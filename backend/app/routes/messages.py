from fastapi import APIRouter, HTTPException,Query
from typing import List,Optional

from app.database import get_db_connection
from app.models import MessageCreate, MessageResponse
from app.services.llm_service import translate_text

router = APIRouter()

@router.get("/search", response_model=List[MessageResponse])
async def search_messages(
    q: str = Query(..., description="Search query"),
    conversation_id: Optional[int] = Query(None, description="Optional conversation ID filter")
):
    """Search messages with optional conversation filter"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        print(f"SEARCH: q='{q}', conversation_id={conversation_id}")
        
        if conversation_id:
            query = '''
                SELECT * FROM messages 
                WHERE conversation_id = ? 
                AND (original_content LIKE ? OR translated_content LIKE ?)
                ORDER BY created_at DESC
            '''
            params = (conversation_id, f'%{q}%', f'%{q}%')
        else:
            query = '''
                SELECT * FROM messages 
                WHERE original_content LIKE ? OR translated_content LIKE ? 
                ORDER BY created_at DESC
            '''
            params = (f'%{q}%', f'%{q}%')
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        results = [dict(row) for row in rows]
        print(f" FOUND {len(results)} results")
        return results
        
    except Exception as e:
        print(f" ERROR: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during search")
    finally:
        conn.close()


@router.post("/", response_model=MessageResponse)
def create_message(message: MessageCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:

        cursor.execute("SELECT * FROM conversations WHERE id = ?", (message.conversation_id,))
        conversation = cursor.fetchone()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        role = message.sender_role
        original_content = message.original_content
        translated_content = message.translated_content

        if original_content and not translated_content:
            if role == "doctor":
                source_lang = conversation["doctor_language"]
                target_lang = conversation["patient_language"]
            else:
                source_lang = conversation["patient_language"]
                target_lang = conversation["doctor_language"]
            
            translated_content = translate_text(original_content, source_lang, target_lang)

        cursor.execute(
            """
            INSERT INTO messages (conversation_id, sender_role, original_content, translated_content, audio_path)
            VALUES (?, ?, ?, ?, ?)
            """,
            (message.conversation_id, role, original_content, translated_content, message.audio_path)
        )
        conn.commit()
        new_id = cursor.lastrowid

        cursor.execute("SELECT * FROM messages WHERE id = ?", (new_id,))
        row = cursor.fetchone()
        return dict(row)

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/{conversation_id}", response_model=List[MessageResponse])
def get_conversation_messages(conversation_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM conversations WHERE id = ?", (conversation_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Conversation not found")

        cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", (conversation_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()