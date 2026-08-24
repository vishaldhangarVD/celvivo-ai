"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  Mic,
  Video as VideoIcon,
  Activity,
  Command,
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Special HR Interview Arena v4.3
 * Stabilized for high-fidelity WebRTC streaming.
 * Includes deep diagnostics for MediaStream tracks and hardware video state.
 */

export default function SpecialHRInterview() {
  const { toast } = useToast();

  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Core Lifecycle Refs
  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<any>(null);
  const agentStreamRef = useRef<MediaStream | null>(null);
  const initializationStartedRef = useRef(false);
  const hasStartedGreetingRef = useRef(false);
  const videoPlayPromiseRef = useRef<Promise<void> | null>(null);

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  // ---------------------------------------------------------
  // Helper: Safely trigger video.play() without interruptions
  // ---------------------------------------------------------
  const ensureVideoPlaying = useCallback(async () => {
    const video = agentVideoRef.current;
    if (!video || !video.srcObject || videoPlayPromiseRef.current) return;

    try {
      videoPlayPromiseRef.current = video.play();
      await videoPlayPromiseRef.current;
      console.log("[D-ID] Video playback started", {
        muted: video.muted,
        volume: video.volume,
        paused: video.paused
      });
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Silently ignore interruptions from new play requests
      } else if (error.name === "NotAllowedError") {
        console.warn("[D-ID] Browser autoplay blocked audio playback");
        setIsAudioBlocked(true);
      } else {
        console.error("[D-ID] Video playback failed:", error);
      }
    } finally {
      videoPlayPromiseRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------
  // Helper: Attach stream to hardware node exactly once
  // ---------------------------------------------------------
  const attachStreamToVideo = useCallback((stream: MediaStream) => {
    const video = agentVideoRef.current;
    if (!video) return;

    // Strict guard against duplicate attachment/reloading
    if (agentStreamRef.current?.id === stream.id && video.srcObject === stream) {
      console.log("[D-ID] Stream already attached - skipping duplicate");
      return;
    }

    console.log("[D-ID] Stream attached", {
      id: stream.id,
      audioTracks: stream.getAudioTracks().length,
      videoTracks: stream.getVideoTracks().length
    });

    agentStreamRef.current = stream;
    video.srcObject = stream;
    
    // Diagnostic Log for MediaStream and Video Element State
    console.log("[D-ID] VIDEO ELEMENT", {
      muted: video.muted,
      volume: video.volume,
      paused: video.paused,
      readyState: video.readyState,
      hasSrcObject: !!video.srcObject,
      audioTracks: stream.getAudioTracks().length
    });

    // Autoplay configuration (Start muted for reliability)
    video.muted = true; 
    video.autoplay = true;
    video.playsInline = true;

    ensureVideoPlaying();
  }, [ensureVideoPlaying]);

  // ---------------------------------------------------------
  // Interactive Vocal Unlock
  // ---------------------------------------------------------
  const handleEnableAudio = async () => {
    const video = agentVideoRef.current;
    if (video) {
      console.log("[D-ID] Unmuting vocal matrix");
      
      // Hardware state update
      video.muted = false;
      video.volume = 1.0;
      setIsAudioBlocked(false);

      // Diagnostics
      console.log("[D-ID] Video diagnostics:", {
        muted: video.muted,
        volume: video.volume,
        paused: video.paused,
        readyState: video.readyState,
        hasAudio: (video.srcObject as MediaStream)?.getAudioTracks().length > 0
      });

      ensureVideoPlaying();
      toast({ title: "Audio Initialized", description: "Vocal nodes synchronized." });
    }
  };

  // ---------------------------------------------------------
  // D-ID Agent Manager Lifecycle
  // ---------------------------------------------------------
  useEffect(() => {
    if (initializationStartedRef.current) return;
    initializationStartedRef.current = true;

    console.log("[D-ID] Initialization started");

    const initializeDIDAgency = async () => {
      try {
        const { createAgentManager } = await import("@d-id/client-sdk");
        
        const manager = await createAgentManager(agentId, {
          auth: { type: "key", clientKey },
          streamOptions: {
            compatibilityMode: "on",
            streamWarmup: true
          },
          callbacks: {
            onSrcObjectReady: (stream: MediaStream) => {
              console.log("[D-ID] Stream received", { 
                id: stream.id,
                tracks: stream.getTracks().length,
                active: stream.active 
              });
              
              // Deep Diagnostics requested for audio troubleshooting
              console.log("[D-ID] ALL TRACKS", stream.getTracks().map(track => ({
                kind: track.kind,
                enabled: track.enabled,
                muted: (track as any).muted, // muted property exists on MediaStreamTrack
                readyState: track.readyState,
                label: track.label
              })));

              console.log("[D-ID] AUDIO TRACKS", stream.getAudioTracks());
              console.log("[D-ID] VIDEO TRACKS", stream.getVideoTracks());
              
              const videoTrack = stream.getVideoTracks()[0];
              if (stream.active && videoTrack?.readyState === "live") {
                setStatus("READY");
                attachStreamToVideo(stream);
              }
            },

            onConnectionStateChange: (state: string) => {
              console.log(`[D-ID] Connection state: ${state}`);
              if (state === "connected") {
                console.log("[D-ID] Connected");
              }
            },

            onVideoStateChange: (state: string) => {
              console.log(`[D-ID] Video state changed: ${state}`);
              if (state === "START") {
                setIsAiSpeaking(true);
                console.log("[D-ID] Avatar speaking started");
                ensureVideoPlaying();
              } else if (state === "STOP") {
                setIsAiSpeaking(false);
                console.log("[D-ID] Avatar speaking stopped");
              }
            },

            onError: (error: any) => {
              console.error("[D-ID] Critical Neural Fault:", error);
              setStatus("ERROR");
            },
          },
        });

        agentManagerRef.current = manager;
        await manager.connect();

        // Greeting Trigger - Only once per session
        if (!hasStartedGreetingRef.current) {
          hasStartedGreetingRef.current = true;
          try {
            console.log("[D-ID] Triggering initial greeting");
            await manager.speak({
              type: "text",
              input: "Hello, welcome to your AI HR interview. Please introduce yourself.",
            });
          } catch (speakError) {
            console.error("[D-ID] Initial greeting failed:", speakError);
          }
        }

      } catch (error) {
        console.error("[D-ID] Initialization failed:", error);
        setStatus("ERROR");
      }
    };

    initializeDIDAgency();

    return () => {
      if (agentManagerRef.current) {
        console.log("[D-ID] Terminating session");
        agentManagerRef.current.disconnect();
        agentManagerRef.current = null;
        initializationStartedRef.current = false;
        hasStartedGreetingRef.current = false;
        agentStreamRef.current = null;
      }
    };
  }, [attachStreamToVideo, ensureVideoPlaying, toast]);

  return (
    <div className="h-screen w-full bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="flex-1 w-full h-[calc(100vh-64px)] mt-[64px] px-8 md:px-12 py-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full h-full grid lg:grid-cols-12 gap-10 items-stretch">

          {/* SYSTEM OVERVIEW */}
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

                <p className="text-lg text-white/50 font-light leading-relaxed">
                  High-fidelity behavioral simulation.
                  Verify your vocal nodes for active participation.
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
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      status === "READY" ? "text-green-400" : status === "ERROR" ? "text-red-400" : "text-orange-400"
                    )}
                  >
                    {status === "READY" ? "OPTIMAL" : status === "ERROR" ? "OFFLINE" : "CALIBRATING"}
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

          {/* NEURAL ARENA */}
          <div className="lg:col-span-9 xl:col-span-10 h-full min-w-0">
            <Card className="premium-card w-full min-w-0 bg-[#0b0e1a]/90 border-accent/10 p-0 h-full flex flex-col relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="relative w-full h-full min-h-0 bg-black overflow-hidden">
                
                {/* PERSISTENT HARDWARE RENDERER */}
                <video
                  ref={agentVideoRef}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-contain bg-black z-10"
                />

                <AnimatePresence>
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
                          The simulation session failed to synchronize. Verify your network protocol.
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
                </AnimatePresence>

                {/* AUDIO AUTHORIZATION LAYER */}
                {isAudioBlocked && status === "READY" && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-500">
                    <div className="text-center space-y-6">
                       <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                         <Volume2 className="w-10 h-10 text-accent animate-pulse" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-xl font-bold uppercase tracking-tighter">Vocal Matrix Locked</h3>
                         <p className="text-xs text-white/60 uppercase tracking-widest">Interaction required to synchronize audio stream</p>
                       </div>
                       <Button 
                         onClick={handleEnableAudio}
                         className="h-14 px-10 btn-premium rounded-xl text-xs font-black uppercase tracking-[0.2em]"
                       >
                         Initialize Vocal Link
                       </Button>
                    </div>
                  </div>
                )}

                {/* SYSTEM BADGES */}
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

                {/* MANUAL VOLUME TOGGLE */}
                {status === "READY" && !isAudioBlocked && (
                   <div className="absolute bottom-8 right-8 z-30">
                     <Button 
                       onClick={handleEnableAudio}
                       variant="ghost"
                       size="icon"
                       className="w-12 h-12 rounded-full glass border-white/10 text-white/40 hover:text-accent hover:border-accent/40"
                     >
                       <Volume2 className="w-5 h-5" />
                     </Button>
                   </div>
                )}

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.01] z-0">
                  <Command className="w-96 h-96 text-white" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
