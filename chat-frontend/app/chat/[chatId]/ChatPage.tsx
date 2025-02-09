'use client';

import { useState, useEffect, JSX, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import { PaperPlaneTilt } from "@phosphor-icons/react";
import Sidebar from '@/components/Sidebar';

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
    const [hover, setHover] = useState(false);
    const chatId = params?.chatId;

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

    useEffect(() => {
        fetchChatList();
        fetchMessages();
    }, [chatId, fetchChatList, fetchMessages]);

    useEffect(() => {
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, [messages]);

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <Sidebar/>
            
            {/* Chat Page */}
            <div style={styles.chatContainer}>
                <h2 style={styles.header}>{currentChatTitle || "Select a Chat"}</h2>
                <div id="chatBox" style={styles.chatBox}>
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
                                    backgroundColor: msg.role === 'user' ? '#414141' : '#414141',
                                }}
                            >
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </motion.div>
                        ))
                    )}
                    {/* Bot Typing UI */}
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
                </div>
                {/* Text Box Area and Send Button */}
                <div style={styles.inputArea}>
                    <textarea
                        style={styles.textarea}
                        placeholder="Type a message..."
                        value={input}
                        rows={1}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />
                    <button 
                        style={{
                            ...styles.sendButton,
                            ...(hover ? styles.sendButtonHover : {}) // Apply hover style when hover state is true
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={sendMessage}
                    >
                        <PaperPlaneTilt size={20} color="#ffffff" weight="bold" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { 
        display: 'flex', 
        height: '100vh', 
        fontFamily: "'Inter', sans-serif", 
        color: '#fff', 
        backgroundColor: '#3f3f3f' 
    },
    header: { 
        textAlign: 'center', 
        padding: '21px', 
        backgroundColor: '#222', 
        color: '#fff', 
        marginBottom: '0', 
        fontSize: '18px', 
        fontWeight: 'bold'
    },
    chatContainer: { 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '0px', 
        backgroundColor: '#222' 
    },
    chatBox: { 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px', 
        WebkitOverflowScrolling: 'touch', 
        overscrollBehavior: 'contain', 
        scrollSnapType: 'y proximity' 
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
    placeholder: { 
        textAlign: 'center', 
        color: '#aaa', 
        fontStyle: 'italic', 
        paddingTop: '50px' 
    },
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
    inputArea: { 
        position: 'sticky', 
        gap: '10px',
        bottom: '0', 
        display: 'flex', 
        padding: '10px', 
        borderTop: '1px solid #333', 
        backgroundColor: '#222' 
    },
    textarea: {
        flex: 1,
        minHeight: '40px',
        maxHeight: '150px',
        padding: '10px',
        borderRadius: '4px',
        backgroundColor: '#222',
        color: '#fff',
        border: '1px solid #444',
        resize: 'none',
        overflowY: 'hidden',
        fontSize: '14px',
        lineHeight: '1.5',
        outline: 'none',
    },
    sendButton: {
        backgroundColor: '#007FFF',
        border: 'none',
        borderRadius: '6px',
        padding: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '48px',
        height: '40px',
        transition: 'background-color 0.2s ease',
    },
    sendButtonHover: {
        backgroundColor: '#1c39bb',
    }
};

export default ChatPage;