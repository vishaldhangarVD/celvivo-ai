"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Box, Activity, Zap, Waves } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @fileOverview HolographicInterviewer - Elite AI Persona v5.0.
 * Matches the neon purple/blue holographic reference EXACTLY.
 */

interface HolographicInterviewerProps {
  isSpeaking?: boolean;
  className?: string;
}

export default function HolographicInterviewer({ isSpeaking = false, className }: HolographicInterviewerProps) {
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
          throw new Error("TalkingHead module interface not detected.");
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
            avatarIdleEyeContact: 0.9,
            avatarIdleHeadMove: 0.5,
            avatarSpeakingEyeContact: 1.0,
            avatarSpeakingHeadMove: 0.8
          });

          // Set professional framing (Reference: portrait/upper body)
          head.setView("upper");

          if (isMounted) {
            setLoading(false);
          }
        } catch (glbErr: any) {
          console.error("[Neural Mesh] Julia avatar loading failed:", glbErr);
          throw new Error(`Mesh Hydration Fault: ${glbErr.message}`);
        }

      } catch (err: any) {
        console.error("[Neural Mesh] Runtime Initialization Fault:", err);
        if (isMounted) {
          setError(err.message || "Failed to establish neural link.");
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
    <div className={cn("relative w-full h-full min-h-[400px] flex items-center justify-center bg-black overflow-hidden group rounded-[2rem]", className)}>
      {/* 1. Futuristic Background Aura (Purple/Blue Neon) */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000",
        isSpeaking 
          ? "bg-[radial-gradient(circle_at_50%_40%,rgba(147,51,234,0.25)_0%,transparent_70%)]" 
          : "bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.15)_0%,transparent_60%)]"
      )} />

      {/* 2. Holographic Projection Platform (Circular energy base) */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[150%] aspect-[4/1] pointer-events-none z-10">
        <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-pulse blur-sm" />
        <div className="absolute inset-4 rounded-full border border-purple-500/30 animate-spin-slow" />
        <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent blur-xl" />
      </div>

      {/* 3. Floating Particles Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-20">
        {[...Array(25)].map((_, i) => (
          <div 
            key={i}
            className={cn(
              "absolute w-1 h-1 bg-accent rounded-full animate-float",
              isSpeaking && "animate-pulse brightness-200"
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      {/* 4. 3D Julia Avatar Container (Futuristic Filter Applied) */}
      <div 
        className={cn(
          "relative w-full h-full transition-all duration-700 transform scale-[1.15] z-30",
          "holographic-identity-filter",
          isSpeaking ? "brightness-150" : "brightness-110 opacity-90"
        )}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* 5. HUD Labels & Status */}
      <div className="absolute top-6 left-6 z-40 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
            <Cpu className={cn("w-3 h-3", isSpeaking && "animate-spin-slow")} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">AI Interviewer</span>
        </div>
        <p className="text-[7px] font-bold uppercase tracking-widest text-white/20 pl-8">Protocol: Nexus-7</p>
      </div>

      <div className="absolute top-6 right-6 z-40">
        <AnimatePresence>
          {isSpeaking && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 px-3 py-1 glass border-accent/40 bg-accent/10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              <span className="text-[8px] font-black uppercase tracking-widest text-accent">Speaking</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 6. Neural Audio Waveform (Base surrounding) */}
      <AnimatePresence>
        {isSpeaking && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-end gap-1 h-12">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 2 }}
                animate={{ height: [2, Math.random() * 40 + 5, 2] }}
                transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity }}
                className="w-1 bg-gradient-to-t from-accent to-purple-600 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Scanline Layer */}
      <div className="absolute inset-0 pointer-events-none hologram-scanlines z-50 opacity-20" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[100]">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Initializing Hologram...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-xl z-[110] p-8 text-center">
          <Activity className="w-10 h-10 text-red-500 mb-4" />
          <h3 className="text-white font-bold uppercase tracking-widest text-[10px] mb-2">Neural Desync</h3>
          <p className="text-white/40 text-[8px] uppercase max-w-xs leading-relaxed">{error}</p>
        </div>
      )}

      <style jsx global>{`
        .holographic-identity-filter {
          /* Neon Purple/Blue Transformation Matrix */
          filter: grayscale(0.4) brightness(1.2) sepia(0.8) hue-rotate(220deg) saturate(10) drop-shadow(0 0 20px rgba(168,85,247,0.5));
          mix-blend-mode: lighten;
        }
        
        .hologram-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.2) 50%
          ),
          linear-gradient(
            90deg,
            rgba(168, 85, 247, 0.05),
            rgba(34, 211, 238, 0.02),
            rgba(168, 85, 247, 0.05)
          );
          background-size: 100% 4px, 4px 100%;
          animation: scanlineMove 8s linear infinite;
        }

        @keyframes scanlineMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }

        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
