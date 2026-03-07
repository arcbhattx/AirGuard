import Avatar from "./Avatar";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4">
      <Avatar role="assistant" />

      <div className="bg-[#0B4F6C]/60 border border-[#01BAEF]/20 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#01BAEF] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}