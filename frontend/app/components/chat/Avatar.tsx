
import { Role } from "@/app/types/chat";

interface AvatarProps {
  role: Role;
}

export default function Avatar({ role }: AvatarProps) {
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#FBFBFF]
      ${role === "assistant"
        ? "bg-gradient-to-br from-[#0B4F6C] to-[#01BAEF] ring-2 ring-[#01BAEF]/30"
        : "bg-[#968E85]"
      }`}
    >
      {role === "assistant" ? "AG" : "U"}
    </div>
  );
}