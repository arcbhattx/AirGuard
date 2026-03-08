import StatusBar from "./StatusBar";
import { History, X } from "lucide-react";

interface ChatHeaderProps {
  onToggleHistory: () => void;
  onClose?: () => void;
}

export default function ChatHeader({ onToggleHistory, onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#01BAEF]/10 dark:border-transparent bg-[#0B4F6C]/80 dark:bg-[#121212] backdrop-blur-sm transition-colors relative z-10">
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0B4F6C] to-[#01BAEF] flex items-center justify-center text-[#FBFBFF] font-bold">
            AG
          </div>

          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#01BAEF] border-2 border-[#0B4F6C]" />
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