
import { Role } from "@/app/types/chat";

interface AvatarProps {
  role: Role;
}

export default function Avatar({ role }: AvatarProps) {
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#FBFBFF] transition-colors
      ${role === "assistant"
        ? "bg-gradient-to-br from-[#0B4F6C] to-[#01BAEF] dark:bg-none dark:bg-[#1A1A1A] dark:text-white dark:border dark:border-white/20 ring-2 ring-[#01BAEF]/30 dark:ring-0"
        : "bg-[#968E85] dark:bg-[#1A1A1A] dark:text-white dark:border dark:border-white/20"
      }`}
    >
      {role === "assistant" ? "AG" : "U"}
    </div>
  );
}