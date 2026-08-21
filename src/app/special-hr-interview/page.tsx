'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import SpecialHRInterviewRoom from '@/components/special-hr-interview/SpecialHRInterviewRoom';

/**
 * @fileOverview Special HR Interview Root.
 * Locked to 100vh viewport with zero page-level scrolling.
 */

export default function SpecialHRInterviewPage() {
  return (
    <div className="h-screen w-full bg-[#050816] flex flex-col relative overflow-hidden">
      {/* Background Lighting/Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.05)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="particles-bg" />
      <Navbar />

      <main className="flex-1 flex flex-col pt-[72px] relative z-10 overflow-hidden">
        <SpecialHRInterviewRoom />
      </main>
    </div>
  );
}
