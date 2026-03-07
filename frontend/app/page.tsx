import AirGuardChat from "./components/chat/AirGuardChat";
import AirGuardMap from "./components/map/AirGaurdMap";
import { createClient } from '@/utils/supabase/server';
import { redirect } from "next/navigation";

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
    <div className="flex h-screen w-screen">
      {/* Map - left side */}
      <div className="w-2/3 h-full">
        <AirGuardMap />
      </div>

      {/* Chat - right side */}
      <div className="w-1/3 h-full">
        {/* We can now pass the authenticated user and their conversations down to the chat! */}
        <AirGuardChat 
          user={user} 
          initialConversations={conversations || []} 
        />
      </div>
    </div>
  );
} 