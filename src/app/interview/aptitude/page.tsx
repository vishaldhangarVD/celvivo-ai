
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Command, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Cpu,
  Brain,
  Zap,
  Activity,
  Award,
  RotateCcw,
  LayoutGrid,
  Trophy,
  Target,
  XCircle,
  ArrowRight,
  Timer
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, arrayUnion } from 'firebase/firestore';
import { generateAptitudeTest, type AptitudeQuestion } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const FORBIDDEN_CONCEPTS = [
  "velocity doubles",
  "growth doubles",
  "doubles every",
  "triples every",
  "25% complete", 
  "percentage completion",
  "missing information",
];

function normalizeQuestion(text: string): { fingerprint: string; pattern: string } {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ")    // Normalize whitespace
    .trim();
  
  const pattern = clean.replace(/\d+/g, "X"); // Replace numbers with X to detect templates
  return { fingerprint: clean, pattern };
}

function validateAptitudeQuestion(q: any): boolean {
  if (!q.question || q.question.trim().length < 20) return false;
  if (!q.options || q.options.length !== 4) return false;
  
  const uniqueOpts = new Set(q.options.map((o: any) => String(o).trim().toLowerCase()));
  if (uniqueOpts.size !== 4) return false;

  if (q.correctOptionIndex < 0 || q.correctOptionIndex > 3) return false;
  if (!q.options[q.correctOptionIndex]) return false;

  const { fingerprint } = normalizeQuestion(q.question);
  for (const concept of FORBIDDEN_CONCEPTS) {
    if (fingerprint.includes(concept)) return false;
  }

  return true;
}

