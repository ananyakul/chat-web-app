'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Chat {
    id: string;
    title: string;
}

interface ChatContextType {
    chatList: Chat[];
    setChatList: (chats: Chat[]) => void;
    addChat: (chat: Chat) => void;
    updateChatTitle: (chatId: string, newTitle: string) => void;
    removeChat: (chatId: string) => void;
    fetchChatList: () => Promise<void>;
    loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" }; // Exclude Authorization if token is missing
    };
      

    const fetchChatList = useCallback(async () => {
        if (!isAuthenticated || hasFetched) return;
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/list_chats`, {
                method: "GET",
                headers: getAuthHeaders(),
              });

            if (response.ok) {
                const data: Chat[] = await response.json();
                setChatList(data);
                setHasFetched(true);
            } else {
                console.error('Failed to fetch chat list');
            }
        } catch (error) {
            console.error('Error fetching chat list:', error);
        } finally {
            setLoading(false);
        }
    }, [hasFetched]);

    useEffect(() => {
        fetchChatList();
    }, [fetchChatList]);

    const addChat = (chat: Chat) => {
        setChatList((prev) => [...prev, chat]);
    };

    const updateChatTitle = (chatId: string, newTitle: string) => {
        setChatList((prev) =>
            prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
        );
    };

    const removeChat = (chatId: string) => {
        setChatList((prev) => prev.filter((chat) => chat.id !== chatId));
    };

    return (
        <ChatContext.Provider value={{ chatList, setChatList, addChat, updateChatTitle, removeChat, fetchChatList, loading }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};