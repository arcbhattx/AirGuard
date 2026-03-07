interface Props {
  status: "online" | "away" | "offline";
}

export default function StatusBar({ status }: Props) {

  const colors = {
    online: "bg-emerald-400",
    away: "bg-yellow-400",
    offline: "bg-gray-500",
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