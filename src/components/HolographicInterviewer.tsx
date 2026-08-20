
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Cpu, Brain, Wifi, Zap } from "lucide-react";
import { TalkingHead } from "@met4citizen/talkinghead";

/**
 * @fileOverview HolographicInterviewer v8.0 - Julia 3D Restoration.
 * Powered by TalkingHead and julia.glb for high-fidelity 3D interaction.
 * Replaces the 2D hologram with a real-time lip-synced 3D character.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
  isGenerating?: boolean;
  currentQuestion?: string;
}

export default function HolographicInterviewer({ 
  isSpeaking = false, 
  className,
  isGenerating = false,
  currentQuestion = ""
}: HolographicInterviewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize 3D Talking Head
  useEffect(() => {
    if (!containerRef.current || headRef.current) return;

    const initHead = async () => {
      try {
        const head = new TalkingHead(containerRef.current!, {
          model: "/avatars/julia.glb",
          cameraView: "upper", // Upper body framing
          lipsync: true,
          blinking: true,
          lookup: true,
          smoothMouth: true,
          background: "transparent"
        });

        await head.promise;
        headRef.current = head;
        setIsLoaded(true);

        // Start idle animation
        head.start();
      } catch (error) {
        console.error("[Julia Engine] Failed to initialize 3D node:", error);
      }
    };

    initHead();

    return () => {
      if (headRef.current) {
        // Cleanup would go here if TalkingHead supported explicit destroy
      }
    };
  }, []);

  // Synchronize Speech
  useEffect(() => {
    if (!headRef.current || !isLoaded) return;

    if (isSpeaking && currentQuestion) {
      headRef.current.speakText(currentQuestion);
    } else if (!isSpeaking) {
      headRef.current.stopSpeaking();
    }
  }, [isSpeaking, currentQuestion, isLoaded]);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-[#02040a] overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-2xl",
      className
    )}>
      
      {/* 1. 3D RENDER TARGET */}
      <div 
        ref={containerRef} 
        className={cn(
          "absolute inset-0 z-10 w-full h-full transition-opacity duration-1000",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />

      {/* 2. ATMOSPHERIC HUD LAYERS */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Futuristic Scanlines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

        {/* HUD Labels */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 glass rounded-lg border-cyan-500/20 bg-black/40">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">AI INTERVIEWER (JULIA)</span>
          </div>
          
          <AnimatePresence>
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

        {/* Reactive Waveform Matrix */}
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
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3 transition-colors", isSpeaking ? "text-green-400" : "text-white/20")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">
              {isSpeaking ? "SYNTAX STREAMING" : "SIGNAL STABLE"}
            </span>
          </div>
        </div>
      </div>

      {/* Generating/Loading Overlay */}
      <AnimatePresence>
        {(!isLoaded || isGenerating) && (
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
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Neural 3D Node...</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
