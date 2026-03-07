interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
}

export default function MessageInput({
  value,
  onChange,
  onSend,
  disabled
}: Props) {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex items-end gap-3 px-4 py-4 border-t border-[#01BAEF]/10 bg-[#071E28]/80">

      <div className="flex-1">

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about air quality, filters, alerts..."
          rows={1}
          className="w-full bg-[#0B4F6C]/40 border border-[#01BAEF]/20 rounded-2xl px-4 py-3 text-sm text-[#FBFBFF] placeholder-[#968E85] focus:outline-none focus:border-[#01BAEF]/50 resize-none"
        />

      </div>

      <button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition
        ${value.trim()
          ? "bg-[#01BAEF] text-[#0B4F6C]"
          : "bg-[#0B4F6C]/40 text-[#968E85]"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m22 2-7 20-4-9-9-4Z"/>
        </svg>
      </button>

    </div>
  )
}