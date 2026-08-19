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
  FastForward
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDoc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MASTER_QUESTIONS } from '@/lib/coding-questions-data';

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
    const map: Record<string, string> = {
      'Strings': 'STRING ENGINE',
      'Arrays': 'DATA STRUCTURES',
      'Stack': 'ALGORITHM CORE',
      'Hash Map': 'HASH ENGINE',
      'Sorting': 'OPTIMIZATION CORE',
      'Searching': 'SCAN PROTOCOL',
      'Data Structures': 'DATA STRUCTURES',
      'Algorithms': 'ALGORITHM CORE'
    };

    if (!topic || typeof topic !== 'string') {
      return 'ALGORITHM CORE';
    }

    return map[topic] || topic.toUpperCase();
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
      
      const total = questions?.length || 10;
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
          failed++;
        }
      }
      
      const scorePercentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      
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
          submissionTime: new Date().toLocaleTimeString()
        },
        codingRoundCompleted: true,
        codingScore: scorePercentage,
        currentStage: 'HR Interview',
        step: 6,
        updatedAt: serverTimestamp()
      });

      router.push('/interview/coding-result');
    } catch (error) {
      console.error("Finalize Assessment Error:", error);
      setIsFinalizing(false);
      toast({ variant: "destructive", title: "Archive Failure" });
    }
  }, [isFinalizing, user, db, journey, sessionResults, questions, journeyRef, router, toast]);

  const goToNextQuestion = useCallback(async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    const totalQuestionsCount = (questions || []).length;
    if (currentIdx < totalQuestionsCount - 1) {
      setCurrentIdx(prev => prev + 1);
      setTerminalOutput("Waiting for your implementation.");
      setActiveTerminalTab("output");
      setIsNavigating(false);
    } else {
      await finalizeAssessment();
    }
  }, [currentIdx, questions, isNavigating, finalizeAssessment]);

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

      // UNLOCK GUARD: 70% threshold enforcement
      if (journey.codingUnlocked !== true) {
        toast({ 
          variant: "destructive", 
          title: "Access Restricted", 
          description: "A minimum efficiency rating of 70% in the Aptitude Round is required to enter the Syntax Matrix stage." 
        });
        router.push('/interview/aptitude');
        return;
      }

      if (questions && questions.length === 10) return;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const usedIds = Array.isArray(userData?.codingQuestionHistory) ? userData.codingQuestionHistory : [];
        
        const pickQuestions = (difficulty: string, count: number) => {
          const pool = [...MASTER_QUESTIONS].filter(q => q.difficulty === difficulty);
          const shuffledPool = pool.sort(() => Math.random() - 0.5);
          
          const unused = shuffledPool.filter(q => !usedIds.includes(q.id));
          const used = shuffledPool.filter(q => usedIds.includes(q.id));
          
          const combined = [...unused, ...used];
          return combined.slice(0, count);
        };

        const selectedEasy = pickQuestions('Easy', 4);
        const selectedMed = pickQuestions('Medium', 4);
        const selectedHard = pickQuestions('Hard', 2);

        const finalQuestions = [...selectedEasy, ...selectedMed, ...selectedHard];
        
        if (finalQuestions.length < 10) {
          const fallback = MASTER_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 10);
          setQuestions(fallback);
          return;
        }

        const newIds = finalQuestions.map(q => q.id);
        
        await updateDoc(journeyRef!, {
          codingQuestions: finalQuestions,
          questionsSessionId: journey.sessionId || "unknown",
          updatedAt: serverTimestamp()
        });

        const updatedHistory = Array.from(new Set([...usedIds, ...newIds]));
        await updateDoc(userRef, {
          codingQuestionHistory: updatedHistory
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
      <Brain className="w-12 h-12 text-accent animate-pulse" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Neural Core Synchronizing...</p>
    </div>
  );

  const currentResult = sessionResults[currentIdx];
  const isCurrentFailed = !!currentResult && currentResult.status !== 'Solved' && currentResult.status !== 'Skipped';

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      
      <header className="h-[72px] border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
             <Code2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">Syntax Matrix Protocol</h1>
            <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Question {currentIdx + 1} of {(questions || []).length || 10}</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-12">
          <div className="flex justify-between items-center mb-1.5 px-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Progression Roadmap</span>
             <span className="text-[8px] font-black uppercase tracking-widest text-accent">α → α → α → α → β → β → β → β → Ω → Ω</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
            {(questions || []).map((_, s) => (
              <div key={s} className={cn("flex-1 h-full transition-all duration-500", currentIdx >= s ? "bg-accent shadow-[0_0_8px_#22d3ee]" : "bg-white/5")} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className={cn(
            "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums tracking-widest flex items-center gap-3",
            timeLeft < 300 && "animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          )} style={{ color: '#ef4444' }}>
            <Timer className="w-5 h-5" /> {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 container-fluid flex overflow-hidden p-4 gap-4">
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 glass bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar rounded-[2.5rem]">
            {currentQ ? (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Question {currentIdx + 1} of {(questions || []).length || 10}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#ef4444' }}>TIME LEFT: {formatTime(timeLeft)}</span>
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
                    <p className="text-base text-white/70 leading-relaxed font-light whitespace-pre-wrap">{currentQ.description || 'Solve the given programming problem.'}</p>
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
                        <pre className="text-accent whitespace-pre-wrap p-4 glass rounded-xl bg-white/5 border border-white/5">{currentQ.sampleInput || ''}</pre>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/20 uppercase tracking-widest text-[9px]">EXPECTED OUTPUT</p>
                        <pre className="text-green-400 whitespace-pre-wrap p-4 glass rounded-xl bg-white/5 border border-white/5">{currentQ.sampleOutput || ''}</pre>
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
          <Card className="p-6 glass border-accent/20 bg-accent/[0.03] rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                 <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">MISSION</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Complete the algorithm logic. Verification is mandatory for progression.</p>
              </div>
            </div>
            {(isNavigating || countdown !== null) && (
              <div className="flex items-center gap-3 bg-accent/20 px-6 py-2 rounded-xl border border-accent/30 animate-pulse">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
                <span className="text-[9px] font-black text-accent uppercase tracking-widest">
                  {countdown !== null ? `TRANSITIONING IN ${countdown}S...` : "LOADING NEXT QUESTION..."}
                </span>
              </div>
            )}
          </Card>

          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] flex flex-col relative overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center px-10 gap-12 justify-between">
               <div className="flex items-center gap-12">
                 {currentQ?.functionInfo && (
                   <>
                     <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Function:</span>
                        <Badge variant="outline" className="border-accent/30 text-accent text-[10px] font-mono px-3">
                          {currentQ.functionInfo.name || 'solve()'}
                        </Badge>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Return:</span>
                        <span className="text-[10px] font-mono text-purple-400">{currentQ.functionInfo.returnType || 'void'}</span>
                     </div>
                   </>
                 )}
               </div>
               <div className="flex items-center gap-3">
                 <select 
                   value={selectedLang?.id || LANGUAGES[0].id} 
                   onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])} 
                   className="h-8 px-3 glass border-white/10 bg-[#0b0e1a] rounded-lg text-[9px] font-black uppercase tracking-widest outline-none focus:border-accent"
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
                
                monaco.languages.typescript.typescriptDefaults.addExtraLib(`
                  declare module "fs" {
                    export function readFileSync(fd: number, encoding: string): string;
                    export function readFileSync(path: string, encoding: string): string;
                  }
                  declare var process: {
                    stdin: { fd: number };
                    stdout: { write: (s: string) => void };
                  };
                `, 'node.d.ts');
              }}
              options={{ 
                fontSize: 15, 
                readOnly: isTimeExpired || isFinalizing || countdown !== null ? true : false, 
                minimap: { enabled: false },
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6
              }} 
            />

            <div className="h-24 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-10">
              <div className="flex items-center gap-6">
                <Button 
                  onClick={handleRunCode} 
                  disabled={isRunning || isSubmitting || isTimeExpired || isNavigating || !currentQ || countdown !== null} 
                  className="h-12 px-8 glass border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                >
                  {isRunning ? <Loader2 className="w-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />} RUN SAMPLE
                </Button>

                <Button 
                  onClick={handleSubmitCode} 
                  disabled={isRunning || isSubmitting || isTimeExpired || isNavigating || !currentQ || countdown !== null} 
                  className="h-12 px-12 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl group"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 animate-spin mr-2" /> AUDITING TESTS...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> SUBMIT ANSWER</>
                  )}
                </Button>

                <Button 
                  onClick={handleSkipQuestion} 
                  disabled={isRunning || isSubmitting || isTimeExpired || isNavigating || !currentQ || countdown !== null}
                  variant="ghost" 
                  className="h-12 px-6 rounded-xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
                >
                  <FastForward className="w-4 h-4 mr-2" /> SKIP QUESTION
                </Button>
              </div>
            </div>
          </Card>

          <Card className="h-[30%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden rounded-[2.5rem]">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
              <TabsList className="bg-white/[0.03] px-10 h-12 border-b border-white/5 gap-8">
                <TabsTrigger value="output" className="text-[9px] font-black uppercase tracking-[0.2em] data-[state=active]:text-accent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full transition-all">Console Output</TabsTrigger>
                <TabsTrigger value="cases" className="text-[9px] font-black uppercase tracking-[0.2em] data-[state=active]:text-accent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full transition-all">Audit Trace</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 font-mono text-[12px] overflow-hidden bg-black/20">
                <TabsContent value="output" className="p-8 text-white/60 h-full overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {terminalOutput}
                </TabsContent>

                <TabsContent value="cases" className="p-8 h-full overflow-y-auto space-y-4">
                  {currentResult ? (
                    <div className="space-y-4">
                      <div className={cn("p-4 rounded-xl border flex items-center justify-between", 
                        currentResult.status === 'Solved' ? "bg-green-500/10 border-green-500/20" : 
                        currentResult.status === 'Skipped' ? "bg-white/5 border-white/10" : "bg-red-500/10 border-red-500/20")}>
                         <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentResult.status === 'Solved' ? "bg-green-500/20 text-green-400" : "bg-red-500/10 text-red-400")}>
                               {currentResult.status === 'Solved' ? <Trophy className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </div>
                            <div>
                               <h4 className={cn("text-sm font-bold", currentResult.status === 'Solved' ? "text-green-400" : "text-red-400")}>
                                {currentResult.status === 'Solved' ? "SUBMISSION ACCEPTED" : currentResult.status === 'Skipped' ? "QUESTION SKIPPED" : "SUBMISSION FAILED"}
                               </h4>
                               <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Audit Nodes Passed: {currentResult.passedCount}/{currentResult.totalCount}</p>
                            </div>
                         </div>
                      </div>

                      <div className="grid gap-2">
                        {(currentResult.results || []).map((r: any, i: number) => (
                          <div key={i} className="p-3 glass border-white/5 rounded-lg bg-white/[0.01] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-1.5 h-1.5 rounded-full", r.passed ? "bg-green-500" : "bg-red-500")} />
                              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Audit Case #{i + 1}</span>
                            </div>
                            <Badge variant="outline" className={cn("text-[7px] uppercase py-0", r.passed ? "text-green-400 border-green-500/20" : "text-red-400 border-red-500/20")}>
                              {r.status || (r.passed ? "PASSED" : "FAILED")}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {countdown !== null && (
                        <div className="mt-8 p-6 glass rounded-2xl border-accent/20 bg-accent/5 flex items-center justify-center gap-4 animate-pulse">
                          <Timer className="w-6 h-6 text-accent" />
                          <p className="text-sm font-bold uppercase tracking-widest text-white">
                            Next question in <span className="text-accent text-lg">{countdown}</span> seconds...
                          </p>
                        </div>
                      )}

                      {isCurrentFailed && countdown === null && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                           <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Protocol mismatch detected.</p>
                           <Button 
                             onClick={handleSkipQuestion}
                             variant="outline"
                             className="h-12 px-8 border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                           >
                             Skip This Question
                           </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                      <ShieldCheck className="w-10 h-10" />
                      <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Awaiting answer submission...</p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-[#050816]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-12">
              <div className="w-56 h-56 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
              <Cpu className="w-14 h-14 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-5xl font-bold tracking-tighter text-premium uppercase mb-12">Finalizing Matrix Dossier</h2>
            <div className="space-y-6 max-w-sm w-full">
              {["Aggregating Node Telemetry...", "Calculating Logic Precision...", "Validating Matrix Metrics...", "Finalizing Performance Audit..."].map((step, idx) => (
                <div key={idx} className={cn("flex items-center gap-6 transition-opacity duration-500", submitStep >= idx ? "opacity-100" : "opacity-20")}>
                  <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black", submitStep > idx ? "bg-green-500 border-green-500 text-black" : "border-white/20 text-white/20")}>
                    {submitStep > idx ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
