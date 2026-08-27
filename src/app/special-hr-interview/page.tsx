"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

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
  const { user } = useUser();
  const db = useFirestore();

  const [status, setStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

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
  
  const [isTypeMode, setIsTypeMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<any>(null);
  const agentStreamRef = useRef<MediaStream | null>(null);
  const initializationStartedRef = useRef(false);
  const connectionReadyRef = useRef(false);
  const didConnectionStateRef = useRef<string>("disconnected");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const interviewStartedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const answerSubmissionPendingRef = useRef(false);
  const isSpeakingRequestRef = useRef(false);
  const isTypeModeRef = useRef(false);

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  // Active Journey Context
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  // Determine which resume data to use (Special HR fields first, then Round 1 fallback)
  const resumeAnalysis = useMemo(() => {
    return (journey as any)?.specialHRResumeAnalysis || journey?.resumeAnalysis;
  }, [journey]);

  const startListeningRef = useRef<() => void>(() => {});
  const stopListeningRef = useRef<() => void>(() => {});

  const ensureVideoPlaying = useCallback(async () => {
    const video = agentVideoRef.current;
    if (!video) return;
    try {
      if (video.srcObject || video.src) {
        await video.play();
      }
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setIsAudioBlocked(true);
      }
    }
  }, []);

  const handleEnableAudio = async () => {
    const video = agentVideoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      setIsAudioBlocked(false);

      if (video.srcObject instanceof MediaStream) {
        video.srcObject.getAudioTracks().forEach(track => { track.enabled = true; });
      }

      await video.play().catch(() => {});
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

        if (combined.length > 5 && !isTypeModeRef.current) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          
          silenceTimerRef.current = setTimeout(() => {
            if (!isProcessingRef.current && !isAiSpeakingRef.current && interviewStartedRef.current) {
              handleSubmitAnswer(combined);
            }
          }, 1800);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech") return;
        console.error("[Speech] Error:", event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (interviewStartedRef.current && !isProcessingRef.current && !isAiSpeakingRef.current && !isCompleteRef.current && !isTypeModeRef.current) {
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
  }, [toast]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      setIsListening(false);
    }
  }, []);

  // Update refs
  useEffect(() => {
    startListeningRef.current = startListening;
    stopListeningRef.current = stopListening;
  }, [startListening, stopListening]);

  const waitForDIdConnection = async (maxWaitMs = 15000) => {
    if (agentManagerRef.current && didConnectionStateRef.current === "connected") return true;
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      if (agentManagerRef.current && didConnectionStateRef.current === "connected") {
        return true;
      }
      await new Promise(r => setTimeout(r, 500));
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

      const result: AiMockInterviewOutput = await aiMockInterview({
        role: journey?.role || "Software Engineer",
        experienceLevel: journey?.experience || "Entry Level",
        roundType: "Technical Interview",
        currentMainQuestionIndex: nextIndex,
        history: history,
        userAnswer: userAnswer,
        targetCompany: journey?.company || "Nexvoro AI",
        candidateName: resumeAnalysis?.personalInfo?.fullName || "Candidate",
        // Prefer context from the Round-2 specific Special HR Resume
        resumeSkills: (journey as any)?.specialHRResumeAnalysis?.skillAnalysis?.map(
          (s: any) => s.skill
        ) || [],
        resumeProjects: (journey as any)?.specialHRResumeAnalysis?.sections?.projects || [],
        resumeSummary: (journey as any)?.specialHRResumeAnalysis?.summary || "",
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

      if (isSpeakingRequestRef.current) return;
      isSpeakingRequestRef.current = true;

      try {
        let isConnected = await waitForDIdConnection();
        
        if (!isConnected && agentManagerRef.current) {
          await agentManagerRef.current.connect();
          isConnected = await waitForDIdConnection(10000);
        }

        if (!isConnected) throw new Error("Neural interface timed out.");

        await agentManagerRef.current.speak({
          type: "text",
          input: result.nextQuestion
        });
      } catch (speakError: any) {
        console.error("[D-ID] Speak failure:", speakError);
        if (speakError.message?.includes("session_id") || speakError.status === 400) {
          await agentManagerRef.current.connect();
          if (await waitForDIdConnection(10000)) {
            await agentManagerRef.current.speak({ type: "text", input: result.nextQuestion });
          }
        }
      } finally {
        isSpeakingRequestRef.current = false;
      }

    } catch (error: any) {
      console.error("[Interview] Turn error:", error);
      toast({ variant: "destructive", title: "Intelligence Fault", description: "Neural link interrupted." });
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

  const stopInterview = async () => {
    setInterviewStarted(false);
    interviewStartedRef.current = false;
    stopListening();
    setIsComplete(true);
    isCompleteRef.current = true;
    
    if (agentManagerRef.current) {
      try {
        await agentManagerRef.current.disconnect();
      } catch (e: any) {}
      agentManagerRef.current = null;
      didConnectionStateRef.current = "disconnected";
      setStatus("LOADING");
    }
  };

  const handleTypedSubmit = () => {
    if (!typedAnswer.trim() || isProcessing) return;
    const ans = typedAnswer;
    setTypedAnswer("");
    setIsTypeMode(false);
    isTypeModeRef.current = false;
    handleSubmitAnswer(ans);
  };

  const toggleTypeMode = (val: boolean) => {
    setIsTypeMode(val);
    isTypeModeRef.current = val;
    if (val) stopListening();
    else if (interviewStartedRef.current && !isAiSpeakingRef.current) startListening();
  };

  useEffect(() => {
    if (initializationStartedRef.current) return;
    initializationStartedRef.current = true;

    let manager: any = null;

    const initializeDIDAgency = async () => {
      try {
        const { createAgentManager } = await import("@d-id/client-sdk");
        manager = await createAgentManager(agentId, {
          auth: { type: "key", clientKey },
          streamOptions: { compatibilityMode: "on", streamWarmup: true },
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
              requestAnimationFrame(() => video.play().catch(() => {}));
            },
            onConnectionStateChange: (state: string) => {
              didConnectionStateRef.current = state;
              if (state === "connected") connectionReadyRef.current = true;
              else connectionReadyRef.current = false;
            },
            onVideoStateChange: (state: string) => {
              if (state === "START") {
                setIsAiSpeaking(true);
                isAiSpeakingRef.current = true;
                stopListeningRef.current();
              } else if (state === "STOP") {
                setIsAiSpeaking(false);
                isAiSpeakingRef.current = false;
                if (interviewStartedRef.current && !isProcessingRef.current && !isCompleteRef.current && !isTypeModeRef.current) {
                  startListeningRef.current();
                }
              }
            },
            onError: (error: any) => { 
              if (!error.message?.includes("session_id")) setStatus("ERROR"); 
            },
          },
        });
        agentManagerRef.current = manager;
        await manager.connect();
      } catch (error) { 
        setStatus("ERROR"); 
      }
    };
    
    initializeDIDAgency();

    return () => {
      if (manager) {
        manager.disconnect().catch(() => {});
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  return (
    <div className={cn(
      "min-h-screen bg-[#050816] flex flex-col relative overflow-hidden",
      interviewStarted && "h-screen w-screen"
    )}>
      <div className="particles-bg" />
      
      {!interviewStarted && <Navbar />}
      
      <main className={cn(
        "flex-1 relative flex flex-col items-center justify-center",
        interviewStarted ? "h-screen w-screen p-0 m-0" : "container mx-auto px-6 pt-32 pb-16"
      )}>
        {!interviewStarted && <NavigationControls />}

        <div className={cn(
          "bg-black overflow-hidden relative",
          interviewStarted 
            ? "fixed inset-0 z-0 w-screen h-screen" 
            : "w-full max-w-4xl aspect-[16/10] rounded-[3rem] border border-white/5 shadow-2xl z-10"
        )}>
          <video
            ref={agentVideoRef}
            autoPlay
            playsInline
            muted
            preload="auto"
            className="w-full h-full object-contain bg-black z-10"
          />
          
          {!interviewStarted && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center bg-[#050816]/40 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {status === "LOADING" ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                        <Loader2 className="w-full h-full text-accent animate-spin" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Neural Link</p>
                  </motion.div>
                ) : status === "READY" ? (
                  <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                        <ShieldCheck className="w-10 h-10 text-accent" />
                     </div>
                     <div className="space-y-4">
                       <h3 className="text-3xl font-bold tracking-tighter text-white">Simulation Arena Ready</h3>
                       <p className="text-muted-foreground font-light max-w-xs mx-auto">High-fidelity WebRTC node established for the IT executive simulation.</p>
                     </div>

                     {isAudioBlocked ? (
                        <Button onClick={handleEnableAudio} className="h-16 px-10 btn-premium rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                          <Volume2 className="w-4 h-4 mr-2" /> Unlock Vocal Matrix
                        </Button>
                     ) : (
                        <Button onClick={startInterview} className="h-20 px-12 btn-premium rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-transform">
                          Enter Neural Arena <Play className="ml-3 w-5 h-5 fill-current" />
                        </Button>
                     )}
                  </motion.div>
                ) : (
                  <motion.div key="error" className="space-y-4 text-red-400">
                     <AlertCircle className="w-16 h-16 mx-auto" />
                     <p className="text-xs font-bold uppercase tracking-widest">Protocol Sync Failure</p>
                     <Button variant="ghost" onClick={() => window.location.reload()} className="text-[9px] uppercase tracking-widest text-white/40">Re-initialize Handshake</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {interviewStarted && (
          <div className="fixed inset-0 z-50 flex flex-col pointer-events-none p-8 overflow-hidden h-screen w-screen">
            <div className="flex-1 flex pointer-events-none gap-8 min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
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
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto w-full max-w-2xl pointer-events-auto mb-12">
                     <div className="glass p-6 rounded-3xl border-white/10 bg-black/60 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-2 text-accent">
                           <MessageSquare className="w-4 h-4" />
                           <span className="text-[9px] font-black uppercase tracking-widest">Live Capture Log</span>
                        </div>
                        <p className="text-lg font-light text-white/90 leading-relaxed italic line-clamp-2">"{transcript}"</p>
                     </div>
                  </motion.div>
                )}
              </div>

              <div className="w-[450px] h-full flex flex-col pointer-events-auto overflow-hidden">
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
                          <h3 className="text-xs font-black uppercase tracking-widest text-white">AI Evaluator</h3>
                          <p className={cn("text-[9px] font-bold uppercase tracking-[0.2em]", isAiSpeaking ? "text-accent animate-pulse" : "text-white/40")}>
                            {isAiSpeaking ? "Transmitting" : isListening ? "Listening" : "Ready"}
                          </p>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" onClick={stopInterview} className="text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
                          {currentQuestion || "Synchronizing with neural engine..."}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/5">
                      <AnimatePresence mode="wait">
                        {isTypeMode ? (
                          <motion.div key="type-area" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Manual Entry Override</span>
                                <Button variant="ghost" size="sm" onClick={() => toggleTypeMode(false)} className="h-6 text-[8px] uppercase tracking-widest hover:text-accent">Voice Interface</Button>
                             </div>
                             <Textarea 
                               value={typedAnswer}
                               onChange={(e) => setTypedAnswer(e.target.value)}
                               placeholder="Synthesize your response..."
                               className="min-h-[120px] rounded-2xl glass border-white/10 bg-transparent text-white p-4 text-sm font-light resize-none focus:border-accent"
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
                             <p className="text-xs text-white/40 font-light italic">"Awaiting vocal response node..."</p>
                             <Button 
                               onClick={() => toggleTypeMode(true)}
                               variant="outline" 
                               className="w-full h-16 rounded-2xl glass border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 flex gap-3"
                             >
                               <Keyboard className="w-5 h-5 text-accent" />
                               Switch to Manual Text Entry
                             </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-4 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Secure Matrix</span>
                        <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> Grade: {interviewDifficulty}</span>
                     </div>
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="fixed top-8 right-8 pointer-events-auto">
               <Button 
                onClick={stopInterview}
                variant="ghost"
                className="h-10 px-4 glass border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
               >
                 <Square className="w-3 h-3 mr-2 fill-current" /> Terminate Session
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
