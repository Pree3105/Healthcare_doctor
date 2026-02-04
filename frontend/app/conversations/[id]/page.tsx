'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getConversation, Conversation } from '../../../lib/api';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conversationId = params.id as string;

  useEffect(() => {
    async function fetchConversation() {
      try {
        setLoading(true);
        const data = await getConversation(parseInt(conversationId));
        setConversation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  const goToChat = () => {
    router.push(`/chat/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading conversation...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-lg mb-4">Error: {error || 'Conversation not found'}</div>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800">
          Conversation #{conversation.id}
          {conversation.title && `: ${conversation.title}`}
        </h1>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Doctor Language</h3>
            <p className="text-lg">{conversation.doctor_language}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Patient Language</h3>
            <p className="text-lg">{conversation.patient_language}</p>
          </div>
        </div>
        
        <div className="mt-4 text-gray-600">
          Created: {new Date(conversation.created_at).toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Start Communication</h2>
        <p className="text-gray-600 mb-6">
          Ready to begin the doctor-patient conversation with real-time translation.
        </p>
        
        <button
          onClick={goToChat}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 text-lg font-medium"
        >
          Enter Chat Room
        </button>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold mb-2">Features Available:</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Real-time text translation</li>
            <li>Audio recording and playback</li>
            <li>AI-powered conversation summary</li>
            <li>Search through conversation history</li>
          </ul>
        </div>
      </div>
    </main>
  );
}