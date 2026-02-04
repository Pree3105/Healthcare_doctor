'use client';

import { useState } from 'react';
import { searchMessages, Message } from '../../lib/api';
import React from 'react';
import { Search, User, Calendar, MessageSquare, Hash, Mic, Filter } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await searchMessages(query, conversationId);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setConversationId(undefined);
    setResults([]);
    setHasSearched(false);
  };

  // Helper component to highlight matched text
  const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-gray-900 font-medium px-1 py-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg mb-4">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Conversation Search</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Search across doctor-patient conversations with intelligent text highlighting
          </p>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/60">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Search Query */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Query
                </label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-full p-4 pl-12 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800 placeholder-gray-500"
                    placeholder="e.g. headache, medication, symptoms..."
                    required
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              {/* Conversation ID */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Conversation ID (Optional)
                </label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={conversationId ?? ''}
                    onChange={(e) =>
                      setConversationId(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full h-full p-4 pl-12 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800 placeholder-gray-500"
                    placeholder="e.g. 123"
                  />
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2 pl-1">
                  Leave empty to search all conversations
                </p>
              </div>
              
              {/* Search Button - Aligned with inputs */}
              <div className="flex flex-col">
                <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2 opacity-0">
                  {/* Invisible label for alignment */}
                  <Search className="h-4 w-4" />
                  Action
                </div>
                <div className="flex-1 flex items-end">
                  <button 
                    type="submit" 
                    disabled={isLoading || !query.trim()}
                    className="w-full h-[60px] bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        Search Messages
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Clear Search */}
            {(query || conversationId || results.length > 0) && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        </form>

        {/* Results Section */}
        {hasSearched && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Search Results
                {results.length > 0 && (
                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {results.length} {results.length === 1 ? 'result' : 'results'}
                  </span>
                )}
              </h2>
              {results.length > 0 && (
                <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                  Found in {new Set(results.map(r => r.conversation_id)).size} conversations
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* No Results */}
          {hasSearched && results.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Try different search terms or adjust your filters
              </p>
              <button
                onClick={clearSearch}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md"
              >
                Clear Search
              </button>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full mb-4">
                <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Searching conversations...</p>
            </div>
          )}
          
          {/* Results */}
          {results.map((msg) => (
            <div key={msg.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200/70 hover:border-blue-200/50 transition-all duration-300 overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      msg.sender_role === 'doctor' 
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200' 
                        : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
                    }`}>
                      <User className={`h-5 w-5 ${
                        msg.sender_role === 'doctor' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-sm font-bold uppercase tracking-wide ${
                          msg.sender_role === 'doctor' ? 'text-blue-700' : 'text-green-700'
                        }`}>
                          {msg.sender_role}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 font-medium">
                          Conversation #{msg.conversation_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                      ID: {msg.id}
                    </div>
                    {msg.audio_path && (
                      <div className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5" />
                        Audio Available
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-5">
                  {/* Original Content */}
                  {msg.original_content && (
                    <div className="group/msg">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3 pl-1">
                        Original Message
                      </div>
                      <div className="text-gray-800 leading-relaxed text-lg p-4 bg-gray-50/70 rounded-xl border border-gray-200">
                        <HighlightedText text={msg.original_content} highlight={query} />
                      </div>
                    </div>
                  )}

                  {/* Translated Content */}
                  {msg.translated_content && msg.translated_content !== '(Audio Message)' && (
                    <div className="group/translation">
                      <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5" />
                        AI Translation
                      </div>
                      <div className="text-gray-700 italic leading-relaxed p-4 bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-xl border border-blue-200/50">
                        <HighlightedText text={msg.translated_content} highlight={query} />
                      </div>
                    </div>
                  )}

                  {/* Audio Player */}
                  {msg.audio_path && (
                    <div className="pt-2">
                      <div className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                        <Mic className="h-3.5 w-3.5" />
                        Audio Message
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-50/30 p-4 rounded-xl border border-purple-200/50">
                        <audio
                          controls
                          className="w-full h-10"
                          src={`${process.env.NEXT_PUBLIC_API_URL}${msg.audio_path}`}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 md:px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-50/50 border-t border-gray-200/50 flex justify-between items-center">
                <div className="text-xs text-gray-500 font-medium">
                  Message ID: {msg.id} • Conversation: {msg.conversation_id}
                </div>
                <button
                  onClick={() => window.open(`/chat/${msg.conversation_id}`, '_blank')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  View Conversation
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}