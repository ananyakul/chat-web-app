'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const NewChatPage = () => {
    const [chatTitle, setChatTitle] = useState('');
    const [firstMessage, setFirstMessage] = useState('');
    const router = useRouter();

    const handleCreateChat = async () => {
        if (!chatTitle.trim() || !firstMessage.trim()) return;

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
                return;
            }

            const [newChatId] = await response.json();

            // Redirect to the new chat
            router.push(`/chat/${newChatId}`);
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <h2 style={styles.header}>Create New Chat</h2>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Chat Title"
                    value={chatTitle}
                    onChange={(e) => setChatTitle(e.target.value)}
                />
                <textarea
                    style={styles.textarea}
                    placeholder="First Message"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                />
                <button style={styles.button} onClick={handleCreateChat}>
                    Create Chat
                </button>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        width: '90%',
        maxWidth: '400px',
        padding: '30px',
        backgroundColor: '#2c2c2c',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    header: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: '10px',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        backgroundColor: '#1e1e1e',
        color: '#fff',
        border: '1px solid #444',
        outline: 'none',
        fontSize: '16px',
    },
    textarea: {
        width: '100%',
        height: '80px',
        padding: '12px',
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
        padding: '12px',
        borderRadius: '6px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    },
};

export default NewChatPage;
