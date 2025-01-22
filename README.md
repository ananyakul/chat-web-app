
SQL Command:

``brew install postgresql``

``brew services start postgresql``

``psql postgres``

``CREATE DATABASE chat_app;``

``\c chat_app``

``CREATE TABLE chats (
    chat_id UUID PRIMARY KEY,
    chat_title VARCHAR(255) NOT NULL,
    messages JSON DEFAULT '[]'
);``
