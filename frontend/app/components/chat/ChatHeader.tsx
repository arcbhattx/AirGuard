import StatusBar from "./StatusBar";
import Image from "next/image";
import { History, X } from "lucide-react";

interface ChatHeaderProps {
  onToggleHistory: () => void;
  onClose?: () => void;
  onNewChat?: () => void;
}

export default function ChatHeader({ onToggleHistory, onClose, onNewChat }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#01BAEF]/10 dark:border-transparent bg-[#0B4F6C]/80 dark:bg-[#121212] backdrop-blur-sm transition-colors relative z-10">
      
      <div className="flex items-center gap-3">

        <div className="relative">
          <div className="w-14 h-14 flex items-center justify-center relative overflow-visible">
            <Image src="/assets/airguard.svg" alt="AirGuard AI" fill className="object-contain" />
          </div>

          <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#01BAEF] border-2 border-[#0B4F6C]" />
        </div>

        <div className="flex flex-col">
          <span className="text-[#FBFBFF] font-semibold text-sm tracking-wide">
            AirGuard AI
          </span>

          <StatusBar status="online" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleHistory}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#FBFBFF] hover:text-[#01BAEF] hover:bg-[#FBFBFF]/10 transition-all border border-[#FBFBFF]/10 hover:border-[#01BAEF]/30 group"
          title="History"
        >
          <History size={18} className="group-hover:rotate-12 transition-transform" />
        </button>

        {onNewChat && (
          <button
            onClick={onNewChat}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#968E85] dark:text-white hover:text-[#01BAEF] dark:hover:text-[#01BAEF] hover:bg-[#01BAEF]/10 transition-colors"
            title="New Chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#FBFBFF] hover:text-red-400 hover:bg-red-400/10 transition-all border border-[#FBFBFF]/10 hover:border-red-400/30 group"
            title="Close Chat"
          >
            <X size={20} />
          </button>
        )}

      </div>
    </div>
  );
}