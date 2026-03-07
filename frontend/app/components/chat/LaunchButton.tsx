interface Props {
  onClick: () => void
  unread: number
}

export default function LauncherButton({ onClick, unread }: Props) {

  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B4F6C] to-[#01BAEF] flex items-center justify-center shadow-xl relative hover:scale-105 transition"
    >

      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FBFBFF" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>

      {unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#01BAEF] text-[#0B4F6C] text-[10px] font-bold flex items-center justify-center border-2 border-[#0B4F6C]">
          {unread}
        </span>
      )}

    </button>
  );
}