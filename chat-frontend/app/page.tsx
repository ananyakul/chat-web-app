'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Chat {
  id: string;
  title: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Home = () => {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const router = useRouter();

  // Fetch chat list
  const fetchChatList = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/list_chats`);
      if (response.ok) {
        const data: Chat[] = await response.json();
        setChatList(data);
      } else {
        console.error('Failed to fetch chat list');
      }
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/delete_chat/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChatList((prev) => prev.filter((chat) => chat.id !== chatId));
      } else {
        console.error(`Failed to delete chat. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
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
            <div
              key={chat.id}
              style={{
                ...styles.chatItemContainer,
                backgroundColor: 'transparent',
              }}
            >
              <div
                style={styles.chatItem}
                onClick={() => router.push(`/chat/${chat.id}`)}
              >
                {chat.title.length > 20 ? `${chat.title.slice(0, 20)}...` : chat.title}
              </div>
              <button style={styles.deleteButton} onClick={() => deleteChat(chat.id)}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Landing Page */}
      <div style={styles.mainContent}>
        <h1 style={styles.welcomeTitle}>Welcome to Ananya&apos;s Chat App</h1>
        <p style={styles.instructions}>
          Select a chat from the sidebar or click ➕ to create a new one.
        </p>
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
    backgroundColor: '#1a1a1a',
  },
  sidebar: {
    width: '25%',
    borderRight: '1px solid #ddd',
    padding: '10px',
    backgroundColor: '#222',
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
  chatList: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 80px)',
    padding: '5px',
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
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#121212',
  },
  welcomeTitle: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  instructions: {
    fontSize: '16px',
    color: '#bbb',
  },
  homeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px',
    transition: 'color 0.2s ease',
  }
};

export default Home;
