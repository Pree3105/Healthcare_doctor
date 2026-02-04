import os
from groq import Groq
from dotenv import load_dotenv
from typing import List, Union

load_dotenv()

MODEL = "llama-3.1-8b-instant"

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def translate_text(text: str, source_language: str, target_language: str) -> str:
    """
    Translate medical text while preserving terminology.
    """
    if not text.strip():
        return text

    prompt = (
        f"Translate the following medical message accurately from {source_language} "
        f"to {target_language}. Preserve medical terminology.\n\n"
        f"Message:\n{text}"
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=512,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        # Fail safe: return original text
        print(f"[Groq][Translate] Error: {e}")
        return text


def summarize_conversation(messages: List[Union[dict, object]]) -> str:
    """
    Summarize a doctor-patient conversation focusing on medical details.
    """
    lines = []

    for msg in messages:
        if isinstance(msg, dict):
            role = msg.get("sender_role", "unknown")
            text = msg.get("translated_text") or msg.get("original_text") or ""
        else:
            role = getattr(msg, "sender_role", "unknown")
            text = getattr(msg, "translated_text", None) or getattr(msg, "original_text", "")

        if text.strip():
            lines.append(f"{role.capitalize()} said: {text}")

    if not lines:
        return "No conversation data available."

    conversation_block = "\n".join(lines)

    prompt = (
        "You are a medical assistant.\n\n"
        "Summarize the following doctor-patient conversation.\n\n"
        "Focus on:\n"
        "- Symptoms\n"
        "- Diagnoses\n"
        "- Medications\n"
        "- Follow-up actions\n\n"
        "Return a concise, structured summary.\n\n"
        "Conversation:\n"
        f"{conversation_block}"
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=600,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[Groq][Summary] Error: {e}")
        return "Unable to generate summary at this time."
