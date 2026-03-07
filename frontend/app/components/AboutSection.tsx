export default function AboutSection() {
  return (
    <section id="about" className="w-full bg-[#FBFBFF] dark:bg-[#121212] py-24 px-8 border-t border-[#01BAEF]/20 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#01BAEF]/10 border border-[#01BAEF]/20 text-[#01BAEF] text-sm font-semibold tracking-wide">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          How It Works
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0B4F6C] dark:text-white tracking-tight">
          Intelligent Air Quality Monitoring
        </h2>
        
        <p className="text-lg md:text-xl text-[#968E85] dark:text-[#968E85] max-w-3xl leading-relaxed">
          AirGuard provides real-time, high-precision air quality data combined with an intelligent AI assistant to help you make informed decisions about your environment and health.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full text-left">
          
          <div className="flex flex-col gap-4 p-8 rounded-3xl bg-[#FBFBFF] dark:bg-[#1A1A1A] border border-[#01BAEF]/10 dark:border-white/10 shadow-xl shadow-[#0B4F6C]/5 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#01BAEF]/10 flex items-center justify-center text-[#01BAEF]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0B4F6C] dark:text-white">Real-Time Map</h3>
            <p className="text-[#968E85] text-sm leading-relaxed">
              Explore your surroundings with our interactive map. View up-to-the-minute air quality indices (AQI), pollution hotspots, and sensor data right down to your street level.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-8 rounded-3xl bg-[#FBFBFF] dark:bg-[#1A1A1A] border border-[#01BAEF]/10 dark:border-white/10 shadow-xl shadow-[#0B4F6C]/5 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#01BAEF]/10 flex items-center justify-center text-[#01BAEF]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0B4F6C] dark:text-white">AI Assistant</h3>
            <p className="text-[#968E85] text-sm leading-relaxed">
              Have questions about the air you're breathing? Ask our built-in AirGuard AI. Get contextual advice, health recommendations, and explanations on complex environmental data.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-8 rounded-3xl bg-[#FBFBFF] dark:bg-[#1A1A1A] border border-[#01BAEF]/10 dark:border-white/10 shadow-xl shadow-[#0B4F6C]/5 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#01BAEF]/10 flex items-center justify-center text-[#01BAEF]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0B4F6C] dark:text-white">Actionable Alerts</h3>
            <p className="text-[#968E85] text-sm leading-relaxed">
              Stay ahead of poor conditions. Configure your settings to receive instant alerts when air quality drops below your personal thresholds, keeping you and your family safe.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