export default function AptitudeEnginePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  const initGuard = useRef(false);
  const submissionGuard = useRef(false);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  useEffect(() => {
    async function init() {
      if (!db || !user?.uid || !journeyRef || initGuard.current) return;
      initGuard.current = true;
      
      const snap = await getDoc(journeyRef);
      if (!snap.exists()) {
        router.push('/interview');
        return;
      }
      
      const data = snap.data();
      const existingQuestions = data.aptitudeQuestions || [];
      const isValidSet = existingQuestions.length === 20 && existingQuestions.every(validateAptitudeQuestion);

      if (isValidSet && data.aptitudeStatus === "in_progress") {
        console.log("[APTITUDE SESSION] Resuming active session:", data.sessionId);
        setQuestions(existingQuestions);
        setAnswers(data.aptitudeAnswers || {});
        setCurrentIdx(data.aptitudeCurrentIndex || 0);
        setTimeLeft(data.aptitudeTimeLeft ?? 45 * 60);
        setIsInitializing(false);
        return;
      }

      if (data.aptitudeStatus === "completed" && data.aptitudeReport) {
        setQuestions(existingQuestions);
        setAnswers(data.aptitudeAnswers || {});
        setResult(data.aptitudeReport);
        setIsInitializing(false);
        return;
      }

      try {
        console.log("[APTITUDE SESSION] Initializing new session for user:", user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const history = userSnap.data()?.aptitudeQuestionHistory || [];

        const response = await generateAptitudeTest({
          role: data.role,
          company: data.company,
          experienceLevel: data.experience,
          usedQuestionFingerprints: history
        });
        
        const freshQuestions = response.questions;
        const newEncounterData = freshQuestions.map(q => {
          const norm = normalizeQuestion(q.question);
          return norm.fingerprint;
        });
        
        await updateDoc(journeyRef, {
          aptitudeQuestions: freshQuestions,
          aptitudeAnswers: {},
          aptitudeCurrentIndex: 0,
          aptitudeTimeLeft: 45 * 60,
          aptitudeStatus: "in_progress",
          aptitudeReport: null,
          updatedAt: serverTimestamp()
        });

        await updateDoc(userRef, {
          aptitudeQuestionHistory: arrayUnion(...newEncounterData)
        });

        setQuestions(freshQuestions);
        setIsInitializing(false);
      } catch (e: any) {
        console.error("[APTITUDE SESSION] Initialization fault:", e);
        toast({ variant: "destructive", title: "Synthesis Error", description: "Assessment calibration failure." });
        setIsInitializing(false);
      }
    }
    
    if (!journeyLoading && journey) {
      init();
    }
  }, [db, user?.uid, journey, journeyLoading, journeyRef, router, toast]);

  const handleSubmit = useCallback(async () => {
    if (submissionGuard.current || isEvaluating || !journey || !journeyRef || result) return;
    submissionGuard.current = true;
    setIsEvaluating(true);

    let correctCount = 0;
    const formattedResults = questions.map((q, idx) => {
      const userSelectedIdx = answers[idx];
      const isCorrect = userSelectedIdx === q.correctOptionIndex;
      if (isCorrect) correctCount++;
      
      return {
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        userAnswer: userSelectedIdx !== undefined ? q.options[userSelectedIdx] : "Not Answered",
        correctAnswer: q.options[q.correctOptionIndex],
        isCorrect: isCorrect,
      };
    });

    const finalNumericScore = Math.round((correctCount / questions.length) * 100);
    const steps = ["Auditing Quantitative Accuracy...", "Mapping Logical Consistency...", "Verbal Capability Synthesis...", "Finalizing Performance Dossier..."];
    
    for (let i = 0; i < steps.length; i++) {
      setEvaluationStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const report = await evaluateAptitude({
        role: journey.role,
        company: journey.company,
        experienceLevel: journey.experience,
        timeTakenSeconds: (45 * 60) - timeLeft,
        totalQuestions: questions.length,
        results: formattedResults
      });

      const finalReport = {
        ...report,
        overallScore: finalNumericScore,
        correctCount,
        wrongCount: questions.length - correctCount,
        accuracy: finalNumericScore,
        status: finalNumericScore >= 60 ? 'Pass' : 'Fail'
      };

      setResult(finalReport);
      
      await updateDoc(journeyRef!, {
        aptitudeReport: finalReport,
        aptitudeStatus: "completed",
        currentStage: finalReport.status === 'Pass' ? 'Coding Assessment' : 'Aptitude Assessment',
        step: 3,
        updatedAt: serverTimestamp()
      });

    } catch (e) {
      console.error("[APTITUDE SESSION] Submission fault:", e);
      toast({ variant: "destructive", title: "Audit Protocol Fault" });
    } finally {
      setIsEvaluating(false);
    }
  }, [isEvaluating, journey, journeyRef, questions, answers, timeLeft, result, toast]);

  const handleOptionSelect = async (optIdx: number) => {
    if (!journeyRef || result) return;
    const newAnswers = { ...answers, [currentIdx]: optIdx };
    setAnswers(newAnswers);
    updateDoc(journeyRef, { aptitudeAnswers: newAnswers });
  };

  const handleNav = (newIdx: number) => {
    if (!journeyRef || result) return;
    setCurrentIdx(newIdx);
    updateDoc(journeyRef, { aptitudeCurrentIndex: newIdx });
  };

  const handleRetry = async () => {
    if (!journeyRef || !user) return;
    setIsInitializing(true);
    initGuard.current = false;
    await updateDoc(journeyRef, {
      aptitudeQuestions: null,
      aptitudeAnswers: null,
      aptitudeCurrentIndex: 0,
      aptitudeStatus: "not_started",
      aptitudeReport: null
    });
    window.location.reload();
  };

  useEffect(() => {
    if (isInitializing || isEvaluating || result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        const next = prev - 1;
        if (next % 30 === 0 && journeyRef) updateDoc(journeyRef, { aptitudeTimeLeft: next });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, isEvaluating, result, journeyRef, handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isInitializing || journeyLoading) {
    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-premium uppercase">Synthesizing Unique Nodes</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
            Personalizing Environment for {journey?.company || "Standard Tech"}
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !result && !isEvaluating) {
     return (
       <div className="h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center">
         <XCircle className="w-16 h-16 text-red-500 mb-6" />
         <h2 className="text-2xl font-bold text-white mb-2">Protocol Desynchronization</h2>
         <p className="text-muted-foreground mb-8 text-sm max-w-md">System failed to load unique questions. Please restart the session.</p>
         <Button onClick={handleRetry} className="btn-premium px-12 h-14 uppercase tracking-widest text-xs">Restart Session</Button>
       </div>
     );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-y-auto custom-scrollbar">
      <div className="particles-bg" />
      <Navbar />

      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">{journey?.company || "Standard Tech"} COGNITIVE AUDIT</h1>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{journey?.role || "Protocol"} • SESSION ACTIVE</p>
          </div>
        </div>
        {!result && (
          <div className={cn("px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums", timeLeft < 300 ? "text-red-500 animate-pulse" : "text-accent")}>
            <Timer className="w-5 h-5 inline-block mr-2" /> {formatTime(timeLeft)}
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-6 pt-12 pb-16">
        <AnimatePresence mode="wait">
          {!result && !isEvaluating ? (
            <div className="grid lg:grid-cols-12 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-9 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span>Question {currentIdx + 1} of {questions.length}</span>
                    <span className="text-accent">{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
                  </div>
                  <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-1 bg-white/5" />
                </div>

                <Card className="premium-card bg-white/[0.01] border-white/5 p-12 min-h-[480px] relative flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-8">
                    <Badge variant="outline" className="border-accent/20 text-accent text-[9px] font-black uppercase px-3">{currentQ?.difficulty || "Medium"}</Badge>
                  </div>
                  
                  <div className="max-w-3xl mx-auto w-full space-y-10">
                    <div className="space-y-4">
                      <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase tracking-widest">{currentQ?.category || "Logic"}</Badge>
                      <h2 className="text-3xl font-bold tracking-tight text-white/90 leading-tight whitespace-pre-wrap">{currentQ?.question}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {currentQ?.options?.map((opt, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleOptionSelect(i)} 
                          className={cn("p-6 rounded-2xl border text-left transition-all group flex items-center gap-6", 
                          answers[currentIdx] === i ? "bg-accent/20 border-accent text-accent shadow-[0_0_30px_rgba(34,211,238,0.1)]" : "glass border-white/5 hover:border-white/20 text-white/60")}
                        >
                          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black shrink-0", 
                            answers[currentIdx] === i ? "bg-accent border-accent text-black" : "border-white/10 group-hover:border-white/30")}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-sm font-medium leading-relaxed">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="h-24 glass rounded-[2.5rem] border-white/5 p-4 flex items-center justify-between shadow-2xl">
                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => handleNav(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0} className="h-16 px-8 rounded-2xl glass border-white/10 text-[10px] font-black uppercase"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button variant="ghost" onClick={() => setMarkedForReview(prev => { const n = new Set(prev); n.has(currentIdx) ? n.delete(currentIdx) : n.add(currentIdx); return n; })} className={cn("h-16 px-8 rounded-2xl glass border-white/10 text-[10px] font-black uppercase", markedForReview.has(currentIdx) && "bg-orange-500/10 text-orange-400")}>Review Later</Button>
                  </div>
                  <div className="flex gap-4">
                    {currentIdx < questions.length - 1 ? (
                      <Button onClick={() => handleNav(Math.min(questions.length - 1, currentIdx + 1))} className="h-16 px-12 btn-premium rounded-2xl text-[10px] font-black uppercase">Commit & Next <ChevronRight className="ml-2 w-4 h-4" /></Button>
                    ) : (
                      <Button onClick={handleSubmit} className="h-16 px-12 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg group">Submit Audit <ShieldCheck className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" /></Button>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="lg:col-span-3">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-8 sticky top-32">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3"><LayoutGrid className="w-4 h-4" /> Node Matrix</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {questions.map((_, i) => (
                      <button key={i} onClick={() => handleNav(i)} className={cn("w-full aspect-square rounded-xl border text-[10px] font-black transition-all", currentIdx === i ? "bg-accent border-accent text-black scale-110" : markedForReview.has(i) ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : answers[i] !== undefined ? "bg-green-500/20 border-green-500/40 text-green-400" : "glass border-white/5 text-white/20")}>{i + 1}</button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : isEvaluating ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 text-center min-h-[600px]">
              <div className="relative mb-16">
                <div className="w-40 h-40 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-8 max-w-lg w-full">
                <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">AI Performance Audit</h2>
                <div className="space-y-4">
                   <Progress value={(evaluationStep + 1) * 25} className="h-1.5" />
                   <p className="text-[10px] font-black uppercase tracking-[0.6em] text-accent animate-pulse">{["Processing Nodes", "Mapping Logic", "Calibrating Score", "Finalizing Audit"][evaluationStep]}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
              <Card className="premium-card p-16 flex flex-col items-center text-center space-y-12 bg-white/[0.01] border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12">
                  <Badge className={cn("px-10 py-4 rounded-2xl font-black tracking-[0.4em] text-xs border-none", result.status === 'Pass' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>STATUS: {result.status.toUpperCase()}</Badge>
                </div>
                <div className="relative">
                   <div className="text-[140px] font-black tracking-tighter text-premium tabular-nums leading-none drop-shadow-[0_0_60px_rgba(34,211,238,0.2)]">{result.overallScore}%</div>
                   <p className="text-[11px] font-black uppercase tracking-[0.8em] text-accent mt-4">Cognitive Precision Index</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-5xl pt-12 border-t border-white/5">
                  {[
                    { label: "Correct Nodes", val: result.correctCount, icon: CheckCircle2, color: "text-green-400" },
                    { label: "Failed Probes", val: result.wrongCount, icon: XCircle, color: "text-red-400" },
                    { label: "Total Probes", val: questions.length, icon: Timer, color: "text-purple-400" },
                    { label: "Verification", val: result.status, icon: ShieldCheck, color: "text-accent" }
                  ].map((s, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase text-white/30"><s.icon className={cn("w-4 h-4", s.color)} /> {s.label}</div>
                      <p className="text-3xl font-bold text-white/90">{s.val}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-center gap-6 pt-8">
                {result.status === 'Pass' ? (
                  <Button onClick={() => journey?.sessionId && router.push(`/interview/${journey.sessionId}?role=${encodeURIComponent(journey.role)}&company=${encodeURIComponent(journey.company)}&exp=${encodeURIComponent(journey.experience)}&round=HR%20Round`)} className="h-20 px-24 btn-premium rounded-[2.5rem] text-xl font-black uppercase tracking-[0.4em] shadow-2xl group">Proceed to Arena <ChevronRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" /></Button>
                ) : (
                  <Button onClick={handleRetry} className="h-20 px-16 glass border-white/10 rounded-[2.5rem] text-xl font-black uppercase tracking-widest hover:bg-white/5"><RotateCcw className="mr-4 w-8 h-8" /> Re-initialize Assessment</Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <NavigationControls onHome={() => router.push('/')} onBack={() => router.push('/dashboard')} />
    </div>
  );
}

