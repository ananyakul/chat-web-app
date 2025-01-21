from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from sqlalchemy import Column, Integer, String, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from transformers import AutoModelForCausalLM, AutoTokenizer
import uuid

# FastAPI related initilizations go here
app = FastAPI()

# List type storage for messages go here
# messages = []

# Database related initilizations go here
DATABASE_URL = "postgresql://ananyak@localhost:5432/chat_app"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Chats(Base):
    __tablename__ = "chats"

    chat_id = Column(String, primary_key=True, index=True)
    chat_title = Column(String, nullable=False)
    messages = Column(JSON, default=[])

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# LLM related initilizations go here
model_name = "distilgpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Request and Response Models
class ChatMsg(BaseModel):
    role: str
    text: str

class NewChat(BaseModel):
    chat_title: str
    first_message: ChatMsg
    
# Helper functions go here
def generate_reply(input_text: str, chat_history: List[dict] = None, max_chars: int = 1000) -> str:
    """
    Generate a reply from the assistantusing the LLM model chosen.
    """
    if not chat_history:
        chat_history = []
    user_messages = [msg['text'] for msg in chat_history if msg['role'] == 'user']
    
    history = " ".join(user_messages)
    truncated_history = history[-max_chars:]
    prompt = f"{truncated_history} User: {input_text} Assistant:"
    
    input_ids = tokenizer.encode(prompt, return_tensors="pt", truncation=True, max_length=512)
    output = model.generate(input_ids, max_length=150, num_return_sequences=1, pad_token_id=tokenizer.eos_token_id)
    reply = tokenizer.decode(output[0], skip_special_tokens=True)
    return reply.split("Assistant:")[-1].strip()

# API endpoints go here
@app.post("/create_chat", response_model=Tuple[str, ChatMsg])
def create_chat(new_chat: NewChat, db: Session = Depends(get_db)):
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
    chat = Chats(chat_id=chat_id, chat_title=new_chat.chat_title, messages=[user_message, assistant_message])
    db.add(chat)
    db.commit()

    return chat_id, assistant_message

@app.get("/list_chats", response_model=List[str])
def list_chats(db: Session = Depends(get_db)):
    """
    Return the list of chat IDs.
    """
    chats = db.query(Chats).all()
    return [str(chat.chat_id) for chat in chats]

@app.get("/get_chat/{chat_id}", response_model=List[ChatMsg])
def get_chat(chat_id: str, db: Session = Depends(get_db)):
    """
    Return the list of messages in a specific chat.
    """
    chat = db.query(Chats).filter(Chats.chat_id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return chat.messages

@app.post("/add_message_to_chat/{chat_id}", response_model=ChatMsg)
def add_message_to_chat(chat_id: str, new_user_message: ChatMsg, db: Session = Depends(get_db)):
    """
    Add a user message to a chat and get the assistant's response.
    """
    chat = db.query(Chats).filter(Chats.chat_id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Add the user's message
    user_message = {"role": new_user_message.role, "text": new_user_message.text}

    # Generate assistant's response using generate_reply helper function
    assistant_response = generate_reply(new_user_message.text, chat.messages)
    assistant_message = {"role": "assistant", "text": assistant_response}

    # Add the user and assistant message to db  
    chat.messages = chat.messages + [user_message, assistant_message]
    db.commit()

    return assistant_message

@app.delete("/delete_chat/{chat_id}")
def delete_chat(chat_id: str, db: Session = Depends(get_db)):
    """
    Delete a chat from the database.
    """
    chat = db.query(Chats).filter(Chats.chat_id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(chat)
    db.commit()

    return {"detail": "Chat deleted successfully"}


# Middleware portion
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
