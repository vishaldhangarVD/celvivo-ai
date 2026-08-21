'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Cpu, Wifi } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SpecialHRInterviewerAgentProps {
  isInterviewStarted: boolean;
  status: string;
}

/**
 * @fileOverview SpecialHRInterviewerAgent - Clean placeholder for the future D-ID/HeyGen agent.
 * Designed as a high-end corporate empty stage.
 */

export default function SpecialHRInterviewerAgent({ isInterviewStarted, status }: SpecialHRInterviewerAgentProps) {
  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden border border-white/5 bg-[#02040a] shadow-2xl group">
      
      {/* Cinematic Office Backdrop */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.05)_0%,transparent_60%)]" />
        
        {/* Subtle Modern Office Background */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center grayscale transition-transform duration-[20s] group-hover:scale-110" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')" }} 
        />
      </div>

      {/* Center Stage Placeholder */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12">
        <AnimatePresence mode="wait">
          {!isInterviewStarted ? (
            <motion.div 
              key="stage-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-full glass border-white/5 flex items-center justify-center mx-auto opacity-20 group-hover:opacity-40 transition-opacity">
                <User className="w-10 h-10 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">Executive Interview Stage</p>
            </motion.div>
          ) : (
            <motion.div 
              key="stage-active"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
               <div className="px-6 py-3 glass border-accent/20 rounded-2xl flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-accent">Neural Feed Initializing...</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Room Metadata */}
      <div className="absolute bottom-8 left-8 right-8 z-30 flex justify-between items-end pointer-events-none">
        <div className="space-y-1">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Environment Link</p>
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SECURE_ROOM_01</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="glass border-white/10 text-white/40 text-[8px] uppercase tracking-widest px-4 py-1">
             STATUS: {status.replace('_', ' ')}
           </Badge>
        </div>
      </div>
    </div>
  );
}
