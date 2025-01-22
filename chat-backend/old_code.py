@app.get("/messages", response_model=List[Message])
async def get_messages():
    """
    Get all messages.
    """
    return messages

@app.post("/messages", response_model=Message)
async def post_message(new_message: NewMessage):
    """
    Add a new message to the chat.
    """
    if not new_message.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Add the user's message
    user_message = Message(sender="user", text=new_message.text)
    messages.append(user_message)

    # Simulate a bot response
    bot_reply_text = generate_reply(new_message.text)
    bot_message = Message(sender="bot", text=bot_reply_text)
    messages.append(bot_message)
    
    return user_message



@app.delete("/messages")
async def delete_messages():
    """
    Clear all messages.
    """
    global messages
    messages = []
    return {"detail": "All messages deleted"}
