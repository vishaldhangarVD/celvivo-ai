"use client";

import { useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";

/**
 * @fileOverview HolographicInterviewer - Step 3: 3D Avatar Rendering Protocol.
 * 
 * Corrected API Usage:
 * - Replaced invalid showGLB() with official showAvatar().
 * - Added explicit setView("upper") after loading.
 */

export default function HolographicInterviewer() {
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
        // We use webpackIgnore to ensure the Next.js bundler doesn't attempt to resolve this.
        // @ts-ignore - 'talkinghead' is resolved by the browser importmap
        const module: any = await import(/* webpackIgnore: true */ 'talkinghead');
        
        if (!module || !module.TalkingHead) {
          throw new Error("TalkingHead module interface not detected in CDN stream.");
        }

        const TalkingHead = module.TalkingHead;

        if (!isMounted || !containerRef.current) return;

        // Step 3: Initialize 3D Engine
        const head = new TalkingHead(containerRef.current, {
          eyeContact: true,      // Maintain virtual eye contact
          headMovement: true,    // Natural idle micro-movements
          headSpeaking: true,    // Enable head motion
          lipsync: false,        // Explicitly disabled for Step 3 testing
          mood: "neutral"        // Default professional expression
        });

        headRef.current = head;

        // Load the Julia mesh using the official showAvatar API
        try {
          await head.showAvatar({
            url: "/avatars/julia.glb",
            body: "F",
            avatarMood: "neutral",
            avatarIdleEyeContact: 0.7,
            avatarIdleHeadMove: 0.7,
            avatarSpeakingEyeContact: 0.7,
            avatarSpeakingHeadMove: 0.7
          });

          // Calibration: Set camera to upper body view
          head.setView("upper");

          if (isMounted) {
            setLoading(false);
            console.log("[Neural Mesh] Julia initialized via official showAvatar protocol.");
          }
        } catch (glbErr: any) {
          console.error("[Neural Mesh] Julia avatar loading failed:", glbErr);
          throw new Error(`Avatar Load Fault: ${glbErr.message || "Check /public/avatars/julia.glb path"}`);
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
      // Cleanup to prevent Three.js context/canvas memory leaks
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
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-black/40">
      {/* Loading State Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0e1a]/90 backdrop-blur-xl z-10 rounded-[inherit]">
          <div className="w-12 h-12 rounded-full border-2 border-accent/10 border-t-accent animate-spin mb-6" />
          <div className="space-y-2 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
               Hydrating Neural Mesh...
             </p>
             <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">Official Julia Protocol v1.7</p>
          </div>
        </div>
      )}

      {/* Error Feedback Display */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/40 backdrop-blur-2xl z-20 p-8 text-center rounded-[inherit] border border-red-500/20">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
            <Box className="w-6 h-6" />
          </div>
          <h4 className="text-red-400 text-xs font-black uppercase tracking-widest mb-3">Protocol Desync</h4>
          <p className="text-white/40 text-[10px] uppercase leading-relaxed max-w-[280px] font-medium">{error}</p>
        </div>
      )}

      {/* TalkingHead Render Viewport */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          background: 'transparent'
        }}
      />
    </div>
  );
}
