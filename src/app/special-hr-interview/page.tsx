"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SpecialHRInterview() {
  const { toast } = useToast();

  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">(
    "LOADING"
  );
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<any>(null);
  const initializationStartedRef = useRef(false);
  const pendingStreamRef = useRef<MediaStream | null>(null);

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  // ---------------------------------------------------------
  // High-Fidelity Audio-Visual Attachment Protocol
  // ---------------------------------------------------------
  const attachStreamToVideo = useCallback(async (stream: MediaStream) => {
    const video = agentVideoRef.current;
    if (!video) return;

    // Inspect and log audio tracks as requested
    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();

    console.log("[D-ID] Audio tracks:", audioTracks);
    console.log("[D-ID] Video tracks:", videoTracks);
    console.log("[D-ID] Audio track count:", audioTracks.length);

    audioTracks.forEach((track) => {
      // Ensure audio track is enabled
      track.enabled = true;
      console.log("[D-ID] Audio track:", {
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
      });
    });

    console.log("[D-ID] Video attached");

    // Configure hardware properties for UNMUTED playback
    video.srcObject = stream;
    video.muted = false;
    video.volume = 1.0;
    video.autoplay = true;
    video.playsInline = true;

    // Telemetry Diagnostic
    console.log("[D-ID] Video diagnostics", {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      paused: video.paused,
      muted: video.muted,
      volume: video.volume,
      srcObject: !!video.srcObject,
    });

    try {
      video.load();
      await video.play();
      console.log("[D-ID] Video playback started");
      setIsAudioBlocked(false);
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        console.warn("[D-ID] Browser autoplay blocked audio playback");
        setIsAudioBlocked(true);
        // Fallback: Play muted so video is still visible while waiting for user interaction
        video.muted = true;
        await video.play().catch((e) => console.error("[D-ID] Muted fallback play failed:", e));
      } else {
        console.error("[D-ID] Video playback failed:", error);
      }
    }
  }, []);

  const handleEnableAudio = async () => {
    const video = agentVideoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      try {
        await video.play();
        setIsAudioBlocked(false);
        console.log("[D-ID] Audio manually enabled via user interaction");
      } catch (e) {
        console.error("[D-ID] Manual audio enable failed:", e);
      }
    }
  };

  // ---------------------------------------------------------
  // UI Re-Sync Effect (Ensures attachment if video mounts late)
  // ---------------------------------------------------------
  useEffect(() => {
    if (status === "READY" && pendingStreamRef.current && agentVideoRef.current) {
      if (agentVideoRef.current.srcObject !== pendingStreamRef.current) {
        attachStreamToVideo(pendingStreamRef.current);
      }
    }
  }, [status, attachStreamToVideo]);

  // ---------------------------------------------------------
  // Initialize D-ID Agent Protocol (Strict Singleton)
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
          streamOptions: {
            compatibilityMode: "on",
            streamWarmup: true
          },
          callbacks: {
            onSrcObjectReady: (stream: MediaStream) => {
              console.log("[D-ID] Stream received");
              pendingStreamRef.current = stream;
              if (isMounted) {
                setStatus("READY");
                if (agentVideoRef.current) {
                  attachStreamToVideo(stream);
                }
              }
            },

            onConnectionStateChange: (state: string) => {
              console.log(`[D-ID] Connection state changed: ${state}`);
              if (state === "connected") {
                console.log("[D-ID] Connected");
              }

              if (state === "disconnected" || state === "closed") {
                console.log("[D-ID] Disconnected");
                if (isMounted && state === "disconnected") {
                  setStatus("ERROR");
                }
              }
            },

            onVideoStateChange: (state: string) => {
              console.log(`[D-ID] Video state changed: ${state}`);
              if (state !== 'STOP' && pendingStreamRef.current && agentVideoRef.current) {
                 if (agentVideoRef.current.srcObject !== pendingStreamRef.current) {
                   agentVideoRef.current.srcObject = pendingStreamRef.current;
                 }
                 agentVideoRef.current.play().catch(() => {});
              }
            },

            onError: (error: any, errorData: any) => {
              console.error("[D-ID] Neural Error:", error, errorData);
              if (isMounted) setStatus("ERROR");
            },
          },
        });

        agentManagerRef.current = manager;
        await manager.connect();

        if (isMounted) {
          console.log("[D-ID] Starting initial avatar response");
          try {
            await manager.speak({
              type: "text",
              input: "Hello, welcome to your AI HR interview. Please introduce yourself.",
            });
            console.log("[D-ID] Avatar response started");
          } catch (speakError) {
            console.error("[D-ID] Speak failed:", speakError);
          }

          toast({
            title: "Neural Link Established",
            description: "The Special HR Agent is now online.",
          });
        }

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
  }, [attachStreamToVideo, toast]);

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
                      playsInline
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-contain bg-black z-10"
                    />

                    {isAudioBlocked && (
                      <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-500">
                        <div className="text-center space-y-6">
                           <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                             <Volume2 className="w-10 h-10 text-accent animate-pulse" />
                           </div>
                           <div className="space-y-2">
                             <h3 className="text-xl font-bold uppercase tracking-tighter">Audio Stream Blocked</h3>
                             <p className="text-xs text-white/60 uppercase tracking-widest">Interaction required to sync vocal matrix</p>
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
