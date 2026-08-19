"use client";

import { useEffect, useRef, useState } from "react";

/**
 * @fileOverview HolographicInterviewer - Step 3: Reusable 3D Avatar Component.
 * Integrates Julia.glb mesh with @met4citizen/talkinghead protocol.
 * Calibrated for upper-body rendering and client-side stability.
 * 
 * FIX: Uses a runtime dynamic import via eval to bypass Webpack's static analysis 
 * of the library's internal dynamic imports which causes build errors.
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
        // Use eval-based import to bypass Webpack's static dependency analysis.
        // The library @met4citizen/talkinghead contains dynamic imports that
        // Webpack cannot resolve at build time. This strategy loads the module at runtime in the browser.
        const module = await eval('import("@met4citizen/talkinghead")');
        const TalkingHead = module.TalkingHead;

        if (!isMounted || !containerRef.current) return;

        // Initialize TalkingHead with Step 3 configuration
        // Constructor signature: new TalkingHead(domElement, options)
        const head = new TalkingHead(containerRef.current, {
          cameraView: "upper",   // upper-body camera view
          eyeContact: true,      // maintain virtual eye contact with candidate
          headMovement: true,    // enable natural idle head movements
          headSpeaking: true,    // enable head movement while speaking (for future steps)
          lipsync: false,        // Explicitly disabled for Step 3 to avoid build errors
          mood: "neutral"        // Default neutral expression
        });

        headRef.current = head;

        // Load the Julia mesh from the provided GLB asset in public/avatars/
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
      // Cleanup to prevent Three.js context and canvas memory leaks
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

      {/* TalkingHead Render Viewport (Three.js Canvas) */}
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
