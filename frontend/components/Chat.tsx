'use client';

import { Message } from '@/lib/api';
import { Volume2, User, Clock, Globe, Bot, Stethoscope, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface ChatProps {
  messages: Message[];
}

export default function Chat({ messages }: ChatProps) {
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);

  const handleAudioPlay = (messageId: number) => {
    setPlayingAudioId(messageId);
  };

  const handleAudioEnd = () => {
    setPlayingAudioId(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [date: string]: Message[] }, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="space-y-6 p-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          {/* Date Separator */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_role === 'doctor' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Message Bubble */}
              <div
                className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.sender_role === 'doctor'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                }`}
              >
                {/* Corner Decoration */}
                <div className={`absolute -top-2 ${message.sender_role === 'doctor' ? '-right-2' : '-left-2'}`}>
                  <div className={`p-1.5 rounded-full shadow-sm ${
                    message.sender_role === 'doctor'
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-emerald-700 text-emerald-100'
                  }`}>
                    {message.sender_role === 'doctor' ? (
                      <Stethoscope className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </div>
                </div>

                {/* Message Header */}
                <div className="flex items-center justify-between mb-2 px-4 pt-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${
                      message.sender_role === 'doctor'
                        ? 'bg-blue-400/20'
                        : 'bg-emerald-400/20'
                    }`}>
                      {message.sender_role === 'doctor' ? (
                        <span className="text-xs font-bold">DR</span>
                      ) : (
                        <span className="text-xs font-bold">PT</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold">
                      {message.sender_role === 'doctor' ? 'Doctor' : 'Patient'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{formatTime(message.created_at)}</span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="px-4 pb-3">
                  {/* Original Content */}
                  {message.original_content && message.original_content !== '(Audio Message)' && (
                    <div className="mb-2">
                      <p className="text-white text-sm md:text-base leading-relaxed">
                        {message.original_content}
                      </p>
                    </div>
                  )}

                  {/* Translated Content */}
                  {message.translated_content && message.translated_content !== '(Audio Message)' && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="flex items-center gap-1 mb-2 text-white/80">
                        <Globe className="h-3 w-3" />
                        <span className="text-xs font-medium">Translated</span>
                      </div>
                      <p className="text-white/90 italic text-sm md:text-base leading-relaxed">
                        {message.translated_content}
                      </p>
                    </div>
                  )}

                  {/* AI-Generated Content Indicator */}
                  {message.translated_content && message.translated_content.includes('AI') && (
                    <div className="mt-2 flex items-center gap-1 text-white/70">
                      <Bot className="h-3 w-3" />
                      <span className="text-xs">AI-generated translation</span>
                    </div>
                  )}

                  {/* Audio Message */}
                  {message.audio_path && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            playingAudioId === message.id
                              ? 'bg-white/20 animate-pulse'
                              : 'bg-white/10'
                          }`}>
                            <Volume2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-medium">Audio Recording</div>
                            <div className="text-xs text-white/70">
                              Click to play
                            </div>
                          </div>
                        </div>
                        <audio
                          controls
                          className="h-8"
                          onPlay={() => handleAudioPlay(message.id)}
                          onEnded={handleAudioEnd}
                          src={`${process.env.NEXT_PUBLIC_API_URL}${message.audio_path}`}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Footer */}
                <div className={`px-4 py-2 rounded-b-2xl ${
                  message.sender_role === 'doctor'
                    ? 'bg-blue-700/20'
                    : 'bg-emerald-700/20'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-white/70">
                      <MessageSquare className="h-3 w-3" />
                      <span>ID: {message.id}</span>
                    </div>
                    <div className="text-white/60">
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty space for alignment */}
              <div className="w-8"></div>
            </div>
          ))}
        </div>
      ))}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 border border-gray-200">
            <div className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white p-4 rounded-xl mb-4 inline-block">
              <MessageSquare className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Start the medical consultation by sending your first message. 
              All messages will be automatically translated between doctor and patient languages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}