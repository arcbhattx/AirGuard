import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface NavBarProps {
  user?: User | null;
}

export default function NavBar({ user }: NavBarProps) {

  const signOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect('/login');
  };

  return (
    <nav className="w-full h-16 bg-[#FBFBFF] dark:bg-[#121212] flex items-center justify-between px-6 border-b border-[#01BAEF]/20 shadow-sm shrink-0 z-50 relative transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B4F6C] dark:from-white to-[#01BAEF] flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#FBFBFF] dark:text-[#121212]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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


        <div className="w-px h-6 bg-[#01BAEF]/20 mx-2" />

        <ThemeToggle />

        {user ? (
          <form action={signOut}>
            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 dark:border-red-500/30 text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm">
              Sign Out
            </button>
          </form>
        ) : (
          <Link href="/login" className="bg-[#0B4F6C] dark:bg-white hover:bg-[#01BAEF] dark:hover:bg-[#01BAEF] hover:text-[#0B4F6C] dark:text-[#121212] text-[#FBFBFF] text-sm font-medium px-5 py-2 rounded-xl transition-all shadow-sm inline-block">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
