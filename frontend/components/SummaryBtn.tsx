'use client';

import { useState } from 'react';
import { generateSummary, Summary } from '@/lib/api';

interface SummaryBtnProps {
  conversationId: number;
}

export default function SummaryBtn({ conversationId }: SummaryBtnProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Using the API utility which maps to the correct backend endpoint
      // (GET /ai/summary/{id} as defined in backend/app/routes/ai.py)
      const result = await generateSummary(conversationId);
      setSummary(result.summary_text);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="mb-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Generating Summary...' : 'Generate Summary'}
      </button>

      {summary && (
        <div className="p-4 border border-gray-200 rounded-lg bg-yellow-50 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Conversation Summary</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
