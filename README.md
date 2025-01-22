
SQL Command:
CREATE TABLE chats (
    chat_id UUID PRIMARY KEY,
    chat_title VARCHAR(255) NOT NULL,
    messages JSON DEFAULT '[]'
);
