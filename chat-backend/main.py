from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from sqlalchemy import Column, Integer, String, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import psycopg2
# from transformers import AutoModelForCausalLM, AutoTokenizer
import uuid
import openai 
import os
from dotenv import load_dotenv
from supabase import create_client

# FastAPI related initilizations go here
app = FastAPI()

# Middleware portion
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database related initilizations go here
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
# database_url = os.environ.get("DATABASE_URL")
# ssl_cert_path = os.environ.get("SSL_CERT_PATH")
# engine = create_engine(database_url, connect_args={"sslrootcert": ssl_cert_path})
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# class Chats(Base):
#     __tablename__ = "chats"

#     chat_id = Column(String, primary_key=True, index=True)
#     chat_title = Column(String, nullable=False)
#     messages = Column(JSON, default=[])

# Base.metadata.create_all(bind=engine)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# LLM related initilizations go here

# model_name = "distilgpt2"
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForCausalLM.from_pretrained(model_name)

client = openai.OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)


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
    
class RenameChatRequest(BaseModel):
    title: str 
    
class UserSignup(BaseModel):
    email: str
    password: str
    
class UserLogin(BaseModel):
    email: str
    password: str
    
# Helper functions go here
def generate_reply(input_text: str, chat_history: List[dict] = None, max_chars: int = 1000) -> str:
    """
    Generate a reply from the assistantusing the LLM model chosen.
    """
    if not chat_history:
        chat_history = []
    
    # Build the chat message history for the API
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    for msg in chat_history:
        messages.append({"role": msg['role'], "content": msg['text']})
    messages.append({"role": "user", "content": input_text})
    
    # Call OpenAI's chat completions endpoint
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        
        # Extract and return the assistant's reply
        reply = response.choices[0].message.content
        return str(reply)
    
    except Exception as e:
        return f"An error occurred: {e}"
    
def get_current_user(authorization: str = Header(None)):
    """
    Validate Supabase authentication token and return the user ID.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token missing")

    token = authorization.replace("Bearer ", "")
    
    try:
        user = supabase.auth.get_user(token)  # Fetch user details using token
        if not user or "error" in user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        return user.user  # Extract user details
    
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed: " + str(e))


# def generate_reply(input_text: str, chat_history: List[dict] = None, max_chars: int = 1000) -> str:
#     """
#     Generate a reply from the assistantusing the LLM model chosen.
#     """
#     if not chat_history:
#         chat_history = []
#     user_messages = [msg['text'] for msg in chat_history if msg['role'] == 'user']
    
#     history = " ".join(user_messages)
#     truncated_history = history[-max_chars:]
#     prompt = f"{truncated_history} User: {input_text} Assistant:"
    
#     input_ids = tokenizer.encode(prompt, return_tensors="pt", truncation=True, max_length=512)
#     output = model.generate(input_ids, max_length=150, num_return_sequences=1, pad_token_id=tokenizer.eos_token_id)
#     reply = tokenizer.decode(output[0], skip_special_tokens=True)
#     return reply.split("Assistant:")[-1].strip()

# API endpoints go here
@app.post("/create_chat", response_model=Tuple[str, ChatMsg])
async def create_chat(new_chat: NewChat, user=Depends(get_current_user)):
    """
    Create a new chat, save the first message, and get the assistant's response.
    """
    # Generate unique chat_id
    chat_id = str(uuid.uuid4())

    # Add the first message
    user_message = {"role": new_chat.first_message.role, "text": new_chat.first_message.text}
    assistant_response = generate_reply(new_chat.first_message.text)
    assistant_message = {"role": "assistant", "text": assistant_response}

    # Save the chat to the database
    try:
        response = (
            supabase.table("chats")
            .insert({
                "chat_id": chat_id,
                "chat_title": new_chat.chat_title,
                "messages": [user_message, assistant_message],
                "user_id": user["id"]
            })
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return chat_id, assistant_message

@app.get("/list_chats", response_model=List[ChatLists])
async def list_chats(user=Depends(get_current_user)):
    """
    Return the list of chat IDs.
    """
    try:
        response = supabase.table("chats").select("chat_id, chat_title").eq("user_id", user["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    chats = response.data or []
    return [{"id": chat["chat_id"], "title": chat.get("chat_title", "Untitled")} for chat in chats]

@app.get("/get_chat/{chat_id}", response_model=ChatResponse)
async def get_chat(chat_id: str, user=Depends(get_current_user)):
    """
    Return the list of messages in a specific chat.
    """
    try:
        response = supabase.table("chats").select("*").eq("chat_id", chat_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    chat = response.data
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = chat[0]
    return {
        "title": chat["chat_title"],
        "messages": chat["messages"],
    }

@app.post("/add_message_to_chat/{chat_id}", response_model=ChatMsg)
async def add_message_to_chat(chat_id: str, new_user_message: ChatMsg):
    """
    Add a user message to a chat and get the assistant's response.
    """
    try:
        response = supabase.table("chats").select("messages").eq("chat_id", chat_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    chat = response.data or []
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Add the user's message
    messages = chat[0]["messages"]
    user_message = {"role": new_user_message.role, "text": new_user_message.text}

    # Generate assistant's response using generate_reply helper function
    assistant_response = generate_reply(new_user_message.text, messages)
    assistant_message = {"role": "assistant", "text": assistant_response}

    # Add the user and assistant message to db  
    updated_messages = messages + [user_message, assistant_message]
    try: 
        response = (
            supabase.table("chats")
            .update({"messages": updated_messages})
            .eq("chat_id", chat_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return assistant_message

@app.delete("/delete_chat/{chat_id}")
async def delete_chat(chat_id: str):
    """
    Delete a chat from the database.
    """
    try:
        response = supabase.table("chats").delete().eq("chat_id", chat_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"detail": "Chat deleted successfully"}

@app.put("/rename_chat/{chat_id}")
async def rename_chat(chat_id: str, new_title: RenameChatRequest):
    """
    Rename a chat by updating its title in the database.
    """
    try:
        # Update the chat title in Supabase
        response = (
            supabase.table("chats")
            .update({"chat_title": new_title.title})
            .eq("chat_id", chat_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Chat not found")

        return {"detail": "Chat renamed successfully", "new_title": new_title.title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# User-related Methods
@app.post("/signup")
async def signup(user: UserSignup):
    """
    Sign up a new user with Supabase authentication.
    """
    try:
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })

        if "error" in response:
            raise HTTPException(status_code=400, detail=response["error"]["message"])
        
        return {"message": "User created successfully. Please check your email to confirm your account."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login(user: UserLogin):
    """
    Log in an existing user with Supabase authentication.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if "error" in response:
            raise HTTPException(status_code=400, detail=response["error"]["message"])
        
        return {"message": "Login successful", "session": response.session}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



