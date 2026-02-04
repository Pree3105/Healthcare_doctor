from fastapi import APIRouter, HTTPException
from typing import List

from app.database import get_db_connection
from app.models import ConversationCreate, ConversationResponse

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.post("/", response_model=ConversationResponse)
def create_conversation(conversation: ConversationCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO conversations (doctor_language, patient_language, title) VALUES (?, ?, ?)",
            (conversation.doctor_language, conversation.patient_language, conversation.title)
        )
        conn.commit()
        new_id = cursor.lastrowid
        
        # Fetch the created record to return complete data including timestamp
        cursor.execute("SELECT * FROM conversations WHERE id = ?", (new_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
            
        return {
            "id": row["id"],
            "doctor_language": row["doctor_language"],
            "patient_language": row["patient_language"],
            "title": row["title"],
            "created_at": row["created_at"],
        }
    except Exception as e:
         raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()

@router.get("/", response_model=List[ConversationResponse])
def list_conversations():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM conversations ORDER BY created_at DESC")
        rows = cursor.fetchall()
        return [{
            "id": r["id"],
            "doctor_language": r["doctor_language"],
            "patient_language": r["patient_language"],
            "title": r["title"],
            "created_at": r["created_at"],
        } for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()

@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: int):
    """Get a single conversation by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT * FROM conversations WHERE id = ?",
            (conversation_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        return {
            "id": row["id"],
            "doctor_language": row["doctor_language"],
            "patient_language": row["patient_language"],
            "title": row["title"],
            "created_at": row["created_at"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        conn.close()