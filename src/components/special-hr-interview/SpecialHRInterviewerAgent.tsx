'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, User, Wifi, Brain, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecialHRInterviewerAgentProps {
  isInterviewStarted: boolean;
  status: string;
}

export default function SpecialHRInterviewerAgent({ isInterviewStarted, status }: SpecialHRInterviewerAgentProps) {
  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden border border-white/5 bg-[#02040a] shadow-[0_0_100px_rgba(147,51,234,0.05)] group">
      {/* City Skyline / Executive Background Simulation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.08)_0%,transparent_60%)]" />
        {/* Animated City Window Effect */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
      </div>

      {/* Futuristic Grid Overlay */}
      <div className="absolute inset-0 z-5 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12">
        <AnimatePresence mode="wait">
          {!isInterviewStarted ? (
            <motion.div 
              key="awaiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8"
            >
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-b-2 border-purple-400 animate-spin duration-[4s]" />
                <div className="absolute inset-4 glass rounded-full flex items-center justify-center border border-white/10">
                  <User className="w-10 h-10 text-white/20" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tighter text-premium">AI HR INTERVIEWER</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400/60 animate-pulse">READY FOR PROTOCOL</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="starting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center text-center space-y-12"
            >
              {/* Future D-ID / HeyGen Placeholder Node */}
              <div className="p-12 glass border-purple-500/20 rounded-[2.5rem] bg-purple-500/[0.02] max-w-lg">
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-8 animate-pulse" />
                <h2 className="text-3xl font-bold tracking-tighter text-white mb-4">Neural Link Establishing...</h2>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Initializing specialized HR narrative matrix. Preparing high-fidelity streaming interface for executive assessment.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border-green-500/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-green-400">Stream Node Online</span>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border-purple-500/20">
                   <Cpu className="w-3.5 h-3.5 text-purple-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">GPU Matrix Active</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-10 left-10 right-10 z-30 flex justify-between items-end pointer-events-none">
        <div className="space-y-1">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Protocol Signal</p>
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] font-bold text-white/40">SECURE_LINK_ENCRYPTED</span>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{status}</span>
        </div>
      </div>
    </div>
  );
}
