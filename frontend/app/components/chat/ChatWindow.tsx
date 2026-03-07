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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className="flex flex-col w-[480px] h-[720px] rounded-3xl overflow-hidden border border-[#01BAEF]/15 shadow-2xl shadow-black/40"
      style={{
        background: "linear-gradient(160deg, #0d2535 0%, #071E28 60%, #071520 100%)",
      }}
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