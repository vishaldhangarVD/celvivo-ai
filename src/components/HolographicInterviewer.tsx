
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Activity, Wifi, Zap } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v5.0 - Neural Animatronics.
 * Animates a static PNG using localized CSS/Framer Motion layers.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
  currentQuestion?: string;
}

export default function HolographicInterviewer({ 
  isSpeaking = false, 
  className,
  currentQuestion = "" 
}: HolographicInterviewerProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  // 1. Autonomous Blinking Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      timeout = setTimeout(triggerBlink, Math.random() * 5000 + 2000);
    };
    timeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // 2. Subtle Eye Movement Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const moveEyes = () => {
      setEyePos({ 
        x: (Math.random() - 0.5) * 2, 
        y: (Math.random() - 0.5) * 1 
      });
      timeout = setTimeout(moveEyes, Math.random() * 3000 + 1000);
    };
    timeout = setTimeout(moveEyes, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-[#02040a] overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-2xl shadow-cyan-900/20",
      className
    )}>
      
      {/* 1. BACKGROUND ENVIRONMENT */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Projector Platform Glow */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[140%] aspect-square z-0 opacity-40">
          <motion.div 
            animate={{ 
              scale: isSpeaking ? [1, 1.1, 1] : 1, 
              opacity: isSpeaking ? [0.4, 0.6, 0.4] : 0.3 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.4)_0%,transparent_70%)] blur-3xl"
            style={{ transform: 'rotateX(80deg)' }}
          />
        </div>
      </div>

      {/* 2. PRIMARY NEURAL ENTITY (Image + Animatronics) */}
      <motion.div 
        className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 0.5, 0, -0.5, 0]
        }}
        transition={{ 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="relative w-full h-full max-w-[95%] max-h-[95%]">
          
          {/* THE SOURCE PNG */}
          <Image
            src="/avatars/hologram.png"
            alt="AI Interviewer"
            fill
            className={cn(
              "object-contain transition-all duration-700",
              isSpeaking ? "brightness-125 saturate-110" : "brightness-100 saturate-100"
            )}
            priority
          />

          {/* LOCALIZED ANIMATION OVERLAYS */}
          
          {/* Eye Blinking & Micro-movement Layer */}
          <div className="absolute inset-0 overflow-hidden">
             {/* Eye Region Masking (Approximate positioning based on reference) */}
             <motion.div 
                className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[18%] h-[3%] flex justify-between px-1"
                animate={{ x: `calc(-50% + ${eyePos.x}px)`, y: eyePos.y }}
             >
                {/* Left Eye Dip */}
                <motion.div 
                  animate={{ opacity: isBlinking ? 0.7 : 0 }}
                  className="w-[42%] h-full bg-[#0b0e1a] blur-[2px] rounded-full"
                />
                {/* Right Eye Dip */}
                <motion.div 
                  animate={{ opacity: isBlinking ? 0.7 : 0 }}
                  className="w-[42%] h-full bg-[#0b0e1a] blur-[2px] rounded-full"
                />
             </motion.div>
          </div>

          {/* Vocal Matrix (Mouth) Layer */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-[48.5%] left-1/2 -translate-x-1/2 w-[6%] h-[2%] pointer-events-none"
              >
                 {/* Glowing Vocal Slit */}
                 <motion.div 
                   animate={{ 
                     height: ["20%", "80%", "40%", "90%", "30%"],
                     opacity: [0.6, 1, 0.7, 0.9, 0.6]
                   }}
                   transition={{ duration: 0.15, repeat: Infinity }}
                   className="w-full bg-cyan-400 blur-[3px] rounded-full shadow-[0_0_10px_#22d3ee]"
                   style={{ mixBlendMode: 'screen' }}
                 />
                 <motion.div 
                   animate={{ 
                     scaleX: [1, 1.2, 0.9, 1.1, 1]
                   }}
                   transition={{ duration: 0.2, repeat: Infinity }}
                   className="absolute inset-0 bg-purple-500/30 blur-[6px] rounded-full"
                 />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Holographic Scanline Overlay */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.15] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
        </div>
      </motion.div>

      {/* 3. HUD SYSTEM */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* Top-Left ID Nodes */}
        <div className="absolute top-8 left-8 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 glass rounded-lg border-cyan-500/20 bg-black/40">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">AI INTERVIEWER</span>
          </div>
          
          <AnimatePresence mode="wait">
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-purple-500/20 bg-purple-500/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#a855f7]" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">SPEAKING</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dual Side Waveforms */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: isSpeaking ? [4, 16, 8, 20, 4] : 4,
                opacity: isSpeaking ? [0.3, 0.8, 0.4] : 0.1
              }}
              transition={{ duration: 0.5 + (i * 0.1), repeat: Infinity }}
              className="h-[2px] bg-cyan-400 rounded-full"
            />
          ))}
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: isSpeaking ? [4, 16, 8, 20, 4] : 4,
                opacity: isSpeaking ? [0.3, 0.8, 0.4] : 0.1
              }}
              transition={{ duration: 0.5 + (i * 0.1), repeat: Infinity }}
              className="h-[2px] bg-cyan-400 rounded-full"
            />
          ))}
        </div>

        {/* Bottom System Status */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3 transition-colors", isSpeaking ? "text-green-400" : "text-white/20")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">
              {isSpeaking ? "UPLINK BUSY" : "SIGNAL STABLE"}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
