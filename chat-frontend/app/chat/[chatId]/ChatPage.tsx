'use client';

import { useState, useEffect, JSX, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const ChatPage = (params: { chatId: string }): JSX.Element => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [chatList, setChatList] = useState<{ id: string; title: string }[]>([]);
    const [currentChatTitle, setCurrentChatTitle] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingChatList, setLoadingChatList] = useState(true);
    const [botTyping, setBotTyping] = useState(false);
    // const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const chatId = params?.chatId;

    // useEffect(() => {
    //     if (messagesEndRef.current) {
    //         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [messages, botTyping]);

    const fetchChatList = useCallback(async () => {
        setLoadingChatList(true);
        try {
            const response = await fetch(`${BACKEND_URL}/list_chats`);
            if (response.ok) {
                const data: { id: string; title: string }[] = await response.json();
                setChatList(data);
            } else {
                console.error('Failed to fetch chat list');
            }
        } catch (error) {
            console.error('Error fetching chat list:', error);
        } finally {
            setLoadingChatList(false);
        }
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!chatId) return;
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/get_chat/${chatId}`);
            if (response.ok) {
                const data: { title: string; messages: Message[] } = await response.json();
                setMessages(data.messages);
                setCurrentChatTitle(data.title);
            } else {
                console.error('Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, [chatId]);

    // const sendMessage = useCallback(async () => {
    //     if (!input.trim() || !chatId) return;

    //     try {
    //         const response = await fetch(`${BACKEND_URL}/add_message_to_chat/${chatId}`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ role: 'user', text: input }),
    //         });

    //         if (response.ok) {
    //             const responseMessage: Message = await response.json();
    //             setMessages((prev) => [...prev, { role: 'user', text: input }, responseMessage]);
    //         } else {
    //             console.error('Failed to send message');
    //         }
    //     } catch (error) {
    //         console.error('Error sending message:', error);
    //     } finally {
    //         setInput('');
    //     }
    // }, [chatId, input]);

    const sendMessage = useCallback(async () => {
        if (!input.trim() || !chatId) return;

        setMessages((prev) => [...prev, { role: 'user', text: input }]);
        setInput('');
        setBotTyping(true);

        try {
            const response = await fetch(`${BACKEND_URL}/add_message_to_chat/${chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', text: input }),
            });

            if (response.ok) {
                const responseMessage: Message = await response.json();
                setMessages((prev) => [...prev, responseMessage]);
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setBotTyping(false);
        }
    }, [chatId, input]);

    const deleteChat = useCallback(async (chatId: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/delete_chat/${chatId}`, {
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
                        <Image src="/logo.png" alt="Logo" width={30} height={30} />
                    </button>
                    <span>Chats</span>
                    <button style={styles.plusButton} onClick={() => router.push('/new-chat')}>
                        <Image src="/write-icon-white.png" alt="New Chat Icon" width={36} height={36} />
                    </button>
                </div>
                    {loadingChatList ? (
                        <div style={styles.loadingContainer}>
                            <ClipLoader color="#007bff" size={20} />
                            <span style={styles.loadingText}>Loading chats...</span>
                        </div>
                ) : (
                <div style={styles.chatList}>
                    {chatList.length === 0 ? (
                            <div style={styles.placeholder}>No chats available.</div>
                        ) : (
                    chatList.map((chat) => (
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
                                <Image src="/trash-can.png" alt="Trash Icon" width={14} height={14} />
                            </button>
                        </div>
                    )))}
                </div>
                )}
                
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
                    {loading ? (
                        <div style={styles.loadingContainer}>
                            <ClipLoader color="#007bff" size={30} />
                        <span style={styles.loadingText}>Loading messages...</span>
                    </div>
                    ) : messages.length === 0 ? (
                        <div style={styles.placeholder}>No messages yet. Start chatting!</div>
                    ) : (
                        messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                style={{
                                    ...styles.message,
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.role === 'user' ? '#808080' : '#808080',
                                }}
                            >
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                {/* <strong>{msg.role === 'user' ? '👤 You:' : '🤖 Assistant:'}</strong> <ReactMarkdown>{msg.text}</ReactMarkdown> */}
                            </motion.div>
                        ))
                    )}
                    

                    {botTyping && (
                        <div style={styles.typingIndicator}>
                            Assistant is typing
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >.</motion.span>
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            >.</motion.span>
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            >.</motion.span>
                    </div>
                    )}
                    {/* <div ref={messagesEndRef} /> */}
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
                        Send Message
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', height: '100vh', fontFamily: "'Roboto', sans-serif", color: '#fff', backgroundColor: '#1a1a1a' },
    sidebar: { width: '25%', borderRight: '1px solid #ddd', padding: '0px', backgroundColor: '#222' },
    header: { textAlign: 'center', padding: '15px', backgroundColor: '#1e40af', color: '#fff', marginBottom: '0', fontSize: '18px', fontWeight: 'bold'},
    chatList: { overflowY: 'auto', maxHeight: '100vh', padding: '5px', height: '100%' },
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
        padding: '10px',
        cursor: 'pointer',
        color: '#ddd',
        transition: 'background-color 0.2s ease',
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
    chatContainer: { flex: 1, display: 'flex', flexDirection: 'column', padding: '0px', backgroundColor: '#121212' },
    chatBox: { flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' },
    message: {
      maxWidth: '70%',
      padding: '10px',
      borderRadius: '10px',
      fontSize: '14px',
      lineHeight: '1.5',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      wordWrap: 'break-word',
      margin: '8px 12px',
    },
    deleteButtonHover: {
        color: '#ff6666',
    },
    heading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px',
        backgroundColor: '#1e40af',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
        borderBottom: '1px solid #333',
        width: '100%',    
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
    typingIndicator: {
        backgroundColor: 'transparent',
        color: '#aaa',
        fontSize: '14px',
        fontStyle: 'italic',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        marginLeft: '15px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#aaa',
    },
    loadingText: {
        marginTop: '10px',
        fontSize: '14px',
        fontStyle: 'italic',
        color: '#aaa',
    },
    userMessage: { alignSelf: 'flex-end', backgroundColor: '#e3f2fd', color: '#fff', textAlign: 'right' },
    botMessage: { alignSelf: 'flex-start', backgroundColor: '#e3f2fd', color: '#ddd', textAlign: 'left' },
    placeholder: { textAlign: 'center', color: '#aaa', fontStyle: 'italic', paddingTop: '50px' },
    inputArea: { display: 'flex', padding: '10px', borderTop: '1px solid #333' },
    input: { flex: 1, padding: '10px', marginRight: '5px', borderRadius: '4px', backgroundColor: '#222', color: '#fff', border: '1px solid #444' },
    button: { padding: '10px 20px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
  

export default ChatPage;