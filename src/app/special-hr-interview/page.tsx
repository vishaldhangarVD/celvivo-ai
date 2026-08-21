'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import SpecialHRInterviewRoom from '@/components/special-hr-interview/SpecialHRInterviewRoom';

/**
 * @fileOverview Special HR Interview feature root.
 * Completely separate from the existing interview system.
 */

export default function SpecialHRInterviewPage() {
  return (
    <div className="h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      {/* Cinematic Room Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(147,51,234,0.05)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="flex-1 flex flex-col pt-[72px] relative z-10">
        <SpecialHRInterviewRoom />
      </main>

      {/* Bottom Interface Bar */}
      <footer className="h-14 border-t border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center px-12 justify-between shrink-0 relative z-20">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Atmosphere</span>
               <span className="text-[10px] font-bold text-accent uppercase tracking-widest">EXECUTIVE ROOM 04</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Privacy</span>
               <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">SANDBOX_MODE_ENABLED</span>
            </div>
         </div>
         <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Nexvoro AI Executive Protocols © 2024</div>
      </footer>
    </div>
  );
}
