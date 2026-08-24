"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import Navbar from '@/components/layout/Navbar';
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
  ArrowRight
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDoc, query, where, setDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MASTER_QUESTIONS } from '@/lib/coding-questions-data';
import { generateCodingQuestions } from '@/ai/flows/ai-coding-generator';

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

export default function CodingEnginePage() {
  const router = useRouter();
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
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("Waiting for your implementation.");
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");
  const [countdown, setCountdown] = useState<number | null>(null);

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
    if (existingResultsData && existingResultsData.length > 0 && questions.length > 0 && Object.keys(sessionResults).length === 0) {
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
      setSessionResults(restoredResults);
    }
  }, [existingResultsData, questions, sessionResults]);

  const getDifficultyColor = (diff?: string) => {
    if (!diff) return 'text-accent border-accent/20 bg-accent/5';
    switch (diff) {
      case 'Easy': return 'text-green-400 border-green-500/20 bg-green-500/5';
      case 'Medium': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
      case 'Hard': return 'text-red-400 border-red-500/20 bg-red-500/20';
      default: return 'text-accent border-accent/20 bg-accent/5';
    }
  };

  const getTopicLabel = (topic?: string | null) => {
    if (!topic) return 'ALGORITHM CORE';
    return topic.toUpperCase();
  };

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
        await new Promise(r => setTimeout(r, 800));
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

      const report = { 
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
      };

      await setDoc(doc(db, 'users', user.uid, 'coding_attempts', attemptId), {
        ...report,
        questions: questions,
        userId: user.uid,
        role: journey.role,
        company: journey.company,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(journeyRef!, {
        codingReport: report,
        codingRoundCompleted: true,
        codingScore: scorePercentage,
        currentStage: 'HR Interview',
        step: 6,
        updatedAt: serverTimestamp()
      });

      router.push(`/interview/coding-result?attemptId=${attemptId}`);
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
      setTerminalOutput("Waiting for your implementation.");
      setActiveTerminalTab("output");
      setIsNavigating(false);
    } else {
      await finalizeAssessment();
    }
  }, [currentIdx, isNavigating, finalizeAssessment]);

  const saveQuestionResult = async (idx: number, res: any) => {
    if (!user || !db || !journey || !questions || !questions[idx]) return;
    const q = questions[idx];
    
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
      await addDoc(collection(db, 'users', user.uid, 'coding_results'), {
        interviewId: journey.sessionId || "unknown",
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
      });
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
    setTerminalOutput("Initializing system sample execution...");
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      setTerminalOutput("[NETWORK FAULT] Execution link interrupted.");
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
    setTerminalOutput("Running Hidden Test Cases...");
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      await saveQuestionResult(currentIdx, submissionReport);

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
      setTerminalOutput("[CRITICAL FAULT] Matrix node connection lost.");
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
    await saveQuestionResult(currentIdx, skipReport);
    await goToNextQuestion();
  };

  useEffect(() => {
    async function initEnvironment() {
      if (!db || !user || !journey) return;

      if (journey.codingUnlocked !== true) {
        toast({ 
          variant: "destructive", 
          title: "Access Restricted", 
          description: "A minimum efficiency rating of 70% in the Aptitude Round is required to enter the Syntax Matrix stage." 
        });
        router.push('/interview/aptitude');
        return;
      }

      // 1. RECOVERY PROTOCOL: If questions are already assigned to this specific session in Firestore, use them.
      if (Array.isArray(journey.codingQuestions) && 
          journey.codingQuestions.length === 8 && 
          journey.questionsSessionId === journey.sessionId) {
        setQuestions(journey.codingQuestions);
        setIsInitializing(false);
        return;
      }

      if (questions && questions.length === 8) return;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const usedTitles = Array.isArray(userData?.codingQuestionHistory) ? userData.codingQuestionHistory : [];
        
        // 2. SYNTHESIS PROTOCOL: Use Gemini as the primary source
        let finalQuestions = [];
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
          console.error("[Coding Round] Neural synthesis failed, using fallback bank:", genError);
          // FALLBACK PROTOCOL
          const pickQuestions = (difficulty: string, count: number) => {
            const pool = [...MASTER_QUESTIONS].filter(q => q.difficulty === difficulty);
            const unused = pool.filter(q => !usedTitles.includes(q.title)).sort(() => Math.random() - 0.5);
            const used = pool.filter(q => usedTitles.includes(q.title)).sort(() => Math.random() - 0.5);
            return [...unused, ...used].slice(0, count);
          };
          finalQuestions = [...pickQuestions('Easy', 3), ...pickQuestions('Medium', 3), ...pickQuestions('Hard', 2)];
        }

        if (finalQuestions.length < 8) {
          finalQuestions = [...MASTER_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8);
        }

        const newTitles = finalQuestions.map(q => q.title);
        
        // 3. PERSISTENCE PROTOCOL: Store the assigned set for the current session.
        await updateDoc(journeyRef!, {
          codingQuestions: finalQuestions,
          questionsSessionId: journey.sessionId || "unknown",
          updatedAt: serverTimestamp(),
          currentStage: "Coding Assessment"
        });

        // 4. HISTORY PROTOCOL: Update global user history to avoid repeating these in future attempts.
        await updateDoc(userRef, {
          codingQuestionHistory: arrayUnion(...newTitles)
        });

        setQuestions(finalQuestions);
      } catch (e: any) {
        console.error("[CODING ROUND] Environment Sync Fault:", e);
        toast({ variant: "destructive", title: "Matrix Sync Fault", description: "Failed to calibrate logic nodes." });
      } finally {
        setIsInitializing(false);
      }
    }
    initEnvironment();
  }, [db, user, journey, journeyRef, questions, toast, router]);

  useEffect(() => {
    if (currentQ) {
      const savedResult = sessionResults[currentIdx];
      const isSameLanguage = savedResult?.language === selectedLang.label;
      const savedCode = isSameLanguage ? savedResult.code : null;

      const starterCode = currentQ.starterCode?.[selectedLang.id] || 
                          currentQ.starterCode?.["python"] || 
                          "// Starter code unavailable for this language.";

      setCode(savedCode || starterCode);

      if (isSameLanguage) {
        setTerminalOutput("Question submission archived.");
        setActiveTerminalTab("cases");
      } else {
        setTerminalOutput("Waiting for your implementation.");
        setActiveTerminalTab("output");
      }
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
    <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-12">
      <div className="relative">
         <div className="w-24 h-24 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
         <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Neural Core Synchronizing...</p>
    </div>
  );

  const currentResult = sessionResults[currentIdx];
  const isCurrentFailed = !!currentResult && currentResult.status !== 'Solved' && currentResult.status !== 'Skipped';

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      
      <header className="h-[72px] border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50 sticky top-[72px]">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
             <Code2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">Syntax Matrix Protocol</h1>
            <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Question {currentIdx + 1} of 8</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-12">
          <div className="flex justify-between items-center mb-1.5 px-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Progression Roadmap</span>
             <span className="text-[8px] font-black uppercase tracking-widest text-accent">α → α → α → β → β → β → Ω → Ω</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
            {[...Array(8)].map((_, s) => (
              <div key={s} className={cn("flex-1 h-full transition-all duration-500", currentIdx >= s ? "bg-accent shadow-[0_0_8px_#22d3ee]" : "bg-white/5")} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className={cn(
            "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums tracking-widest flex items-center gap-3 shadow-xl",
            timeLeft < 300 ? "text-red-500 animate-pulse border-red-500/30 bg-red-500/10" : "text-accent border-accent/20 bg-accent/5"
          )}>
            <Timer className={cn("w-5 h-5", timeLeft < 300 && "animate-spin-slow")} /> {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 container-fluid flex overflow-hidden p-4 gap-4 mt-20">
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 glass bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar rounded-[2.5rem]">
            {currentQ ? (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Question {currentIdx + 1} of 8</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: timeLeft < 300 ? '#ef4444' : '#22d3ee' }}>TIME LEFT: {formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight text-white">{currentQ.title || 'Untitled Node'}</h2>
                  <div className="flex gap-3">
                    <Badge variant="outline" className={cn("text-[10px] uppercase px-4 py-1 font-black tracking-widest", getDifficultyColor(currentQ.difficulty))}>
                      {currentQ.difficulty === 'Easy' ? 'LEVEL α' : currentQ.difficulty === 'Medium' ? 'LEVEL β' : 'LEVEL Ω'}
                    </Badge>
                    <Badge variant="outline" className="text-white/40 text-[10px] uppercase border-white/10 px-4 py-1 font-black tracking-widest flex items-center gap-1.5">
                      <Target className="w-3 h-3" /> {getTopicLabel(currentQ?.topic)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">PROBLEM NARRATIVE</h4>
                    <p className="text-base text-white/70 leading-relaxed font-light whitespace-pre-wrap">{currentQ.problemStatement || currentQ.description || 'Solve the given programming problem.'}</p>
                  </div>

                  {(currentQ.constraints || []).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">BOUNDARY CONSTRAINTS</h4>
                      <ul className="space-y-2">
                        {currentQ.constraints.map((c: string, i: number) => (
                          <li key={i} className="text-sm text-white/50 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0 shadow-[0_0_8px_#22d3ee]" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4 p-6 glass border-white/5 rounded-3xl bg-black/40">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">SYSTEM SAMPLE</h4>
                    <div className="space-y-5 font-mono text-[11px]">
                      <div className="space-y-2">
                        <p className="text-white/20 uppercase tracking-widest text-[9px]">INPUT</p>
                        <pre className="text-accent whitespace-pre-wrap p-4 glass rounded-xl bg-white/5 border border-white/5 shadow-inner">{currentQ.sampleInput || ''}</pre>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/20 uppercase tracking-widest text-[9px]">EXPECTED OUTPUT</p>
                        <pre className="text-green-400 whitespace-pre-wrap p-4 glass rounded-xl bg-white/5 border border-white/5 shadow-inner">{currentQ.sampleOutput || ''}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Question Unavailable</p>
              </div>
            )}
          </Card>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Card className="p-6 glass border-accent/20 bg-accent/[0.03] rounded-[2rem] flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
                 <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">MISSION PROTOCOL</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Implement the algorithmic logic. System verification is mandatory for progression.</p>
              </div>
            </div>
            {(isNavigating || countdown !== null) && (
              <div className="flex items-center gap-3 bg-accent/20 px-6 py-2 rounded-xl border border-accent/30 animate-pulse">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
                <span className="text-[9px] font-black text-accent uppercase tracking-widest">
                  {countdown !== null ? `SYNCING IN ${countdown}S...` : "CALIBRATING NEXT NODE..."}
                </span>
              </div>
            )}
          </Card>

          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] flex flex-col relative overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center px-10 gap-12 justify-between">
               <div className="flex items-center gap-12">
                 <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Syntax Node</span>
                    <Badge variant="outline" className="border-accent/30 text-accent text-[10px] font-mono px-3 bg-accent/5">
                      {currentQ?.topic || 'ALGORITHM'}
                    </Badge>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <select 
                   value={selectedLang?.id || LANGUAGES[0].id} 
                   onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])} 
                   className="h-9 px-4 glass border-white/10 bg-[#08090D] rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-accent shadow-lg transition-all"
                 >
                   {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                 </select>
               </div>
            </div>

            <Editor 
              height="100%" 
              theme="vs-dark" 
              language={selectedLang?.monaco || 'python'} 
              value={code} 
              onChange={(val) => setCode(val || "")} 
              onMount={(editor, monaco) => {
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                  target: monaco.languages.typescript.ScriptTarget.ES2017,
                  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                  module: monaco.languages.typescript.ModuleKind.CommonJS,
                  allowNonTsExtensions: true,
                  noEmit: true,
                });
              }}
              options={{ 
                fontSize: 15, 
                readOnly: isTimeExpired || isFinalizing || countdown !== null ? true : false, 
                minimap: { enabled: false },
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6,
                padding: { top: 20, bottom: 20 }
              }} 
            />

            <div className="h-24 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-10">
              <div className="flex items-center gap-6">
                <Button 
                  onClick={handleRunCode} 
                  disabled={isRunning || isSubmitting || isTimeExpired || isNavigating || !currentQ || countdown !== null} 
                  className="h-12 px-8 glass border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all shadow-lg"
                >
                  {isRunning ? <Loader2 className="w-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />} RUN SAMPLE
                </Button>

                <Button 
                  onClick={handleSubmitCode} 
                  disabled={isSubmitting || isRunning || isTimeExpired || isNavigating || !currentQ || countdown !== null} 
                  className="h-12 px-12 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(147,51,234,0.3)] group"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 animate-spin mr-2" /> AUDITING...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> SUBMIT SOLUTION</>
                  )}
                </Button>

                <Button 
                  onClick={handleSkipQuestion} 
                  disabled={isRunning || isSubmitting || isTimeExpired || isNavigating || !currentQ || countdown !== null}
                  variant="ghost" 
                  className="h-12 px-6 rounded-xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
                >
                  <FastForward className="w-4 h-4 mr-2" /> SKIP NODE
                </Button>
              </div>
            </div>
          </Card>

          <Card className="h-[30%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden rounded-[2.5rem] shadow-2xl">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
              <TabsList className="bg-[#08090D] px-10 h-14 border-b border-white/5 gap-12 justify-start rounded-none">
                <TabsTrigger value="output" className="text-[9px] font-black uppercase tracking-[0.3em] data-[state=active]:text-accent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full transition-all px-0">CONSOLE OUTPUT</TabsTrigger>
                <TabsTrigger value="cases" className="text-[9px] font-black uppercase tracking-[0.3em] data-[state=active]:text-accent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full transition-all px-0">AUDIT TRACE</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 font-mono text-[13px] overflow-hidden bg-black/40">
                <TabsContent value="output" className="p-8 text-white/70 h-full overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar">
                  {terminalOutput}
                </TabsContent>

                <TabsContent value="cases" className="p-8 h-full overflow-y-auto space-y-6 custom-scrollbar">
                  {currentResult ? (
                    <div className="space-y-6">
                      <div className={cn("p-6 rounded-2xl border flex items-center justify-between shadow-lg", 
                        currentResult.status === 'Solved' ? "bg-green-500/10 border-green-500/20" : 
                        currentResult.status === 'Skipped' ? "bg-white/5 border-white/10" : "bg-red-500/10 border-red-500/20")}>
                         <div className="flex items-center gap-6">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", currentResult.status === 'Solved' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
                               {currentResult.status === 'Solved' ? <Trophy className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                            <div>
                               <h4 className={cn("text-lg font-bold tracking-tight", currentResult.status === 'Solved' ? "text-green-400" : "text-red-400")}>
                                {currentResult.status === 'Solved' ? "NODES VERIFIED" : currentResult.status === 'Skipped' ? "NODE SKIPPED" : "SYNTAX FAILURE"}
                               </h4>
                               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Audit Passes: {currentResult.passedCount}/{currentResult.totalCount}</p>
                            </div>
                         </div>
                      </div>

                      <div className="grid gap-3">
                        {(currentResult.results || []).map((r: any, i: number) => (
                          <div key={i} className="p-4 glass border-white/5 rounded-2xl bg-white/[0.01] flex items-center justify-between hover:bg-white/[0.03] transition-all group/node">
                            <div className="flex items-center gap-4">
                              <div className={cn("w-2 h-2 rounded-full", r.passed ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")} />
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover/node:text-white transition-colors">Probe Node #{i + 1}</span>
                            </div>
                            <Badge variant="outline" className={cn("text-[8px] uppercase py-1 px-4 font-black tracking-widest rounded-lg", r.passed ? "text-green-400 border-green-500/20 bg-green-500/5" : "text-red-400 border-red-500/20 bg-red-500/5")}>
                              {r.status || (r.passed ? "PASSED" : "FAILED")}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {countdown !== null && (
                        <div className="mt-10 p-8 glass rounded-[2.5rem] border-accent/30 bg-accent/5 flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500 shadow-2xl">
                          <div className="relative">
                             <div className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                             <Timer className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <p className="text-sm font-black uppercase tracking-[0.4em] text-white">
                            NEXT NODE IN <span className="text-accent text-2xl tabular-nums ml-2">{countdown}S</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 group">
                      <ShieldCheck className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
                      <p className="text-[10px] font-black text-white uppercase tracking-[0.6em]">Awaiting node submission...</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </main>

      <AnimatePresence>
        {isFinalizing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-[#050816]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-16">
              <div className="w-64 h-64 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
              <Cpu className="w-16 h-16 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-6xl font-bold tracking-tighter text-premium uppercase mb-16">Synthesizing Dossier</h2>
            <div className="space-y-8 max-w-md w-full">
              {["Aggregating Performance...", "Calculating Precision...", "Validating Efficiency...", "Finalizing Archive..."].map((step, idx) => (
                <div key={idx} className={cn("flex items-center gap-8 transition-all duration-700", submitStep >= idx ? "opacity-100 translate-x-0" : "opacity-10 translate-x-4")}>
                  <div className={cn("w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-[12px] font-black shadow-lg", submitStep > idx ? "bg-green-500 border-green-500 text-black" : "border-white/10 text-white/20")}>
                    {submitStep > idx ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-base font-black uppercase tracking-[0.3em] text-white/80">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
