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
  Play,
  Square,
  Sparkles,
  Brain,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { aiMockInterview, type AiMockInterviewOutput } from "@/ai/flows/ai-mock-interview-v2";

/**
 * @fileOverview Special HR Interview Arena v5.0
 * Features a live voice-to-voice interview flow integrated with D-ID and Gemini.
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

interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
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
  const hasStartedGreetingRef = useRef(false);
  const videoPlayPromiseRef = useRef<Promise<void> | null>(null);
  
  // --- Voice Refs ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);

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

  // ---------------------------------------------------------
  // Helper: Attach stream to hardware node
  // ---------------------------------------------------------
  const attachStreamToVideo = useCallback((stream: MediaStream) => {
    const video = agentVideoRef.current;
    if (!video) return;

    if (agentStreamRef.current?.id === stream.id && video.srcObject === stream) {
      return;
    }

    console.log("[D-ID] Stream attached", { id: stream.id });
    agentStreamRef.current = stream;
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.volume = 1;
    video.muted = true; // Start muted for autoplay reliability

    ensureVideoPlaying();
  }, [ensureVideoPlaying]);

  // ---------------------------------------------------------
  // Interactive Vocal Unlock
  // ---------------------------------------------------------
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

      await video.play();
      console.log("[D-ID] AUDIO UNLOCKED");
    }
  };

  // ---------------------------------------------------------
  // Voice Logic: Speech Recognition
  // ---------------------------------------------------------
  const startListening = useCallback(() => {
    if (isComplete || isProcessingRef.current || isAiSpeakingRef.current) return;

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
        console.error("[Speech] Error:", event.error);
        if (event.error === "not-allowed") {
          toast({ variant: "destructive", title: "Mic Access Denied", description: "Please enable microphone permissions." });
          stopInterview();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      console.log("[Speech] Listening started");
    } catch (err) {
      console.error("[Speech] Start error:", err);
    }
  }, [isComplete, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("[Speech] Listening stopped");
    }
  }, []);

  // ---------------------------------------------------------
  // Turn Logic: Process Turn
  // ---------------------------------------------------------
  const processNextTurn = async (userAnswer: string) => {
    if (isProcessingRef.current || !interviewStarted) return;
    
    setIsProcessing(true);
    isProcessingRef.current = true;
    stopListening();

    try {
      const nextIndex = questionIndex + 1;
      const history = userAnswer 
        ? [...conversationHistory, { question: currentQuestion, answer: userAnswer }]
        : conversationHistory;
      
      if (userAnswer) setConversationHistory(history);

      console.log("[Interview] Calling Gemini Flow Turn:", nextIndex);
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
      }

      // Speak the response via D-ID
      if (agentManagerRef.current) {
        console.log("[D-ID] Speaking next question");
        await agentManagerRef.current.speak({
          type: "text",
          input: result.nextQuestion
        });
      }

    } catch (error) {
      console.error("[Interview] Turn error:", error);
      toast({ variant: "destructive", title: "Neural Link Error", description: "Failed to fetch response from Gemini." });
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  // ---------------------------------------------------------
  // Session Logic
  // ---------------------------------------------------------
  const startInterview = async () => {
    if (status !== "READY") return;
    
    await handleEnableAudio();
    setInterviewStarted(true);
    setConversationHistory([]);
    setAskedQuestions([]);
    setQuestionIndex(0);
    setIsComplete(false);
    
    // Initial Turn (Empty Answer)
    await processNextTurn("");
  };

  const stopInterview = () => {
    setInterviewStarted(false);
    stopListening();
    setIsComplete(true);
  };

  const submitAnswerManual = () => {
    if (isListening && transcript.trim()) {
      processNextTurn(transcript.trim());
    }
  };

  // ---------------------------------------------------------
  // D-ID Agent Manager Lifecycle
  // ---------------------------------------------------------
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
              console.log("[D-ID] Stream received", { id: stream.id, active: stream.active });
              const videoTrack = stream.getVideoTracks()[0];
              if (stream.active && videoTrack?.readyState === "live") {
                setStatus("READY");
                attachStreamToVideo(stream);
              }
            },
            onConnectionStateChange: (state: string) => {
              console.log(`[D-ID] Connection state: ${state}`);
            },
            onVideoStateChange: (state: string) => {
              console.log(`[D-ID] Video state: ${state}`);
              if (state === "START") {
                setIsAiSpeaking(true);
                isAiSpeakingRef.current = true;
                stopListening();
                ensureVideoPlaying();
              } else if (state === "STOP") {
                setIsAiSpeaking(false);
                isAiSpeakingRef.current = false;
                // If interview is active and we're not processing, start listening
                if (interviewStarted && !isProcessingRef.current && !isComplete) {
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
        agentManagerRef.current.disconnect();
        agentManagerRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [attachStreamToVideo, ensureVideoPlaying, interviewStarted, isComplete, startListening, stopListening, toast]);

  return (
    <div className="h-screen w-full bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="flex-1 w-full h-[calc(100vh-64px)] mt-[64px] px-8 md:px-12 py-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full h-full grid lg:grid-cols-12 gap-10 items-stretch">

          {/* SYSTEM OVERVIEW */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-8 flex flex-col justify-center">
            <header className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1.5 text-[10px] tracking-widest font-black uppercase">
                  Vocal Simulation Protocol
                </Badge>
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-5xl xl:text-6xl font-bold tracking-tighter text-premium leading-[1.05]">
                  Live Voice <br />
                  <span className="text-gradient-purple">AI Assessment.</span>
                </h1>
                <p className="text-lg text-white/50 font-light leading-relaxed">
                  Engage in a real-time vocal simulation with our executive HR agent.
                </p>
              </div>
            </header>

            <div className="space-y-4">
              {interviewStarted ? (
                <Card className="p-6 glass border-accent/20 bg-accent/5 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-accent border-accent/30 text-[9px] uppercase tracking-widest">Question {questionIndex}</Badge>
                    <Badge className="bg-white/5 text-white/40 text-[8px] uppercase">{interviewStage}</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Activity className={cn("w-4 h-4", isListening ? "text-green-400 animate-pulse" : "text-white/20")} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                        {isListening ? "Listening to Candidate..." : isProcessing ? "AI Agent Thinking..." : isAiSpeaking ? "AI Agent Speaking..." : "Awaiting Input"}
                      </span>
                    </div>

                    <div className="p-4 glass rounded-2xl border-white/5 bg-black/20 min-h-[100px]">
                      <p className="text-xs font-light text-white/60 leading-relaxed italic">
                        {transcript || (isListening ? "Speak now..." : "Awaiting transmission...")}
                      </p>
                    </div>

                    {isListening && transcript.trim() && (
                      <Button 
                        onClick={submitAnswerManual}
                        className="w-full h-12 glass border-accent/20 text-accent hover:bg-accent/10 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                      >
                        Submit Response
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 glass border-white/5 bg-white/[0.01] rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                      System Integrity: Optimal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">D-ID Stream</span>
                    <span className={cn("text-[9px] font-bold uppercase", status === "READY" ? "text-green-400" : "text-orange-400")}>
                      {status === "READY" ? "READY" : "LINKING..."}
                    </span>
                  </div>
                  <Button 
                    onClick={startInterview}
                    disabled={status !== "READY" || interviewStarted}
                    className="w-full h-14 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl"
                  >
                    <Play className="w-4 h-4 mr-2 fill-current" /> Start Interview
                  </Button>
                </Card>
              )}

              {interviewStarted && (
                <Button 
                  onClick={stopInterview}
                  variant="ghost"
                  className="w-full h-12 glass border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                >
                  <Square className="w-3 h-3 mr-2 fill-current" /> Terminate Session
                </Button>
              )}
            </div>
          </div>

          {/* NEURAL ARENA */}
          <div className="lg:col-span-9 xl:col-span-9 h-full min-w-0 flex flex-col gap-6">
            <Card className="premium-card w-full min-w-0 bg-[#0b0e1a]/90 border-accent/10 p-0 flex-1 flex flex-col relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="relative w-full h-full min-h-0 bg-black overflow-hidden">
                <video
                  ref={agentVideoRef}
                  autoPlay
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
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Matrix</p>
                    </motion.div>
                  )}

                  {isAudioBlocked && !interviewStarted && (
                    <motion.div
                      key="audio-lock"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm"
                    >
                      <div className="text-center space-y-6 p-10 glass rounded-[2.5rem] border-white/10 max-w-sm">
                         <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                           <Volume2 className="w-10 h-10 text-accent animate-pulse" />
                         </div>
                         <div className="space-y-2">
                           <h3 className="text-xl font-bold uppercase tracking-tighter text-white">Vocal Matrix Locked</h3>
                           <p className="text-xs text-white/60 uppercase tracking-widest leading-relaxed">Browser permissions required to synchronize vocal output.</p>
                         </div>
                         <Button onClick={handleEnableAudio} className="h-14 px-10 btn-premium rounded-xl text-xs font-black uppercase tracking-[0.2em]">
                           Initialize Vocal Link
                         </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OVERLAY INTERFACE */}
                {interviewStarted && (
                  <div className="absolute inset-0 z-30 pointer-events-none p-10 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                       <Badge className="bg-black/60 backdrop-blur-md border-accent/30 text-accent py-2 px-5 rounded-full flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Assessment</span>
                      </Badge>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="px-6 py-3 glass rounded-2xl border-white/10 shadow-2xl flex items-center gap-4">
                           <Activity className="w-4 h-4 text-accent" />
                           <span className="text-[10px] font-black uppercase text-accent tracking-widest">Neural Link Verified</span>
                        </div>
                        <Badge variant="outline" className="bg-black/40 border-white/10 text-white/40 text-[9px] uppercase">{interviewDifficulty} DIFFICULTY</Badge>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={currentQuestion}
                        className="max-w-2xl"
                      >
                        <Card className="p-6 glass border-accent/10 bg-black/40 backdrop-blur-md rounded-3xl border-l-4 border-l-accent shadow-2xl">
                          <div className="flex gap-4">
                            <Brain className="w-5 h-5 text-accent shrink-0 mt-1" />
                            <p className="text-lg font-light text-white leading-relaxed">{currentQuestion || "Initializing interview..."}</p>
                          </div>
                        </Card>
                      </motion.div>

                      <div className="flex justify-center">
                        <div className="px-8 py-4 glass rounded-full border-white/10 flex items-center gap-8">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-3 h-3 rounded-full", isListening ? "bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" : "bg-white/10")} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Candidate</span>
                           </div>
                           <div className="w-px h-6 bg-white/10" />
                           <div className="flex items-center gap-3">
                              <div className={cn("w-3 h-3 rounded-full", isAiSpeaking ? "bg-accent animate-pulse shadow-[0_0_10px_#22d3ee]" : "bg-white/10")} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Interviewer</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="h-24 glass border-white/5 bg-[#0b0e1a]/40 rounded-[2rem] p-6 flex items-center justify-between shadow-2xl">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Connection Protocol</span>
                    <span className="text-sm font-bold text-white/80">WebRTC Neural Proxy</span>
                  </div>
                  <div className="w-px h-10 bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Encryption</span>
                    <span className="text-sm font-bold text-green-400/80 uppercase">Active</span>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="p-3 glass rounded-xl border-white/5">
                    <Command className="w-5 h-5 text-white/20" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Version</span>
                    <span className="text-sm font-bold text-white/40 font-mono">5.0.2-BETA</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
