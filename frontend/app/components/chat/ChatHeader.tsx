import StatusBar from "./StatusBar";
import Image from "next/image";

interface ChatHeaderProps {
  onClose?: () => void;
  onNewChat?: () => void;
  onToggleHistory?: () => void;
}

export default function ChatHeader({ onClose, onNewChat, onToggleHistory }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#01BAEF]/10 dark:border-transparent bg-[#0B4F6C]/80 dark:bg-[#121212] backdrop-blur-sm transition-colors">

      <div className="flex items-center gap-3">
        {onToggleHistory && (
          <button
            onClick={onToggleHistory}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#FBFBFF] hover:bg-white/10 transition-colors"
            title="Chat History"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#968E85] dark:text-white hover:text-[#01BAEF] dark:hover:text-[#01BAEF] hover:bg-[#01BAEF]/10 transition-colors"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
}