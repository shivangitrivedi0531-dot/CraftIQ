from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies.auth import get_current_user
from app.services.gemini_service import call_gemini
from app.services import storage_service

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    text: str


class ChatRequest(BaseModel):
    category: str
    message: str
    chat_history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, user: dict = Depends(get_current_user)):
    conv_id = storage_service.get_active_conversation_id(user["uid"], payload.category)

    history_as_dicts = [m.model_dump() for m in payload.chat_history]
    reply = await call_gemini(payload.category, payload.message, history_as_dicts)

    storage_service.save_message(user["uid"], payload.category, conv_id, "user", payload.message)
    storage_service.save_message(user["uid"], payload.category, conv_id, "assistant", reply)

    return ChatResponse(reply=reply, conversation_id=conv_id)


@router.post("/chat/new")
async def new_chat(category: str, user: dict = Depends(get_current_user)):
    conv_id = storage_service.start_new_conversation(user["uid"], category)
    return {"conversation_id": conv_id}


@router.get("/chat-history")
async def chat_history(category: str, user: dict = Depends(get_current_user)):
    """Returns the messages of the currently ACTIVE conversation - this is
    what the live Chat screen loads when it opens."""
    conv_id = storage_service.get_active_conversation_id(user["uid"], category)
    messages = storage_service.get_messages(user["uid"], category, conv_id)
    return {"category": category, "conversation_id": conv_id, "messages": messages}


@router.get("/conversations")
async def get_conversations(category: str, user: dict = Depends(get_current_user)):
    """Returns EVERY saved conversation thread for this category - this is
    what the Chat History tab lists."""
    conversations = storage_service.list_conversations(user["uid"], category)
    return {"category": category, "conversations": conversations}


@router.delete("/conversations")
async def clear_conversations(category: str, user: dict = Depends(get_current_user)):
    storage_service.delete_all_conversations(user["uid"], category)
    return {"status": "cleared", "category": category}


@router.delete("/conversations/{conversation_id}")
async def delete_one_conversation(conversation_id: str, category: str, user: dict = Depends(get_current_user)):
    storage_service.delete_conversation(user["uid"], category, conversation_id)
    return {"status": "deleted", "conversation_id": conversation_id}


@router.post("/conversations/{conversation_id}/activate")
async def activate_conversation(conversation_id: str, category: str, user: dict = Depends(get_current_user)):
    storage_service.set_active_conversation(user["uid"], category, conversation_id)
    return {"status": "activated", "conversation_id": conversation_id}