"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function InterviewDispatcher() {
  const router = useRouter();

  useEffect(() => {
    // Redirect all traffic to the new setup node
    router.replace('/interview/setup');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Simulation...</p>
      </div>
    </div>
  );
}
