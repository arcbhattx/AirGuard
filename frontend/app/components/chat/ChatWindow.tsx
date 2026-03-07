"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/app/types/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";0
import MessageInput from "./MessageInput";
import QuickReplyChips from "./QuickReplyChips";

interface Props {
  messages: Message[];
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
  isTyping,
  input,
  onInputChange,
  onSend,
  onQuickReply,
  showQuickReplies,
  onClose,
}: Props) {

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [messages, isTyping]);

  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden border-l border-[#01BAEF]/15 dark:border-white/10 shadow-2xl shadow-[#0B4F6C]/20 dark:shadow-none bg-[#FBFBFF] dark:bg-[#121212] transition-colors"
    >
      <ChatHeader onClose={onClose} />

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