"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Cpu, Brain, Wifi, AlertTriangle, Volume2, Loader2 } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v42.0 - ElevenLabs Voice Integration.
 * Reuses the existing /api/tts endpoint to feed ElevenLabs audio to the Julia avatar.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
  isGenerating?: boolean;
  currentQuestion?: string;
  onSpeechEnd?: () => void;
}

declare global {
  interface Window {
    TalkingHeadClass: any;
  }
}

export default function HolographicInterviewer({ 
  isSpeaking = false, 
  className,
  isGenerating = false,
  currentQuestion = "",
  onSpeechEnd
}: HolographicInterviewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [internalIsSpeaking, setInternalIsSpeaking] = useState(false);
  const lastSpokenRef = useRef("");
  const activeAudioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || headRef.current) return;

    const initHead = async () => {
      const getTalkingHead = () => {
        return new Promise((resolve) => {
          if (window.TalkingHeadClass) {
            resolve(window.TalkingHeadClass);
            return;
          }
          const handleReady = () => {
            window.removeEventListener('talkinghead-ready', handleReady);
            resolve(window.TalkingHeadClass);
          };
          window.addEventListener('talkinghead-ready', handleReady);
        });
      };

      try {
        const TalkingHead: any = await getTalkingHead();

        // Initialize with lipsyncModules as an array of language codes
        const head = new TalkingHead(containerRef.current!, {
          lipsyncModules: ["en"],
          lipsyncLang: "en",
          ttsLang: "en-US",
          cameraView: "upper",
          blinking: true,
          lookup: true,
          smoothMouth: true,
          background: "transparent",
          avatarIdleHeadMove: 0.5,
          avatarIdleEyeContact: 0.5,
          avatarSpeakingHeadMove: 0.8
        });

        // Load Julia Avatar from GLB
        await head.showAvatar({
          url: "/avatars/julia.glb",
          body: "F",
          avatarMood: "neutral"
        });

        headRef.current = head;
        setStatus("ready");
        head.start();
        console.log("[Julia] 3D Matrix Initialized with ElevenLabs Voice Pipeline.");
      } catch (error: any) {
        console.error("[Julia] Initialization Fault:", error);
        setErrorMessage(error?.message || "3D Matrix initialization failed.");
        setStatus("error");
      }
    };

    if (typeof window !== "undefined") {
      initHead();
    }

    return () => {
      if (headRef.current) {
        try {
          headRef.current.stopSpeaking();
        } catch (e) {}
      }
      if (activeAudioUrlRef.current) {
        URL.revokeObjectURL(activeAudioUrlRef.current);
      }
    };
  }, []);

  /**
   * Fetches audio from ElevenLabs and plays it through the Julia avatar.
   */
  const speakText = async (text: string) => {
    if (!headRef.current || !text || status !== "ready") return;
    
    try {
      // 1. Reset current speech
      headRef.current.stopSpeaking();
      if (activeAudioUrlRef.current) {
        URL.revokeObjectURL(activeAudioUrlRef.current);
        activeAudioUrlRef.current = null;
      }

      // 2. Fetch from existing ElevenLabs endpoint
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Julia ElevenLabs] TTS API Error:", response.status, errorText);
        throw new Error(`TTS API failed: ${response.status}`);
      }

      // 3. Process binary audio response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      activeAudioUrlRef.current = audioUrl;

      // 4. Play through Julia avatar pipeline (No visemes added in this step)
      headRef.current.speakAudio(audioUrl, [], {
        onStart: () => setInternalIsSpeaking(true),
        onEnd: () => {
          setInternalIsSpeaking(false);
          if (onSpeechEnd) onSpeechEnd();
          if (activeAudioUrlRef.current) {
            URL.revokeObjectURL(activeAudioUrlRef.current);
            activeAudioUrlRef.current = null;
          }
        }
      });

    } catch (err: any) {
      console.error("[Julia Speech] ElevenLabs Transmission Fault:", err.message);
      setInternalIsSpeaking(false);
    }
  };

  // Trigger speech when isSpeaking prop changes or a new question arrives
  useEffect(() => {
    if (isSpeaking && currentQuestion && currentQuestion !== lastSpokenRef.current && status === "ready") {
      lastSpokenRef.current = currentQuestion;
      speakText(currentQuestion);
    } else if (!isSpeaking && headRef.current) {
      headRef.current.stopSpeaking();
      setInternalIsSpeaking(false);
    }
  }, [isSpeaking, currentQuestion, status]);

  // Diagnostic tool for development/testing
  const runVocalDiagnostic = () => {
    speakText("Neural vocal diagnostic initiated. ElevenLabs voice transmission is now synchronized with the Julia protocol.");
  };

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-[#02040a] overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-2xl group",
      className
    )}>
      
      {/* 3D Render Container */}
      <div 
        ref={containerRef} 
        className={cn(
          "absolute inset-0 z-10 w-full h-full transition-opacity duration-1000",
          status === "ready" ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Holographic Overlays */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 glass rounded-lg border-cyan-500/20 bg-black/40">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">AI INTERVIEWER</span>
              <span className="text-[9px] text-white/20">|</span>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-1 h-1 rounded-full", 
                  internalIsSpeaking ? "bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-white/20"
                )} />
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest", 
                  internalIsSpeaking ? "text-green-400" : "text-white/30"
                )}>
                  {internalIsSpeaking ? "● SPEAKING" : "● IDLE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3 transition-colors", internalIsSpeaking ? "text-green-400" : "text-white/20")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">ELEVENLABS SYNC</span>
          </div>
        </div>
      </div>

      {/* Diagnostic Vocal Trigger */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={runVocalDiagnostic}
          className="px-6 py-2 glass rounded-xl text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all border border-white/5 hover:border-accent/30 bg-black/40 backdrop-blur-md flex items-center gap-2"
        >
          <Volume2 className="w-3 h-3" /> TRIGGER VOCAL MATRIX
        </button>
      </div>

      {/* Loading & Status States */}
      <AnimatePresence>
        {(status === "loading" || isGenerating) && (
          <motion.div 
            key="loading"
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
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">
              {isGenerating ? "Synthesizing Neural Node..." : "Synchronizing Neural Core..."}
            </p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 glass backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Neural Link Failure</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed max-w-[240px]">
              {errorMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}