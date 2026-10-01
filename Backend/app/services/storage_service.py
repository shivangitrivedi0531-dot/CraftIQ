"""
CONTRACT: placeholder storage using local JSON files, until Firebase/Firestore
is wired up. Two files: conversations.json holds every message, grouped into
conversation threads; active_conversations.json tracks which thread is
currently "live" per user+category (the one the Chat screen shows).

Whoever swaps this for real Firestore later should keep these function names
and shapes identical - routers only ever call these functions, never touch
the files directly.
"""

import json
import os
import uuid
from datetime import datetime, timezone
from threading import Lock

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_CONV_PATH = os.path.join(_DATA_DIR, "conversations.json")
_ACTIVE_PATH = os.path.join(_DATA_DIR, "active_conversations.json")
_lock = Lock()


def _load(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def _save(path, data):
    os.makedirs(_DATA_DIR, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _key(user_id: str, category: str) -> str:
    return f"{user_id}::{category}"


def _new_conversation_entry():
    return {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "messages": [],
    }


def get_active_conversation_id(user_id: str, category: str) -> str:
    """Returns the current active conversation id for this user+category,
    creating a brand new (empty) conversation if none exists yet."""
    with _lock:
        active = _load(_ACTIVE_PATH)
        conversations = _load(_CONV_PATH)
        key = _key(user_id, category)

        conv_id = active.get(key)
        if conv_id and key in conversations and conv_id in conversations[key]:
            return conv_id

        # No active conversation yet - create one.
        conv_id = str(uuid.uuid4())
        conversations.setdefault(key, {})
        conversations[key][conv_id] = _new_conversation_entry()
        active[key] = conv_id
        _save(_CONV_PATH, conversations)
        _save(_ACTIVE_PATH, active)
        return conv_id


def start_new_conversation(user_id: str, category: str) -> str:
    """Always creates a brand new conversation and makes it active.
    Old conversations are kept, untouched, just no longer active."""
    with _lock:
        conversations = _load(_CONV_PATH)
        active = _load(_ACTIVE_PATH)
        key = _key(user_id, category)

        conv_id = str(uuid.uuid4())
        conversations.setdefault(key, {})
        conversations[key][conv_id] = _new_conversation_entry()
        active[key] = conv_id

        _save(_CONV_PATH, conversations)
        _save(_ACTIVE_PATH, active)
        return conv_id


def save_message(user_id: str, category: str, conversation_id: str, role: str, text: str):
    with _lock:
        conversations = _load(_CONV_PATH)
        key = _key(user_id, category)
        conversations.setdefault(key, {})
        conversations[key].setdefault(conversation_id, _new_conversation_entry())
        conversations[key][conversation_id]["messages"].append({
            "role": role,
            "text": text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        _save(_CONV_PATH, conversations)


def get_messages(user_id: str, category: str, conversation_id: str):
    with _lock:
        conversations = _load(_CONV_PATH)
        key = _key(user_id, category)
        return conversations.get(key, {}).get(conversation_id, {}).get("messages", [])


def list_conversations(user_id: str, category: str):
    """Returns every saved conversation thread for this user+category,
    newest first, each with its full message list."""
    with _lock:
        conversations = _load(_CONV_PATH)
        key = _key(user_id, category)
        threads = conversations.get(key, {})

        result = [
            {
                "conversation_id": conv_id,
                "created_at": thread["created_at"],
                "messages": thread["messages"],
            }
            for conv_id, thread in threads.items()
        ]
        result.sort(key=lambda t: t["created_at"], reverse=True)
        return result


def delete_all_conversations(user_id: str, category: str):
    """Wipes every conversation thread for this user+category entirely."""
    with _lock:
        conversations = _load(_CONV_PATH)
        active = _load(_ACTIVE_PATH)
        key = _key(user_id, category)

        conversations[key] = {}
        active.pop(key, None)

        _save(_CONV_PATH, conversations)
        _save(_ACTIVE_PATH, active)