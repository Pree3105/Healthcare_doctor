'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Mic, Send, X, MessageSquare, User, Volume2 } from 'lucide-react';
import Chat from '@/components/Chat';
import AudioRecorder from '@/components/AudioRecorder';
import SummaryBtn from '@/components/SummaryBtn';
import { fetchMessages, sendMessage, Message, generateSummary, Summary } from '@/lib/api';

export default function ChatPage() {
  const params = useParams();
  const conversationId = Number(params.id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderRole, setSenderRole] = useState<'doctor' | 'patient'>('doctor');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [conversationId]);

  // Poll backend every 3 seconds (less frequent)
  useEffect(() => {
    loadMessages();
    const intervalId = setInterval(loadMessages, 3000);
    return () => clearInterval(intervalId);
  }, [loadMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      await sendMessage({
        conversation_id: conversationId,
        sender_role: senderRole,
        original_content: inputText,
      });
      setInputText('');
      await loadMessages(); // Wait for refresh
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const summaryData = await generateSummary(conversationId);
      setSummary(summaryData);
      setShowSummaryModal(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const closeSummaryModal = () => {
    setShowSummaryModal(false);
  };

  // Count messages by role
  const doctorMessages = messages.filter(msg => msg.sender_role === 'doctor').length;
  const patientMessages = messages.filter(msg => msg.sender_role === 'patient').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {/* Summary Modal */}
      {showSummaryModal && summary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                <h2 className="text-xl font-bold">AI Medical Summary</h2>
              </div>
              <button
                onClick={closeSummaryModal}
                className="p-2 hover:bg-blue-800 rounded-full transition-colors"
                aria-label="Close summary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Conversation #{conversationId}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(summary.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {summary.summary_text}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Doctor Messages</div>
                  <div className="text-2xl font-bold text-blue-600">{doctorMessages}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Patient Messages</div>
                  <div className="text-2xl font-bold text-green-600">{patientMessages}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <button
                onClick={closeSummaryModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingSummary ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Regenerating...
                  </>
                ) : (
                  'Regenerate Summary'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-col h-screen">
        <div className="max-w-5xl w-full mx-auto flex flex-col h-full">
          {/* Header */}
          <div className="p-6 bg-white border-b shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                  Medical Consultation #{conversationId}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Role:</span>
                    <select
                      value={senderRole}
                      onChange={(e) => setSenderRole(e.target.value as 'doctor' | 'patient')}
                      className="text-sm border text-gray-700  border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="doctor" className="flex items-center gap-2">
                        <User className="h-3 w-3" /> Doctor
                      </option>
                      <option value="patient" className="flex items-center gap-2">
                        <User className="h-3 w-3" /> Patient
                      </option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    {messages.length} total messages
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingSummary ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Generate AI Summary
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <Chat messages={messages} />
              
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Start the conversation by sending a message below.</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-2 md:p-2">
              <div className="max-w-3xl mx-auto">
                {/* Audio Recording Section */}
                <div className="mb-4">
                  <AudioRecorder
                    conversationId={conversationId}
                    senderRole={senderRole}
                    onUploadComplete={loadMessages}
                  />
                </div>

                {/* Text Input Section */}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Type your message as ${senderRole}...`}
                      className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 placeholder-gray-500"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Mic className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send
                      </>
                    )}
                  </button>
                </form>

                {/* Helper Text */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Messages are automatically translated between doctor and patient languages
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="bg-white border-t p-4">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{messages.length}</div>
                  <div className="text-sm text-gray-600">Total Messages</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{doctorMessages}</div>
                  <div className="text-sm text-gray-600">Doctor Messages</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{patientMessages}</div>
                  <div className="text-sm text-gray-600">Patient Messages</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-700">
                    {messages.filter(m => m.audio_path).length}
                  </div>
                  <div className="text-sm text-gray-600">Audio Messages</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}