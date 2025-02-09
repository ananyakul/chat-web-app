// Sidebar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ClipLoader } from 'react-spinners';
import { ChatCircleDots, PencilSimple, Trash } from "@phosphor-icons/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Sidebar = () => {
    const [chatList, setChatList] = useState<{ id: string; title: string }[]>([]);
    const [loadingChatList, setLoadingChatList] = useState(true);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [renameInput, setRenameInput] = useState('');
    const router = useRouter();
    const params = useParams();
    const chatId = params.chatId;

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

    useEffect(() => {
        fetchChatList();
    }, [fetchChatList]);

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

    const handleRename = useCallback(async (chatId: string) => {
        if (!renameInput.trim()) return;

        try {
            const response = await fetch(`${BACKEND_URL}/rename_chat/${chatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: renameInput }),
            });

            if (response.ok) {
                setChatList((prev) =>
                    prev.map((chat) =>
                        chat.id === chatId ? { ...chat, title: renameInput } : chat
                    )
                );
            } else {
                console.error('Failed to rename chat:', response.status);
            }
        } catch (error) {
            console.error('Error renaming chat:', error);
        }

        setEditingChatId(null);
    }, [renameInput]);

    return (
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

            );
};

const styles: { [key: string]: React.CSSProperties } = {
    sidebar: {
        display: 'flex', 
        flexDirection: 'column',
        width: '25%',
        borderRight: '1px solid #ddd',
        backgroundColor: '#222',
        padding: '0px',
        overflowY: 'auto'
    },
    heading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px',
        backgroundColor: '#007FFF',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
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
    chatList: { 
        overflowY: 'auto', 
        padding: '5px' 
    },
    placeholder: { 
        textAlign: 'center', 
        color: '#aaa', 
        fontStyle: 'italic', 
        paddingTop: '50px' 
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
    renameInput: {
        padding: '5px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        color: '#000',
        outline: 'none',
        width: '80%',
    },
    renameButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ddd',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '5px',
        transition: 'color 0.2s ease',
        display: 'flex',
        alignItems: 'center',
    },
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

}

export default Sidebar;
