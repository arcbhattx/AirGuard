'use client'

import AirGuardChat from "./components/chat/AirGuardChat";
import AirGuardMap from "./components/map/AirGaurdMap";
import NavBar from "./components/NavBar";
import AboutSection from "./components/AboutSection";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FBFBFF] dark:bg-[#121212] transition-colors overflow-x-hidden">
      
      {/* 
        Hero / Main App Section 
        Takes up the exact viewport height so the map and chat fit perfectly initially
      */}
      <div className="flex flex-col h-screen w-full relative z-10 shrink-0">
        <NavBar />

        <div className="flex flex-1 min-h-0 w-full relative">
          <div className="flex-1 h-full min-w-0 transition-all duration-300 relative z-10">
            <AirGuardMap />
          </div>
          <AirGuardChat />
        </div>
      </div>

      {/* About Section that users can scroll down to */}
      <AboutSection />

    </div>
  );
} 