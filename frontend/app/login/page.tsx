import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LoginMapBackground from '@/app/components/map/LoginMapBackground';

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;
  const message = searchParams?.message;

  const loginWithGoogle = async () => {
    'use server';
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      return redirect('/login?message=Could not authenticate with Google');
    }

    if (data.url) {
      redirect(data.url);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111111] font-sans">
      {/* 
        This is the actual Google Map component covering the entire background.
      */}
      <LoginMapBackground />
      
      {/* Gradients to fade out the edges and embed the map smoothly into the wrapper */}
      <div className="absolute inset-0 z-0 bg-transparent overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/50 via-transparent to-[#111111]/50" />
      </div>

      {/* Glassmorphism Login Container */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4">
        <div className="absolute inset-0 bg-[#0B4F6C]/80 backdrop-blur-xl border border-[#01BAEF]/30 rounded-3xl shadow-2xl shadow-black/50" />
        
        <div className="relative flex flex-col items-center">
          {/* Top Logo / Icon */}
          <div className="mb-6 flex flex-col items-center">
             {/* Logo Diamond Indicator */}
             <div className="flex gap-1 mb-4">
               <div className="w-2 h-2 rounded bg-[#01BAEF]/80 rotate-45 transform"></div>
               <div className="w-2 h-2 rounded bg-[#01BAEF] rotate-45 transform"></div>
               <div className="w-2 h-2 rounded bg-[#FBFBFF] rotate-45 transform"></div>
             </div>

             {/* User Avatar SVG */}
            <div className="p-4 bg-[#0B4F6C] rounded-full border border-[#01BAEF]/50 shadow-inner">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-10 h-10 text-[#FBFBFF]"
              >
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h2 className="mb-8 text-2xl font-bold tracking-tight text-[#FBFBFF]">Welcome back</h2>

          {message && (
            <div className="mb-6 w-full p-4 text-sm font-medium text-center text-red-200 bg-red-950/50 border border-red-500/20 rounded-xl">
              {message}
            </div>
          )}

          <form className="w-full flex flex-col">
            <button
              formAction={loginWithGoogle}
              className="group relative flex w-full justify-center items-center gap-3 py-3.5 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
              </svg>
              Sign In with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
