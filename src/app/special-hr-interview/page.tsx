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
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { aiMockInterview, type AiMockInterviewOutput } from "@/ai/flows/ai-mock-interview-v2";

/**
 * @fileOverview Special HR Interview Arena v6.0 - Full Screen Immersion
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
      console.log("[D-ID] AUDIO UNLOCKED");
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

  const processNextTurn = async (userAnswer: string, forceStart = false) => {
    if (isProcessingRef.current || (!interviewStartedRef.current && !forceStart)) return;
    
    setIsProcessing(true);
    isProcessingRef.current = true;
    stopListening();

    try {
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

    } catch (error) {
      console.error("[Interview] Turn error:", error);
      toast({ variant: "destructive", title: "Neural Link Error", description: "Failed to fetch response from Gemini." });
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
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      <Navbar />
      <NavigationControls />

      {/* FULL SCREEN VIDEO LAYER */}
      <div className="absolute inset-0 z-0">
        <video
          ref={agentVideoRef}
          autoPlay
          playsInline
          muted
          preload="auto"
          className="w-full h-full object-cover"
        />
        {/* Subtle Overlay to make HUD elements pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* INTERACTIVE HUD OVERLAYS */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-start w-full">
          <AnimatePresence>
            {interviewStarted && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <Badge className="bg-black/60 backdrop-blur-md border-accent/30 text-accent py-2 px-5 rounded-full flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Arena</span>
                </Badge>
                <Badge variant="outline" className="bg-black/40 backdrop-blur-md border-white/10 text-white/40 text-[9px] uppercase py-2 px-4 rounded-full">
                  {interviewStage} • {interviewDifficulty}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-auto">
            {interviewStarted && (
              <Button 
                onClick={stopInterview}
                variant="ghost"
                className="h-10 px-4 glass border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full text-[9px] font-black uppercase tracking-widest"
              >
                Terminate
              </Button>
            )}
          </div>
        </div>

        {/* CENTER ACTION OVERLAY (Starts & Loads) */}
        <div className="flex flex-col items-center justify-center flex-1 w-full pointer-events-auto">
          <AnimatePresence mode="wait">
            {status === "LOADING" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                  <Loader2 className="w-full h-full text-accent animate-spin" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Matrix</p>
              </motion.div>
            )}

            {status === "READY" && !interviewStarted && (
              <motion.div
                key="start-ui"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-8 text-center max-w-sm"
              >
                {isAudioBlocked ? (
                  <div className="glass p-10 rounded-[3rem] border-accent/20 bg-black/40 backdrop-blur-xl space-y-6">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/40">
                      <Volume2 className="w-8 h-8 text-accent animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold uppercase tracking-tighter text-white">Vocal Matrix Locked</h3>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">System requires vocal synchronization permission.</p>
                    </div>
                    <Button onClick={handleEnableAudio} className="w-full h-14 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                      Unlock Vocal Link
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={startInterview}
                    className="w-48 h-48 rounded-full btn-premium flex flex-col gap-3 shadow-[0_0_50px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform"
                  >
                    <Play className="w-12 h-12 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Start Mission</span>
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM HUD (Subtitles & Status) */}
        <div className="w-full flex flex-col items-center gap-6 max-w-4xl mx-auto">
          <AnimatePresence>
            {interviewStarted && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-4"
              >
                {/* STATUS CHIPS */}
                <div className="flex justify-center gap-4">
                  {isListening && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 py-1.5 px-4 rounded-full flex items-center gap-2 animate-pulse">
                      <Mic className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Listening</span>
                    </Badge>
                  )}
                  {isProcessing && (
                    <Badge className="bg-accent/20 text-accent border-accent/30 py-1.5 px-4 rounded-full flex items-center gap-2">
                      <Activity className="w-3 h-3 animate-spin" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Thinking</span>
                    </Badge>
                  )}
                </div>

                {/* TRANSCRIPT BOX */}
                <div className="glass p-6 rounded-3xl border-white/10 bg-black/40 backdrop-blur-xl w-full text-center">
                  <p className="text-lg md:text-xl font-light text-white leading-relaxed line-clamp-3">
                    {isListening ? (transcript || "...") : (currentQuestion || "Initializing...")}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
