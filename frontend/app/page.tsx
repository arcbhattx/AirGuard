import AirGuardChat from "./components/chat/AirGuardChat";
import AirGuardMap from "./components/map/AirGaurdMap";
import { createClient } from '@/utils/supabase/server';
import { redirect } from "next/navigation";
import NavBar from "./components/NavBar";
import AboutSection from "./components/AboutSection";
import { MapProvider } from "./hooks/MapContext";

export default async function Page() {
  // 1. Initialize Supabase Server Client
  const supabase = await createClient();

  // 2. Secure the Dashboard: Check if the user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 3. Fetch user's existing conversations from the DB
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <MapProvider>
      <div className="flex flex-col min-h-screen w-full bg-[#FBFBFF] dark:bg-[#121212] transition-colors overflow-x-hidden">
        
        {/* 
          Hero / Main App Section 
          Takes up the exact viewport height so the map and chat fit perfectly initially
        */}
        <div className="flex flex-col h-screen w-full relative z-10 shrink-0">
          <NavBar user={user} />

          <div className="flex flex-1 min-h-0 w-full relative">
            <div className="flex-1 h-full min-w-0 transition-all duration-300 relative z-10">
              <AirGuardMap />
            </div>
            <AirGuardChat 
              user={user} 
              initialConversations={conversations || []} 
            />
          </div>
        </div>

        {/* About Section that users can scroll down to */}
        <AboutSection />

      </div>
    </MapProvider>
  );
}