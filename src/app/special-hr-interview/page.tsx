"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  ShieldCheck,
  Mic,
  Activity,
  Volume2,
  Play,
  Square,
  Brain,
  MessageSquare,
  MicOff,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { aiMockInterview, type AiMockInterviewOutput } from "@/ai/flows/ai-mock-interview-v2";

/**
 * @fileOverview Special HR Interview Arena v9.0 - Stable Viewport Protocol
 * Fixed: Persistent video node to prevent black-screen on mode transition.
 */

// --- TypeScript Definitions for Web Speech API ---
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

export default function SpecialHRInterview() {
  const { toast } = useToast();

  // --- D-ID State ---
  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // --- Interview State ---
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<{ question: string; answer: string }[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [interviewStage, setInterviewStage] = useState<any>("INTRODUCTION");
  const [interviewDifficulty, setInterviewDifficulty] = useState<any>("MEDIUM");
  const [isComplete, setIsComplete] = useState(false);

  // --- Core Lifecycle Refs ---
  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<any>(null);
  const agentStreamRef = useRef<MediaStream | null>(null);
  const initializationStartedRef = useRef(false);
  const videoPlayPromiseRef = useRef<Promise<void> | null>(null);
  const connectionReadyRef = useRef(false);
  
  // --- Voice Refs ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);

  // --- Stability Refs ---
  const interviewStartedRef = useRef(false);
  const isCompleteRef = useRef(false);

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  const ensureVideoPlaying = useCallback(async () => {
    const video = agentVideoRef.current;
    if (!video || !video.srcObject || videoPlayPromiseRef.current) return;

    try {
      videoPlayPromiseRef.current = video.play();
      await videoPlayPromiseRef.current;
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Silently ignore interruptions
      } else if (error.name === "NotAllowedError") {
        setIsAudioBlocked(true);
      } else {
        console.error("[D-ID] Video playback failed:", error);
      }
    } finally {
      videoPlayPromiseRef.current = null;
    }
  }, []);

  const handleEnableAudio = async () => {
    const video = agentVideoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      setIsAudioBlocked(false);

      const audioTracks = video.srcObject instanceof MediaStream
        ? video.srcObject.getAudioTracks()
        : [];

      audioTracks.forEach(track => {
        track.enabled = true;
      });

      await video.play().catch(() => {});
      console.log("[D-ID] AUDIO UNLOCKED", {
        muted: video.muted,
        volume: video.volume,
        paused: video.paused,
        audioTracks: audioTracks.length
      });
    }
  };

  const startListening = useCallback(() => {
    if (isCompleteRef.current || isProcessingRef.current || isAiSpeakingRef.current) return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({ 
          variant: "destructive", 
          title: "Unsupported Browser", 
          description: "Speech recognition is not supported. Please use Chrome." 
        });
        return;
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + " " + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech") {
          setIsListening(false);
          return;
        }
        
        console.error("[Speech] Error:", event.error);
        if (event.error === "not-allowed") {
          toast({ variant: "destructive", title: "Mic Access Denied", description: "Please enable microphone permissions." });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("[Speech] Start error:", err);
    }
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const waitForDIdConnection = async (maxWaitMs = 15000) => {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      if (agentManagerRef.current && connectionReadyRef.current) {
        return true;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    return false;
  };

  const processNextTurn = async (userAnswer: string, forceStart = false) => {
    if (isProcessingRef.current || (!interviewStartedRef.current && !forceStart)) return;
    
    setIsProcessing(true);
    isProcessingRef.current = true;
    stopListening();

    try {
      const isConnected = await waitForDIdConnection();
      if (!isConnected) {
        throw new Error("D-ID Connection Timeout: System could not reach the signaling server.");
      }

      const nextIndex = questionIndex + 1;
      const history = userAnswer 
        ? [...conversationHistory, { question: currentQuestion, answer: userAnswer }]
        : conversationHistory;
      
      if (userAnswer) setConversationHistory(history);

      const result: AiMockInterviewOutput = await aiMockInterview({
        role: "Software Engineer",
        experienceLevel: "Entry Level",
        roundType: "Technical Interview",
        currentMainQuestionIndex: nextIndex,
        history: history,
        userAnswer: userAnswer,
        targetCompany: "Nexvoro AI",
        candidateName: "Candidate",
        resumeSkills: [],
        resumeProjects: [],
        resumeSummary: "",
        askedQuestions: askedQuestions,
        currentStage: interviewStage,
        currentDifficulty: interviewDifficulty,
        hintUsed: false
      });

      setCurrentQuestion(result.nextQuestion);
      setQuestionIndex(nextIndex);
      setInterviewStage(result.stage);
      setInterviewDifficulty(result.difficulty);
      setAskedQuestions(prev => [...prev, result.nextQuestion]);
      setTranscript("");

      if (result.isInterviewComplete) {
        setIsComplete(true);
        isCompleteRef.current = true;
      }

      if (agentManagerRef.current) {
        await agentManagerRef.current.speak({
          type: "text",
          input: result.nextQuestion
        });
      }

    } catch (error: any) {
      console.error("[Interview] Turn error:", error);
      toast({ 
        variant: "destructive", 
        title: "Neural Link Error", 
        description: error.message || "Failed to fetch response from Gemini." 
      });
      setIsProcessing(false);
      isProcessingRef.current = false;
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const startInterview = async () => {
    if (status !== "READY") return;
    
    await handleEnableAudio();
    interviewStartedRef.current = true;
    setInterviewStarted(true);
    setConversationHistory([]);
    setAskedQuestions([]);
    setQuestionIndex(0);
    isCompleteRef.current = false;
    setIsComplete(false);
    
    await processNextTurn("", true);
  };

  const stopInterview = () => {
    setInterviewStarted(false);
    interviewStartedRef.current = false;
    stopListening();
    setIsComplete(true);
    isCompleteRef.current = true;
  };

  useEffect(() => {
    if (initializationStartedRef.current) return;
    initializationStartedRef.current = true;

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
              const video = agentVideoRef.current;
              if (!video) return;

              agentStreamRef.current = stream;
              video.srcObject = stream;
              video.autoplay = true;
              video.playsInline = true;
              video.muted = true;
              video.volume = 1;

              setStatus("READY");
              
              requestAnimationFrame(() => {
                video.play().catch(err => {
                  console.warn("[D-ID] Video playback prevented:", err);
                });
              });
            },
            onConnectionStateChange: (state: string) => {
              console.log("[D-ID] Connection state:", state);
              if (state === "connected") {
                connectionReadyRef.current = true;
              } else if (state === "disconnected" || state === "fail") {
                connectionReadyRef.current = false;
              }
            },
            onVideoStateChange: (state: string) => {
              if (state === "START") {
                setIsAiSpeaking(true);
                isAiSpeakingRef.current = true;
                stopListening();
                ensureVideoPlaying();
              } else if (state === "STOP") {
                setIsAiSpeaking(false);
                isAiSpeakingRef.current = false;
                
                if (interviewStartedRef.current && !isProcessingRef.current && !isCompleteRef.current) {
                  startListening();
                }
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

      } catch (error) {
        console.error("[D-ID] Initialization failed:", error);
        setStatus("ERROR");
      }
    };

    initializeDIDAgency();

    return () => {
      if (agentManagerRef.current) {
        agentManagerRef.current.disconnect().catch(() => {});
        agentManagerRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [ensureVideoPlaying, startListening, stopListening, toast]);

  return (
    <div className={cn(
      "min-h-screen bg-[#050816] flex flex-col relative selection:bg-accent/30",
      interviewStarted && "h-screen w-screen overflow-hidden"
    )}>
      <div className="particles-bg" />
      
      {!interviewStarted && <Navbar />}
      
      <main className={cn(
        "flex-1 relative flex flex-col items-center",
        interviewStarted ? "h-screen w-screen p-0 m-0" : "container mx-auto px-6 pt-32 pb-16"
      )}>
        {!interviewStarted && <NavigationControls className="top-40" />}

        {/* PERSISTENT VIDEO CONTAINER: Prevents WebRTC stream remounting */}
        <div className={cn(
          "transition-all duration-700 ease-in-out bg-black overflow-hidden",
          interviewStarted 
            ? "fixed inset-0 z-0 w-screen h-screen" 
            : "absolute right-6 top-[380px] lg:top-32 lg:right-12 w-[calc(100%-48px)] lg:w-[calc(55%-48px)] aspect-[16/10] rounded-[3rem] border border-white/5 shadow-2xl z-0"
        )}>
          <video
            ref={agentVideoRef}
            autoPlay
            playsInline
            muted
            preload="auto"
            className="w-full h-full object-contain"
          />
          
          {/* Overlay Initialization Layer (Only in Landing Mode) */}
          {!interviewStarted && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-transparent via-[#050816]/40 to-[#050816]">
              <AnimatePresence mode="wait">
                {status === "LOADING" ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                        <Loader2 className="w-full h-full text-accent animate-spin" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Matrix</p>
                  </motion.div>
                ) : status === "READY" ? (
                  <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                        <ShieldCheck className="w-10 h-10 text-accent" />
                     </div>
                     <div className="space-y-4">
                       <h3 className="text-3xl font-bold tracking-tighter text-white">Neural Link Ready</h3>
                       <p className="text-muted-foreground font-light max-w-xs mx-auto">Secure WebRTC channel established with D-ID node.</p>
                     </div>

                     {isAudioBlocked ? (
                        <Button onClick={handleEnableAudio} className="h-16 px-10 btn-premium rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                          <Volume2 className="w-4 h-4 mr-2 animate-pulse" /> Initialize Vocal Link
                        </Button>
                     ) : (
                        <Button onClick={startInterview} className="h-20 px-12 btn-premium rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-transform group">
                          Start Simulation <Play className="ml-3 w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                        </Button>
                     )}
                  </motion.div>
                ) : (
                  <motion.div key="error" className="space-y-4 text-red-400">
                     <AlertCircle className="w-16 h-16 mx-auto" />
                     <p className="text-xs font-bold uppercase tracking-widest">Protocol Fault: Connection Lost</p>
                     <Button variant="ghost" onClick={() => window.location.reload()} className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white">Retry Handshake</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Landing Mode UI Grid */}
        {!interviewStarted && (
          <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-12 items-center min-h-[500px]">
            <div className="lg:col-span-5 space-y-12">
              <header className="space-y-6">
                <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1.5 text-[10px] tracking-[0.4em] font-black uppercase">Vocal Simulation Protocol</Badge>
                <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-premium leading-[0.95]">Live Voice <br /><span className="text-gradient-purple">AI Assessment.</span></h1>
                <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-md">
                  Initialize a real-time, hands-free technical simulation powered by Gemini 2.5 Flash and D-ID Neural Avatars.
                </p>
              </header>

              <div className="grid gap-4">
                 {[
                   { icon: Brain, label: "Neural Audio Logic", val: "ACTIVE" },
                   { icon: Mic, label: "STT Transcription", val: "SYNCHRONIZED" },
                   { icon: Activity, label: "Conversation Buffer", val: "STREAMING" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 bg-white/[0.01]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-accent tracking-tighter">{item.val}</span>
                   </div>
                 ))}
              </div>
            </div>
            
            {/* The right side (lg:col-span-7) is empty here because the video element is positioned over it absolute-ly */}
            <div className="lg:col-span-7 h-[400px] lg:h-full" />
          </div>
        )}

        {/* FULL SCREEN HUD: Visible only when interview starts */}
        {interviewStarted && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* HUD: TOP MICROPHONE CONTROL */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 glass border-white/10",
                isListening ? "bg-green-500/20 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.4)]" : 
                isProcessing ? "bg-accent/20 border-accent/50 shadow-[0_0_30px_rgba(34,211,238,0.4)]" :
                "bg-white/5"
              )}>
                {isListening ? (
                  <Mic className="w-6 h-6 text-green-400 animate-pulse" />
                ) : isProcessing ? (
                  <Activity className="w-6 h-6 text-accent animate-spin" />
                ) : (
                  <MicOff className="w-6 h-6 text-white/30" />
                )}
              </div>
              <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/10 text-white/60 py-1 px-4 rounded-full text-[9px] uppercase tracking-widest font-black">
                {isListening ? "LISTENING" : isProcessing ? "THINKING" : "IDLE"}
              </Badge>
            </div>

            {/* HUD: TOP RIGHT TERMINATE BUTTON */}
            <div className="absolute top-8 right-8 pointer-events-auto">
              <Button 
                onClick={stopInterview}
                variant="ghost"
                className="h-10 px-4 glass border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Square className="w-3 h-3 mr-2 fill-current" /> Terminate Session
              </Button>
            </div>

            {/* HUD: BOTTOM QUESTION OVERLAY */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 pointer-events-auto">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass p-8 rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl w-full text-center shadow-2xl"
              >
                <div className="flex justify-center mb-4">
                  <Badge variant="outline" className="border-white/10 text-white/30 text-[8px] uppercase px-3 py-1">
                    {interviewStage} Node • Step {questionIndex}
                  </Badge>
                </div>
                <p className="text-xl md:text-2xl font-light text-white leading-relaxed line-clamp-3">
                  {isListening ? (transcript || "...") : (currentQuestion || "Initializing...")}
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan-line 4s linear infinite;
        }
        html, body {
          height: 100%;
          ${interviewStarted ? 'overflow: hidden !important;' : ''}
        }
      `}</style>
    </div>
  );
}
