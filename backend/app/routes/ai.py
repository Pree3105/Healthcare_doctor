from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.services.llm_service import summarize_conversation
from app.models import SummaryResponse

router = APIRouter()

@router.get("/summary/{conversation_id}", response_model=SummaryResponse)
def generate_summary(conversation_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verify conversation exists
        cursor.execute("SELECT id FROM conversations WHERE id = ?", (conversation_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Fetch messages
        cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", (conversation_id,))
        rows = cursor.fetchall()
        
        if not rows:
            raise HTTPException(status_code=400, detail="No messages found to summarize")

        # Prepare messages for LLM service
        # Map database columns (_content) to service expectations (_text)
        messages = []
        for row in rows:
            msg = dict(row)
            messages.append({
                "sender_role": msg["sender_role"],
                "original_text": msg["original_content"],
                "translated_text": msg["translated_content"]
            })

        # Generate summary
        summary_text = summarize_conversation(messages)

        # Store summary in database
        cursor.execute(
            "INSERT INTO summaries (conversation_id, summary_text) VALUES (?, ?)",
            (conversation_id, summary_text)
        )
        conn.commit()
        new_id = cursor.lastrowid

        # Return the created summary record
        cursor.execute("SELECT * FROM summaries WHERE id = ?", (new_id,))
        row = cursor.fetchone()
        return dict(row)

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
