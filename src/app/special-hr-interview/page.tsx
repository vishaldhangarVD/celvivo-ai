"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  Mic,
  Video as VideoIcon,
  Activity,
  Command,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SpecialHRInterview() {
  const { toast } = useToast();

  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">(
    "LOADING"
  );

  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<any>(null);
  const initializationStartedRef = useRef(false);
  const pendingStreamRef = useRef<MediaStream | null>(null);

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  // ---------------------------------------------------------
  // Attach D-ID stream whenever the video element is available
  // ---------------------------------------------------------
  useEffect(() => {
    const video = agentVideoRef.current;
    const stream = pendingStreamRef.current;

    if (!video || !stream || status !== "READY") {
      return;
    }

    if (video.srcObject !== stream) {
      console.log("[D-ID] Video attached");
      video.srcObject = stream;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      video.play()
        .then(() => console.log("[D-ID] Video playback started"))
        .catch((error) => console.warn("[D-ID] Video play failed:", error));
    }
  }, [status]);

  // ---------------------------------------------------------
  // Initialize D-ID Agent Protocol
  // ---------------------------------------------------------
  useEffect(() => {
    if (initializationStartedRef.current) return;
    initializationStartedRef.current = true;

    let isMounted = true;
    console.log("[D-ID] Initialization started");

    const initializeDIDAgency = async () => {
      if (typeof window === "undefined") return;

      try {
        const { createAgentManager } = await import("@d-id/client-sdk");
        
        if (!isMounted) return;

        const manager = await createAgentManager(agentId, {
          auth: {
            type: "key",
            clientKey,
          },
          callbacks: {
            onSrcObjectReady: (stream: MediaStream) => {
              console.log("[D-ID] Stream received");
              console.log(
                "[D-ID] Stream tracks:",
                stream.getTracks().map((track) => ({
                  kind: track.kind,
                  enabled: track.enabled,
                  readyState: track.readyState,
                }))
              );

              pendingStreamRef.current = stream;
              if (isMounted) setStatus("READY");
            },

            onConnectionStateChange: (state: string) => {
              if (state === "connected") {
                console.log("[D-ID] Connected");
                if (isMounted) {
                  toast({
                    title: "Neural Link Established",
                    description: "The Special HR Agent is now online.",
                  });
                }
              }

              if (state === "disconnected" || state === "closed") {
                console.log("[D-ID] Disconnected");
                if (isMounted && state === "disconnected") {
                  // Requirement #14: Show error on unexpected disconnect
                  setStatus("ERROR");
                }
              }
            },

            onVideoStateChange: (state: string) => {
              // Internal video state management if needed
            },

            onNewMessage: (messages: any, type: any) => {
              // Handle transcript or chat responses
            },

            onError: (error: any, errorData: any) => {
              console.error("[D-ID] Neural Error:", error, errorData);
              if (isMounted) setStatus("ERROR");
            },
          },
        });

        agentManagerRef.current = manager;
        await manager.connect();

      } catch (error) {
        console.error("[D-ID] Initialization failed:", error);
        if (isMounted) setStatus("ERROR");
      }
    };

    initializeDIDAgency();

    return () => {
      isMounted = false;
      if (agentManagerRef.current) {
        agentManagerRef.current.disconnect();
        agentManagerRef.current = null;
      }
    };
  }, []); // Stable effect only runs once

  return (
    <div className="h-screen w-full bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />

      <Navbar />

      <NavigationControls />

      <main className="flex-1 w-full h-[calc(100vh-72px)] mt-[72px] px-4 md:px-12 py-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full h-full max-w-none grid lg:grid-cols-12 gap-10 items-stretch">

          {/* LEFT PANEL */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-10 flex flex-col justify-center">
            <header className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1.5 text-[10px] tracking-widest font-black uppercase">
                  Executive HR Protocol
                </Badge>
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-5xl xl:text-6xl font-bold tracking-tighter text-premium leading-[1.05]">
                  AI Virtual{" "}
                  <br />
                  <span className="text-gradient-purple">
                    HR Arena.
                  </span>
                </h1>

                <p className="text-lg text-white/50 font-light leading-relaxed max-w-md">
                  High-fidelity behavioral simulation.
                  Ensure your vocal and visual nodes are
                  calibrated.
                </p>
              </div>
            </header>

            <div className="space-y-6">
              <div className="p-6 glass border-white/5 bg-white/[0.01] rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    Neural Integrity Check
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                    System Status
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest ${
                      status === "READY"
                        ? "text-green-400"
                        : status === "ERROR"
                        ? "text-red-400"
                        : "text-orange-400"
                    }`}
                  >
                    {status === "READY" ? "OPTIMAL" : status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="glass border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <Mic className="w-4 h-4 text-accent" />
                  <span className="text-[9px] font-black uppercase text-white/40">
                    Vocal Node
                  </span>
                </Card>

                <Card className="glass border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <VideoIcon className="w-4 h-4 text-accent" />
                  <span className="text-[9px] font-black uppercase text-white/40">
                    Visual Node
                  </span>
                </Card>
              </div>
            </div>
          </div>

          {/* AI ARENA */}
          <div className="lg:col-span-9 xl:col-span-10 h-full min-w-0">
            <Card className="premium-card w-full min-w-0 bg-[#0b0e1a]/90 border-accent/10 p-0 h-full flex flex-col relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <AnimatePresence mode="wait">
                {status === "LOADING" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#0b0e1a] z-50"
                  >
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                      <Loader2 className="w-full h-full text-accent animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">
                        Initializing Matrix
                      </p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        Dynamic Handshake Protocol
                      </p>
                    </div>
                  </motion.div>
                )}

                {status === "ERROR" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-6 text-center bg-[#0b0e1a] z-50"
                  >
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">
                        Neural Bridge Error
                      </h3>
                      <p className="text-sm text-white/40 max-w-xs mx-auto">
                        The AI Interviewer failed to initialize or disconnected unexpectedly.
                      </p>
                    </div>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="h-12 px-10 rounded-xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest"
                    >
                      Retry Protocol
                    </Button>
                  </motion.div>
                )}

                {status === "READY" && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full min-h-0 bg-black overflow-hidden"
                  >
                    <video
                      ref={agentVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain bg-black z-10"
                    />

                    <div className="absolute top-8 left-8 z-30">
                      <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white/80 py-2 px-5 rounded-full flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Live Arena
                        </span>
                      </Badge>
                    </div>

                    <div className="absolute top-8 right-8 z-30">
                      <div className="flex items-center gap-3 px-6 py-3 glass rounded-2xl border-white/10 shadow-2xl">
                        <Activity className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-black uppercase text-accent tracking-widest">
                          Neural Link Verified
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.01] z-0">
                      <Command className="w-96 h-96 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
