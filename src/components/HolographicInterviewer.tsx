
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Wifi, Activity, Loader2, Sparkles, Zap } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v40.0 - Neural Video Matrix.
 * Supports static PNG, neural loading, and real talking-head video playback.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  isGenerating?: boolean;
  videoUrl?: string | null;
  currentQuestion?: string;
  className?: string;
}

export default function HolographicInterviewer({ 
  isSpeaking = false, 
  isGenerating = false,
  videoUrl = null,
  currentQuestion = "", 
  className 
}: HolographicInterviewerProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  
  // 1. Autonomous Blinking Loop (Only for static mode)
  useEffect(() => {
    if (isSpeaking && videoUrl) return;
    let timeout: NodeJS.Timeout;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      timeout = setTimeout(blink, Math.random() * 4000 + 2000);
    };
    timeout = setTimeout(blink, 3000);
    return () => clearTimeout(timeout);
  }, [isSpeaking, videoUrl]);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-2xl",
      className
    )}>
      
      {/* BACKGROUND ATMOSPHERE */}
      <div className="absolute inset-0 bg-[#02040a] z-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Projector Platform */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square z-0 pointer-events-none opacity-40">
          <motion.div 
            animate={{ 
              scale: (isSpeaking || isGenerating) ? [1, 1.05, 1] : 1, 
              opacity: (isSpeaking || isGenerating) ? [0.4, 0.6, 0.4] : 0.3 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.5)_0%,transparent_70%)] blur-2xl"
            style={{ transform: 'rotateX(80deg)' }}
          />
        </div>
      </div>

      {/* PRIMARY MEDIA LAYER */}
      <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-[95%] max-h-[95%] overflow-hidden rounded-2xl">
          
          <AnimatePresence mode="wait">
            {isSpeaking && videoUrl ? (
              <motion.div
                key="video-matrix"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain filter hue-rotate-[200deg] saturate-[1.2] brightness-110"
                  onEnded={() => {}} // Controlled by parent isSpeaking prop
                />
                {/* Holographic Overlay for Video */}
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none mix-blend-overlay" />
              </motion.div>
            ) : (
              <motion.div
                key="static-matrix"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <Image
                  src="/avatars/hologram.png"
                  alt="Interviewer"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
                
                {/* NEURAL BLINK EFFECT (CSS Simulation) */}
                <motion.div 
                  animate={{ opacity: isBlinking ? 0.6 : 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
                  style={{ clipPath: "ellipse(10% 4% at 50% 40%)" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* GENERATING OVERLAY */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-accent animate-spin" />
                  <Zap className="w-4 h-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Neural Synthesis</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest mt-1">Generating Local Video Node...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FUTURISTIC HUD OVERLAYS */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />

        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-cyan-500/20 bg-black/60">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">AI INTERVIEWER</span>
          </div>
          
          <AnimatePresence mode="wait">
            {isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-purple-500/20 bg-purple-500/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_#a855f7]" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">SPEAKING</span>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-amber-500/20 bg-amber-500/10"
              >
                <Activity className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-400">SYNTHESIZING</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/10 bg-black/40"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">READY</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SYMMETRIC WAVEFORMS */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 h-4">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isSpeaking ? [4, 18, 6, 22, 4] : 2,
                opacity: isSpeaking ? [0.6, 1, 0.6] : 0.1
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.05,
              }}
              className="w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
            />
          ))}
        </div>

        <div className="absolute bottom-6 right-6">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3", isSpeaking ? "text-green-400" : "text-white/10")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">
              {isGenerating ? "UPLINK BUSY" : isSpeaking ? "NEURAL LINK: ACTIVE" : "NEURAL LINK: STABLE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
