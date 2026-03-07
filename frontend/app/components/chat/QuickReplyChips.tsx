import { QUICK_REPLIES } from "@/app/constants/chat";
interface Props {
  onSelect: (v: string) => void;
}

export default function QuickReplyChips({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">

      {QUICK_REPLIES.map((reply) => (

        <button
          key={reply.value}
          onClick={() => onSelect(reply.value)}
          className="text-xs px-3 py-1.5 rounded-full border border-[#01BAEF]/40 text-[#01BAEF] hover:bg-[#01BAEF]/10"
        >
          {reply.label}
        </button>

      ))}

    </div>
  );
}