export interface Conversation {
  id: number;
  doctor_language: string;
  patient_language: string;
  title: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_role: 'doctor' | 'patient';
  original_content: string | null;
  translated_content: string | null;
  audio_path: string | null;
  created_at: string;
}

export interface Summary {
  id: number;
  conversation_id: number;
  summary_text: string;
  created_at: string;
}

export interface CreateConversationParams {
  doctor_language: string;
  patient_language: string;
  title?: string;
}

export interface SendMessageParams {
  conversation_id: number;
  sender_role: 'doctor' | 'patient';
  original_content?: string;
  translated_content?: string;
  audio_path?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function createConversation(data: CreateConversationParams): Promise<Conversation> {
    console.log(data)
  const response = await fetch(`${BASE_URL}/conversations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  console.log(response)
  return handleResponse<Conversation>(response);
}

export async function fetchMessages(conversationId: number): Promise<Message[]> {
  const response = await fetch(`${BASE_URL}/messages/${conversationId}`);
  return handleResponse<Message[]>(response);
}

export async function sendMessage(data: SendMessageParams): Promise<Message> {
  const response = await fetch(`${BASE_URL}/messages/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Message>(response);
}

export async function uploadAudio(file: File, messageId: number): Promise<{ audio_url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message_id', messageId.toString());

  const response = await fetch(`${BASE_URL}/audio/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<{ audio_url: string }>(response);
}

export async function generateSummary(conversationId: number): Promise<Summary> {
  const response = await fetch(`${BASE_URL}/ai/summary/${conversationId}`);
  return handleResponse<Summary>(response);
}

export async function searchMessages(query: string, conversationId?: number): Promise<Message[]> {
    try{
    const url = new URL(`${BASE_URL}/messages/search`);
    
    // Add search query
    url.searchParams.append('q', query);
    
    // Add conversation_id ONLY if it's a valid number
    if (conversationId && conversationId) {
      const idNum = Number(conversationId);
      if (!isNaN(idNum) && idNum > 0) {
        url.searchParams.append('conversation_id', idNum.toString());
      }
    }
    
    console.log('Search URL:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        detail: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.detail || 'Search failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search API error:', error);
    throw error; // Re-throw to handle in component
  }
}

export async function getConversation(id: number): Promise<Conversation> {
  const response = await fetch(`${BASE_URL}/conversations/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch conversation: ${error}`);
  }
  
  return response.json();
}