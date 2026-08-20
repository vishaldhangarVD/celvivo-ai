"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Wifi, Activity } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v15.0 - Neural Animatronics.
 * Animates a static PNG to act as a live AI interviewer.
 * Features: Head tilt, Eye blinking, Reactive mouth movement, and Neural pulsing.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
  const [blink, setBlink] = useState(false);

  // Autonomous Blinking Logic
  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      setTimeout(triggerBlink, Math.random() * 4000 + 2000);
    };
    const timer = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden group rounded-[2rem] border border-cyan-500/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]", className)}>
      
      {/* 1. Deep Neural Background */}
      <div className="absolute inset-0 bg-[#02040a]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div 
          animate={{
            opacity: isSpeaking ? [0.4, 0.7, 0.4] : [0.2, 0.3, 0.2],
            scale: isSpeaking ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.15)_0%,transparent_70%)]" 
        />
      </div>

      {/* 2. Primary Animatronic Container */}
      <motion.div 
        animate={{
          y: [-5, 5, -5],
          rotate: [-0.5, 0.5, -0.5]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        {/* The Base Image */}
        <motion.div
          animate={{
            filter: isSpeaking 
              ? ["brightness(1) saturate(1)", "brightness(1.2) saturate(1.2)", "brightness(1) saturate(1)"]
              : "brightness(1) saturate(1)"
          }}
          transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
          className="relative w-full h-full"
        >
          <Image
            src="/avatars/hologram(1).png"
            alt="AI Interviewer Protocol"
            fill
            className="object-contain"
            priority
          />

          {/* EYE BLINK OVERLAYS (Positioned relative to face in PNG) */}
          <div className="absolute top-[37.5%] left-1/2 -translate-x-1/2 w-[18%] h-[2%] flex justify-between px-[2%] pointer-events-none opacity-40">
             <motion.div 
               animate={{ scaleY: blink ? 1 : 0 }}
               className="w-[35%] h-full bg-[#0a0f1e] rounded-full origin-top shadow-[0_0_10px_rgba(34,211,238,0.5)]"
             />
             <motion.div 
               animate={{ scaleY: blink ? 1 : 0 }}
               className="w-[35%] h-full bg-[#0a0f1e] rounded-full origin-top shadow-[0_0_10px_rgba(34,211,238,0.5)]"
             />
          </div>

          {/* MOUTH SPEAKING OVERLAY (Reactive to isSpeaking) */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: 1, 
                  scaleY: [0.8, 1.4, 0.9, 1.2, 0.8],
                  height: ["2px", "4px", "3px", "5px", "2px"]
                }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.2, repeat: Infinity }}
                className="absolute top-[52.5%] left-1/2 -translate-x-1/2 w-[8%] bg-cyan-400/60 rounded-full blur-[2px] mix-blend-screen shadow-[0_0_15px_#22d3ee]"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* 3. Digital Scanline Engine */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

      {/* 4. Interface HUD Labels */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-1.5">
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

      {/* 5. Audio Visualizer (Minimal bottom variant) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 h-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isSpeaking ? [4, 12, 6, 16, 4] : 4,
              opacity: isSpeaking ? 1 : 0.2
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
