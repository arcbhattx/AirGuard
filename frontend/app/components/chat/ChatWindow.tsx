"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/app/types/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import QuickReplyChips from "./QuickReplyChips";
import ChatSidebar from "./ChatSidebar";

interface Props {
  messages: Message[];
  conversations: any[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isTyping: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onQuickReply: (v: string) => void;
  showQuickReplies: boolean;
  onClose?: () => void;
}

export default function ChatWindow({
  messages,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isTyping,
  input,
  onInputChange,
  onSend,
  onQuickReply,
  showQuickReplies,
  onClose,
}: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [messages, isTyping]);

  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden border-l border-[#01BAEF]/15 dark:border-white/10 shadow-2xl shadow-[#0B4F6C]/20 dark:shadow-none bg-[#FBFBFF] dark:bg-[#121212] transition-colors relative"
    >
      <ChatSidebar 
        isVisible={showHistory} 
        onClose={() => setShowHistory(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={onSelectConversation}
        onNewChat={onNewChat}
      />

      <ChatHeader 
        onToggleHistory={() => setShowHistory(!showHistory)} 
        onClose={onClose} 
        onNewChat={onNewChat}
      />

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {showQuickReplies && <QuickReplyChips onSelect={onQuickReply} />}

      <MessageInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        disabled={isTyping}
      />
    </div>
  );
}