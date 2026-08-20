"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Wifi } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v17.0 - Corrected Path.
 * Displays the holographic AI interviewer from /avatars/hologram.png.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
  const [blink, setBlink] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Autonomous Blinking Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      timeout = setTimeout(triggerBlink, Math.random() * 4000 + 2000);
    };
    timeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden rounded-[2rem] border border-cyan-500/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]",
      className
    )}>
      
      {/* 1. Deep Neural Background (Z-0) */}
      <div className="absolute inset-0 bg-[#02040a] z-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div 
          animate={{
            opacity: isSpeaking ? [0.3, 0.5, 0.3] : [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.15)_0%,transparent_70%)]" 
        />
      </div>

      {/* 2. Primary Animatronic Container (Z-10) */}
      <motion.div 
        animate={{
          y: [-4, 4, -4],
          rotate: [-0.3, 0.3, -0.3]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
      >
        {/* Image Container */}
        <div className="relative w-full h-full max-w-[95%] max-h-[95%]">
          
          {/* THE MASTER IMAGE - Corrected Path */}
          <Image
            src="/avatars/hologram.png"
            alt="AI Interviewer Protocol"
            fill
            className={cn(
              "object-contain transition-all duration-500",
              isSpeaking ? "brightness-125 saturate-110" : "brightness-100 saturate-100"
            )}
            priority
            unoptimized
            onError={() => setImgError(true)}
          />

          {imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-black/80">
              <span className="text-[10px] font-black uppercase tracking-widest text-center">Neural Asset Missing</span>
              <span className="text-[8px] opacity-60 text-center">/avatars/hologram.png</span>
            </div>
          )}

          {/* EYE BLINK OVERLAYS */}
          {!imgError && (
            <div className="absolute top-[37.5%] left-1/2 -translate-x-1/2 w-[18%] h-[2%] flex justify-between px-[2%] opacity-60">
               <motion.div 
                 animate={{ scaleY: blink ? 1 : 0 }}
                 className="w-[35%] h-full bg-[#0a0f1e] rounded-full origin-top shadow-[0_0_8px_rgba(34,211,238,0.4)]"
               />
               <motion.div 
                 animate={{ scaleY: blink ? 1 : 0 }}
                 className="w-[35%] h-full bg-[#0a0f1e] rounded-full origin-top shadow-[0_0_8px_rgba(34,211,238,0.4)]"
               />
            </div>
          )}

          {/* MOUTH SPEAKING OVERLAY */}
          <AnimatePresence>
            {isSpeaking && !imgError && (
              <motion.div 
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: 0.8, 
                  scaleY: [1, 1.6, 0.7, 1.4, 1],
                  height: ["1px", "3px", "2px", "4px", "1px"]
                }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="absolute top-[52.8%] left-1/2 -translate-x-1/2 w-[6%] bg-cyan-400 rounded-full blur-[1px] shadow-[0_0_12px_#22d3ee] mix-blend-screen"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 3. Global HUD & Effects (Z-20+) */}
      {/* Digital Scanline Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

      {/* HUD Information Labels */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-cyan-500/20 bg-black/40">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">NEURAL ENTITY</span>
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
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">TRANSMITTING</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Audio Visualizer Activity */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 h-4 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isSpeaking ? [4, 14, 6, 18, 4] : 2,
              opacity: isSpeaking ? 1 : 0.1
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              delay: i * 0.1
            }}
            className="w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
          />
        ))}
      </div>

      {/* Link Status Label */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-white/10 bg-black/40">
          <Wifi className={cn("w-3 h-3 transition-colors", isSpeaking ? "text-green-400" : "text-white/20")} />
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/40">SIGNAL: {isSpeaking ? "ACTIVE" : "IDLE"}</span>
        </div>
      </div>

      {/* Projection Glow Overlay */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none z-20" />

    </div>
  );
}
