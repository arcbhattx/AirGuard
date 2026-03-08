"use client";

import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import LauncherButton from "./LaunchButton";
import { Message } from "@/app/types/chat";
import { SAMPLE_MESSAGES } from "@/app/constants/chat";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface AirGuardChatProps {
  user: User | null;
  initialConversations: any[]; // We can cast this properly, but any is fine for now
}

export default function AirGuardChat({ user, initialConversations }: AirGuardChatProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [conversations, setConversations] = useState<any[]>(initialConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [unread, setUnread] = useState(1);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations.length > 0 ? initialConversations[0].id : null
  );

  const supabase = createClient();

  // On load, fetch existing messages for the active conversation
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) {
        // Fallback to sample messages if it's a completely new user or explicitly creating a new chat
        setMessages(SAMPLE_MESSAGES);
        setShowQuickReplies(true);
        return;
      }

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          text: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
        setShowQuickReplies(false);
      } else {
        setMessages(SAMPLE_MESSAGES);
        setShowQuickReplies(true);
      }
    }

    loadMessages();
  }, [activeConversationId, supabase]);

  const handleNewChat = () => {
    if (!user) return;
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Determine current conversation id, create one if it doesn't exist yet
    let convId = activeConversationId;
    if (!convId && user) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: text.substring(0, 30) + "..." })
        .select("*")
        .single();
      
      if (newConv) {
        convId = newConv.id;
        setActiveConversationId(newConv.id);
        setConversations((prev) => [newConv, ...prev]);
      }
    }

    // Append to UI immediately for snappy response
    const tempId = Date.now().toString();
    const userMsg: Message = {
      id: tempId,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowQuickReplies(false);

    // Save user message to DB
    if (convId) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: trimmed,
      });
    }

    // Simulate backend processing an AI response
    setTimeout(async () => {
      const aiResponseText = "Simulated response: We are syncing with real-time flight maps!";
      
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: aiResponseText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);

      // Save AI response to DB
      if (convId) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: aiResponseText,
        });
      }
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