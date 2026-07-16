"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AssessmentReadyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/resume-upload');
  }, [router]);

  return (
    <div className="h-screen bg-[#050816] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Protocol Redirecting...</p>
      </div>
    </div>
  );
}
