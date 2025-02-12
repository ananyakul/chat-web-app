'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import Sidebar from '@/components/Sidebar';
import { useChatContext } from '@/context/ChatContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const NewChatPage = () => {
    const [chatTitle, setChatTitle] = useState('');
    const [firstMessage, setFirstMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { addChat } = useChatContext();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const getAuthHeaders = useCallback((): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" };
    }, []);

    const handleCreateChat = useCallback(async () => {
        if (!chatTitle.trim() || !firstMessage.trim() || !isAuthenticated) return;
        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/create_chat`, {
                method: 'POST',
                headers: getAuthHeaders(),
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
            addChat({ id: newChatId, title: chatTitle });
            router.push(`/chat/${newChatId}`); // Redirect to new chat
        } catch (error) {
            console.error('Error creating chat:', error);
        } finally {
            setLoading(false);
        }
    }, [chatTitle, firstMessage, router, addChat]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // console.error("No token found, redirecting to login.");
            setIsAuthenticated(false);
            router.replace("/login");
            return;
        } else {
            setIsAuthenticated(true);}
        setIsCheckingAuth(false);
    }, [router]);

    if (isCheckingAuth) {
        return <div style={styles.loading}>Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <Sidebar/>

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
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
        backgroundColor: '#222',
    },
    chatContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',

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
        backgroundColor: '#818589',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    loading: {
        color: "#222",
        textAlign: "center",
        paddingTop: "50px",
        fontSize: "18px",
    },
};

export default NewChatPage;