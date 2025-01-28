'use client';

import { useState, useEffect, JSX, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

const ChatPage = (params: { chatId: string }): JSX.Element => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [chatList, setChatList] = useState<{ id: string; title: string }[]>([]);
    const [currentChatTitle, setCurrentChatTitle] = useState<string>('');
    const router = useRouter();
    const chatId = params?.chatId;

    const fetchChatList = useCallback(async () => {
        try {
            const response = await fetch('https://anyak1729--chat-web-app-fastapi-app.modal.run/list_chats');
            if (response.ok) {
                const data: { id: string; title: string }[] = await response.json();
                setChatList(data);
            } else {
                console.error('Failed to fetch chat list');
            }
        } catch (error) {
            console.error('Error fetching chat list:', error);
        }
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!chatId) return;
        try {
            const response = await fetch(`https://anyak1729--chat-web-app-fastapi-app.modal.run/get_chat/${chatId}`);
            if (response.ok) {
                const data: { title: string; messages: Message[] } = await response.json();
                setMessages(data.messages);
                setCurrentChatTitle(data.title);
            } else {
                console.error('Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [chatId]);

    const sendMessage = useCallback(async () => {
        if (!input.trim() || !chatId) return;

        try {
            const response = await fetch(`https://anyak1729--chat-web-app-fastapi-app.modal.run/add_message_to_chat/${chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', text: input }),
            });

            if (response.ok) {
                const responseMessage: Message = await response.json();
                setMessages((prev) => [...prev, { role: 'user', text: input }, responseMessage]);
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setInput('');
        }
    }, [chatId, input]);

    const deleteChat = useCallback(async (chatId: string) => {
        try {
            const response = await fetch(`https://anyak1729--chat-web-app-fastapi-app.modal.run/delete_chat/${chatId}`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                setChatList((prev) => prev.filter((chat) => chat.id !== chatId));
                if (chatId === params.chatId) {
                    router.push('/');
                }
            } else {
                console.error(`Failed to delete chat. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    }, [params.chatId, router]);
    

    useEffect(() => {
        fetchChatList();
        fetchMessages();
    }, [chatId, fetchChatList, fetchMessages]);

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.heading}>
                    <button style={styles.homeButton} onClick={() => router.push('/')}>
                        🏠
                    </button>
                    <span>Chats</span>
                    <button style={styles.plusButton} onClick={() => router.push('/new-chat')}>
                        ➕
                    </button>
                </div>
                <div style={styles.chatList}>
                    {chatList.map((chat) => (
                        <div key={chat.id} 
                        style={{
                            ...styles.chatItemContainer,
                            backgroundColor: chat.id === chatId ? '#333' : 'transparent',
                        }} >
                            <div
                                key={chat.id}
                                style={styles.chatItem}
                                onClick={() => router.push(`/chat/${chat.id}`)}
                            >
                                {/* Chat names on sidebar */}
                                {chat.title.length > 20 ? `${chat.title.slice(0, 20)}...` : chat.title}
                            </div>
                            <button style={styles.deleteButton} onClick={() => deleteChat(chat.id)}>
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
                {/* <div style={styles.newChat}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="New chat title"
                        value={chatTitle}
                        onChange={(e) => setChatTitle(e.target.value)}
                    />
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="First message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button style={styles.button} onClick={createChat}>
                        ➕ Create
                    </button>
                </div> */}
            </div>

            <div style={styles.chatContainer}>
                <h2 style={styles.header}>{currentChatTitle || "Select a Chat"}</h2>
                <div style={styles.chatBox}>
                    {messages.length === 0 ? (
                        <div style={styles.placeholder}>No messages yet. Start chatting!</div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.message,
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.role === 'user' ? '#808080' : '#808080',
                                }}
                            >
                                <strong>{msg.role === 'user' ? '👤 You:' : '🤖 Assistant:'}</strong> {msg.text}
                            </div>
                        ))
                    )}
                </div>
                <div style={styles.inputArea}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button style={styles.button} onClick={sendMessage}>
                        🚀 Send
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', height: '100vh', fontFamily: "'Roboto', sans-serif", color: '#fff', backgroundColor: '#1a1a1a' },
    sidebar: { width: '25%', borderRight: '1px solid #ddd', padding: '10px', backgroundColor: '#222' },
    header: { textAlign: 'center', padding: '10px', backgroundColor: '#007bff', color: '#fff', marginBottom: '0', fontSize: '18px', fontWeight: 'bold' },
    chatList: { overflowY: 'auto', maxHeight: 'calc(100vh - 80px)', padding: '5px' },
    chatItemContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        borderBottom: '1px solid #333',
        borderRadius: '4px',
        transition: 'background-color 0.2s ease',
    },
    chatItem: {
        flex: 1,
        color: '#ddd',
        cursor: 'pointer',
        textAlign: 'left',
        padding: '5px 0',
    },
    deleteButton: {
        marginLeft: '10px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ff4d4f',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'color 0.2s ease',
    },
    newChat: { display: 'flex', marginTop: '10px' },
    chatContainer: { flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', backgroundColor: '#121212' },
    chatBox: { flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' },
    message: {
      maxWidth: '70%',
      padding: '10px',
      borderRadius: '10px',
      fontSize: '14px',
      lineHeight: '1.5',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      wordWrap: 'break-word',
    },
    deleteButtonHover: {
        color: '#ff6666',
    },
    heading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
        borderBottom: '1px solid #333',
    },
    plusButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '20px',
        fontWeight: 'bold',
        padding: '5px',
        margin: '0',
        transition: 'color 0.2s ease',
    },
    plusButtonHover: {
        color: '#ccc',
    },
    homeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '5px',
        transition: 'color 0.2s ease',
      },
    userMessage: { alignSelf: 'flex-end', backgroundColor: '#e3f2fd', color: '#fff', textAlign: 'right' },
    botMessage: { alignSelf: 'flex-start', backgroundColor: '#e3f2fd', color: '#ddd', textAlign: 'left' },
    placeholder: { textAlign: 'center', color: '#aaa', fontStyle: 'italic', paddingTop: '50px' },
    inputArea: { display: 'flex', padding: '10px', borderTop: '1px solid #333' },
    input: { flex: 1, padding: '10px', marginRight: '5px', borderRadius: '4px', backgroundColor: '#222', color: '#fff', border: '1px solid #444' },
    button: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
  

export default ChatPage;