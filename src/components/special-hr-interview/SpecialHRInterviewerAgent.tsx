'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, User, Wifi, Brain, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecialHRInterviewerAgentProps {
  isInterviewStarted: boolean;
  status: string;
}

/**
 * @fileOverview SpecialHRInterviewerAgent - Placeholder container for future D-ID/HeyGen integration.
 * Styled as an executive office window with high-end corporate aesthetics.
 */

export default function SpecialHRInterviewerAgent({ isInterviewStarted, status }: SpecialHRInterviewerAgentProps) {
  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden border border-white/5 bg-[#02040a] shadow-[0_0_100px_rgba(147,51,234,0.05)] group">
      
      {/* Executive Backdrop */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.08)_0%,transparent_60%)]" />
        
        {/* Modern Office Imagery */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-screen transition-transform duration-[10s] group-hover:scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')" }} 
        />
      </div>

      {/* Interface Grid Layer */}
      <div className="absolute inset-0 z-5 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12">
        <AnimatePresence mode="wait">
          {!isInterviewStarted ? (
            <motion.div 
              key="awaiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center space-y-10"
            >
              <div className="relative mx-auto w-40 h-40">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-b-2 border-purple-400 animate-spin duration-[6s]" />
                <div className="absolute inset-4 glass rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                  <User className="w-12 h-12 text-white/20" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold tracking-tighter text-premium">AI HR INTERVIEWER</h3>
                <div className="flex items-center justify-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">READY FOR PROTOCOL</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="starting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center text-center space-y-12"
            >
              {/* Agent Stream Node Placeholder */}
              <div className="p-16 glass border-purple-500/20 rounded-[3rem] bg-purple-500/[0.02] max-w-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Brain className="w-32 h-32 text-purple-400" />
                </div>
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-8 animate-pulse" />
                <h2 className="text-4xl font-bold tracking-tighter text-white mb-4">Neural Link Active.</h2>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Initializing specialized HR narrative matrix. Preparing high-fidelity streaming interface for executive assessment.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 px-6 py-2.5 glass rounded-2xl border-green-500/20">
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Stream Node Online</span>
                 </div>
                 <div className="flex items-center gap-3 px-6 py-2.5 glass rounded-2xl border-purple-500/20">
                   <Cpu className="w-4 h-4 text-purple-400" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">GPU Matrix Active</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Room Status Indicator */}
      <div className="absolute bottom-10 left-10 right-10 z-30 flex justify-between items-end pointer-events-none">
        <div className="space-y-1.5">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Atmosphere Sync</p>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-purple-500" />
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">EXECUTIVE_SECURE_LINK</span>
          </div>
        </div>
        <Badge className="bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
          NODE: {status}
        </Badge>
      </div>
    </div>
  );
}
