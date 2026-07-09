"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  Send,
  Mic,
  Settings,
  Timer,
  ShieldCheck,
  Command,
  LogOut,
  Zap,
} from "lucide-react";

import {
  aiMockInterview,
  type AiMockInterviewOutput,
} from "@/ai/flows/ai-mock-interview-v2";

import { useUser, useFirestore, useCollection } from "@/firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

const TOTAL_QUESTIONS = 9;
const QUESTION_TIMEOUT = 120;

function InterviewSessionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { user } = useUser();
  const db = useFirestore();

  const role = searchParams.get("role") || "Software Engineer";
  const exp = searchParams.get("exp") || "Senior";
  const round = searchParams.get("round") || "Technical";
  const company = searchParams.get("company") || "Standard";
  const debugEnabled = searchParams.get("debug") === "true";

  const [currentIdx, setCurrentIdx] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [nextOutput, setNextOutput] = useState<AiMockInterviewOutput | null>(null);

  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [candidateStrengths, setCandidateStrengths] = useState<string[]>([]);
  const [candidateWeaknesses, setCandidateWeaknesses] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");

  const [interviewStage, setInterviewStage] = useState<
    | "INTRODUCTION" | "RESUME" | "PROJECT" | "TECHNICAL" | "SCENARIO" | "FOLLOW UP" | "BEHAVIOUR" | "RAPID FIRE" | "CLOSING"
  >("INTRODUCTION");

  const [userAnswer, setUserAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeReady, setResumeReady] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(QUESTION_TIMEOUT);
  const [totalTimer, setTotalTimer] = useState(0);

  const [cachedAnalysis, setCachedAnalysis] = useState<any>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("resumeAnalysis");
    if (stored) {
      try {
        setCachedAnalysis(JSON.parse(stored));
        setResumeReady(true);
      } catch (e) { console.error(e); }
    }
  }, []);

  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "resumes"), orderBy("createdAt", "desc"), limit(1));
  }, [db, user]);

  const { data: resumes, loading: resumesLoading } = useCollection(resumeQuery);

  useEffect(() => {
    if (!resumeReady && !resumesLoading) setResumeReady(true);
  }, [resumeReady, resumesLoading]);

  const resumeContext = useMemo(() => {
    const r = cachedAnalysis || resumes?.[0];
    if (!r) return undefined;
    const analysis = (r as any).analysis || r;
    return {
      skills: analysis.skillAnalysis?.map((x: any) => x.skill) || [],
      projects: analysis.sections?.projects || [],
      experienceSummary: analysis.sections?.experience?.[0] || "",
    };
  }, [cachedAnalysis, resumes]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onstart = () => setIsListening(true);
    recog.onend = () => setIsListening(false);
    recog.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      transcriptRef.current = transcript;
      setUserAnswer(transcript);
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        recognitionRef.current?.stop();
        handleSend(transcriptRef.current);
      }, 2000);
    };
    recognitionRef.current = recog;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else {
      try { recognitionRef.current.start(); }
      catch (e) {}
    }
  };

  useEffect(() => {
    if (!resumeReady || nextOutput) return;
    const startInterview = async () => {
      try {
        const output = await aiMockInterview({
          role, experienceLevel: exp, roundType: round, targetCompany: company,
          currentMainQuestionIndex: 0, history: [], userAnswer: "",
          resumeSkills: resumeContext?.skills || [], resumeProjects: resumeContext?.projects || [],
          resumeSummary: resumeContext?.experienceSummary || "",
          debugMode: debugEnabled, interviewStage: "INTRODUCTION", difficultyLevel: "MEDIUM",
          askedQuestions: [], candidateStrengths: [], candidateWeaknesses: [],
        });
        setNextOutput(output);
      } catch (err) { console.error("Initial Error:", err); }
    };
    startInterview();
  }, [resumeReady]);

  const handleSend = async (answer?: string) => {
    const ans = answer ?? userAnswer;
    if (!ans.trim() || isProcessing) return;
    recognitionRef.current?.stop();
    setUserAnswer("");
    const turn = { question: nextOutput?.nextQuestion || "", answer: ans, feedback: nextOutput?.feedbackOnLastAnswer || null };
    const newHistory = [...history, turn];
    setHistory(newHistory);
    setCurrentIdx((i) => i + 1);
    setQuestionTimer(QUESTION_TIMEOUT);
    setIsProcessing(true);

    try {
      const output = await aiMockInterview({
        role, experienceLevel: exp, roundType: round, targetCompany: company,
        currentMainQuestionIndex: newHistory.length + 1, history: newHistory, userAnswer: ans,
        resumeSkills: [], resumeProjects: [], resumeSummary: "", debugMode: debugEnabled,
        interviewStage, difficultyLevel, askedQuestions, candidateStrengths, candidateWeaknesses,
      });
      setNextOutput(output);
      setInterviewStage(output.nextInterviewStage ?? interviewStage);
      setDifficultyLevel(output.difficultyAdjustment === "Harder" ? "HARD" : output.difficultyAdjustment === "Easier" ? "EASY" : "MEDIUM");
      setAskedQuestions(output.askedQuestions ?? []);
      setCandidateStrengths(output.candidateStrengths ?? []);
      setCandidateWeaknesses(output.candidateWeaknesses ?? []);
      if (output.isInterviewComplete) setIsComplete(true);
    } catch (err) { console.error(err); }
    finally { setIsProcessing(false); }
  };

  const finish = async () => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      const sanitizedHistory = history.map((turn) => ({ question: turn.question, answer: turn.answer, feedback: turn.feedback }));
      const docRef = await addDoc(collection(db, "users", user.uid, "interviews"), {
        userId: user.uid, role, experienceLevel: exp, round, targetCompany: company,
        history: sanitizedHistory, duration: totalTimer, createdAt: serverTimestamp(),
        overallScore: nextOutput?.overallScore ?? 0, finalRecommendation: nextOutput?.finalRecommendation ?? "",
        hiringDecision: nextOutput?.hiringDecision ?? "Borderline",
        candidateStrengths: nextOutput?.candidateStrengths ?? [],
        candidateWeaknesses: nextOutput?.candidateWeaknesses ?? [],
      });
      router.push(`/feedback/${docRef.id}`);
    } catch (e) { console.error(e); setIsSaving(false); }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-black/5 z-10 pointer-events-none" />
      <div className="relative z-20 flex flex-col h-full">
        {!resumeReady ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-cyan-400" /></div>
        ) : (
          <>
            <header className="px-10 py-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><Command className="w-6 h-6 text-white" /></div>
                <div>
                  <h1 className="text-white font-bold">{company} Simulation • {role}</h1>
                  <p className="text-cyan-400 text-xs uppercase tracking-widest">{round}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Timer className="w-4 h-4 text-cyan-400" />
                  <span className="text-white">{Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, "0")}</span>
                </div>
                <Button variant="ghost" onClick={() => router.push("/dashboard")}><LogOut className="w-4 h-4 mr-2" />Exit</Button>
              </div>
            </header>

            <AnimatePresence mode="wait">
              {!isComplete && nextOutput?.nextQuestion && (
                <motion.div key={currentIdx} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="fixed top-32 left-10 z-30 w-80">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-cyan-400 text-black">Question {currentIdx + 1}/{TOTAL_QUESTIONS}</Badge>
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                    <p className="text-white leading-7">{nextOutput.nextQuestion}</p>
                    <div className="mt-4">
                      <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-400/30 uppercase tracking-widest">{interviewStage}</Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <main className="flex-1 relative">
              <AnimatePresence>
                {isComplete && (
                  <div className="absolute inset-0 flex items-center justify-center z-50">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/70 backdrop-blur-2xl rounded-3xl p-12 text-center border border-cyan-500/30">
                      <ShieldCheck className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-white">Simulation Completed</h2>
                      <p className="text-white/60 mt-3">Neural analysis complete for {company} protocol.</p>
                      <Button onClick={finish} disabled={isSaving} className="mt-8">
                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "View Audit Feedback"}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </main>

            {!isComplete && (
              <div className="w-full max-w-5xl mx-auto pb-10 px-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-4 flex items-center gap-3">
                  <textarea value={userAnswer} onChange={(e)=>setUserAnswer(e.target.value)} rows={1} disabled={isProcessing} placeholder="Transmit your response..." className="flex-1 bg-transparent outline-none resize-none text-white px-4" />
                  <Button type="button" onClick={toggleListening} disabled={isProcessing} className="rounded-full w-12 h-12 p-0"><Mic className={isListening ? "text-red-500" : ""}/></Button>
                  <Button onClick={()=>handleSend()} disabled={isProcessing || !userAnswer.trim()} className="rounded-full w-12 h-12 p-0">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InterviewSession() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 animate-spin text-cyan-400" /></div>}>
      <InterviewSessionContent />
    </Suspense>
  );
}
