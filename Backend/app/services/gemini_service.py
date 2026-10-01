import asyncio
import httpx
from app.config import GEMINI_API_KEY, GEMINI_MODEL, DEMO_MODE
from app.services.category_prompts import get_prompt

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)


async def call_gemini(category_id: str, message: str, chat_history: list[dict]) -> str:
    """
    chat_history: list of {"role": "user"|"assistant", "text": str}, oldest first.
    Returns the assistant's reply text.
    """
    if DEMO_MODE:
        # No API key set yet - lets the rest of the app be built/tested without one.
        return (
            f"(demo mode - no GEMINI_API_KEY set) I'd answer your {category_id} "
            f"question about \"{message}\" here once the real API key is added to .env."
        )

    contents = []
    for m in chat_history:
        gemini_role = "model" if m["role"] == "assistant" else "user"
        contents.append({"role": gemini_role, "parts": [{"text": m["text"]}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {
        "system_instruction": {"parts": [{"text": get_prompt(category_id)}]},
        "contents": contents,
    }

    max_retries = 3
    delay = 1.0

    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(max_retries):
            response = await client.post(
                GEMINI_URL,
                params={"key": GEMINI_API_KEY},
                json=payload,
            )

            if response.status_code == 200:
                data = response.json()
                try:
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                except (KeyError, IndexError):
                    return "Sorry, I couldn't generate a response just now."

            if response.status_code == 429 and attempt < max_retries - 1:
                # Rate limited - back off and retry.
                await asyncio.sleep(delay)
                delay *= 2
                continue

            # Any other error, or out of retries.
            return (
                f"Sorry, the AI service returned an error (status {response.status_code}). "
                "Please try again in a moment."
            )

    return "Sorry, the AI service is temporarily unavailable."