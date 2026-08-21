'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Rocket, 
  PhoneOff,
  ShieldCheck,
  Zap
} from 'lucide-react';
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
 * @fileOverview SpecialHRControls - The bottom interface bar for mission management.
 * High-end professional design with explicit state visualization.
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
    <Card className="h-full glass border-white/10 bg-[#080c19]/60 backdrop-blur-2xl rounded-[2.5rem] px-10 flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
      
      {/* Device Protocols */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleMic}
            className={cn(
              "w-14 h-14 rounded-2xl transition-all duration-300",
              isMicOn ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}
          >
            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          <div className="hidden md:block">
             <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Audio Node</p>
             <p className={cn("text-[10px] font-bold uppercase", isMicOn ? "text-green-400" : "text-red-400")}>
               {isMicOn ? "Active" : "Muted"}
             </p>
          </div>
        </div>

        <div className="w-px h-8 bg-white/10" />

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCamera}
            className={cn(
              "w-14 h-14 rounded-2xl transition-all duration-300",
              isCameraOn ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}
          >
            {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          <div className="hidden md:block">
             <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Visual Node</p>
             <p className={cn("text-[10px] font-bold uppercase", isCameraOn ? "text-green-400" : "text-red-400")}>
               {isCameraOn ? "Online" : "Off"}
             </p>
          </div>
        </div>
      </div>

      {/* Mission Execution */}
      <div className="flex items-center gap-8">
        {!isStarted ? (
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Validation State</p>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{canStart ? "Ready for Deployment" : "Awaiting Blueprint"}</p>
             </div>
             <Button 
              onClick={onStart}
              disabled={!canStart || status === 'INTERVIEW_STARTING'}
              className="h-16 px-12 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl group overflow-hidden"
             >
               <span className="relative z-10 flex items-center gap-3">
                 Initialize Session <Rocket className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
               </span>
             </Button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 px-6 py-2 glass rounded-xl border-accent/20 bg-accent/5">
                <Zap className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Session In Progress</span>
             </div>
             <Button 
              onClick={onEnd}
              className="h-16 px-10 glass border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
             >
               <PhoneOff className="w-4 h-4 mr-3" /> Terminate
             </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
