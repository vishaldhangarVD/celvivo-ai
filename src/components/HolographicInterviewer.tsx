"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Wifi } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v22.0 - Static Image Stability.
 * Restores the original hologram asset as a stable visual anchor.
 * Animations are restricted to HUD and subtle glow layers.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]",
      className
    )}>
      
      {/* 1. Neural Atmosphere (Background Layers) */}
      <div className="absolute inset-0 bg-[#02040a] z-0">
        {/* Star-like background texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Animated Neural Pulse Background */}
        <motion.div 
          animate={{
            opacity: isSpeaking ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.2)_0%,transparent_70%)]" 
        />

        {/* Circular Platform Perspective Effect */}
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[150%] aspect-square z-0 pointer-events-none opacity-40">
          <div 
            className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.4)_0%,transparent_70%)] blur-3xl"
            style={{ transform: 'rotateX(75deg)' }}
          />
        </div>
      </div>

      {/* 2. Main Visual Anchor (The Static Image) */}
      {/* The container and image are now completely stationary */}
      <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-[95%] max-h-[95%]">
          
          {/* 
            Neural Sync Filter:
            Only subtle brightness and shadow shifts for speaking. 
            The position remains 100% stable.
          */}
          <motion.div
            animate={{
              filter: isSpeaking 
                ? "brightness(1.2) contrast(1.1) drop-shadow(0 0 20px rgba(34,211,238,0.3))" 
                : "brightness(1.0) contrast(1.0) drop-shadow(0 0 10px rgba(34,211,238,0.1))"
            }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            <Image
              src="/avatars/hologram.png"
              alt="AI Interviewer Protocol"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </motion.div>
        </div>
      </div>

      {/* 3. Futuristic HUD & Overlays (Z-20) */}
      
      {/* Digital Scanline Filter */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[size:100%_3px,4px_100%]" />

      {/* HUD Labels */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-cyan-500/20 bg-black/60 shadow-xl">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">AI INTERVIEWER</span>
        </div>
        
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-purple-500/20 bg-purple-500/10 shadow-xl"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#a855f7]" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">SPEAKING</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Visualization - Reactive Waveform */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 h-4 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isSpeaking ? [4, 18, 6, 22, 4] : 2,
              opacity: isSpeaking ? 1 : 0.2
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              delay: i * 0.04,
              ease: "easeInOut"
            }}
            className="w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
          />
        ))}
      </div>

      {/* Data Link Status */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/10 bg-black/60">
          <Wifi className={cn("w-3 h-3 transition-colors duration-500", isSpeaking ? "text-green-400 shadow-[0_0_8px_#4ade80]" : "text-white/20")} />
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/40">LINK: {isSpeaking ? "ACTIVE" : "STABLE"}</span>
        </div>
      </div>

      {/* Final Bottom Glow Bloom */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent pointer-events-none z-20" />
    </div>
  );
}
