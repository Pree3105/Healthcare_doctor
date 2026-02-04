'use client';

interface MessageBubbleProps {
  sender_role: 'doctor' | 'patient';
  original_content?: string | null;
  translated_content?: string | null;
  audio_path?: string | null;
  created_at: string;
}

export default function MessageBubble({
  sender_role,
  original_content,
  translated_content,
  audio_path,
  created_at,
}: MessageBubbleProps) {
  const isDoctor = sender_role === 'doctor';

  return (
    <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isDoctor ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
        }`}
      >
        {audio_path && (
          <audio
            controls
            className="mb-2 w-full"
            src={`http://localhost:8000${audio_path}`}
          />
        )}

        {original_content && <div>{original_content}</div>}

        {translated_content && (
          <div className="text-sm italic mt-2 opacity-80">
            {translated_content}
          </div>
        )}

        <div className="text-[10px] text-right opacity-70 mt-1">
          {new Date(created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
