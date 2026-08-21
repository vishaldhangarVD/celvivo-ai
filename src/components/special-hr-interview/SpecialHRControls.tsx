'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpecialHRInterviewStatus } from '@/lib/special-hr-interview/types';

interface SpecialHRControlsProps {
  status: SpecialHRInterviewStatus;
  isMicOn: boolean;
  isCameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onStart: () => void;
  onEnd: () => void;
  canStart: boolean;
}

/**
 * @fileOverview SpecialHRControls - Streamlined hardware protocols for the executive room.
 */

export default function SpecialHRControls({
  status,
  isMicOn,
  isCameraOn,
  onToggleMic,
  onToggleCamera,
  onStart,
  onEnd,
  canStart
}: SpecialHRControlsProps) {
  const isStarted = status === 'IN_PROGRESS' || status === 'INTERVIEW_STARTING';

  return (
    <div className="h-full glass border-white/5 bg-[#080c19]/40 backdrop-blur-3xl rounded-full px-8 flex items-center justify-between shadow-2xl">
      
      {/* Device Protocols */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleMic}
          className={cn(
            "w-10 h-10 rounded-full transition-all",
            isMicOn ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleCamera}
          className={cn(
            "w-10 h-10 rounded-full transition-all",
            isCameraOn ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}
        >
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
      </div>

      {/* Session Logic */}
      <div className="flex items-center gap-4">
        {!isStarted ? (
          <Button 
            onClick={onStart}
            disabled={!canStart}
            className="h-10 px-8 btn-premium rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-20"
          >
            Enter Interview
          </Button>
        ) : (
          <Button 
            onClick={onEnd}
            className="h-10 px-8 glass border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          >
            End Session
          </Button>
        )}
      </div>
    </div>
  );
}
