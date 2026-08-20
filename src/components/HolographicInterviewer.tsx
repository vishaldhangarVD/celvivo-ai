"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer - Protocol v10.0 (Strict Reference Alignment).
 * This component uses the exact 'hologram(1).png' asset as the single source of truth.
 * All 3D engines (Three.js/TalkingHead) have been removed for visual integrity.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
  return (
    <div className={cn("relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden group rounded-[2rem]", className)}>
      
      {/* 1. Deep Space Foundation */}
      <div className="absolute inset-0 bg-[#02040a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.1)_0%,transparent_70%)]" />
      </div>

      {/* 2. Primary Holographic Intelligence (hologram(1).png) */}
      <div className="relative z-30 w-full h-full flex items-center justify-center p-2">
        <motion.div 
          animate={isSpeaking ? { 
            filter: ["brightness(1) contrast(1)", "brightness(1.2) contrast(1.1)", "brightness(1) contrast(1)"],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <Image
            src="/hologram(1).png"
            alt="AI Interviewer"
            fill
            className="object-contain"
            priority
          />
          
          {/* Subtle Neural Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </div>

      {/* 3. Speaking Protocol HUD Overlay */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 pointer-events-none"
          >
            {/* Soft Ambient Glow during active speech */}
            <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay" />
            
            {/* Visual Indicator of active Neural Link */}
            <div className="absolute bottom-6 right-6">
              <div className="flex items-center gap-3 px-4 py-1.5 glass border-cyan-500/40 bg-cyan-500/10 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">NEURAL LINK ACTIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Top Status Header */}
      <div className="absolute top-6 left-6 z-40">
        <div className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-white/10 bg-black/40">
          <Cpu className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Simulation Console</span>
        </div>
      </div>

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
