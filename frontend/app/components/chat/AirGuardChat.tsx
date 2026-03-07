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

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    setShowQuickReplies(false);

    try {
      // Map existing messages to the format the API expects
      const history = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();
      
      if (res.ok && data.reply) {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, reply]);
      } else {
        throw new Error(data.detail || "Error connecting to AI.");
      }
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I am having trouble connecting to my servers right now.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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