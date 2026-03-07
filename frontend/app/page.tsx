'use client'

import AirGuardChat from "./components/chat/AirGuardChat";
import AirGuardMap from "./components/map/AirGaurdMap";

export default function Page() {
  return (
    <div className="flex h-screen w-screen">

      {/* Map - left side */}
      <div className="w-2/3 h-full">
        <AirGuardMap />
      </div>

      {/* Chat - right side */}
      <div className="w-1/3 h-full">
        <AirGuardChat />
      </div>

    </div>
  );
} 