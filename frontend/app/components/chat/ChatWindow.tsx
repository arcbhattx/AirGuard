"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/app/types/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";
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
  onNewChat?: () => void;
  conversations?: any[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
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
  onNewChat,
  conversations = [],
  activeConversationId,
  onSelectConversation,
}: Props) {

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [messages, isTyping]);

  const toggleHistory = () => setIsHistoryOpen((prev) => !prev);

  const handleNewChat = () => {
    setIsHistoryOpen(false);
    onNewChat?.();
  };

  const handleSelectConversation = (id: string) => {
    setIsHistoryOpen(false);
    onSelectConversation?.(id);
  };

  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden border-l border-[#01BAEF]/15 dark:border-white/10 shadow-2xl shadow-[#0B4F6C]/20 dark:shadow-none bg-[#FBFBFF] dark:bg-[#121212] transition-colors relative"
    >
      <ChatHeader onClose={onClose} onNewChat={handleNewChat} onToggleHistory={toggleHistory} />

      {/* History Sidebar / Overlay */}
      <div 
        className={`absolute top-[73px] left-0 bottom-0 w-3/4 max-w-[300px] bg-[#FBFBFF] dark:bg-[#1A1A1A] border-r border-[#01BAEF]/10 z-20 shadow-xl transition-transform duration-300 flex flex-col ${isHistoryOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-[#01BAEF]/10 dark:border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-[#0B4F6C] dark:text-white">Chat History</h3>
          <button onClick={toggleHistory} className="text-[#968E85] hover:text-[#01BAEF]">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-[#968E85] p-2">No past conversations.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left p-3 rounded-xl mb-2 text-sm transition-colors ${
                  activeConversationId === conv.id 
                  ? "bg-[#01BAEF]/10 text-[#0B4F6C] dark:bg-white/10 dark:text-white font-semibold" 
                  : "text-[#968E85] hover:bg-[#01BAEF]/5 hover:text-[#0B4F6C] dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <div className="truncate">{conv.title || "Chat Session"}</div>
                <div className="text-[10px] opacity-70 mt-1">
                  {new Date(conv.created_at).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Backdrop for history sidebar */}
      {isHistoryOpen && (
        <div 
          className="absolute inset-0 bg-black/20 dark:bg-black/50 z-10"
          onClick={toggleHistory}
        />
      )}

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