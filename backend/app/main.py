# Create a FastAPI application with:
# - CORS allowing http://localhost:3000
# - Include routers for conversations, messages, audio and ai
# - Serve static files from /audio_storage
# - Basic error handling
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from app.routes import conversations, messages, audio, ai
from app.database import init_db

os.makedirs("audio_storage", exist_ok=True)
app = FastAPI()
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(conversations.router, tags=["Conversations"])
app.include_router(messages.router, prefix="/messages", tags=["Messages"])
app.include_router(audio.router, prefix="/audio", tags=["Audio"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
    
# Serve static files
app.mount("/audio_storage", StaticFiles(directory="audio_storage"), name="audio_storage")

# Basic error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)},
    )

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    init_db()
