
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import NavigationControls from "@/components/NavigationControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  AlertCircle,
  ChevronRight,
  Keyboard,
  Send,
  X,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { aiMockInterview, type AiMockInterviewOutput } from "@/ai/flows/ai-mock-interview-v2";

/**
 * @fileOverview Special HR Interview Arena v12.5 - Immersion & Session Stability Fix
 * Features: High-fidelity WebRTC persistence, session wait logic, and turn-taking sync.
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
  
  // --- Hybrid Input State ---
  const [isTypeMode, setIsTypeMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  // --- Core Lifecycle Refs ---
  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<any>(null);
  const agentStreamRef = useRef<MediaStream | null>(null);
  const initializationStartedRef = useRef(false);
  const videoPlayPromiseRef = useRef<Promise<void> | null>(null);
  const connectionReadyRef = useRef(false);
  const didConnectionStateRef = useRef<string>("disconnected");
  
  // --- Voice & Logic Refs ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const interviewStartedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const answerSubmissionPendingRef = useRef(false);
  const isSpeakingRequestRef = useRef(false);

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  const ensureVideoPlaying = useCallback(async () => {
    const video = agentVideoRef.current;
    if (!video || videoPlayPromiseRef.current) return;

    try {
      // If video has a source, attempt to play
      if (video.srcObject || video.src) {
        videoPlayPromiseRef.current = video.play();
        await videoPlayPromiseRef.current;
      }
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setIsAudioBlocked(true);
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

      audioTracks.forEach(track => { track.enabled = true; });

      await video.play().catch(() => {});
      console.log("[D-ID] AUDIO UNLOCKED");
    }
  };

  const startListening = useCallback(() => {
    if (isCompleteRef.current || isProcessingRef.current || isAiSpeakingRef.current || !interviewStartedRef.current) return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({ 
          variant: "destructive", 
          title: "Unsupported Browser", 
          description: "Please use Google Chrome for voice features." 
        });
        return;
      }

      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const combined = (transcriptRef.current + " " + finalTranscript + interimTranscript).trim();
        setTranscript(combined);

        // Silence Detection Logic (VAD)
        if (combined.length > 5 && !isTypeMode) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          
          silenceTimerRef.current = setTimeout(() => {
            if (!isProcessingRef.current && !isAiSpeakingRef.current && interviewStartedRef.current) {
              console.log("[Speech] Silence detected, submitting answer...");
              handleSubmitAnswer(combined);
            }
          }, 1800);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech") return;
        console.error("[Speech] Error:", event.error);
        if (event.error === "not-allowed") {
          toast({ variant: "destructive", title: "Mic Access Denied", description: "Microphone permission is required." });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if we're supposed to be listening
        if (interviewStartedRef.current && !isProcessingRef.current && !isAiSpeakingRef.current && !isCompleteRef.current && !isTypeMode) {
          setTimeout(() => {
            if (interviewStartedRef.current && !isProcessingRef.current && !isAiSpeakingRef.current) {
              try { recognition.start(); setIsListening(true); } catch(e) {}
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("[Speech] Init error:", err);
    }
  }, [toast, isTypeMode]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      setIsListening(false);
    }
  }, []);

  const waitForDIdConnection = async (maxWaitMs = 10000) => {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      if (agentManagerRef.current && didConnectionStateRef.current === "connected") {
        return true;
      }
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  };

  const handleSubmitAnswer = (answer: string) => {
    if (answerSubmissionPendingRef.current || !answer.trim()) return;
    answerSubmissionPendingRef.current = true;
    stopListening();
    processNextTurn(answer);
  };

  const processNextTurn = async (userAnswer: string, forceStart = false) => {
    if (isProcessingRef.current || (!interviewStartedRef.current && !forceStart)) return;
    
    setIsProcessing(true);
    isProcessingRef.current = true;
    answerSubmissionPendingRef.current = false;

    try {
      const nextIndex = questionIndex + (userAnswer ? 1 : 0);
      const history = userAnswer 
        ? [...conversationHistory, { question: currentQuestion, answer: userAnswer }]
        : conversationHistory;
      
      if (userAnswer) setConversationHistory(history);

      // Stage A: Gemini Processing
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
      transcriptRef.current = "";

      if (result.isInterviewComplete) {
        setIsComplete(true);
        isCompleteRef.current = true;
      }

      // Stage B: D-ID Vocalization
      if (isSpeakingRequestRef.current) {
        console.warn("[D-ID] Speak request already in progress, skipping.");
        return;
      }

      isSpeakingRequestRef.current = true;
      try {
        let isConnected = await waitForDIdConnection();
        
        if (!isConnected && agentManagerRef.current) {
          console.warn("[D-ID] Signaling not connected, attempting manual sync...");
          try { await agentManagerRef.current.reconnect(); } catch(e) {}
          isConnected = await waitForDIdConnection(5000);
        }

        if (!isConnected) throw new Error("Neural interface timed out. Check connection.");

        await agentManagerRef.current.speak({
          type: "text",
          input: result.nextQuestion
        });
      } catch (speakError: any) {
        console.error("[D-ID] Speak error:", speakError);
        // Handle 400 session errors with one reconnect attempt
        if (speakError.message?.includes("400") || speakError.status === 400) {
          console.log("[D-ID] Session expired, reconnecting...");
          try {
            await agentManagerRef.current.reconnect();
            if (await waitForDIdConnection(5000)) {
              await agentManagerRef.current.speak({ type: "text", input: result.nextQuestion });
            }
          } catch (e) {
             toast({ variant: "destructive", title: "Session Error", description: "Interviewer session lost. Please refresh." });
          }
        }
      } finally {
        isSpeakingRequestRef.current = false;
      }

    } catch (error: any) {
      console.error("[Interview] Turn error:", error);
      toast({ variant: "destructive", title: "Intelligence Fault", description: error.message || "Neural link interrupted." });
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
    if (agentManagerRef.current) {
      try { agentManagerRef.current.disconnect(); } catch(e) {}
    }
  };

  const handleTypedSubmit = () => {
    if (!typedAnswer.trim() || isProcessing) return;
    const ans = typedAnswer;
    setTypedAnswer("");
    setIsTypeMode(false);
    handleSubmitAnswer(ans);
  };

  useEffect(() => {
    if (initializationStartedRef.current) return;
    initializationStartedRef.current = true;

    const initializeDIDAgency = async () => {
      try {
        const { createAgentManager } = await import("@d-id/client-sdk");
        const manager = await createAgentManager(agentId, {
          auth: { type: "key", clientKey },
          streamOptions: { compatibilityMode: "on", streamWarmup: true },
          callbacks: {
            onSrcObjectReady: (stream: MediaStream) => {
              console.log("[D-ID] Stream received", stream.id);
              const video = agentVideoRef.current;
              if (!video) return;
              agentStreamRef.current = stream;
              video.srcObject = stream;
              video.autoplay = true;
              video.playsInline = true;
              video.muted = true;
              setStatus("READY");
              requestAnimationFrame(() => video.play().catch(() => {}));
            },
            onConnectionStateChange: (state: string) => {
              console.log("[D-ID] Connection state:", state);
              didConnectionStateRef.current = state;
              if (state === "connected") connectionReadyRef.current = true;
              else if (state === "disconnected" || state === "closed" || state === "fail") {
                connectionReadyRef.current = false;
              }
            },
            onVideoStateChange: (state: string) => {
              console.log("[D-ID] Video state:", state);
              if (state === "START") {
                setIsAiSpeaking(true);
                isAiSpeakingRef.current = true;
                stopListening();
                ensureVideoPlaying();
              } else if (state === "STOP") {
                setIsAiSpeaking(false);
                isAiSpeakingRef.current = false;
                // Preserve video element state but start listening
                ensureVideoPlaying();
                if (interviewStartedRef.current && !isProcessingRef.current && !isCompleteRef.current && !isTypeMode) {
                  startListening();
                }
              }
            },
            onError: (error: any) => { 
              console.error("[D-ID] SDK Error:", error);
              // Handle SDK errors without crashing
              if (error.status !== 400) setStatus("ERROR"); 
            },
          },
        });
        agentManagerRef.current = manager;
        await manager.connect();
      } catch (error) { 
        console.error("[D-ID] Init critical failure:", error);
        setStatus("ERROR"); 
      }
    };
    initializeDIDAgency();
    return () => {
      if (agentManagerRef.current) {
        agentManagerRef.current.disconnect().catch(() => {});
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, [ensureVideoPlaying, startListening, stopListening]);

  return (
    <div className={cn(
      "min-h-screen bg-[#050816] flex flex-col relative overflow-hidden selection:bg-accent/30",
      interviewStarted && "h-screen w-screen"
    )}>
      <div className="particles-bg" />
      {!interviewStarted && <Navbar />}
      
      <main className={cn(
        "flex-1 relative flex flex-col items-center justify-center",
        interviewStarted ? "h-screen w-screen p-0 m-0" : "container mx-auto px-6 pt-32 pb-16"
      )}>
        {!interviewStarted && <NavigationControls className="top-40" />}

        {/* --- D-ID VIDEO ARENA (STABLE NODE) --- */}
        <div className={cn(
          "transition-all duration-1000 ease-in-out bg-black overflow-hidden",
          interviewStarted 
            ? "fixed inset-0 z-0 w-screen h-screen" 
            : "relative w-full max-w-4xl aspect-[16/10] rounded-[3rem] border border-white/5 shadow-2xl z-10"
        )}>
          <video
            ref={agentVideoRef}
            autoPlay
            playsInline
            muted
            preload="auto"
            className="w-full h-full object-contain"
          />
          
          {/* Landing State Overlays */}
          {!interviewStarted && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center bg-[#050816]/40 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {status === "LOADING" ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                        <Loader2 className="w-full h-full text-accent animate-spin" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Synchronizing Session</p>
                  </motion.div>
                ) : status === "READY" ? (
                  <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                        <ShieldCheck className="w-10 h-10 text-accent" />
                     </div>
                     <div className="space-y-4">
                       <h3 className="text-3xl font-bold tracking-tighter text-white">Interface Ready</h3>
                       <p className="text-muted-foreground font-light max-w-xs mx-auto">Vocal matrix calibrated. Simulation node established.</p>
                     </div>

                     {isAudioBlocked ? (
                        <Button onClick={handleEnableAudio} className="h-16 px-10 btn-premium rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                          <Volume2 className="w-4 h-4 mr-2" /> Initialize Vocal Link
                        </Button>
                     ) : (
                        <Button onClick={startInterview} className="h-20 px-12 btn-premium rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-transform">
                          Launch Arena <Play className="ml-3 w-5 h-5 fill-current" />
                        </Button>
                     )}
                  </motion.div>
                ) : (
                  <motion.div key="error" className="space-y-4 text-red-400">
                     <AlertCircle className="w-16 h-16 mx-auto" />
                     <p className="text-xs font-bold uppercase tracking-widest">Protocol Fault</p>
                     <Button variant="ghost" onClick={() => window.location.reload()} className="text-[9px] uppercase tracking-widest text-white/40">Retry Handshake</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* --- INTERVIEW ARENA HUD --- */}
        {interviewStarted && (
          <div className="fixed inset-0 z-50 flex pointer-events-none p-8 gap-8">
            
            {/* LEFT HUD: Dynamic Mic State */}
            <div className="flex-1 flex flex-col justify-between h-full">
              <div className="flex justify-center pointer-events-auto">
                 <div className={cn(
                   "px-6 py-4 glass rounded-full border border-white/10 flex items-center gap-4 transition-all duration-500",
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
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                        {isListening ? "Listening" : isProcessing ? "Neural Thinking" : isAiSpeaking ? "Interviewer Speaking" : "Idle"}
                      </span>
                   </div>
                 </div>
              </div>

              {!isTypeMode && transcript && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto w-full max-w-2xl pointer-events-auto">
                   <div className="glass p-6 rounded-3xl border-white/10 bg-black/60 backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-2 text-accent">
                         <MessageSquare className="w-4 h-4" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Capture Log</span>
                      </div>
                      <p className="text-lg font-light text-white/90 leading-relaxed italic line-clamp-2">"{transcript}"</p>
                   </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT PANEL: Communicator Node */}
            <div className="w-[450px] h-full flex flex-col pointer-events-auto">
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex-1 flex flex-col glass rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                         <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">AI Interviewer</h3>
                        <p className={cn("text-[9px] font-bold uppercase tracking-[0.2em]", isAiSpeaking ? "text-accent animate-pulse" : "text-white/40")}>
                          {isAiSpeaking ? "Transmitting" : isListening ? "Listening" : "Calibrating"}
                        </p>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" onClick={stopInterview} className="text-white/20 hover:text-red-400 hover:bg-red-500/10">
                      <X className="w-5 h-5" />
                   </Button>
                </div>

                <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="border-accent/30 text-accent text-[8px] uppercase tracking-tighter">Turn {questionIndex}</Badge>
                       <Badge variant="outline" className="border-white/10 text-white/30 text-[8px] uppercase tracking-tighter">{interviewStage}</Badge>
                    </div>
                    <div className="p-6 glass rounded-3xl border-accent/20 bg-accent/5">
                      <h4 className="text-xl font-medium text-white leading-relaxed">
                        {currentQuestion || "Synchronizing initial prompt..."}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/5">
                    <AnimatePresence mode="wait">
                      {isTypeMode ? (
                        <motion.div key="type-area" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Override Protocol</span>
                              <Button variant="ghost" size="sm" onClick={() => setIsTypeMode(false)} className="h-6 text-[8px] uppercase tracking-widest hover:text-accent">Voice Link</Button>
                           </div>
                           <Textarea 
                             value={typedAnswer}
                             onChange={(e) => setTypedAnswer(e.target.value)}
                             placeholder="Type your response..."
                             className="min-h-[150px] rounded-2xl glass border-white/10 bg-transparent text-white p-4 text-sm font-light resize-none focus:border-accent"
                           />
                           <Button 
                            disabled={!typedAnswer.trim() || isProcessing}
                            onClick={handleTypedSubmit}
                            className="w-full h-14 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest"
                           >
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Commit Answer</>}
                           </Button>
                        </motion.div>
                      ) : (
                        <motion.div key="mic-area" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="text-center space-y-6">
                           <p className="text-xs text-white/40 font-light italic">"Awaiting vocal input node..."</p>
                           <Button 
                             onClick={() => { stopListening(); setIsTypeMode(true); }}
                             variant="outline" 
                             className="w-full h-16 rounded-2xl glass border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 flex gap-3"
                           >
                             <Keyboard className="w-5 h-5 text-accent" />
                             Manual Entry
                           </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Secure Arena</span>
                      <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> Level: {interviewDifficulty}</span>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </motion.div>
            </div>

            <div className="fixed top-8 right-8 pointer-events-auto">
               <Button 
                onClick={stopInterview}
                variant="ghost"
                className="h-10 px-4 glass border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
               >
                 <Square className="w-3 h-3 mr-2 fill-current" /> Abort
               </Button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        html, body {
          height: 100%;
          ${interviewStarted ? 'overflow: hidden !important;' : ''}
        }
      `}</style>
    </div>
  );
}
