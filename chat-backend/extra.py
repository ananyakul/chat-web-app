from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
import openai
import os
from dotenv import load_dotenv
from supabase import create_client
import uuid

# FastAPI related initializations go here
app = FastAPI()

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase initialization
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# LLM initialization
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Request and Response Models
class ChatMsg(BaseModel):
    role: str
    text: str

class NewChat(BaseModel):
    chat_title: str
    first_message: ChatMsg

class ChatLists(BaseModel):
    id: str
    title: str

class ChatResponse(BaseModel):
    title: str
    messages: List[ChatMsg]

# Helper function
def generate_reply(input_text: str, chat_history: List[dict] = None) -> str:
    """
    Generate a reply from the assistant using OpenAI's GPT model.
    """
    if not chat_history:
        chat_history = []

    # Build the chat message history for OpenAI API
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    for msg in chat_history:
        messages.append({"role": msg['role'], "content": msg['text']})
    messages.append({"role": "user", "content": input_text})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {e}"

# API endpoints
@app.post("/create_chat", response_model=Tuple[str, ChatMsg])
def create_chat(new_chat: NewChat):
    """
    Create a new chat, save the first message, and get the assistant's response.
    """
    chat_id = str(uuid.uuid4())

    # Add the first message and generate assistant response
    user_message = {"role": new_chat.first_message.role, "text": new_chat.first_message.text}
    assistant_response = generate_reply(new_chat.first_message.text)
    assistant_message = {"role": "assistant", "text": assistant_response}

    # Insert into Supabase
    response = (
        supabase.table("chats")
        .insert({
            "chat_id": chat_id,
            "chat_title": new_chat.chat_title,
            "messages": [user_message, assistant_message]
        })
        .execute()
    )
    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"]["message"])

    return chat_id, assistant_message

@app.get("/list_chats", response_model=List[ChatLists])
def list_chats():
    """
    Return the list of chat IDs.
    """
    response = supabase.table("chats").select("chat_id, chat_title").execute()
    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"]["message"])

    chats = response.get("data", [])
    return [{"id": chat["chat_id"], "title": chat.get("chat_title", "Untitled")} for chat in chats]

@app.get("/get_chat/{chat_id}", response_model=ChatResponse)
def get_chat(chat_id: str):
    """
    Return the list of messages in a specific chat.
    """
    response = supabase.table("chats").select("*").eq("chat_id", chat_id).execute()
    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"]["message"])

    chat = response.get("data")
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = chat[0]
    return {
        "title": chat["chat_title"],
        "messages": chat["messages"],
    }

@app.post("/add_message_to_chat/{chat_id}", response_model=ChatMsg)
def add_message_to_chat(chat_id: str, new_user_message: ChatMsg):
    """
    Add a user message to a chat and get the assistant's response.
    """
    # Fetch the chat from Supabase
    response = supabase.table("chats").select("messages").eq("chat_id", chat_id).execute()
    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"]["message"])

    chat = response.get("data")
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = chat[0]["messages"]
    user_message = {"role": new_user_message.role, "text": new_user_message.text}
    assistant_response = generate_reply(new_user_message.text, messages)
    assistant_message = {"role": "assistant", "text": assistant_response}

    # Update the chat messages
    updated_messages = messages + [user_message, assistant_message]
    response = (
        supabase.table("chats")
        .update({"messages": updated_messages})
        .eq("chat_id", chat_id)
        .execute()
    )
    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"]["message"])

    return assistant_message

@app.delete("/delete_chat/{chat_id}")
def delete_chat(chat_id: str):
    """
    Delete a chat from Supabase.
    """
    response = supabase.table("chats").delete().eq("chat_id", chat_id).execute()
    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"]["message"])

    return {"detail": "Chat deleted successfully"}
