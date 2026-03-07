interface Props {
  status: "online" | "away" | "offline";
}

export default function StatusBar({ status }: Props) {

  const colors = {
    online: "bg-[#01BAEF]",
    away: "bg-[#968E85]",
    offline: "bg-[#0B4F6C]",
  };

  return (
    <div className="flex items-center gap-2">

      <span className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />

      <span className="text-xs text-[#968E85] capitalize">
        {status}
      </span>

    </div>
  );
}