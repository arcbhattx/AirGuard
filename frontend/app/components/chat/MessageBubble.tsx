import { Message } from "@/app/types/chat";
import Avatar from "./Avatar";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex items-end gap-3 px-4 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <Avatar role={message.role} />

      <div className={`flex flex-col gap-1 max-w-[75%] ${isAssistant ? "items-start" : "items-end"}`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed
          ${isAssistant
              ? "bg-[#0B4F6C] dark:bg-transparent border border-[#01BAEF]/20 dark:border-white/20 text-[#FBFBFF] dark:text-white rounded-2xl rounded-bl-sm shadow-sm transition-colors"
              : "bg-[#01BAEF] dark:bg-[#1A1A1A] text-[#0B4F6C] dark:text-white font-medium rounded-2xl rounded-br-sm shadow-sm transition-colors border border-transparent dark:border-white/10"
            }`}
        >
          {message.text}
        </div>

        <span className="text-[10px] text-[#968E85] dark:text-white transition-colors">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}