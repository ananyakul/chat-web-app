import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const Chat = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [chatList, setChatList] = useState<string[]>([]);
  const [chatTitle, setChatTitle] = useState<string>('');
  const router = useRouter();
  const { chatId } = router.query;

  // Fetch list of chats
  const fetchChatList = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/list_chats');
      if (response.ok) {
        const data: string[] = await response.json();
        setChatList(data);
      } else {
        console.error('Failed to fetch chat list');
      }
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_chat/${chatId}`);
      if (response.ok) {
        const data: Message[] = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Create a new chat
  const createChat = async () => {
    if (!chatTitle.trim()) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/create_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_title: chatTitle,
          first_message: { role: 'user', text: input },
        }),
      });

      if (response.ok) {
        const [newChatId, responseMessage]: [string, Message] = await response.json();
        setMessages([responseMessage]);
        setChatList((prev) => [...prev, newChatId]);
        router.push(`/chat/${newChatId}`);
      } else {
        console.error('Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setChatTitle('');
      setInput('');
    }
  };

  // Send a message in an existing chat
  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/add_message_to_chat/${chatId}`, {
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
  };

  // Load chat list and messages on component mount
  useEffect(() => {
    fetchChatList();
    if (chatId) fetchMessages();
  }, [chatId]);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.header}>Chats</h2>
        <div style={styles.chatList}>
          {chatList.map((id) => (
            <div
              key={id}
              style={styles.chatItem}
              onClick={() => router.push(`/chat/${id}`)}
            >
              Chat {id.slice(0, 8)}...
            </div>
          ))}
        </div>
        <div style={styles.newChat}>
          <input
            style={styles.input}
            type="text"
            placeholder="New chat title"
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
          />
          <button style={styles.button} onClick={createChat}>
            ➕ Create
          </button>
        </div>
      </div>

      <div style={styles.chatContainer}>
        <h2 style={styles.header}>Chat</h2>
        <div style={styles.chatBox}>
          {messages.length === 0 ? (
            <div style={styles.placeholder}>No messages yet. Start chatting!</div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end',
                  backgroundColor: msg.role === 'user' ? '#e1f5fe' : '#dcedc8',
                }}
              >
                <strong>{msg.role === 'user' ? '👤 You:' : '🤖 Bot:'}</strong> {msg.text}
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

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', height: '100vh' },
  sidebar: { width: '25%', borderRight: '1px solid #ddd', padding: '10px' },
  header: { textAlign: 'center', padding: '10px 0', backgroundColor: '#007bff', color: '#fff', marginBottom: '10px' },
  chatList: { overflowY: 'auto', maxHeight: '70vh' },
  chatItem: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#007bff' },
  newChat: { display: 'flex', marginTop: '10px' },
  chatContainer: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatBox: { flex: 1, overflowY: 'auto', padding: '10px' },
  placeholder: { textAlign: 'center', color: '#aaa', fontStyle: 'italic', paddingTop: '50px' },
  inputArea: { display: 'flex', padding: '10px', borderTop: '1px solid #ddd' },
  input: { flex: 1, padding: '10px', marginRight: '5px' },
  button: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' },
};

export default Chat;
