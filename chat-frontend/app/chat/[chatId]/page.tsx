import ChatPageClient from './ChatPage';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { chatId } = params; // chatId = params.chatId;

  return <ChatPageClient params={{ chatId }} />;
}