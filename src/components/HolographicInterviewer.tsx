"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Cpu, Brain, Wifi, AlertTriangle, Music, Activity } from "lucide-react";
import { synthesizeAudio } from "@/ai/flows/ai-audio-synthesis";

/**
 * @fileOverview HolographicInterviewer v18.0 - Neural Lip-Sync Implementation.
 * Implements high-fidelity 3D mouth movement synchronized with Gemini TTS audio.
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [internalIsSpeaking, setInternalIsSpeaking] = useState(false);
  const lastSpokenRef = useRef("");

  useEffect(() => {
    if (!containerRef.current || headRef.current) return;

    const initHead = async () => {
      console.log("[Julia] Initializing Oral Matrix (v1.7 API)");

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

        // Initialize 3D Engine with LipSync enabled
        const head = new TalkingHead(containerRef.current!, {
          lipsync: true, 
          cameraView: "upper",
          blinking: true,
          lookup: true,
          smoothMouth: true,
          background: "transparent",
          lipsyncModules: ["en"],
          lipsyncLang: "en"
        });

        console.log("[Julia] Loading GLB asset: /avatars/julia.glb");
        await head.showAvatar({
          url: "/avatars/julia.glb",
          body: "F",
          avatarMood: "neutral"
        });

        // Diagnostic: Log morph targets to verify GLB capability
        const mesh = head.avatar?.getObjectByName('Wolf3D_Head') || head.avatar?.getObjectByName('Head');
        if (mesh && mesh.morphTargetDictionary) {
          console.log("[Julia] Morph Targets Detected:", Object.keys(mesh.morphTargetDictionary).length);
        }

        head.setView("upper");
        headRef.current = head;
        setStatus("ready");
        
        head.start();
        console.log("[Julia] 3D Engine & Lip-Sync Ready");
      } catch (error: any) {
        console.error("[Julia] Critical Engine Failure:", error);
        setErrorMessage(error?.message || "3D Engine initialization failed.");
        setStatus("error");
      }
    };

    initHead();

    return () => {
      if (headRef.current) {
        headRef.current.stopSpeaking();
      }
    };
  }, []);

  /**
   * Neural Speak Logic: Synthesizes high-quality audio and drives 3D morph targets.
   */
  const triggerNeuralSpeech = async (text: string) => {
    if (!headRef.current || !text) return;
    
    try {
      console.log("[Julia LipSync] Initializing Neural Sequence for:", text.substring(0, 30) + "...");
      setInternalIsSpeaking(true);

      // 1. Pre-calculate Visemes from text
      const visemes = headRef.current.getVisemes(text);
      console.log("[Julia LipSync] Visemes calculated:", visemes.length);

      // 2. Synthesize High-Fidelity Audio
      const audioDataUri = await synthesizeAudio(text);
      
      // 3. Decode Audio for 3D Engine
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const base64 = audioDataUri.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      
      const audioBuffer = await audioCtxRef.current.decodeAudioData(bytes.buffer);
      
      // 4. Execute Lip-Sync
      headRef.current.speakAudio(audioBuffer, visemes, () => {
        console.log("[Julia LipSync] Audio Pulse Started");
      }, () => {
        console.log("[Julia LipSync] Audio Pulse Ended");
        setInternalIsSpeaking(false);
        if (onSpeechEnd) onSpeechEnd();
      });

    } catch (err) {
      console.error("[Julia LipSync] Synthesis Fault:", err);
      setInternalIsSpeaking(false);
      // Fallback to basic text speak if neural fails
      headRef.current.speakText(text, undefined, () => setInternalIsSpeaking(true), () => setInternalIsSpeaking(false));
    }
  };

  // React to prop changes
  useEffect(() => {
    if (isSpeaking && currentQuestion && currentQuestion !== lastSpokenRef.current && status === "ready") {
      lastSpokenRef.current = currentQuestion;
      triggerNeuralSpeech(currentQuestion);
    } else if (!isSpeaking && headRef.current) {
      headRef.current.stopSpeaking();
      setInternalIsSpeaking(false);
    }
  }, [isSpeaking, currentQuestion, status]);

  // Diagnostic Test Function
  const runDiagnosticTest = () => {
    triggerNeuralSpeech("Hello. This is a system diagnostic check. My neural lip-sync protocol is currently active.");
  };

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-[#02040a] overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-2xl group",
      className
    )}>
      
      {/* 3D RENDER CANVAS */}
      <div 
        ref={containerRef} 
        className={cn(
          "absolute inset-0 z-10 w-full h-full transition-opacity duration-1000",
          status === "ready" ? "opacity-100" : "opacity-0"
        )}
      />

      {/* HOLOGRAM HUD OVERLAY */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

        {/* Top Diagnostic Labels */}
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
                  "text-[8px] font-black uppercase tracking-widest transition-colors duration-300", 
                  internalIsSpeaking ? "text-green-400" : "text-white/30"
                )}>
                  {internalIsSpeaking ? "SPEAKING" : "IDLE"}
                </span>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {internalIsSpeaking && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-purple-500/20 bg-purple-500/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#a855f7]" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">LIP-SYNC ACTIVE</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Signal Label */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3 transition-colors", internalIsSpeaking ? "text-green-400" : "text-white/20")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">
              {internalIsSpeaking ? "SYNTAX STREAMING" : "SIGNAL STABLE"}
            </span>
          </div>
        </div>

        {/* Waveform Pulse */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none opacity-20">
           <div className="flex items-center justify-center gap-1 h-full">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={internalIsSpeaking ? { height: [10, 40, 10] } : { height: 10 }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                  className="w-1 bg-cyan-500 rounded-full"
                />
              ))}
           </div>
        </div>
      </div>

      {/* Diagnostic Button (Visible only on hover for debug) */}
      <button 
        onClick={runDiagnosticTest}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 glass rounded-xl text-[8px] font-black uppercase tracking-widest text-white/0 group-hover:text-white/40 hover:text-white transition-all pointer-events-auto"
      >
        <Activity className="w-3 h-3 inline mr-2" /> Run Speak Diagnostic
      </button>

      {/* Loading/Error States */}
      <AnimatePresence>
        {status === "loading" && (
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
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Oral Matrix...</p>
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
