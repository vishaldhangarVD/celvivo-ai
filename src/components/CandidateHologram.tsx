
'use client';

/**
 * @fileOverview CandidateHologram - Minimal placeholder after cleanup.
 * Ready for Step 4/5/6 Particle Implementation.
 */

export default function CandidateHologram({ 
  className,
  isLoader = false
}: { 
  className?: string;
  active?: boolean;
  speaking?: boolean;
  isLoader?: boolean;
}) {
  return (
    <div className={className}>
      {isLoader && (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Initialising Pipeline...</p>
        </div>
      )}
    </div>
  );
}
