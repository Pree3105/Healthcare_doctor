from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

# Conversation Models
class ConversationCreate(BaseModel):
    doctor_language: str
    patient_language: str
    title: Optional[str] = None

class ConversationResponse(BaseModel):
    id: int
    doctor_language: str
    patient_language: str
    title: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Message Models
class MessageCreate(BaseModel):
    conversation_id: int
    sender_role: Literal["doctor", "patient"]
    original_content: Optional[str] = None
    translated_content: Optional[str] = None
    audio_path: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_role: str
    original_content: Optional[str] = None
    translated_content: Optional[str] = None
    audio_path: Optional[str] = None
    created_at: datetime

# Summary Models
class SummaryCreate(BaseModel):
    conversation_id: int
    summary_text: str

class SummaryResponse(BaseModel):
    id: int
    conversation_id: int
    summary_text: str
    created_at: datetime
