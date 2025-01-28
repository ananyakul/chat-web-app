'use client';

import { useRouter } from 'next/router';
import ChatPageClient from './ChatPage';

export default function ChatPage() {
  const router = useRouter()
  const chatId = router.query.chatId;
  if (typeof chatId !== "string") {
    return <p>Error</p>
  } 

  return <ChatPageClient chatId={chatId} />;
}