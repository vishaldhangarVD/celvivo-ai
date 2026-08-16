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
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
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
  Lock,
  ArrowRight
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { generateAptitudeTest } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AptitudeEnginePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // Map: index -> optionIndex
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [warnings, setWarnings] = useState(0);

  const initGuard = useRef(false);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  // Persistence Logic: Load or Generate
  useEffect(() => {
    async function init() {
      if (!db || !user?.uid || !journeyRef || initGuard.current) return;
      
      const snap = await getDoc(journeyRef);
      if (!snap.exists()) {
        router.push('/interview');
        return;
      }
      
      const data = snap.data();
      
      // Check if session already has questions
      if (data.aptitudeQuestions && data.aptitudeQuestions.length > 0) {
        setQuestions(data.aptitudeQuestions);
        setAnswers(data.aptitudeAnswers || {});
        setCurrentIdx(data.aptitudeCurrentIndex || 0);
        setTimeLeft(data.aptitudeTimeLeft ?? 45 * 60);
        if (data.aptitudeReport) {
          setResult(data.aptitudeReport);
        }
        setIsInitializing(false);
        initGuard.current = true;
        return;
      }

      // Generate New Session
      initGuard.current = true;
      try {
        const response = await generateAptitudeTest({
          role: data.role,
          company: data.company,
          experienceLevel: data.experience,
        });
        
        const freshQuestions = response.questions;
        setQuestions(freshQuestions);
        
        await updateDoc(journeyRef, {
          aptitudeQuestions: freshQuestions,
          aptitudeAnswers: {},
          aptitudeCurrentIndex: 0,
          aptitudeTimeLeft: 45 * 60,
          updatedAt: serverTimestamp()
        });

      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Neural Sync Error", description: "Failed to calibrate assessment nodes." });
      } finally {
        setIsInitializing(false);
      }
    }
    
    if (!journeyLoading && journey) {
      init();
    }
  }, [db, user?.uid, journey, journeyLoading, journeyRef, router, toast]);

  const handleSubmit = useCallback(async () => {
    if (isEvaluating || !journey || !journeyRef || result) return;
    setIsEvaluating(true);

    // DETERMINISTIC SCORE CALCULATION
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
        isCorrect: isCorrect
      };
    });

    const finalNumericScore = Math.round((correctCount / questions.length) * 100);

    const steps = [
      "Analyzing logical reasoning...",
      "Analyzing analytical thinking...",
      "Analyzing quantitative ability...",
      "Calculating enterprise readiness..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setEvaluationStep(i);
      await new Promise(r => setTimeout(r, 1200));
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

      // Override AI guessed score with real deterministic score
      report.overallScore = finalNumericScore;
      report.correctCount = correctCount;
      report.wrongCount = questions.length - correctCount;
      report.accuracy = finalNumericScore;

      setResult(report);
      
      await updateDoc(journeyRef, {
        aptitudeReport: report,
        currentStage: report.status === 'Pass' ? 'Coding Assessment' : 'Aptitude Assessment',
        step: report.status === 'Pass' ? 4 : 3,
        updatedAt: serverTimestamp()
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Audit Protocol Fault" });
    } finally {
      setIsEvaluating(false);
    }
  }, [isEvaluating, journey, journeyRef, questions, answers, timeLeft, result, toast]);

  // Sync state to Firestore on change
  const handleOptionSelect = async (optIdx: number) => {
    if (!journeyRef || result) return;
    const newAnswers = { ...answers, [currentIdx]: optIdx };
    setAnswers(newAnswers);
    updateDoc(journeyRef, { 
      aptitudeAnswers: newAnswers,
      updatedAt: serverTimestamp() 
    });
  };

  const handleNav = (newIdx: number) => {
    if (!journeyRef || result) return;
    setCurrentIdx(newIdx);
    updateDoc(journeyRef, { aptitudeCurrentIndex: newIdx });
  };

  useEffect(() => {
    if (isInitializing || isEvaluating || result) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 1);
        // Periodically sync time to Firestore (every 30s)
        if (next % 30 === 0 && journeyRef) {
          updateDoc(journeyRef, { aptitudeTimeLeft: next });
        }
        return next;
      });
    }, 1000);

    const handleVisibility = () => {
      if (document.hidden && !result) {
        setWarnings(prev => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isInitializing, isEvaluating, result, journeyRef]);

  useEffect(() => {
    if (warnings > 0 && !result && !isEvaluating) {
      if (warnings >= 4) {
        handleSubmit();
        toast({ 
          variant: "destructive", 
          title: "Security Breach", 
          description: "Automated submission triggered due to multiple tab switches." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: `Warning ${warnings}/3`, 
          description: "Unauthorized tab switch detected. High-fidelity monitoring is active." 
        });
      }
    }
  }, [warnings, handleSubmit, result, isEvaluating, toast]);

  useEffect(() => {
    if (timeLeft <= 0 && !isInitializing && !isEvaluating && !result) {
      handleSubmit();
    }
  }, [timeLeft, isInitializing, isEvaluating, result, handleSubmit]);

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSkipToInterview = () => {
    if (!journey?.sessionId) return;
    router.push(`/interview/${journey.sessionId}?role=${encodeURIComponent(journey.role)}&company=${encodeURIComponent(journey.company)}&exp=${encodeURIComponent(journey.experience)}&round=HR%20Round`);
  };

  if (isInitializing || journeyLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-premium">Synthesizing Aptitude Nodes</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Calibrating for {journey?.company} Protocol</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative">
      <div className="particles-bg" />
      <Navbar />

      {!result && !isEvaluating && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="fixed right-0 top-1/2 -translate-y-1/2 z-[60]">
          <Button onClick={handleSkipToInterview} className="h-12 px-5 rounded-l-2xl rounded-r-none btn-premium text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 border-r-0">
            SKIP <ArrowRight className="w-3.5 h-3.5" /> INTERVIEW
          </Button>
        </motion.div>
      )}

      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">{journey?.company} APTITUDE ENGINE</h1>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{journey?.role} • SESSION ACTIVE</p>
          </div>
        </div>
        {!result && (
          <div className={cn("px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums", timeLeft < 60 ? "text-red-500 animate-pulse" : "text-accent")}>
            {formatTime(timeLeft)}
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!result && !isEvaluating ? (
            <div className="grid lg:grid-cols-12 gap-6">
              <motion.div key="arena" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="lg:col-span-9 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span>Node {currentIdx + 1} of {questions.length}</span>
                    <span className="text-accent">Progress: {Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
                  </div>
                  <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-1 bg-white/5" />
                </div>

                <Card className="premium-card bg-white/[0.01] border-white/5 p-12 min-h-[450px] relative">
                  <div className="absolute top-0 right-0 p-8">
                    <Badge variant="outline" className="border-accent/20 text-accent text-[9px] font-black uppercase">{questions[currentIdx]?.difficulty}</Badge>
                  </div>
                  
                  <div className="max-w-3xl mx-auto w-full space-y-12">
                    <div className="space-y-4">
                      <Badge className="bg-purple-500/10 text-purple-400 border-none text-[10px] font-black uppercase">{questions[currentIdx]?.category}</Badge>
                      <h2 className="text-3xl font-bold tracking-tight text-white/90 leading-tight">{questions[currentIdx]?.question}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {questions[currentIdx]?.options.map((opt: string, i: number) => (
                        <button key={i} onClick={() => handleOptionSelect(i)} className={cn("p-6 rounded-2xl border text-left transition-all group", answers[currentIdx] === i ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "glass border-white/5 hover:border-white/20 text-white/60")}>
                          <div className="flex items-center gap-4">
                            <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black", answers[currentIdx] === i ? "bg-accent border-accent text-black" : "border-white/10 group-hover:border-white/30")}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="text-sm font-medium">{opt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="h-24 glass rounded-[2.5rem] border-white/5 p-4 flex items-center justify-between">
                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => handleNav(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0} className="h-16 px-8 rounded-2xl glass border-white/10 text-[10px] font-black uppercase"><ChevronLeft className="w-4 h-4 mr-2" /> Previous</Button>
                    <Button variant="ghost" onClick={toggleMarkForReview} className={cn("h-16 px-8 rounded-2xl glass border-white/10 text-[10px] font-black uppercase", markedForReview.has(currentIdx) && "bg-orange-500/10 text-orange-400")}>Mark for Review</Button>
                  </div>
                  <div className="flex gap-4">
                    {currentIdx < questions.length - 1 ? (
                      <Button onClick={() => handleNav(Math.min(questions.length - 1, currentIdx + 1))} className="h-16 px-12 btn-premium rounded-2xl text-[10px] font-black uppercase">Save & Next <ChevronRight className="ml-2 w-4 h-4" /></Button>
                    ) : (
                      <Button onClick={handleSubmit} className="h-16 px-12 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">Submit Assessment <ShieldCheck className="ml-2 w-4 h-4" /></Button>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="lg:col-span-3 space-y-6">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-8 sticky top-24">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3"><LayoutGrid className="w-4 h-4" /> Node Palette</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {questions.map((_, i) => (
                      <button key={i} onClick={() => handleNav(i)} className={cn("w-full aspect-square rounded-xl border text-[10px] font-black transition-all", currentIdx === i ? "bg-accent border-accent text-black scale-110" : markedForReview.has(i) ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : answers[i] !== undefined ? "bg-green-500/20 border-green-500/40 text-green-400" : "glass border-white/5 text-white/20")}>{i + 1}</button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : isEvaluating ? (
            <motion.div key="evaluating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 text-center h-[600px]">
              <div className="relative mb-12">
                <div className="w-32 h-32 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-6 max-w-md w-full">
                <h2 className="text-4xl font-bold tracking-tighter text-premium">AI Audit Active</h2>
                <Progress value={(evaluationStep + 1) * 25} className="h-1" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">
                  {["Analyzing logic nodes...", "Auditing precision...", "Calculating scores...", "Finalizing dossier..."][evaluationStep]}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <Card className="premium-card p-12 flex flex-col items-center text-center space-y-10 bg-white/[0.01] border-white/5">
                <div className="absolute top-0 right-0 p-12">
                  <Badge className={cn("px-8 py-3 rounded-2xl font-black text-xs border-none", result.status === 'Pass' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>STATUS: {result.status.toUpperCase()}</Badge>
                </div>
                <div className="text-[100px] font-black tracking-tighter text-premium tabular-nums">{result.overallScore}%</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl pt-8 border-t border-white/5">
                  {[
                    { label: "Accuracy", val: `${result.accuracy}%`, icon: Target, color: "text-blue-400" },
                    { label: "Correct", val: result.correctCount, icon: CheckCircle2, color: "text-green-400" },
                    { label: "Time", val: formatTime((45 * 60) - timeLeft), icon: Clock, color: "text-purple-400" },
                    { label: "Result", val: result.status, icon: Award, color: "text-accent" }
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/30"><s.icon className={cn("w-4 h-4", s.color)} /> {s.label}</div>
                      <p className="text-xl font-bold">{s.val}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-center pt-8">
                {result.status === 'Pass' ? (
                  <Button onClick={() => router.push('/interview/coding')} className="h-20 px-20 btn-premium rounded-[2rem] text-xl font-black uppercase tracking-[0.3em] shadow-2xl">Enter Syntax Matrix <ChevronRight className="ml-4 w-7 h-7" /></Button>
                ) : (
                  <Button onClick={() => window.location.reload()} className="h-20 px-12 glass border-white/10 rounded-[2rem] text-xl font-black uppercase tracking-widest"><RotateCcw className="mr-4 w-7 h-7" /> Re-initialize Assessment</Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <NavigationControls onHome={() => router.push('/')} />
    </div>
  );
}
