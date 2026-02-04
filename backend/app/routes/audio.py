from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import shutil
import os
import uuid
from app.database import get_db_connection

router = APIRouter()

UPLOAD_DIR = "audio_storage"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/upload")
def upload_audio(
    file: UploadFile = File(...),
    message_id: int = Form(...)
):
    # Ensure directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    if not file_ext:
        file_ext = ".wav"
        
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file synchronously
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    # Check file size
    if os.path.getsize(file_path) > MAX_FILE_SIZE:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
    audio_url = f"/audio_storage/{filename}"
    
    # Store audio_path in messages table
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verify message exists
        cursor.execute("SELECT id FROM messages WHERE id = ?", (message_id,))
        if not cursor.fetchone():
            os.remove(file_path)
            raise HTTPException(status_code=404, detail="Message not found")
            
        cursor.execute(
            "UPDATE messages SET audio_path = ? WHERE id = ?",
            (audio_url, message_id)
        )
        conn.commit()
    except Exception as e:
        # Clean up file if DB update fails
        if os.path.exists(file_path):
            os.remove(file_path)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
    return {"audio_url": audio_url}