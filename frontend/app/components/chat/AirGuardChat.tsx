"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import LauncherButton from "./LaunchButton";
import { Message } from "@/app/types/chat";
import { SAMPLE_MESSAGES } from "@/app/constants/chat";

export default function AirGuardChat() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [unread, setUnread] = useState(1);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowQuickReplies(false);

    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Processing your air quality request...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1800);
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
            isTyping={isTyping}
            input={input}
            onInputChange={setInput}
            onSend={() => sendMessage(input)}
            onQuickReply={(v) => sendMessage(v)}
            showQuickReplies={showQuickReplies}
            onClose={() => setIsOpen(false)}
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