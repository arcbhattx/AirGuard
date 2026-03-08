"use client";

import { MessageSquare, Plus, Clock } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isVisible,
  onClose,
}: ChatSidebarProps) {
  return (
    <div
      className={`absolute inset-0 z-50 transition-transform duration-300 ease-in-out bg-[#FBFBFF] dark:bg-[#121212] border-r border-[#01BAEF]/10 dark:border-white/10 ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-[#01BAEF]/5 dark:border-white/5 bg-[#0B4F6C]/5 dark:bg-white/5">
          <h2 className="text-lg font-bold text-[#0B4F6C] dark:text-[#01BAEF] flex items-center gap-2">
            <Clock size={20} />
            History
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#01BAEF]/10 transition-colors text-slate-400"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="m-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0B4F6C] to-[#01BAEF] text-white rounded-xl font-medium shadow-lg shadow-[#01BAEF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          New Conversation
        </button>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm italic">
              No history found
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left transition-all group ${
                  activeConversationId === conv.id
                    ? "bg-[#01BAEF]/10 text-[#01BAEF] font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeConversationId === conv.id ? "bg-[#01BAEF] text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-[#01BAEF]"
                }`}>
                  <MessageSquare size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{conv.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
