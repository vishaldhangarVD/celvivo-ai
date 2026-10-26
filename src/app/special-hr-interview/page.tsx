"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
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
  Cpu,
  VideoOff,
  Video,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { aiMockInterview, type AiMockInterviewOutput } from "@/ai/flows/ai-mock-interview-v2";
import { analyzeHRInterviewResult } from "@/ai/flows/ai-hr-interview-result";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const MIN_QUESTIONS_BEFORE_COMPLETE = 12;

const serif = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] });

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
  const [questionIndex, setQuestionIndex] = useState(1);
  // CHANGED: each history entry now also remembers the stage of its question
  const [conversationHistory, setConversationHistory] = useState<{ question: string; answer: string; stage?: string }[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [interviewStage, setInterviewStage] = useState<any>("INTRODUCTION");
  const [interviewDifficulty, setInterviewDifficulty] = useState<any>("MEDIUM");
  const [isComplete, setIsComplete] = useState(false);
  // NEW: true while the report is being generated (shows the "Generating your report" screen)
  const [isFinalizing, setIsFinalizing] = useState(false);

  const [isTypeMode, setIsTypeMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  // user self-view camera (local only — nothing is recorded or uploaded)
  const [cameraStatus, setCameraStatus] = useState<"IDLE" | "ON" | "DENIED">("IDLE");
  const userVideoRef = useRef<HTMLVideoElement>(null);

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

  // NEW: always points to the LATEST handleSubmitAnswer (fixes stale-closure bug in voice mode)
  const handleSubmitAnswerRef = useRef<(a: string) => void>(() => {});
  // NEW: live copy of what the speech recognizer has heard so far
  const liveTranscriptRef = useRef("");

  const agentId = "v2_agt_5A5V9r-C";
  const clientKey = "ck_0T9vL02nSJmsHMLHMYLsB";

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  // Special HR has its own company / role / experience (saved on the Special HR setup page).
  // If they are missing, fall back to the normal interview values, as before.
  const hrRole: string = (journey as any)?.specialHRRole || journey?.role || "Software Engineer";
  const hrCompany: string = (journey as any)?.specialHRCompany || journey?.company || "Nexvoro AI";
  const hrExperience: string = (journey as any)?.specialHRExperience || journey?.experience || "Entry Level";

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
        // video.play() कधीकधी कायमचं pending राहू शकतं (विशेषतः overlapping calls मुळे) —
        // म्हणून 3 सेकंदांनंतर आपोआप पुढे जाऊ दे, अडकून राहू नये
        await Promise.race([
          video.play(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("video.play() timed out after 3s")), 3000)),
        ]);
        console.log("🟡 [Audio] video.play() succeeded");
      } catch (e) {
        console.log("🟡 [Audio] video.play() failed/blocked/timed-out:", e);
        // हा error असूनही पुढे जाऊ दे — ऑडिओ/व्हिडिओ आधीच दिसत असू शकतो, फक्त play() promise अडकलं असेल
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

      // CHANGED: rebuilds the full text of this recognition session every time,
      // and keeps what was said before an automatic restart.
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = "";
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) finalText += r[0].transcript + " ";
          else interim += r[0].transcript;
        }
        const combined = (transcriptRef.current + " " + finalText + interim).trim();
        liveTranscriptRef.current = combined;
        setTranscript(combined);
        if (combined.length > 5 && !isTypeModeRef.current) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (!isProcessingRef.current && !isAiSpeakingRef.current && interviewStartedRef.current) {
              // CHANGED: use the ref so we always call the latest handleSubmitAnswer
              handleSubmitAnswerRef.current(combined);
            }
          }, 1800);
        }
      };

      recognition.onend = () => {
        // NEW: before an automatic restart, remember what was already said
        if (!isProcessingRef.current) transcriptRef.current = liveTranscriptRef.current;
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

  const finalizeInterviewResult = useCallback(async (history: { question: string; answer: string; stage?: string }[], stage: string) => {
    console.log("🟢 [Finalize 1] Called. history length:", history.length, "stage:", stage);
    setIsFinalizing(true); // NEW
    try {
      // CHANGED: every question keeps ITS OWN stage
      const fullTranscript = history.map(h => ({
        stage: h.stage ?? stage,
        question: h.question,
        answer: h.answer,
      }));
      console.log("🟢 [Finalize 2] Calling analyzeHRInterviewResult...");
      const resultData = await analyzeHRInterviewResult({
        candidateName: resumeAnalysis?.personalInfo?.fullName || user?.displayName || "Candidate",
        role: hrRole,
        targetCompany: hrCompany,
        resumeSummary: resumeAnalysis?.summary || "",
        transcript: fullTranscript,
        userId: user?.uid,
        sessionId: journey?.sessionId,
      });
      console.log("🟢 [Finalize 3] Got resultData:", resultData);
      if (journeyRef) {
        console.log("🟢 [Finalize 4] Writing to Firestore...");
        await updateDoc(journeyRef, {
          specialHRResult: resultData,
          specialHRResultAt: serverTimestamp(),
        });
        console.log("🟢 [Finalize 5] Firestore write done");
      } else {
        console.log("🔴 [Finalize] journeyRef is null!");
      }
      console.log("🟢 [Finalize 6] Navigating to result page...");
      router.push('/special-hr-interview-result');
      console.log("🟢 [Finalize 7] router.push called");
    } catch (err: any) {
      console.error("🔴 [Finalize Error]", err?.message || err, err);
      setIsFinalizing(false); // NEW
      toast({ variant: "destructive", title: "Unable to Generate Results" });
    }
  }, [resumeAnalysis, journey, journeyRef, user, router, toast, hrRole, hrCompany]);

  const handleSubmitAnswer = (answer: string) => {
    if (answerSubmissionPendingRef.current || !answer.trim()) return;
    answerSubmissionPendingRef.current = true;
    stopListening();
    processNextTurn(answer);
  };
  // NEW: keep the ref pointing at the latest version on every render
  handleSubmitAnswerRef.current = handleSubmitAnswer;

  const processNextTurn = async (userAnswer: string, forceStart = false) => {
    if (isProcessingRef.current || (!interviewStartedRef.current && !forceStart)) return;
    setIsProcessing(true);
    isProcessingRef.current = true;
    answerSubmissionPendingRef.current = false;
    try {
      const nextIndex = questionIndex + (userAnswer ? 1 : 0);
      // CHANGED: also store the stage of the question that was just answered
      const history = userAnswer
        ? [...conversationHistory, { question: currentQuestion, answer: userAnswer, stage: interviewStage }]
        : conversationHistory;
      if (userAnswer) setConversationHistory(history);
      const result: AiMockInterviewOutput = await aiMockInterview({
        role: hrRole,
        experienceLevel: hrExperience,
        roundType: "Special HR Interview",
        currentMainQuestionIndex: nextIndex,
        history: history,
        userAnswer: userAnswer,
        targetCompany: hrCompany,
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
      liveTranscriptRef.current = ""; // NEW
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
    console.log("🟢 [1] startInterview called. status =", status, "already started?", interviewStartedRef.current);
    if (status !== "READY" || interviewStartedRef.current) {
      console.log("🔴 [ABORT] not ready or already started, aborting");
      return;
    }
    // लगेच ref सेट कर — जेणेकरून पुढचे क्लिक्स इथेच थांबतील, नवीन overlapping call सुरू होणार नाही
    interviewStartedRef.current = true;

    console.log("🟢 [2] Calling handleEnableAudio...");
    await handleEnableAudio();
    console.log("🟢 [3] handleEnableAudio done");
    setInterviewStarted(true);
    console.log("🟢 [4] setInterviewStarted(true) called");
    await processNextTurn("", true);
    console.log("🟢 [5] processNextTurn done");
  };

  const stopInterview = async () => {
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

  // user self-view camera. Video only (audio: false) — the microphone is already
  // used by SpeechRecognition, so we never open a second audio capture. Nothing is
  // recorded, uploaded or stored; the stream is stopped when the interview ends/unmounts.
  useEffect(() => {
    if (!interviewStarted || isComplete) return;
    let cancelled = false;
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus("DENIED");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        const video = userVideoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play().catch(() => {});
        }
        setCameraStatus("ON");
      } catch (err) {
        console.warn("🟠 [Camera] unavailable or permission denied:", err);
        if (!cancelled) setCameraStatus("DENIED");
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach(track => track.stop());
      setCameraStatus("IDLE");
    };
  }, [interviewStarted, isComplete]);

  return (
    <div className={cn("min-h-screen bg-[#07070b] flex flex-col relative overflow-hidden", interviewStarted && "h-screen w-screen")}>
      <div className="particles-bg" />
      <main className={cn("flex-1 relative flex flex-col items-center justify-center", interviewStarted ? "h-screen w-screen p-0 m-0" : "container mx-auto px-6 pt-32 pb-16")}>
        <div className={cn("bg-black overflow-hidden relative", interviewStarted ? "fixed inset-0 z-0 w-screen h-screen" : "w-full max-w-4xl aspect-[16/10] rounded-[3rem] border border-amber-400/20 shadow-[0_0_80px_rgba(245,196,81,0.08)] z-10")}>
          <video ref={agentVideoRef} autoPlay playsInline muted className={cn("w-full h-full bg-black z-10", interviewStarted ? "object-cover" : "object-contain")} />
          {status !== "READY" && <div className="absolute inset-0 z-[15] bg-[#07070b] pointer-events-none" />}
          {!interviewStarted && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center bg-[#07070b]/40 backdrop-blur-sm">
              {status === "READY" && (
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber-300">Premium · Special HR</span>
                </div>
              )}
              <AnimatePresence mode="wait">
                {status === "LOADING" ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-2 border-amber-400/20 rounded-full animate-ping" />
                        <Loader2 className="w-full h-full text-amber-400 animate-spin" />
                     </div>
                     <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-amber-300 animate-pulse">Connecting to Your Interviewer</p>
                  </motion.div>
                ) : status === "READY" ? (
                  <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                     <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-500/60 shadow-[0_0_50px_rgba(245,196,81,0.28)]">
                       <ShieldCheck className="w-10 h-10 text-amber-300" />
                     </div>
                     <h3 className={cn(serif.className, "mt-6 text-4xl font-medium tracking-tight text-white")}>You&apos;re ready.</h3>
                     <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#b4aea0]">This interview will feel like a real video interview. Take a breath and answer naturally.</p>

                     <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                       {[hrCompany, hrRole, hrExperience].map((chip) => (
                         <span key={chip} className="rounded-full border border-amber-900/70 bg-amber-400/10 px-3.5 py-1.5 text-xs text-amber-200">{chip}</span>
                       ))}
                     </div>

                     <div className="mt-6 mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-stone-400">
                       <span className="flex items-center gap-2"><Video className="w-4 h-4 text-amber-300" />Keep your camera on</span>
                       <span className="flex items-center gap-2"><Mic className="w-4 h-4 text-amber-300" />Allow your mic</span>
                       <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-amber-300" />Find a quiet place</span>
                     </div>

                     <Button onClick={startInterview} className="h-16 px-11 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-[15px] font-semibold text-[#1a1204] shadow-[0_10px_40px_rgba(245,196,81,0.35)] hover:brightness-110 hover:scale-[1.03] transition-all">
                       Start HR interview <Play className="ml-3 w-4 h-4 fill-current" />
                     </Button>
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
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-xl pointer-events-auto mb-12 ml-[360px] mr-auto 2xl:mx-auto">
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
                     <Button variant="ghost" onClick={stopInterview} className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-1.5">
                       <X className="w-3.5 h-3.5" /> End Session
                     </Button>
                  </div>
                  <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><Badge variant="outline" className="text-accent text-[8px] uppercase">Turn {questionIndex}</Badge></div>
                      <div className="p-6 glass rounded-3xl border-accent/20 bg-accent/5"><h4 className="text-xl font-medium text-white leading-relaxed">{currentQuestion || "Preparing..."}</h4></div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">
                          {isTypeMode ? "Type Your Answer" : "Or type your answer instead"}
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const next = !isTypeMode;
                            setIsTypeMode(next);
                            isTypeModeRef.current = next;
                            if (next) stopListening();
                          }}
                          className="h-7 px-3 text-[8px] font-black uppercase tracking-widest text-accent/70 hover:text-accent"
                        >
                          <Keyboard className="w-3 h-3 mr-1.5" />
                          {isTypeMode ? "Use Voice" : "Type Instead"}
                        </Button>
                      </div>

                      {isTypeMode && (
                        <div className="space-y-2">
                          <Textarea
                            value={typedAnswer}
                            onChange={(e) => setTypedAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            className="min-h-[100px] rounded-xl glass border-white/10 bg-transparent p-3 text-sm font-light resize-none focus:border-accent/50 transition-all"
                          />
                          <Button
                            onClick={() => {
                              if (typedAnswer.trim()) {
                                handleSubmitAnswer(typedAnswer.trim());
                                setTypedAnswer("");
                              }
                            }}
                            disabled={isProcessing || !typedAnswer.trim()}
                            className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest bg-accent/20 text-accent border border-accent/30 hover:bg-accent hover:text-black transition-all"
                          >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Answer <Send className="w-3.5 h-3.5 ml-1.5" /></>}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* small self-view camera box (bottom-left). Local preview only. */}
            {!isComplete && (
              <div
                className={cn(
                  "absolute left-6 bottom-1 z-[60] w-[240px] h-[188px] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border-2 transition-colors duration-500",
                  isListening ? "border-green-500/70" : "border-white/20"
                )}
              >
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn("w-full h-full object-cover scale-x-[-1]", cameraStatus !== "ON" && "hidden")}
                />
                {cameraStatus !== "ON" && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/60">
                    {cameraStatus === "DENIED" ? (
                      <>
                        <VideoOff className="w-7 h-7" />
                        <span className="text-[10px] font-bold text-center px-4 leading-snug">Camera is off. Allow camera access in your browser to show yourself here.</span>
                      </>
                    ) : (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    )}
                  </div>
                )}
                {cameraStatus === "ON" && (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Live</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/75 to-transparent">
                  <span className="text-[11px] font-bold text-white">You</span>
                  <span className={cn("flex items-end gap-0.5 h-3.5", isListening && "animate-pulse")}>
                    <span className="w-[3px] h-1.5 rounded-sm bg-green-400" />
                    <span className="w-[3px] h-3 rounded-sm bg-green-400" />
                    <span className="w-[3px] h-2 rounded-sm bg-green-400" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* NEW: shown while the report is being generated, until the result page opens */}
      {isFinalizing && (
        <div className="fixed inset-0 z-[100] bg-[#07070b] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-amber-300 animate-pulse">
            Generating your report...
          </p>
        </div>
      )}
    </div>
  );
}
