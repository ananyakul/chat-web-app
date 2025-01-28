"use client";

import { useParams } from 'next/navigation';
import ChatPageClient from './ChatPage';

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId;
  if (typeof chatId !== "string") {
    return <p>Error</p>
  } 

  return <ChatPageClient chatId={chatId} />;
}