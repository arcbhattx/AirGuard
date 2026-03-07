import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function NavBar() {
  return (
    <nav className="w-full h-16 bg-[#FBFBFF] dark:bg-[#121212] flex items-center justify-between px-6 border-b border-[#01BAEF]/20 shadow-sm shrink-0 z-50 relative transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B4F6C] dark:from-white to-[#01BAEF] flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#FBFBFF] dark:text-[#121212]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-[#0B4F6C] dark:text-white tracking-wide relative top-[1px] transition-colors">AirGuard</span>
      </div>
      
      <div className="flex items-center gap-6">
        <Link href="#about" className="text-sm font-semibold text-[#01BAEF] hover:text-[#0B4F6C] dark:hover:text-white transition-colors">
          About
        </Link>
        <Link href="/" className="text-sm font-semibold text-[#01BAEF] hover:text-[#0B4F6C] dark:hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link href="#" className="text-sm font-medium text-[#968E85] hover:text-[#0B4F6C] dark:hover:text-white transition-colors">
          Sensors
        </Link>
        <Link href="#" className="text-sm font-medium text-[#968E85] hover:text-[#0B4F6C] dark:hover:text-white transition-colors">
          Alerts
        </Link>
        <Link href="#" className="text-sm font-medium text-[#968E85] hover:text-[#0B4F6C] dark:hover:text-white transition-colors">
          Settings
        </Link>
        
        <div className="w-px h-6 bg-[#01BAEF]/20 mx-2" />
        
        <ThemeToggle />

        <button className="bg-[#0B4F6C] dark:bg-white hover:bg-[#01BAEF] dark:hover:bg-[#01BAEF] hover:text-[#0B4F6C] dark:text-[#121212] text-[#FBFBFF] text-sm font-medium px-5 py-2 rounded-xl transition-all shadow-sm">
          Sign In
        </button>
      </div>
    </nav>
  );
}
