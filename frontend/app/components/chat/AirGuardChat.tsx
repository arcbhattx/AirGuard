"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import LauncherButton from "./LaunchButton";
import { User } from "@supabase/supabase-js";
import { useChat } from "@/app/hooks/useChat";

interface AirGuardChatProps {
  user: User | null;
  initialConversations: any[]; // We can cast this properly, but any is fine for now
}

export default function AirGuardChat({ user, initialConversations }: AirGuardChatProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(1);

  const {
    messages,
    conversations,
    isTyping,
    sendMessage,
    startNewChat,
    activeConversationId,
    setActiveConversationId,
    showQuickReplies,
  } = useChat(user, initialConversations);

  const handleSend = async (text: string) => {
    setInput("");
    await sendMessage(text);
  };

  return (
    <>
      {/* Chat Container */}
      <div 
        className={`h-full transition-all duration-300 ease-in-out shrink-0 bg-[#FBFBFF] dark:bg-[#121212] overflow-hidden ${isOpen ? "w-[400px]" : "w-0"}`}
      >
        <div className={`w-[400px] h-full transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <ChatWindow
            messages={messages}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            onNewChat={startNewChat}
            isTyping={isTyping}
            input={input}
            onInputChange={setInput}
            onSend={() => handleSend(input)}
            onQuickReply={(v) => handleSend(v)}
            showQuickReplies={showQuickReplies}
            onClose={() => setIsOpen(false)}
            onNewChat={user ? handleNewChat : undefined}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      </div>

      {/* Launcher button if chat is closed */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-[100]">
          <LauncherButton
            onClick={() => {
              setIsOpen(true);
              setUnread(0);
            }}
            unread={unread}
          />
        </div>
      )}
    </>
  );
}