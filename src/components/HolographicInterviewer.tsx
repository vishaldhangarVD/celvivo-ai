"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Wifi } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer - Protocol v12.0 (Exact Reference Recreation).
 * Uses 'hologram(1).png' as the single source of truth for the visual identity.
 * Implements high-fidelity CSS/Framer Motion overlays for the "Speaking" state.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
  return (
    <div className={cn("relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden group rounded-[2rem] border border-cyan-500/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]", className)}>
      
      {/* 1. Deep Neural Background */}
      <div className="absolute inset-0 bg-[#02040a]">
        {/* Subtle Starfield Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Pulsing Aura */}
        <motion.div 
          animate={{
            opacity: isSpeaking ? [0.4, 0.7, 0.4] : [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.15)_0%,transparent_70%)]" 
        />
      </div>

      {/* 2. Digital Scanline Engine */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

      {/* 3. Primary Hologram Image (hologram(1).png) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-0">
        <motion.div 
          animate={isSpeaking ? { 
            scale: [1, 1.01, 1],
            filter: ["brightness(1) contrast(1)", "brightness(1.2) contrast(1.1)", "brightness(1) contrast(1)"],
          } : {}}
          transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0, ease: "easeInOut" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <Image
            src="/hologram(1).png"
            alt="AI Interviewer Protocol"
            fill
            className="object-contain"
            priority
          />
          
          {/* Neural Glow Layer */}
          <motion.div 
            animate={{ opacity: isSpeaking ? [0, 0.3, 0] : 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-500/10 mix-blend-screen pointer-events-none" 
          />
        </motion.div>
      </div>

      {/* 4. Interface HUD Labels (Top-Left) */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-cyan-500/20 bg-black/40">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">AI INTERVIEWER</span>
        </div>
        
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-purple-500/20 bg-purple-500/10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">SPEAKING</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Transmission Status (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 z-30">
        <div className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-white/10 bg-black/40">
          <Wifi className={cn("w-3 h-3 transition-colors", isSpeaking ? "text-green-400" : "text-white/20")} />
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/40">LINK: {isSpeaking ? "ACTIVE" : "IDLE"}</span>
        </div>
      </div>

      {/* 6. Base Projection Glow */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none z-20" />

      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
