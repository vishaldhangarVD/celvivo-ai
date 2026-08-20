"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Wifi, Activity } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v21.0 - Refined Animatronics.
 * High-fidelity holographic AI interviewer with subtle blinking and kinetically linked speech.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
  const [blink, setBlink] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Autonomous Blinking Logic (Random intervals)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120); // Fast blink duration
      timeout = setTimeout(triggerBlink, Math.random() * 4000 + 3000);
    };
    timeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]",
      className
    )}>
      
      {/* 1. Neural Atmosphere (Z-0) */}
      <div className="absolute inset-0 bg-[#02040a] z-0">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:30px_30px]" />
        <motion.div 
          animate={{
            opacity: isSpeaking ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.15)_0%,transparent_70%)]" 
        />
      </div>

      {/* 2. Primary Animatronic Layer (Z-10) */}
      <motion.div 
        animate={{
          y: isSpeaking ? [-3, 3, -3] : [-5, 5, -5],
          rotate: isSpeaking ? [-0.2, 0.2, -0.2] : [-0.5, 0.5, -0.5]
        }}
        transition={{
          duration: isSpeaking ? 3 : 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
      >
        <div className="relative w-full h-full max-w-[90%] max-h-[90%]">
          
          <Image
            src="/avatars/hologram.png"
            alt="AI Interviewer Protocol"
            fill
            className={cn(
              "object-contain transition-all duration-700 ease-in-out",
              isSpeaking ? "brightness-125 saturate-125" : "brightness-100 saturate-100 opacity-90"
            )}
            priority
            unoptimized
            onError={() => setImgError(true)}
          />

          {imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500/80 bg-black/90 px-6 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Neural Asset Missing</span>
              <span className="text-[8px] opacity-40 font-mono">/avatars/hologram.png</span>
            </div>
          )}

          {/* REFINED BLINK OVERLAY (No hard bars) */}
          {!imgError && (
            <div className="absolute top-[37.8%] left-1/2 -translate-x-1/2 w-[16%] h-[2.5%] flex justify-between px-[1%] pointer-events-none">
               <motion.div 
                 animate={{ opacity: blink ? 0.95 : 0 }}
                 transition={{ duration: 0.1 }}
                 className="w-[42%] h-full bg-[#050816]/90 backdrop-blur-sm rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)]"
               />
               <motion.div 
                 animate={{ opacity: blink ? 0.95 : 0 }}
                 transition={{ duration: 0.1 }}
                 className="w-[42%] h-full bg-[#050816]/90 backdrop-blur-sm rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)]"
               />
            </div>
          )}

          {/* MOUTH SPEAKING OVERLAY */}
          <AnimatePresence>
            {isSpeaking && !imgError && (
              <motion.div 
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: [0.4, 0.9, 0.4], 
                  scaleY: [1, 1.4, 0.8, 1.6, 1],
                }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.15, repeat: Infinity }}
                className="absolute top-[52.8%] left-1/2 -translate-x-1/2 w-[5%] h-[0.5%] bg-cyan-400 rounded-full blur-[1px] shadow-[0_0_15px_#22d3ee] mix-blend-screen"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 3. Futuristic HUD & Visual Effects (Z-20) */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[size:100%_3px,4px_100%]" />

      {/* HUD Labels */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-cyan-500/20 bg-black/60 shadow-xl">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">NEURAL ENTITY</span>
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
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">TRANSMITTING</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Interface Elements */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 h-4 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isSpeaking ? [4, 18, 6, 22, 4] : 2,
              opacity: isSpeaking ? 1 : 0.2
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              delay: i * 0.05,
              ease: "easeInOut"
            }}
            className="w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
          />
        ))}
      </div>

      <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/10 bg-black/60">
          <Wifi className={cn("w-3 h-3 transition-colors duration-500", isSpeaking ? "text-green-400 shadow-[0_0_8px_#4ade80]" : "text-white/20")} />
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/40">LINK: {isSpeaking ? "STABLE" : "IDLE"}</span>
        </div>
      </div>

      {/* Finishing Glow */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent pointer-events-none z-20" />
    </div>
  );
}
