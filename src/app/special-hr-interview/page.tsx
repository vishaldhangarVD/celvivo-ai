"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  MessageSquare,
  MicOff,
  AlertCircle,
  ChevronRight,
  Keyboard,
  Send,
  X,
  User,
  Cpu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { aiMockInterview, type AiMockInterviewOutput } from "@/ai/flows/ai-mock-interview-v2";
import { analyzeHRInterviewResult } from "@/ai/flows/ai-hr-interview-result";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const MIN_QUESTIONS_BEFORE_COMPLETE = 12;

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
  const router = useRouter();
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
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const interviewStartedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const answerSubmissionPendingRef = useRef(false);
  const isTypeModeRef = useRef(false);

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  const resumeAnalysis = useMemo(() => {
    return (journey as any)?.specialHRResumeAnalysis;
  }, [journey]);

  const round1Context = useMemo(() => {
    if (!journey) return undefined;
    return {
      resumeSummary: journey.resumeAnalysis?.summary || "",
      resumeSkills: journey.resumeAnalysis?.analysis?.technicalSkills?.map((s: any) => s.skill) || [],
      resumeProjects: journey.resumeAnalysis?.analysis?.sections?.projects || [],
      scores: {
        aptitude: journey.aptitudeReport?.overallScore || 0,
        coding: journey.codingReport?.score || 0,
      },
      history: journey.history || []
    };
  }, [journey]);

  const handleEnableAudio = async () => {
    console.log("🟡 [Audio] handleEnableAudio start. video ref exists?", !!agentVideoRef.current);
    const video = agentVideoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      setIsAudioBlocked(false);
      if (video.srcObject instanceof MediaStream) {
        video.srcObject.getAudioTracks().forEach(track => { track.enabled = true; });
      }
      try {
        await video.play();
        console.log("🟡 [Audio] video.play() succeeded");
      } catch (e) {
        console.log("🟡 [Audio] video.play() failed/blocked:", e);
      }
    } else {
      console.log("🔴 [Audio] video ref is null!");
    }
  };

  const startListening = useCallback(() => {
    if (isCompleteRef.current || isProcessingRef.current || isAiSpeakingRef.current || !interviewStartedRef.current) return;
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscriptText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i][0].confidence > 0 && event.results[i].isFinal) finalTranscriptText += transcriptChunk;
          else interimTranscript += transcriptChunk;
        }
        const combined = (transcriptRef.current + " " + finalTranscriptText + interimTranscript).trim();
        setTranscript(combined);
        if (combined.length > 5 && !isTypeModeRef.current) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (!isProcessingRef.current && !isAiSpeakingRef.current && interviewStartedRef.current) handleSubmitAnswer(combined);
          }, 1800);
        }
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
    } catch (err) {}
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      setIsListening(false);
    }
  }, []);

  const finalizeInterviewResult = useCallback(async (history: any[], stage: string) => {
    try {
      const fullTranscript = history.map(h => ({
        stage: stage,
        question: h.question,
        answer: h.answer,
      }));
      const resultData = await analyzeHRInterviewResult({
        candidateName: resumeAnalysis?.personalInfo?.fullName || user?.displayName || "Candidate",
        role: journey?.role || "Software Engineer",
        targetCompany: journey?.company || "Nexvoro AI",
        resumeSummary: resumeAnalysis?.summary || "",
        transcript: fullTranscript,
      });
      if (journeyRef) {
        await updateDoc(journeyRef, {
          specialHRResult: resultData,
          specialHRResultAt: serverTimestamp(),
        });
      }
      router.push('/special-hr-interview-result');
    } catch (err) {
      toast({ variant: "destructive", title: "Unable to Generate Results" });
    }
  }, [resumeAnalysis, journey, journeyRef, user, router, toast]);

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
      const history = userAnswer ? [...conversationHistory, { question: currentQuestion, answer: userAnswer }] : conversationHistory;
      if (userAnswer) setConversationHistory(history);
      const result: AiMockInterviewOutput = await aiMockInterview({
        role: journey?.role || "Software Engineer",
        experienceLevel: journey?.experience || "Entry Level",
        roundType: "Special HR Interview",
        currentMainQuestionIndex: nextIndex,
        history: history,
        userAnswer: userAnswer,
        targetCompany: journey?.company || "Nexvoro AI",
        candidateName: resumeAnalysis?.personalInfo?.fullName || user?.displayName || "Candidate",
        resumeSkills: resumeAnalysis?.skillAnalysis?.map((s: any) => s.skill) || [],
        resumeProjects: resumeAnalysis?.sections?.projects || [],
        resumeSummary: resumeAnalysis?.summary || "",
        aptitudeScore: round1Context?.scores?.aptitude || 0,
        codingScore: round1Context?.scores?.coding || 0,
        askedQuestions: askedQuestions,
        currentStage: interviewStage,
        currentDifficulty: interviewDifficulty,
        round1Context: round1Context,
        userId: user?.uid,
        sessionId: journey?.sessionId
      });
      setCurrentQuestion(result.nextQuestion);
      setQuestionIndex(nextIndex);
      setInterviewStage(result.stage);
      setInterviewDifficulty(result.difficulty);
      setAskedQuestions(prev => [...prev, result.nextQuestion]);
      setTranscript("");
      transcriptRef.current = "";
      if (result.isInterviewComplete && nextIndex >= MIN_QUESTIONS_BEFORE_COMPLETE) {
        setIsComplete(true);
        isCompleteRef.current = true;
        await finalizeInterviewResult(history, result.stage);
      }
      if (agentManagerRef.current && connectionReadyRef.current) {
        await agentManagerRef.current.speak({ type: "text", input: result.nextQuestion });
      }
    } catch (error: any) {
      console.error("🔴 [Interview Turn Error]", error?.message || error, error);
      toast({ variant: "destructive", title: "Interview Error" });
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const startInterview = async () => {
    console.log("🟢 [1] startInterview called. status =", status);
    if (status !== "READY") {
      console.log("🔴 [ABORT] status is not READY, aborting");
      return;
    }
    console.log("🟢 [2] Calling handleEnableAudio...");
    await handleEnableAudio();
    console.log("🟢 [3] handleEnableAudio done");
    interviewStartedRef.current = true;
    setInterviewStarted(true);
    console.log("🟢 [4] setInterviewStarted(true) called");
    await processNextTurn("", true);
    console.log("🟢 [5] processNextTurn done");
  };

  const stopInterview = async () => {
    setInterviewStarted(false);
    interviewStartedRef.current = false;
    stopListening();
    setIsComplete(true);
    isCompleteRef.current = true;
    await finalizeInterviewResult(conversationHistory, interviewStage);
  };

  useEffect(() => {
    let cancelled = false;
    let localManager: any = null;

    const initializeDIDAgency = async () => {
      try {
        const { createAgentManager } = await import("@d-id/client-sdk");

        // जर याच effect चा cleanup आधीच चालून गेला असेल (Strict Mode double-invoke),
        // तर आता नव्याने connect करण्यात अर्थ नाही — थांबव
        if (cancelled) return;

        const manager = await createAgentManager(agentId, {
          auth: { type: "key", clientKey },
          callbacks: {
            onSrcObjectReady: (stream: MediaStream) => {
              const video = agentVideoRef.current;
              if (!video) return;
              agentStreamRef.current = stream;
              video.srcObject = stream;
              setStatus("READY");
              requestAnimationFrame(() => video.play().catch(() => {}));
            },
            onConnectionStateChange: (state: string) => {
              connectionReadyRef.current = state === "connected";
            },
            onVideoStateChange: (state: string) => {
              if (state === "START") {
                setIsAiSpeaking(true);
                isAiSpeakingRef.current = true;
                stopListening();
              } else if (state === "STOP") {
                setIsAiSpeaking(false);
                isAiSpeakingRef.current = false;
                if (!isCompleteRef.current && interviewStartedRef.current && !isProcessingRef.current) startListening();
              }
            },
          },
        });

        // manager तयार होईपर्यंत जर cleanup आधीच चालून गेला असेल,
        // तर हा manager लगेच बंद करून टाक — तो वापरात न घेता
        if (cancelled) {
          manager.disconnect().catch(() => {});
          return;
        }

        localManager = manager;
        agentManagerRef.current = manager;
        await manager.connect();
      } catch (error: any) {
        console.error("🔴 [D-ID Init Error]", error?.message || error, error);
        if (!cancelled) setStatus("ERROR");
      }
    };

    initializeDIDAgency();

    return () => {
      cancelled = true;
      if (localManager) {
        localManager.disconnect().catch(() => {});
      }
    };
  }, [stopListening, startListening]);

  return (
    <div className={cn("min-h-screen bg-[#050816] flex flex-col relative overflow-hidden", interviewStarted && "h-screen w-screen")}>
      <div className="particles-bg" />
      <main className={cn("flex-1 relative flex flex-col items-center justify-center", interviewStarted ? "h-screen w-screen p-0 m-0" : "container mx-auto px-6 pt-32 pb-16")}>
        <div className={cn("bg-black overflow-hidden relative", interviewStarted ? "fixed inset-0 z-0 w-screen h-screen" : "w-full max-w-4xl aspect-[16/10] rounded-[3rem] border border-white/5 shadow-2xl z-10")}>
          <video ref={agentVideoRef} autoPlay playsInline muted className="w-full h-full object-contain bg-black z-10" />
          {status !== "READY" && <div className="absolute inset-0 z-[15] bg-[#050816] pointer-events-none" />}
          {!interviewStarted && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center bg-[#050816]/40 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {status === "LOADING" ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                        <Loader2 className="w-full h-full text-accent animate-spin" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Connecting to Your Interviewer</p>
                  </motion.div>
                ) : status === "READY" ? (
                  <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-accent/20 flex items-center justify-center mx-auto border border-accent/40 shadow-[0_0_50px_rgba(34,211,238,0.2)]"><ShieldCheck className="w-10 h-10 text-accent" /></div>
                     <div className="space-y-4">
                       <h3 className="text-3xl font-bold tracking-tighter text-white">You're Ready</h3>
                       <p className="text-muted-foreground font-light max-xs mx-auto">This interview will feel like a real video interview.</p>
                     </div>
                     <Button onClick={startInterview} className="h-20 px-12 btn-premium rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-transform">Start HR Interview <Play className="ml-3 w-5 h-5 fill-current" /></Button>
                  </motion.div>
                ) : (
                  <motion.div key="error" className="space-y-4 text-red-400">
                     <AlertCircle className="w-16 h-16 mx-auto" />
                     <p className="text-xs font-bold uppercase tracking-widest">Connection Failed</p>
                     <Button variant="ghost" onClick={() => window.location.reload()} className="text-[9px] uppercase tracking-widest text-white/40">Try Again</Button>
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
                   <div className={cn("px-6 py-4 glass rounded-full border border-white/10 flex items-center gap-4 transition-all duration-500", isListening ? "bg-green-500/20 border-green-500/50" : isProcessing ? "bg-accent/20 border-accent/50" : "bg-white/5")}>
                     {isListening ? <Mic className="w-6 h-6 text-green-400 animate-pulse" /> : isProcessing ? <Activity className="w-6 h-6 text-accent animate-spin" /> : <MicOff className="w-6 h-6 text-white/30" />}
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{isListening ? "Listening..." : isProcessing ? "Thinking" : "Ready"}</span>
                   </div>
                </div>
                {transcript && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto w-full max-w-2xl pointer-events-auto mb-12">
                     <div className="glass p-6 rounded-3xl border-white/10 bg-black/60 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-2 text-accent"><MessageSquare className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Your Answer</span></div>
                        <p className="text-lg font-light text-white/90 italic line-clamp-2">"{transcript}"</p>
                     </div>
                  </motion.div>
                )}
              </div>
              <div className="w-[360px] h-full flex flex-col pointer-events-auto overflow-hidden">
                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col glass rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent"><User className="w-5 h-5" /></div>
                        <div><h3 className="text-xs font-black uppercase tracking-widest text-white">AI Interviewer</h3></div>
                     </div>
                     <Button variant="ghost" size="icon" onClick={stopInterview} className="text-white/20 hover:text-red-400"><X className="w-5 h-5" /></Button>
                  </div>
                  <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><Badge variant="outline" className="text-accent text-[8px] uppercase">Turn {questionIndex}</Badge></div>
                      <div className="p-6 glass rounded-3xl border-accent/20 bg-accent/5"><h4 className="text-xl font-medium text-white leading-relaxed">{currentQuestion || "Preparing..."}</h4></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
