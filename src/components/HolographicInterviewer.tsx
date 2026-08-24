
'use client';

/**
 * @fileOverview HolographicInterviewer - Minimal placeholder after cleanup.
 * Ready for Step 4/5/6 Hologram Effects.
 */

export default function HolographicInterviewer({ 
  className 
}: { 
  className?: string;
  isSpeaking?: boolean;
  isGenerating?: boolean;
  currentQuestion?: string;
  onSpeechEnd?: () => void;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Hologram Feed...</p>
      </div>
    </div>
  );
}
