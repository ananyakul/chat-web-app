'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import { ChatCircleDots, PencilSimple, Trash } from "@phosphor-icons/react";
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const NewChatPage = () => {
    const [chatTitle, setChatTitle] = useState('');
    const [firstMessage, setFirstMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatList, setChatList] = useState<{ id: string; title: string }[]>([]);
    const [loadingChatList, setLoadingChatList] = useState(true);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [renameInput, setRenameInput] = useState('');
    const router = useRouter();
    const params = useParams();
    const chatId = params.chatId;

    useEffect(() => {
        fetchChatList();
    }, []);

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

    const handleCreateChat = useCallback(async () => {
        if (!chatTitle.trim() || !firstMessage.trim()) return;
        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/create_chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_title: chatTitle,
                    first_message: { role: 'user', text: firstMessage },
                }),
            });

            if (!response.ok) {
                console.error(`Failed to create chat. Status: ${response.status}`);
                setLoading(false);
                return;
            }

            const [newChatId] = await response.json();
            router.push(`/chat/${newChatId}`); // Redirect to new chat
        } catch (error) {
            console.error('Error creating chat:', error);
        } finally {
            setLoading(false);
        }
    }, [chatTitle, firstMessage, router]);

    const handleRename = useCallback(async (chatId: string) => {
        if (!renameInput.trim()) return; // Prevent empty names
    
        try {
            const response = await fetch(`${BACKEND_URL}/rename_chat/${chatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: renameInput }),
            });
    
            const responseData = await response.json();
            console.log('Rename API Response:', responseData);
    
            if (response.ok) {
                setChatList((prev) =>
                    prev.map((chat) =>
                        chat.id === chatId ? { ...chat, title: renameInput } : chat
                    )
                );
            } else {
                console.error('Failed to rename chat:', response.status, responseData);
            }
        } catch (error) {
            console.error('Error renaming chat:', error);
        }
    
        setEditingChatId(null); // Exit edit mode
    }, [renameInput, setChatList]);

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

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.heading}>
                    <button style={styles.homeButton} onClick={() => router.push('/')}>
                        <Image src="/logo.png" alt="Logo" width={30} height={30} />
                    </button>
                    <span>Chats</span>
                    <button style={styles.plusButton} onClick={() => router.push('/new-chat')}>
                        {/* <Image src="/write-icon-white.png" alt="New Chat Icon" width={36} height={36} /> */}
                        <ChatCircleDots size={32} color="#ffffff" weight="bold" />
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
                        <div 
                            key={chat.id} 
                            style={{
                                ...styles.chatItemContainer,
                                backgroundColor: chat.id === chatId ? '#333' : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between', // Distributes items evenly
                                padding: '10px',
                            }} 
                        onClick={() => router.push(`/chat/${chat.id}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        {editingChatId === chat.id ? (
                            <input 
                                type="text"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                onBlur={() => handleRename(chat.id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename(chat.id)}
                                style={styles.renameInput}
                                autoFocus
                            />
                        ) : (
                            <span style={styles.chatItem}>{chat.title}</span>
                        )}

                        {/* Rename Button (Edit Icon) */}
                        <button 
                            style={styles.renameButton} 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent navigation when clicking rename
                                setEditingChatId(chat.id);
                                setRenameInput(chat.title);
                            }}
                        >
                            <PencilSimple size={24} color="#ffffff" />
                        </button>
                    </div>

                {/* Delete Button */}
                <button 
                    style={styles.deleteButton} 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking delete
                        deleteChat(chat.id);
                    }}
                >
                    <Trash size={24} color="#ff0000" weight="fill" />
                </button>
            </div>
                    )))}
                </div>
                )}
            </div>

            {/* New Chat Form */}
            <div style={styles.chatContainer}>
                <div style={styles.formContainer}>
                    <h2 style={styles.header}>Create New Chat</h2>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Chat Title"
                        value={chatTitle}
                        onChange={(e) => setChatTitle(e.target.value)}
                        disabled={loading}
                    />
                    <textarea
                        style={styles.textarea}
                        placeholder="First Message"
                        value={firstMessage}
                        onChange={(e) => setFirstMessage(e.target.value)}
                        disabled={loading}
                    />
                    <button style={styles.button} onClick={handleCreateChat} disabled={loading}>
                        {loading ? <ClipLoader color="#fff" size={16} /> : "Create Chat"}
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
        fontFamily: "'Roboto', sans-serif",
        color: '#fff',
        backgroundColor: '#121212',
    },
    sidebar: {
        display: 'flex-column',
        width: '25%',
        borderRight: '1px solid #ddd',
        backgroundColor: '#222',
        padding: '0px'
    },
    heading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px',
        backgroundColor: '#1e40af',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    chatList: { overflowY: 'auto', padding: '5px' },
    chatItem: {
        padding: '10px',
        cursor: 'pointer',
        color: '#ddd',
        transition: 'background-color 0.2s ease',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
    },
    chatContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',

    },
    chatItemContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        borderBottom: '1px solid #333',
        borderRadius: '4px',
        transition: 'background-color 0.2s ease',
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        width: '100%',
        maxWidth: '500px',
        padding: '40px',
        backgroundColor: '#2c2c2c',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    header: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '14px',
        borderRadius: '6px',
        backgroundColor: '#1e1e1e',
        color: '#fff',
        border: '1px solid #444',
        outline: 'none',
        fontSize: '16px',
    },
    textarea: {
        width: '100%',
        height: '100px',
        padding: '14px',
        borderRadius: '6px',
        backgroundColor: '#1e1e1e',
        color: '#fff',
        border: '1px solid #444',
        outline: 'none',
        fontSize: '16px',
        resize: 'none',
    },
    button: {
        width: '100%',
        padding: '14px',
        borderRadius: '6px',
        backgroundColor: '#1e40af',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
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
};

export default NewChatPage;