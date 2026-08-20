"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Cpu, Activity, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @fileOverview HolographicInterviewer - Step 4: Futuristic AI Persona.
 * Integrates TalkingHead v1.7 with a custom holographic visual stack.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
}

export default function HolographicInterviewer({ isSpeaking = false }: HolographicInterviewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initTalkingHead() {
      if (typeof window === "undefined" || !containerRef.current) return;

      try {
        // Resolve TalkingHead from the browser-level import map specifier 'talkinghead'.
        // @ts-ignore - 'talkinghead' is resolved by the browser importmap
        const module: any = await import(/* webpackIgnore: true */ 'talkinghead');
        
        if (!module || !module.TalkingHead) {
          throw new Error("TalkingHead module interface not detected in CDN stream.");
        }

        const TalkingHead = module.TalkingHead;

        if (!isMounted || !containerRef.current) return;

        // Initialize 3D Engine with professional settings
        const head = new TalkingHead(containerRef.current, {
          eyeContact: true,
          headMovement: true,
          headSpeaking: true,
          lipsync: false, 
          mood: "neutral"
        });

        headRef.current = head;

        try {
          await head.showAvatar({
            url: "/avatars/julia.glb",
            body: "F",
            avatarMood: "neutral",
            avatarIdleEyeContact: 0.8,
            avatarIdleHeadMove: 0.6,
            avatarSpeakingEyeContact: 0.9,
            avatarSpeakingHeadMove: 0.8
          });

          // Set professional framing
          head.setView("upper");

          if (isMounted) {
            setLoading(false);
            console.log("[Neural Mesh] Julia Hologram Initialized.");
          }
        } catch (glbErr: any) {
          console.error("[Neural Mesh] Julia avatar loading failed:", glbErr);
          throw new Error(`Avatar Load Fault: ${glbErr.message}`);
        }

      } catch (err: any) {
        console.error("[Neural Mesh] Runtime Initialization Fault:", err);
        if (isMounted) {
          setError(err.message || "Failed to establish mesh protocol link.");
          setLoading(false);
        }
      }
    }

    initTalkingHead();

    return () => {
      isMounted = false;
      if (headRef.current && typeof headRef.current.dispose === "function") {
        try {
          headRef.current.dispose();
        } catch (e) {
          console.warn("[Neural Mesh] Cleanup warning:", e);
        }
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-[#050816] overflow-hidden group">
      {/* 1. Background Aura */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000",
        isSpeaking 
          ? "bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.15)_0%,transparent_60%)]" 
          : "bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.1)_0%,transparent_60%)]"
      )} />

      {/* 2. Floating Particles Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className={cn(
              "absolute w-1 h-1 bg-accent rounded-full animate-float",
              isSpeaking && "animate-pulse brightness-150"
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 3. 3D Julia Avatar Container */}
      <div 
        className={cn(
          "relative w-full h-full transition-all duration-500 transform scale-[1.1]",
          "hologram-filter",
          isSpeaking ? "brightness-125 saturate-150" : "brightness-100 opacity-90"
        )}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* 4. Scanline & Digital Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none hologram-scanlines z-10 opacity-30" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20 mix-blend-overlay" />

      {/* 5. UI Elements & Labels */}
      <div className="absolute top-8 left-8 z-30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass border-accent/20 flex items-center justify-center text-accent">
            <Cpu className={cn("w-5 h-5", isSpeaking && "animate-spin-slow")} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">AI Interviewer</p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Protocol Julia-01</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-30 flex flex-col items-end gap-2">
        <div className={cn(
          "px-4 py-1 rounded-lg glass border-white/10 flex items-center gap-2 transition-all",
          isSpeaking ? "border-green-500/30 bg-green-500/5 text-green-400" : "text-white/20"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full bg-current", isSpeaking && "animate-ping")} />
          <span className="text-[8px] font-black uppercase tracking-widest">
            {isSpeaking ? "Vocal Matrix: Active" : "Vocal Matrix: Idle"}
          </span>
        </div>
        <div className="text-[7px] font-bold text-white/10 uppercase tracking-[0.3em]">Neural Link Status: Verified</div>
      </div>

      {/* 6. Waveform (Speaking Indicator) */}
      <AnimatePresence>
        {isSpeaking && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-end gap-1 h-8">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 4 }}
                animate={{ height: [4, 16, 8, 24, 6] }}
                transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, repeatType: 'reverse' }}
                className="w-0.5 bg-accent/60 rounded-full"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050816] z-50">
          <div className="relative">
             <div className="w-24 h-24 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
             <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Hydrating Neural Mesh...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-xl z-[60] p-12 text-center">
          <Box className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Protocol Desync</h3>
          <p className="text-white/40 text-[10px] uppercase max-w-xs leading-relaxed">{error}</p>
        </div>
      )}

      <style jsx global>{`
        .hologram-filter {
          filter: grayscale(0.5) brightness(1.3) sepia(1) hue-rotate(160deg) saturate(8) drop-shadow(0 0 15px rgba(34,211,238,0.4));
          mix-blend-mode: screen;
        }
        
        .hologram-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.25) 50%
          ),
          linear-gradient(
            90deg,
            rgba(255, 0, 0, 0.06),
            rgba(0, 255, 0, 0.02),
            rgba(0, 0, 255, 0.06)
          );
          background-size: 100% 3px, 3px 100%;
          animation: scanlineMove 10s linear infinite;
        }

        @keyframes scanlineMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
}