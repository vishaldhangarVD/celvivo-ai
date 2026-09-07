"use client";

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code2, 
  ChevronRight, 
  Loader2, 
  Brain, 
  Command, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Layers, 
  Clock, 
  Target, 
  XCircle, 
  Check, 
  RotateCcw, 
  Sparkles,
  Timer,
  Rocket,
  FastForward,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDoc, query, where, setDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MASTER_QUESTIONS } from '@/lib/coding-questions-data';
import { generateCodingQuestions } from '@/ai/flows/ai-coding-generator';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { Progress } from '@/components/ui/progress';

const LANGUAGES = [
  { id: 'python', label: 'Python 3', monaco: 'python' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { id: 'c', label: 'C', monaco: 'c' },
  { id: 'csharp', label: 'C#', monaco: 'csharp' },
  { id: 'go', label: 'Go', monaco: 'go' },
  { id: 'rust', label: 'Rust', monaco: 'rust' },
  { id: 'kotlin', label: 'Kotlin', monaco: 'kotlin' },
  { id: 'php', label: 'PHP', monaco: 'php' },
  { id: 'swift', label: 'Swift', monaco: 'swift' },
  { id: 'ruby', label: 'Ruby', monaco: 'ruby' }
];

function CodingEngineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); 
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  
  const [sessionResults, setSessionResults] = useState<Record<number, any>>({});
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const initLoadingRef = useRef(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("WRITE YOUR CODE TO SOLVE THE PROBLEM.");
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");
  const [countdown, setCountdown] = useState<number | null>(null);

  const hasRestoredRef = useRef(false);

  const isUnlockedParam = searchParams.get('unlocked') === 'true';

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  const resultsQuery = useMemo(() => {
    if (!db || !user?.uid || !journey?.sessionId) return null;
    return query(
      collection(db, 'users', user.uid, 'coding_results'),
      where('interviewId', '==', journey.sessionId)
    );
  }, [db, user?.uid, journey?.sessionId]);

  const { data: existingResultsData } = useCollection(resultsQuery);

  useEffect(() => {
    if (hasRestoredRef.current) return;
    if (existingResultsData && existingResultsData.length > 0 && questions.length > 0) {
      const restoredResults: Record<number, any> = {};
      existingResultsData.forEach((res: any) => {
        const qIdx = questions.findIndex(q => q.id === res.questionId);
        if (qIdx !== -1) {
          restoredResults[qIdx] = {
            code: res.submittedCode,
            results: res.auditTrace,
            status: res.status,
            passedCount: res.passedTestCases,
            totalCount: res.totalTestCases,
            language: res.language
          };
        }
      });
      if (Object.keys(restoredResults).length > 0) {
        setSessionResults(restoredResults);
        hasRestoredRef.current = true;
      }
    }
  }, [existingResultsData, questions]);

  const currentQ = useMemo(() => {
    if (!questions || questions.length === 0) return null;
    if (currentIdx < 0 || currentIdx >= questions.length) return questions[0];
    return questions[currentIdx];
  }, [questions, currentIdx]);

  const finalizeAssessment = useCallback(async () => {
    if (isFinalizing || !user || !db || !journey) return;
    setIsFinalizing(true);
    
    try {
      for (let i = 0; i < 4; i++) {
        setSubmitStep(i);
        await new Promise(r => setTimeout(r, 600));
      }
      
      const total = 8;
      let passed = 0;
      let failed = 0;
      let skipped = 0;
      let totalPassedCases = 0;
      let totalTestCases = 0;
      
      for (let i = 0; i < total; i++) {
        const r = sessionResults[i];
        if (r) {
          totalPassedCases += (r.passedCount || 0);
          totalTestCases += (r.totalCount || 0);
          if (r.status === 'Solved') passed++;
          else if (r.status === 'Skipped') skipped++;
          else failed++;
        } else {
          skipped++;
        }
      }
      
      const scorePercentage = Math.round((passed / total) * 100);
      const attemptId = journey.sessionId;

      await setDoc(doc(db, 'users', user.uid, 'coding_attempts', attemptId), {
        score: scorePercentage, 
        status: scorePercentage >= 60 ? 'Pass' : 'Fail', 
        totalQuestions: total, 
        passedQuestions: passed, 
        failedQuestions: failed,
        skippedQuestions: skipped,
        totalPassedCases,
        totalTestCases,
        submissionTime: new Date().toLocaleTimeString(),
        sessionId: attemptId,
        questions: questions,
        userId: user.uid,
        role: journey.role,
        company: journey.company,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(journeyRef!, {
        codingReport: { 
          score: scorePercentage, 
          status: scorePercentage >= 60 ? 'Pass' : 'Fail', 
          totalQuestions: total, 
          passedQuestions: passed, 
          failedQuestions: failed,
          skippedQuestions: skipped,
          totalPassedCases,
          totalTestCases,
          submissionTime: new Date().toLocaleTimeString(),
          sessionId: attemptId
        },
        codingRoundCompleted: true,
        codingScore: scorePercentage,
        currentStage: INTERVIEW_STAGES.CODING_RESULT,
        step: 7,
        updatedAt: serverTimestamp()
      });

      router.push(STAGE_ROUTES.CODING_RESULT);
    } catch (error) {
      console.error("Finalize Assessment Error:", error);
      setIsFinalizing(false);
      toast({ variant: "destructive", title: "Archive Failure" });
    }
  }, [isFinalizing, user, db, journey, sessionResults, journeyRef, router, toast, questions]);

  const goToNextQuestion = useCallback(async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    if (currentIdx < 7) { 
      setCurrentIdx(prev => prev + 1);
      setTerminalOutput("WRITE YOUR CODE TO SOLVE THE PROBLEM.");
      setActiveTerminalTab("output");
      setIsNavigating(false);
    } else {
      await finalizeAssessment();
    }
  }, [currentIdx, isNavigating, finalizeAssessment]);

  const saveQuestionResult = async (idx: number, res: any) => {
    if (!user || !db || !journey || !questions || !questions[idx]) return;
    const q = questions[idx];
    const sessionId = journey.sessionId || "unknown";
    const docId = `${sessionId}_${q.id}`;
    
    const executionTime = (res.results || []).length > 0 
      ? Math.max(...res.results.map((r: any) => parseFloat(r.executionTime || 0))) 
      : 0;
    const memory = (res.results || []).length > 0 
      ? Math.max(...res.results.map((r: any) => {
          const m = parseInt(r.memory || 0);
          return isNaN(m) ? 0 : m;
        })) 
      : 0;

    try {
      // Use setDoc with deterministic ID to prevent duplicates and ensure attempt isolation
      await setDoc(doc(db, 'users', user.uid, 'coding_results', docId), {
        interviewId: sessionId,
        userId: user.uid,
        questionId: q.id || "unknown",
        language: res.language || "Unknown",
        score: res.totalCount > 0 ? Math.round((res.passedCount / res.totalCount) * 100) : 0,
        passedTestCases: res.passedCount || 0,
        totalTestCases: res.totalTestCases ?? 0,
        status: res.status || "Unknown",
        submittedCode: res.code || "",
        executionTime,
        memory,
        auditTrace: res.results || [],
        completedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error("Error saving coding result:", e);
    }
  };

  const handleRunCode = async () => {
    if (isRunning || isSubmitting || isTimeExpired || isNavigating || !currentQ || countdown !== null) return;
    
    if (!code || code.trim().length === 0) {
      toast({ variant: "destructive", title: "Empty Payload", description: "Please implement logic before running." });
      return;
    }

    setIsRunning(true);
    setActiveTerminalTab("output");
    setTerminalOutput("Initializing execution...");
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source_code: code, 
          language: selectedLang.id, 
          stdin: currentQ.sampleInput || "",
          expectedOutput: currentQ.sampleOutput || ""
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        setTerminalOutput(`[EXECUTION ERROR]\n${data.error}`);
      } else {
        const statusPrefix = `[${data.status || 'DONE'}]`;
        setTerminalOutput(`${statusPrefix}\n\nOutput Trace:\n${data.stdout || ''}\n\nExpected:\n${currentQ.sampleOutput || ''}\n\nTemporal Audit: ${data.time || '0.00'}s | Memory Load: ${data.memory || 'N/A'}KB`);
      }
    } catch (error) {
      setTerminalOutput("[NETWORK ERROR] Connection interrupted.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (isSubmitting || isRunning || isTimeExpired || isNavigating || !currentQ || countdown !== null) return;

    if (!code || code.trim().length === 0) {
      toast({ variant: "destructive", title: "Empty Payload", description: "Please implement logic before submitting." });
      return;
    }

    setIsSubmitting(true);
    setActiveTerminalTab("cases");
    setTerminalOutput("Running test cases...");
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source_code: code, 
          language: selectedLang.id, 
          testCases: currentQ.hiddenTestCases || [] 
        }),
      });

      if (!response.ok) throw new Error("Audit node timeout.");
      const data = await response.json();
      const results = data.results || [];
      const passed = results.filter((r: any) => r.passed).length;
      const total = results.length || (currentQ.hiddenTestCases?.length ?? 1);
      const allPassed = passed === total && total > 0;

      const submissionReport = { 
        code, 
        results, 
        status: allPassed ? 'Solved' : 'Failed', 
        passedCount: passed, 
        totalCount: total, 
        language: selectedLang.label 
      };

      setSessionResults(prev => ({ ...prev, [currentIdx]: submissionReport }));
      saveQuestionResult(currentIdx, submissionReport);

      if (allPassed) {
        setCountdown(3);
        const timerId = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(timerId);
              setCountdown(null);
              goToNextQuestion();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({ variant: "destructive", title: "Audit Fault", description: `Synchronized ${passed}/${total} nodes. Retry or skip.` });
      }
    } catch (error: any) {
      console.error("[CODING] Submission Error:", error);
      setTerminalOutput("[CONNECTION ERROR] Unable to verify your solution.");
      toast({ variant: "destructive", title: "Submission Error", description: "Failed to verify algorithm." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (isNavigating || isSubmitting || isRunning || isTimeExpired || !currentQ || countdown !== null) return;
    
    const skipReport = { 
      code: code || "// Skipped", 
      results: [], 
      status: 'Skipped', 
      passedCount: 0, 
      totalCount: currentQ.hiddenTestCases?.length || 1, 
      language: selectedLang.label 
    };

    setSessionResults(prev => ({ ...prev, [currentIdx]: skipReport }));
    saveQuestionResult(currentIdx, skipReport);
    await goToNextQuestion();
  };

  useEffect(() => {
    async function initEnvironment() {
      if (!db || !user || !journey || !journeyRef) return;

      const isCacheSuspect = journey.codingQuestions?.some((q: any) => 
        (q.starterCode?.python?.length < 50) || !q.hiddenTestCases?.length
      );

      if (!isCacheSuspect && Array.isArray(journey.codingQuestions) && journey.codingQuestions.length === 8 && journey.questionsSessionId === journey.sessionId) {
        setQuestions(journey.codingQuestions);
        setIsInitializing(false);
        return;
      }

      if (initLoadingRef.current) return;

      if (journey.codingUnlocked !== true && !isUnlockedParam) {
        toast({ variant: "destructive", title: "ACCESS RESTRICTED", description: "Please complete the previous round to continue." });
        router.push(STAGE_ROUTES.APTITUDE_RESULT);
        return;
      }

      initLoadingRef.current = true;
      setInitError(null);

      const timeoutId = setTimeout(() => {
        if (initLoadingRef.current && isInitializing) {
          setInitError("Environment setup timed out. The connection is experiencing high latency.");
          initLoadingRef.current = false;
        }
      }, 45000);
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const usedTitles = Array.isArray(userSnap.data()?.codingQuestionHistory) ? userSnap.data()?.codingQuestionHistory : [];
        
        let finalQuestions = [];

        const pickFromBank = (difficulty: string, count: number) => {
          const pool = [...MASTER_QUESTIONS].filter(q => q.difficulty === difficulty);
          const newOnes = pool.filter(q => !usedTitles.includes(q.title));
          const targetPool = newOnes.length >= count ? newOnes : pool;
          return targetPool.sort(() => Math.random() - 0.5).slice(0, count);
        };

        finalQuestions = [
          ...pickFromBank('Easy', 3),
          ...pickFromBank('Medium', 3),
          ...pickFromBank('Hard', 2)
        ];

        if (!finalQuestions || finalQuestions.length < 8) {
           try {
              const response = await generateCodingQuestions({
                role: journey.role,
                company: journey.company,
                experienceLevel: journey.experience,
                count: 8,
                avoidTitles: usedTitles
              });
              finalQuestions = response.questions;
           } catch (genError) {
              finalQuestions = [...MASTER_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8);
           }
        }

        const newTitles = finalQuestions.map(q => q.title);
        
        setQuestions(finalQuestions);
        setIsInitializing(false);
        initLoadingRef.current = false;
        clearTimeout(timeoutId);

        updateDoc(journeyRef!, {
          codingQuestions: finalQuestions,
          questionsSessionId: journey.sessionId || "unknown",
          currentStage: INTERVIEW_STAGES.CODING,
          updatedAt: serverTimestamp(),
        });

        updateDoc(userRef, {
          codingQuestionHistory: arrayUnion(...newTitles)
        });

      } catch (e: any) {
        console.error("[CODING ROUND] Environment Sync Fault:", e);
        clearTimeout(timeoutId);
        if (initLoadingRef.current) {
          setInitError(e.message || "A connection error occurred while preparing the coding challenge.");
          initLoadingRef.current = false;
        }
      }
    }
    initEnvironment();
  }, [db, user, journey, journeyRef, toast, router, retryKey, isUnlockedParam, isInitializing]);

  useEffect(() => {
    if (currentQ) {
      const savedResult = sessionResults[currentIdx];
      const isSameLanguage = savedResult?.language === selectedLang.label;
      const savedCode = isSameLanguage ? savedResult.code : null;

      const starterCode = currentQ.starterCode?.[selectedLang.id] || 
                          currentQ.starterCode?.["python"] || 
                          "// Starter code unavailable.";

      setCode(savedCode || starterCode);
      setTerminalOutput(isSameLanguage ? "Submission saved." : "WRITE YOUR CODE TO SOLVE THE PROBLEM.");
      setActiveTerminalTab(isSameLanguage ? "cases" : "output");
    }
  }, [currentIdx, selectedLang, currentQ, sessionResults]);

  useEffect(() => {
    setTimeLeft(600);
    setIsTimeExpired(false);
  }, [currentIdx]);

  useEffect(() => {
    if (isInitializing || isFinalizing || isTimeExpired) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeExpired(true);
          goToNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, isFinalizing, isTimeExpired, goToNextQuestion]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isInitializing || journeyLoading) return (
    <div className="h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center overflow-hidden">
      <div className="particles-bg" />
      <AnimatePresence mode="wait">
        {initError ? (
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
              <h2 className="text-3xl font-bold tracking-tight text-white">Coding Round Setup Timed Out</h2>
              <p className="text-muted-foreground font-light leading-relaxed">
                We couldn't prepare your coding round right now. Please try again.
              </p>
            </div>
            <Button 
              onClick={() => { setInitError(null); initLoadingRef.current = false; setRetryKey(k => k + 1); }} 
              className="btn-premium px-12 h-14 uppercase tracking-widest text-[10px] rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> TRY AGAIN
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
              <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">Preparing Your Coding Round</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
                PREPARING YOUR CODING QUESTIONS...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isFinalizing) {
    const analysisSteps = [
      { id: 0, label: "Analyzing Your Performance" },
      { id: 1, label: "Calculating Your Score" },
      { id: 2, label: "Checking Your Results" },
      { id: 3, label: "Saving Your Results" }
    ];

    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center overflow-hidden">
        <div className="particles-bg" />
        
        <motion.div 
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
              <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">Analyzing Your Coding Performance</h2>
              <p className="text-sm text-white/40 font-light">Evaluating your solutions and preparing your results…</p>
            </div>
            
            <div className="space-y-4">
              <Progress value={(submitStep + 1) * 25} className="h-1.5" />
            </div>

            <div className="grid gap-3 pt-6">
              {analysisSteps.map((step) => {
                const isActive = submitStep === step.id;
                const isDone = submitStep > step.id;
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
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      
      <header className="h-[72px] border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
             <Code2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">CODING CHALLENGE</h1>
            <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Question {currentIdx + 1} of 8</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-12">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
            {[...Array(8)].map((_, s) => (
              <div key={s} className={cn("flex-1 h-full transition-all duration-500", currentIdx >= s ? "bg-accent shadow-[0_0_8px_#22d3ee]" : "bg-white/5")} />
            ))}
          </div>
        </div>

        <div className={cn("px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums tracking-widest flex items-center gap-3 shadow-xl",
            timeLeft < 300 ? "text-red-500 animate-pulse border-red-500/30 bg-red-500/10" : "text-accent border-accent/20 bg-accent/5")}>
          <Timer className={cn("w-5 h-5", timeLeft < 300 && "animate-spin-slow")} /> {formatTime(timeLeft)}
        </div>
      </header>

      <main className="flex-1 container-fluid flex overflow-hidden p-4 gap-4">
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 glass bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar rounded-[2.5rem]">
            {currentQ ? (
              <div className="space-y-14">
                <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-widest text-white/40">Question {currentIdx + 1} of 8</span>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-accent border-accent/30">{currentQ.difficulty}</Badge>
                </div>

                <div className="space-y-8">
                <h2 className="text-5xl font-bold tracking-tight text-white">{currentQ.title || 'Untitled Node'}</h2>
                <p className="text-xl text-white/70 leading-relaxed font-light whitespace-pre-wrap">{currentQ.problemStatement || currentQ.description}</p>
                </div>

                <div className="space-y-4 p-6 glass border-white/5 rounded-3xl bg-black/40">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-accent">EXAMPLE</h4>
                  <div className="space-y-4">
                    <div className="space-y-1">
                    <p className="text-xs font-black text-white/30 uppercase tracking-widest">INPUT</p>
                    <pre className="text-base text-accent p-5 glass rounded-xl bg-white/5">{currentQ.sampleInput}</pre>
                    </div>
                    <div className="space-y-1">
                    <p className="text-xs font-black text-white/30 uppercase tracking-widest">EXPECTED OUTPUT</p>
                    <pre className="text-base text-green-400 p-5 glass rounded-xl bg-white/5">{currentQ.sampleOutput}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] flex flex-col relative overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center px-10 justify-between">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">CODE EDITOR</span>
               <select 
                 value={selectedLang?.id || LANGUAGES[0].id} 
                 onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])} 
                 className="h-9 px-4 glass border-white/10 bg-[#08090D] rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-accent"
               >
                 {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
               </select>
            </div>

            <Editor 
              height="100%" 
              theme="vs-dark" 
              language={selectedLang?.monaco || 'python'} 
              value={code} 
              onChange={(val) => setCode(val || "")} 
              options={{ fontSize: 15, readOnly: isTimeExpired || isFinalizing || countdown !== null, minimap: { enabled: false } }} 
            />

            <div className="h-24 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-10">
              <div className="flex items-center gap-6">
                <Button onClick={handleRunCode} disabled={isRunning || isSubmitting || isTimeExpired || isNavigating} className="h-12 px-8 glass border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl">
                  {isRunning ? <Loader2 className="w-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />} RUN SAMPLE
                </Button>
                <Button onClick={handleSubmitCode} disabled={isSubmitting || isRunning || isTimeExpired || isNavigating} className="h-12 px-12 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.3em] group">
                  {isSubmitting ? <><Loader2 className="w-4 animate-spin mr-2" /> CHECKING SOLUTION...</> : <><ShieldCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> SUBMIT SOLUTION</>}
                </Button>
                <Button onClick={handleSkipQuestion} disabled={isRunning || isSubmitting || isTimeExpired || isNavigating} variant="ghost" className="h-12 px-6 rounded-xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <FastForward className="w-4 h-4 mr-2" /> SKIP
                </Button>
              </div>
            </div>
          </Card>

          <Card className="h-[30%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden rounded-[2.5rem]">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
              <TabsList className="bg-[#08090D] px-10 h-14 border-b border-white/5 justify-start gap-12">
                <TabsTrigger value="output" className="text-[9px] font-black uppercase tracking-[0.3em]">CONSOLE OUTPUT</TabsTrigger>
                <TabsTrigger value="cases" className="text-[9px] font-black uppercase tracking-[0.3em]">TEST RESULTS</TabsTrigger>
              </TabsList>
              <div className="flex-1 font-mono text-[13px] overflow-hidden bg-black/40">
                <TabsContent value="output" className="p-8 text-white/70 h-full overflow-y-auto whitespace-pre-wrap leading-relaxed">{terminalOutput}</TabsContent>
                <TabsContent value="cases" className="p-8 h-full overflow-y-auto space-y-4">
                  {sessionResults[currentIdx] ? (
                    <div className="space-y-4">
                      <div className={cn("p-4 rounded-xl border flex items-center justify-between", sessionResults[currentIdx].status === 'Solved' ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20")}>
                         <div className="flex items-center gap-4">
                            <h4 className={cn("text-base font-bold", sessionResults[currentIdx].status === 'Solved' ? "text-green-400" : "text-red-400")}>
                                {sessionResults[currentIdx].status === 'Solved' ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}
                            </h4>
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Passes: {sessionResults[currentIdx].passedCount}/{sessionResults[currentIdx].totalCount}</span>
                         </div>
                      </div>
                      <div className="grid gap-2">
                        {sessionResults[currentIdx].results.map((r: any, i: number) => (
                          <div key={i} className="p-3 glass border-white/5 rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/40 uppercase">TEST CASE #{i+1}</span>
                            <Badge variant="outline" className={cn("text-[8px] uppercase", r.passed ? "text-green-400 border-green-500/20" : "text-red-400 border-red-500/20")}>{r.status}</Badge>
                          </div>
                        ))}
                      </div>
                      {countdown !== null && <p className="text-center text-xs font-black uppercase tracking-widest text-accent animate-pulse">NEXT NODE IN {countdown}S...</p>}
                    </div>
                  ) : <div className="h-full flex flex-col items-center justify-center opacity-20"><ShieldCheck className="w-12 h-12 mb-2" /><p className="text-[9px] font-black uppercase">SUBMIT YOUR SOLUTION TO SEE THE RESULTS</p></div>}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CodingEnginePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <CodingEngineContent />
    </Suspense>
  );
}
