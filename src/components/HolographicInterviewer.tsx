"use client";

import { useEffect, useRef, useState } from "react";

/**
 * @fileOverview HolographicInterviewer - Step 3: Reusable 3D Avatar Component.
 * Integrates Julia.glb mesh with @met4citizen/talkinghead protocol.
 * Calibrated for upper-body rendering and client-side stability.
 */

export default function HolographicInterviewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initTalkingHead() {
      // Ensure execution only on client with a valid container
      if (typeof window === "undefined" || !containerRef.current) return;

      try {
        // Dynamic import to handle library browser dependencies (Three.js) safely
        // @ts-ignore - Library may not provide native TS types
        const { TalkingHead } = await import("@met4citizen/talkinghead");

        if (!isMounted || !containerRef.current) return;

        // Initialize TalkingHead with requested Step 3 configuration
        // Constructor signature: new TalkingHead(domElement, options)
        const head = new TalkingHead(containerRef.current, {
          cameraView: "upper",   // upper-body camera view
          eyeContact: true,      // maintain virtual eye contact with candidate
          headMovement: true,    // enable natural idle head micro-movements
          lipsync: false,        // Phoneme mapping scheduled for Step 4
        });

        headRef.current = head;

        // Load the Julia mesh from the provided GLB asset
        // showGLB signature: showGLB(url, bodyCallback?, options?)
        await head.showGLB("/avatars/julia.glb");

        if (isMounted) {
          setLoading(false);
          console.log("[Neural Mesh] Julia initialized successfully.");
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to initialize mesh protocol.";
        console.error("[Neural Mesh] Initialization Fault:", err);
        if (isMounted) {
          setError(errorMsg);
          setLoading(false);
        }
      }
    }

    initTalkingHead();

    return () => {
      isMounted = false;
      // Perform protocol cleanup to prevent Three.js context and canvas memory leaks
      if (headRef.current && typeof headRef.current.dispose === "function") {
        headRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      {/* Fallback / Loading State */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0e1a]/80 backdrop-blur-xl z-10 rounded-[inherit]">
          <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
            Synchronizing Neural Mesh...
          </p>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-xl z-20 p-6 text-center rounded-[inherit] border border-red-500/20">
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Protocol Fault</p>
          <p className="text-white/30 text-[9px] uppercase leading-relaxed max-w-[200px]">{error}</p>
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
