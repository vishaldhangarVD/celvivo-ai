"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
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
  Timer,
  History,
  Check,
  CircleCheck,
  AlertCircle
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, arrayUnion } from 'firebase/firestore';
import { generateAptitudeTest, type AptitudeQuestion } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';

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
    .replace(/[^\w\s]/g, "") 
    .replace(/\s+/g, " ")    
    .trim();
  
  const pattern = clean.replace(/\d+/g, "X"); 
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(1800); 

  const initGuard = useRef(false);
  const submissionGuard = useRef(false);
  const justSubmittedRef = useRef(false);
  const submitRef = useRef<() => Promise<void>>(null);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  useEffect(() => {
    async function init() {
      if (!db || !user?.uid || !journeyRef || initGuard.current || isSubmitting || justSubmittedRef.current) return;
      initGuard.current = true;
      
      try {
        const journeySnap = await getDoc(journeyRef);
        const data = journeySnap.data();
        
        if (!data) {
          router.push('/interview/setup');
          return;
        }
        
        if (data.aptitudeStatus === "completed" || data.currentStage === INTERVIEW_STAGES.APTITUDE_RESULT) {
          router.replace(STAGE_ROUTES.APTITUDE_RESULT);
          return;
        }

        const existingQuestions = data.aptitudeQuestions || [];
        const isValidSet = existingQuestions.length === 20 && existingQuestions.every(validateAptitudeQuestion);

        if (isValidSet && data.aptitudeStatus === "in_progress") {
          setQuestions(existingQuestions);
          setAnswers(data.aptitudeAnswers || {});
          setCurrentIdx(data.aptitudeCurrentIndex || 0);
          
          let endAt = data.aptitudeTimerEndAt;
          const localEndKey = `aptitude_timer_end_${user.uid}`;
          const localEndAt = localStorage.getItem(localEndKey);
          
          if (!endAt && localEndAt) {
            endAt = parseInt(localEndAt);
          } else if (endAt) {
            localStorage.setItem(localEndKey, endAt.toString());
          }

          if (endAt) {
            const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
            setTimeLeft(remaining);
          } else {
            const newEndAt = Date.now() + 30 * 60 * 1000;
            localStorage.setItem(localEndKey, newEndAt.toString());
            await updateDoc(journeyRef, { aptitudeTimerEndAt: newEndAt });
            setTimeLeft(1800);
          }

          setIsInitializing(false);
          return;
        }

        // GENERATE FRESH TEST
        localStorage.removeItem(`aptitude_timer_end_${user.uid}`); 
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const fullHistory = userSnap.data()?.aptitudeQuestionHistory || [];
        const history = fullHistory.slice(-150);

        const response = await generateAptitudeTest({
          role: data.role,
          company: data.company,
          experienceLevel: data.experience,
          usedQuestionFingerprints: history
        });
        
        const freshQuestions = response.questions;
        const newFingerprints = freshQuestions.map(q => {
          const norm = normalizeQuestion(q.question);
          return norm.fingerprint;
        });
        
        const endAt = Date.now() + 30 * 60 * 1000; 
        localStorage.setItem(`aptitude_timer_end_${user.uid}`, endAt.toString());
        
        await updateDoc(journeyRef, {
          aptitudeQuestions: freshQuestions,
          aptitudeAnswers: {},
          aptitudeCurrentIndex: 0,
          aptitudeTimerEndAt: endAt,
          aptitudeStatus: "in_progress",
          aptitudeReport: null,
          updatedAt: serverTimestamp(),
          currentStage: INTERVIEW_STAGES.APTITUDE
        });

        const updatedHistory = [...fullHistory, ...newFingerprints].slice(-300);
        await updateDoc(userRef, {
          aptitudeQuestionHistory: updatedHistory
        });

        setQuestions(freshQuestions);
        setTimeLeft(1800);
        setIsInitializing(false);
      } catch (e: any) {
        console.error("[APTITUDE SESSION] Initialization fault:", e);
        toast({ variant: "destructive", title: "Unable to prepare your test.", description: "A connection error occurred. Please refresh or try again later." });
        setIsInitializing(false);
        initGuard.current = false; // Allow retry on failure
      }
    }
    init();
  }, [db, user?.uid, journeyRef, router, toast, isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !journeyRef) return;
    
    setIsSubmitting(true);
    setIsEvaluating(true);
    setSubmissionError(null);

    if (user?.uid) {
      localStorage.removeItem(`aptitude_timer_end_${user.uid}`);
    }

    try {
      // STEP 0: Checking Answers
      setEvaluationStep(0);
      await new Promise(r => setTimeout(r, 400));
      
      let correctCount = 0;
      let notAnsweredCount = 0;

      const formattedResults = questions.map((q, idx) => {
        const userSelectedIdx = answers[idx];
        const isAnswered = userSelectedIdx !== undefined;
        
        if (!isAnswered) {
          notAnsweredCount++;
        }
        
        const isCorrect = isAnswered && userSelectedIdx === q.correctOptionIndex;
        if (isCorrect) correctCount++;
        
        return {
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          userAnswer: isAnswered ? q.options[userSelectedIdx] : "Not Answered",
          correctAnswer: q.options[q.correctOptionIndex],
          isCorrect: isCorrect,
        };
      });

      // STEP 1: Calculating Score
      setEvaluationStep(1);
      const finalNumericScore = Math.round((correctCount / questions.length) * 100);
      await new Promise(r => setTimeout(r, 400));

      // STEP 2: Analyzing Your Performance
      setEvaluationStep(2);
      const journeySnap = await getDoc(journeyRef);
      const data = journeySnap.data();
      const actualTimeTaken = 1800 - timeLeft;

      const report = await evaluateAptitude({
        role: data?.role || "Software Engineer",
        company: data?.company || "Standard Tech",
        experienceLevel: data?.experience || "Senior",
        timeTakenSeconds: Math.max(0, actualTimeTaken),
        totalQuestions: questions.length,
        results: formattedResults
      });

      const finalReport = {
        ...report,
        overallScore: finalNumericScore,
        correctCount,
        wrongCount: questions.length - (correctCount + notAnsweredCount),
        notAnsweredCount,
        accuracy: finalNumericScore,
        status: finalNumericScore >= 70 ? 'Pass' : 'Fail',
        details: formattedResults 
      };

      // STEP 3: Finalizing Result
      setEvaluationStep(3);
      await updateDoc(journeyRef!, {
        aptitudeReport: finalReport,
        aptitudeStatus: "completed",
        currentStage: INTERVIEW_STAGES.APTITUDE_RESULT,
        step: 5,
        updatedAt: serverTimestamp()
      });

      justSubmittedRef.current = true;
      router.replace(STAGE_ROUTES.APTITUDE_RESULT);
    } catch (e) {
      console.error("[APTITUDE SESSION] Submission fault:", e);
      setSubmissionError("Unable to save your result. Please try again.");
      setIsSubmitting(false);
      submissionGuard.current = false;
    }
  }, [journeyRef, questions, answers, user?.uid, timeLeft, router]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (isInitializing || isEvaluating || isSubmitting) return;
    
    const tick = () => {
      const localEndAt = localStorage.getItem(`aptitude_timer_end_${user?.uid}`);
      if (!localEndAt) return;
      
      const remaining = Math.max(0, Math.ceil((parseInt(localEndAt) - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timerInterval);
        if (submitRef.current) submitRef.current();
      }
    };

    const timerInterval = setInterval(tick, 1000);
    tick(); 
    
    return () => clearInterval(timerInterval);
  }, [isInitializing, isEvaluating, user?.uid, isSubmitting]);

  const handleOptionSelect = async (optIdx: number) => {
    if (!journeyRef || isSubmitting) return;
    const newAnswers = { ...answers, [currentIdx]: optIdx };
    setAnswers(newAnswers);
    
    if (markedForReview.has(currentIdx)) {
      setMarkedForReview(prev => {
        const n = new Set(prev);
        n.delete(currentIdx);
        return n;
      });
    }

    updateDoc(journeyRef, { aptitudeAnswers: newAnswers });
  };

  const handleNav = (newIdx: number) => {
    if (!journeyRef || isSubmitting) return;
    setCurrentIdx(newIdx);
    updateDoc(journeyRef, { aptitudeCurrentIndex: newIdx });
  };

  const handleReviewLater = () => {
    if (!journeyRef || isSubmitting) return;
    
    setMarkedForReview(prev => {
      const n = new Set(prev);
      if (n.has(currentIdx)) {
        n.delete(currentIdx);
      } else {
        n.add(currentIdx);
        if (currentIdx < questions.length - 1) {
          handleNav(currentIdx + 1);
        }
      }
      return n;
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isInitializing) {
    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-premium uppercase">PREPARING YOUR APTITUDE TEST</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
            PREPARING YOUR QUESTIONS
          </p>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
            PLEASE WAIT A MOMENT
          </p>
        </div>
      </div>
    );
  }

  if (isEvaluating) {
    const analysisSteps = [
      { id: 0, label: "Checking Answers" },
      { id: 1, label: "Calculating Score" },
      { id: 2, label: "Analyzing Your Performance" },
      { id: 3, label: "Preparing Your Result" }
    ];

    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center overflow-hidden">
        <div className="particles-bg" />
        
        <AnimatePresence mode="wait">
          {submissionError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 max-w-lg"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-white">Something went wrong</h2>
                <p className="text-muted-foreground font-light leading-relaxed">{submissionError}</p>
              </div>
              <Button onClick={() => handleSubmit()} className="btn-premium px-12 h-14 uppercase tracking-widest text-[10px]">
                <RotateCcw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="evaluating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12 max-w-xl w-full"
            >
              <div className="relative mb-16 mx-auto w-40 h-40">
                <div className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-12 h-12 text-accent animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">Analyzing Your Aptitude Performance</h2>
                  <p className="text-sm text-white/40 font-light">Evaluating your answers and preparing your personalized result…</p>
                </div>
                
                <div className="space-y-4">
                  <Progress value={(evaluationStep + 1) * 25} className="h-1.5" />
                </div>

                <div className="grid gap-3 pt-6">
                  {analysisSteps.map((step) => {
                    const isActive = evaluationStep === step.id;
                    const isDone = evaluationStep > step.id;
                    return (
                      <div 
                        key={step.id} 
                        className={cn(
                          "flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all duration-500",
                          isActive ? "bg-accent/10 border-accent/30 translate-x-2" : 
                          isDone ? "bg-white/5 border-white/10 opacity-50" : "bg-transparent border-transparent opacity-20"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-500",
                          isDone ? "bg-green-500 text-black" : isActive ? "bg-accent text-black" : "bg-white/10"
                        )}>
                          {isDone ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{step.id + 1}</span>}
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                          isActive ? "text-accent" : isDone ? "text-white/60" : "text-white/20"
                        )}>
                          {step.label}
                        </span>
                        {isActive && <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin text-accent" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />

      <div className="flex-1 flex flex-col min-h-0">
        <header className="h-20 shrink-0 border-b border-white/5 bg-[#0b0e1a]/95 backdrop-blur-xl flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
              <img src="/LOGO.png" alt="Celvivo AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-premium">CELVIVO AI</h1>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">APTITUDE TEST IN PROGRESS</p>
            </div>
          </div>

          <div className={cn(
            "px-6 py-2 rounded-xl glass border-white/10 font-mono text-2xl tabular-nums tracking-wider shadow-2xl",
            timeLeft <= 60 ? "text-red-500 animate-pulse border-red-500/30 bg-red-500/10" : 
            timeLeft <= 300 ? "text-orange-400 border-orange-500/30 bg-orange-500/10" : 
            "text-accent border-accent/30 bg-accent/10"
          )}>
            <div className="flex items-center gap-3">
              <Timer className={cn("w-5 h-5", timeLeft <= 60 && "animate-spin-slow")} />
              <span className="font-black">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 min-0 container-fluid flex flex-col w-full px-8 py-4 overflow-hidden">
          <div className="grid flex-1 min-h-0 lg:grid-cols-12 gap-8 overflow-hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-9 flex flex-col h-full min-h-0 gap-4">
              <div className="space-y-2 shrink-0">
                <div className="flex justify-between items-end px-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span className="text-accent">{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
                </div>
                <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-1 bg-white/5" />
              </div>

              <Card className="flex-1 min-h-0 overflow-y-auto premium-card bg-white/[0.01] border-white/5 p-8 relative flex flex-col justify-start custom-scrollbar">
                <div className="absolute top-0 right-0 p-6">
                  <Badge variant="outline" className="border-accent/20 text-accent text-[9px] font-black uppercase px-3">{currentQ?.difficulty || "Medium"}</Badge>
                </div>
                
                <div className="max-w-4xl mx-auto w-full space-y-8 pt-2">
                  <div className="space-y-4">
                    <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase tracking-widest">{currentQ?.category || "Category"}</Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-white/90 leading-tight whitespace-pre-wrap">{currentQ?.question}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 pb-4">
                    {currentQ?.options?.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleOptionSelect(i)} 
                        disabled={isSubmitting}
                        className={cn("p-8 rounded-2xl border text-left transition-all group flex items-center gap-6", 
                        answers[currentIdx] === i ? "bg-accent/20 border-accent text-accent shadow-[0_0_30px_rgba(34,211,238,0.1)]" : "glass border-white/5 hover:border-white/20 text-white/60")}
                      >
                        <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-black shrink-0", 
                          answers[currentIdx] === i ? "bg-accent border-accent text-black" : "border-white/10 group-hover:border-white/30")}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-base font-medium leading-relaxed">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="h-20 shrink-0 glass rounded-[2rem] border-white/5 px-8 flex items-center justify-between shadow-2xl">
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => handleNav(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0 || isSubmitting} className="h-12 px-8 rounded-xl glass border-white/10 text-[10px] font-black uppercase"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleReviewLater} 
                    disabled={isSubmitting}
                    className={cn("h-12 px-8 rounded-xl glass border-white/10 text-[10px] font-black uppercase", markedForReview.has(currentIdx) && "bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]")}
                  >
                    Skip Question
                  </Button>
                </div>
                <div className="flex gap-4">
                  {currentIdx < questions.length - 1 ? (
                    <Button 
                      onClick={() => {
                        if (answers[currentIdx] !== undefined) {
                          handleNav(Math.min(questions.length - 1, currentIdx + 1));
                        } else {
                          toast({
                            title: "Answer Required",
                            description: "Please select an answer before moving to the next question.",
                          });
                        }
                      }} 
                      disabled={isSubmitting} 
                      className="h-12 px-12 btn-premium rounded-xl text-[10px] font-black uppercase"
                    >
                      Next Question <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="h-12 px-12 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg group">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finish Test <ShieldCheck className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" /></>}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-3 h-full overflow-hidden">
              <Card className="h-full overflow-y-auto premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col gap-10 custom-scrollbar">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3 shrink-0"><LayoutGrid className="w-4 h-4" /> Questions</h3>
                <div className="grid grid-cols-5 gap-3">
                  {questions.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleNav(i)} 
                      disabled={isSubmitting}
                      className={cn(
                        "w-full aspect-square rounded-xl border text-[10px] font-black transition-all duration-300", 
                        currentIdx === i ? "bg-accent border-accent text-black scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)]" : 
                        markedForReview.has(i) ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : 
                        answers[i] !== undefined ? "bg-green-500/20 border-green-500/40 text-green-400" : 
                        "glass border-white/5 text-white/20"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
