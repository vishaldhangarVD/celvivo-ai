"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Cpu, Brain, Wifi, AlertTriangle } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer v16.0 - Final Lip-Sync URL Fix.
 * Corrects the lipsyncModules configuration to use language codes,
 * enabling real-time 3D mouth movement without malformed fetch errors.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
  isGenerating?: boolean;
  currentQuestion?: string;
  onSpeechEnd?: () => void;
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
  const lastSpokenRef = useRef("");

  useEffect(() => {
    if (!containerRef.current || headRef.current) return;

    const initHead = async () => {
      console.log("[Julia] Initializing Neural Oral Matrix (v1.7 API)");

      const getTalkingHead = () => {
        return new Promise((resolve) => {
          if ((window as any).TalkingHeadClass) {
            resolve((window as any).TalkingHeadClass);
            return;
          }
          const handleReady = () => {
            window.removeEventListener('talkinghead-ready', handleReady);
            resolve((window as any).TalkingHeadClass);
          };
          window.addEventListener('talkinghead-ready', handleReady);
        });
      };

      try {
        const TalkingHead: any = await getTalkingHead();

        // TalkingHead v1.7 expects lipsyncModules to be an array of language codes.
        // It internally resolves these relative to its own module path.
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

        head.setView("upper");
        headRef.current = head;
        setStatus("ready");
        
        // Start autonomous idle behavior
        head.start();
        console.log("[Julia] 3D Engine & Lip-Sync Active");
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

  // Neural Sync: Bind Prop State to 3D Morph Targets
  useEffect(() => {
    if (!headRef.current || status !== "ready") return;

    if (isSpeaking && currentQuestion && currentQuestion !== lastSpokenRef.current) {
      lastSpokenRef.current = currentQuestion;
      
      const triggerVocalMatrix = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Natural') && v.name.includes('Female') && v.lang.startsWith('en')) ||
                              voices.find(v => v.name.includes('Female') && v.lang.startsWith('en')) ||
                              voices.find(v => v.lang.startsWith('en'));

        headRef.current.speakText(
          currentQuestion,
          preferredVoice,
          () => {
            console.log("[Julia] Vocal Transmission: Synchronizing Lips");
          },
          () => {
            console.log("[Julia] Vocal Transmission: End of Data");
            if (onSpeechEnd) onSpeechEnd();
          }
        );
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          triggerVocalMatrix();
        };
      } else {
        triggerVocalMatrix();
      }

    } else if (!isSpeaking) {
      headRef.current.stopSpeaking();
    }
  }, [isSpeaking, currentQuestion, status, onSpeechEnd]);

  return (
    <div className={cn(
      "relative w-full h-full min-h-[300px] flex items-center justify-center bg-[#02040a] overflow-hidden rounded-[2.5rem] border border-cyan-500/20 shadow-2xl",
      className
    )}>
      
      <div 
        ref={containerRef} 
        className={cn(
          "absolute inset-0 z-10 w-full h-full transition-opacity duration-1000",
          status === "ready" ? "opacity-100" : "opacity-0"
        )}
      />

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
                  isSpeaking ? "bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-white/20"
                )} />
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest transition-colors duration-300", 
                  isSpeaking ? "text-green-400" : "text-white/30"
                )}>
                  {isSpeaking ? "SPEAKING" : "IDLE"}
                </span>
              </div>
            </div>
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
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">LIP-SYNC ACTIVE</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border-white/5 bg-black/40">
            <Wifi className={cn("w-3 h-3 transition-colors", isSpeaking ? "text-green-400" : "text-white/20")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">
              {isSpeaking ? "SYNTAX STREAMING" : "SIGNAL STABLE"}
            </span>
          </div>
        </div>
      </div>

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
