import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  // Initialize Supabase in a Server Component
  const supabase = await createClient();
  
  // Try checking the database connection by fetching a conversation
  const { data, error } = await supabase.from('conversations').select('*').limit(1);
  
  const isConnected = !error;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-white font-sans">
      <div className="z-10 max-w-2xl w-full items-center justify-between flex flex-col gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Supabase Status</h1>
        
        {isConnected ? (
          <div className="p-6 bg-green-950/30 border border-green-500/50 rounded-xl text-green-200 w-full shadow-lg shadow-green-900/20 backdrop-blur-sm">
            <p className="font-semibold text-xl flex items-center justify-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
              Connected successfully!
            </p>
            
            <div className="mt-6 text-left">
              <p className="text-sm text-green-400/80 mb-2 uppercase tracking-wider font-semibold">Test Query Result (conversations)</p>
              <pre className="p-4 bg-black/60 rounded-lg text-xs overflow-x-auto text-zinc-300 border border-green-900/50">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-red-950/30 border border-red-500/50 rounded-xl text-red-200 w-full shadow-lg shadow-red-900/20 backdrop-blur-sm">
             <p className="font-semibold text-xl flex items-center justify-center gap-3">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              Connection Failed
            </p>
            <div className="mt-6 text-left">
              <p className="text-sm text-red-400/80 mb-2 uppercase tracking-wider font-semibold">Error Message</p>
              <p className="mt-2 text-sm p-4 bg-black/60 rounded-lg border border-red-900/50 font-mono">
                {error?.message || "Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
