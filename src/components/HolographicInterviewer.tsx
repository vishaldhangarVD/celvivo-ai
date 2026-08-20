"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Activity } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer - Master Visual v6.0.
 * Replaces the 3D engine with the exact holographic visual from the reference.
 * Features: Blue/purple neon styling, dual side waveforms, and a circular energy platform.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
  return (
    <div className={cn("relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden group rounded-[2rem]", className)}>
      
      {/* 1. Deep Space / Star Background */}
      <div className="absolute inset-0 bg-[#02040a]">
        <div className="absolute inset-0 opacity-30" 
             style={{ 
               backgroundImage: `radial-gradient(circle at 50% 50%, #ffffff 0.5px, transparent 0.5px)`, 
               backgroundSize: '24px 24px' 
             }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.15)_0%,transparent_70%)]" />
      </div>

      {/* 2. Holographic Projection Platform (Bottom) */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[140%] aspect-[4/1] pointer-events-none z-10">
        <div className="absolute inset-0 rounded-[100%] border-2 border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.2)] animate-pulse" />
        <div className="absolute inset-4 rounded-[100%] border border-purple-500/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent blur-2xl" />
      </div>

      {/* 3. Dual Audio Waveforms (Sides) */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
        {/* Left Waveform */}
        <div className="flex items-center gap-1 h-24">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`l-${i}`}
              animate={isSpeaking ? { height: [4, Math.random() * 60 + 10, 4] } : { height: 4 }}
              transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity }}
              className="w-1 bg-cyan-500/60 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          ))}
        </div>
        {/* Right Waveform */}
        <div className="flex items-center gap-1 h-24">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`r-${i}`}
              animate={isSpeaking ? { height: [4, Math.random() * 60 + 10, 4] } : { height: 4 }}
              transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity }}
              className="w-1 bg-purple-500/60 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            />
          ))}
        </div>
      </div>

      {/* 4. Central Holographic Entity */}
      <div className="relative z-30 w-full h-full flex items-center justify-center">
        <div className="relative aspect-[3/4] h-[90%] w-auto group-hover:scale-105 transition-transform duration-1000">
          <Image
            src="https://picsum.photos/seed/hologram_interviewer/600/800"
            alt="AI Interviewer"
            fill
            className="object-contain holographic-filter"
            data-ai-hint="futuristic female ai interviewer"
          />
          {/* Scanline & Glow Overlays */}
          <div className="absolute inset-0 hologram-scanlines opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 5. HUD Status & Labels */}
      <div className="absolute top-6 left-6 z-40 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">AI INTERVIEWER</span>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-40">
        <AnimatePresence>
          {isSpeaking ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 px-4 py-1.5 glass border-cyan-500/40 bg-cyan-500/10 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">SPEAKING</span>
            </motion.div>
          ) : (
            <div className="px-4 py-1.5 glass border-white/10 text-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
              IDLE
            </div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .holographic-filter {
          /* Neon Blue/Purple Transformation */
          filter: grayscale(1) brightness(1.4) sepia(1) hue-rotate(180deg) saturate(8) drop-shadow(0 0 15px rgba(34,211,238,0.4));
          mix-blend-mode: screen;
          opacity: 0.85;
        }

        .hologram-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.25) 50%
          ),
          linear-gradient(
            90deg,
            rgba(168, 85, 247, 0.05),
            rgba(34, 211, 238, 0.05),
            rgba(168, 85, 247, 0.05)
          );
          background-size: 100% 4px, 4px 100%;
          animation: scanlineMove 10s linear infinite;
        }

        @keyframes scanlineMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
      `}</style>
    </div>
  );
}
