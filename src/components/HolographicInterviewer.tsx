"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Cpu, Wifi, Activity, Brain } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v30.0 - Neural Animatronics.
 * Implements localized facial micro-movements and reactive vocal pulses.
 * Asset Stability Protocol: The primary PNG remains fixed in space.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  currentQuestion?: string;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, currentQuestion = "", className }: HolographicInterviewerProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [faceX, setFaceX] = useState(0);
  const [faceY, setFaceY] = useState(0);
  
  // 1. Autonomous Blinking Loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      timeout = setTimeout(blink, Math.random() * 4000 + 2000);
    };
    timeout = setTimeout(blink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // 2. Localized Eye Movement Loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const moveEyes = () => {
      setFaceX((Math.random() - 0.5) * 2); // Micro-range
      setFaceY((Math.random() - 0.5) * 1.5);
      timeout = setTimeout(moveEyes, Math.random() * 3000 + 1000);
    };
    moveEyes();
    return () => clearTimeout(timeout);
  }, []);

  // 3. Thinking State Logic
  useEffect(() => {
    if (currentQuestion && !isSpeaking) {
      setIsThinking(true);
      const timer = setTimeout(() => setIsThinking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, isSpeaking]);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden rounded-[2.5rem] border border-cyan-500/20",
      className
    )}>
      
      {/* BACKGROUND ATMOSPHERE */}
      <div className="absolute inset-0 bg-[#02040a] z-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Projector Platform */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square z-0 pointer-events-none opacity-40">
          <motion.div 
            animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1, opacity: isSpeaking ? [0.4, 0.6, 0.4] : 0.3 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.5)_0%,transparent_70%)] blur-2xl"
            style={{ transform: 'rotateX(80deg)' }}
          />
        </div>
      </div>

      {/* PRIMARY IMAGE LAYERING */}
      <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-[95%] max-h-[95%] overflow-hidden">
          
          {/* BASE STATIC PNG */}
          <div className="w-full h-full relative">
            <Image
              src="/avatars/hologram.png"
              alt="Interviewer"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          {/* LOCALIZED FACE TRANSFORM LAYER (The Animatronics) */}
          {/* We use a clipped clone of the face to simulate movement without moving the blazer */}
          <motion.div
            animate={{
              x: faceX,
              y: faceY,
              rotateZ: faceX * 0.5,
              filter: isSpeaking ? "brightness(1.1) contrast(1.05)" : "brightness(1.0) contrast(1.0)"
            }}
            transition={{ type: "spring", stiffness: 40, damping: 20 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: "circle(22% at 50% 41%)", // Focuses on the face area
            }}
          >
            <Image
              src="/avatars/hologram.png"
              alt="Face"
              fill
              className="object-contain"
              unoptimized
            />

            {/* NEURAL BLINK EFFECT */}
            <motion.div 
              animate={{ opacity: isBlinking ? 0.7 : 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              style={{ clipPath: "ellipse(10% 4% at 50% 40%)" }}
            />
          </motion.div>

          {/* VOCAL MATRIX (Mouth Pulse) */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
                style={{
                  clipPath: "ellipse(4% 2% at 50% 52%)",
                  background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)"
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FUTURISTIC HUD OVERLAYS */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* Digital Scanlines */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />

        {/* HUD Labels */}
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
            ) : isThinking ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-amber-500/20 bg-amber-500/10"
              >
                <Activity className="w-3 h-3 text-amber-400 animate-spin-slow" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-400">PROCESSING</span>
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
          {[...Array(10)].map((_, i) => (
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

        {/* LINK STATUS */}
        <div className="absolute bottom-6 right-6">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3", isSpeaking ? "text-green-400" : "text-white/10")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">NEURAL LINK: {isSpeaking ? "ACTIVE" : "STABLE"}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
