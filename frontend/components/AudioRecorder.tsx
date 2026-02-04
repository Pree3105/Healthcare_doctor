// Create an AudioRecorder component.
'use client';

// File: components/AudioRecorder.tsx
import { useState, useRef } from 'react';
import { sendMessage, uploadAudio } from '../lib/api';

// Features:
// - Use MediaRecorder API
// - Start and Stop recording
// - Save audio as .webm
// - Upload to backend using:
//   POST /audio/upload
// - Send conversation_id with upload
// - Receive audio_path from backend
interface AudioRecorderProps {
  conversationId: number;
  senderRole: 'doctor' | 'patient';
  onUploadComplete: () => void;
}

// Constraints:
// - No transcription
// - No streaming
// - No waveform visualization
export default function AudioRecorder({ conversationId, senderRole, onUploadComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

// After upload:
// - Trigger refresh callback
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        const file = new File([blob], 'recording.mp3', { type: 'audio/mp3' });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        try {
          // 1. Create a placeholder message to attach audio to
          // The backend requires a message_id for audio upload
          const message = await sendMessage({
            conversation_id: conversationId,
            sender_role: senderRole,
            original_content: '(Audio Message)',
          });

          // 2. Upload the audio file
          await uploadAudio(file, message.id);

          // 3. Trigger refresh
          onUploadComplete();
        } catch (error) {
          console.error('Failed to upload audio:', error);
          alert('Failed to send audio message');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex items-center">
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
          </svg>
          <span>Record</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full transition-colors animate-pulse"
        >
          <div className="w-3 h-3 bg-red-600 rounded-sm" />
          <span>Stop & Send</span>
        </button>
      )}
    </div>
  );
}
