
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Activity, Wifi, Zap, Brain } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v7.0 - Independent Neural Animatronics.
 * Decouples facial features from the body to allow independent movement.
 * Blazer, Background, and Platform remain 100% stationary.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
  isGenerating?: boolean;
  videoUrl?: string | null;
  currentQuestion?: string;
}

export default function HolographicInterviewer({ 
  isSpeaking = false, 
  className,
  isGenerating = false
}: HolographicInterviewerProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [headPos, setHeadPos] = useState({ x: 0, y: 0, rotate: 0 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  // 1. Autonomous Blinking Loop
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

  // 2. Independent Head Movement (Subtle micro-movements)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const moveHead = () => {
      setHeadPos({ 
        x: (Math.random() - 0.5) * 1.5, 
        y: (Math.random() - 0.5) * 1,
        rotate: (Math.random() - 0.5) * 0.5
      });
      timeout = setTimeout(moveHead, Math.random() * 3000 + 2000);
    };
    moveHead();
    return () => clearTimeout(timeout);
  }, []);

  // 3. Independent Eye Movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const moveEyes = () => {
      setEyePos({ 
        x: (Math.random() - 0.5) * 2, 
        y: (Math.random() - 0.5) * 1 
      });
      timeout = setTimeout(moveEyes, Math.random() * 4000 + 1000);
    };
    moveEyes();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-[#02040a] overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-2xl",
      className
    )}>
      
      {/* 1. STATIONARY BACKGROUND & BODY LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* The Base Image: Body, Blazer, and Background (STATIONARY) */}
        <Image
          src="/avatars/hologram.png"
          alt="AI Interviewer Body"
          fill
          className="object-contain brightness-90 saturate-75 opacity-95"
          priority
        />

        {/* Stationary Platform Glow */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full h-[100px] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.3)_0%,transparent_70%)] blur-xl" />
      </div>

      {/* 2. INDEPENDENT NEURAL FACE LAYER */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
        animate={{ 
          x: headPos.x, 
          y: headPos.y,
          rotate: headPos.rotate
        }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      >
        <div className="relative w-full h-full max-w-[95%] max-h-[95%]">
          {/* THE FACE (Clipped copy of the same image to move independently) */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
             <div 
               className="w-full h-full relative"
               style={{
                 backgroundImage: 'url(/avatars/hologram.png)',
                 backgroundSize: 'contain',
                 backgroundRepeat: 'no-repeat',
                 backgroundPosition: 'center',
                 clipPath: 'ellipse(16% 22% at 50% 41%)', // Isolates the head area
               }}
             >
                {/* 3. INDEPENDENT OPTIC NODE (Eyes) */}
                <motion.div 
                  className="absolute top-[38.2%] left-[45.8%] w-[8.4%] h-[2%] flex justify-between px-[2%]"
                  animate={{ x: eyePos.x, y: eyePos.y }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  {/* Blinking Logic: Using a soft-edged brightness dip instead of black bars */}
                  <AnimatePresence>
                    {isBlinking && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#02040a] blur-[3px] rounded-full z-20"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* 4. VOCAL MATRIX NODE (Mouth) */}
                {isSpeaking && (
                  <motion.div 
                    className="absolute top-[48.4%] left-[46.5%] w-[7%] h-[1.8%] z-30"
                    animate={{ 
                      scaleY: [1, 1.4, 0.8, 1.2, 1],
                      opacity: [0.7, 1, 0.8, 1, 0.7]
                    }}
                    transition={{ duration: 0.15, repeat: Infinity }}
                  >
                    {/* Vocal Matrix Light (Simulates mouth movement via light sync) */}
                    <div className="w-full h-full bg-cyan-400/40 blur-[4px] rounded-full shadow-[0_0_12px_#22d3ee]" />
                    <div className="absolute inset-0 bg-purple-500/20 blur-[6px] rounded-full" />
                  </motion.div>
                )}
             </div>
          </div>
        </div>
      </motion.div>

      {/* 5. INDEPENDENT ATMOSPHERIC & HUD LAYERS (STATIONARY) */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Futuristic Scanlines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

        {/* HUD Labels */}
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

        {/* Reactive Waveform Matrix (STATIONARY) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: isSpeaking ? [6, 20, 10, 24, 6] : 6,
                opacity: isSpeaking ? [0.4, 1, 0.5, 0.8, 0.4] : 0.1
              }}
              transition={{ duration: 0.4 + (i * 0.1), repeat: Infinity }}
              className="h-[2px] bg-cyan-400 rounded-full"
            />
          ))}
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-end">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: isSpeaking ? [6, 20, 10, 24, 6] : 6,
                opacity: isSpeaking ? [0.4, 1, 0.5, 0.8, 0.4] : 0.1
              }}
              transition={{ duration: 0.4 + (i * 0.1), repeat: Infinity }}
              className="h-[2px] bg-cyan-400 rounded-full"
            />
          ))}
        </div>

        {/* System Uplink Status */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3 transition-colors", isSpeaking ? "text-green-400" : "text-white/20")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">
              {isSpeaking ? "UPLINK BUSY" : "SIGNAL STABLE"}
            </span>
          </div>
        </div>
      </div>

      {/* Generating/Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] glass backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-6">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-2 border-accent/20 border-t-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
              />
              <Brain className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Neural Synthesis...</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
