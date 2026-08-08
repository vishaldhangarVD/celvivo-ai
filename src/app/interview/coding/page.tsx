
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  AlertCircle,
  HelpCircle,
  ArrowDownCircle,
  CheckCircle2,
  FileCode,
  Info,
  Rocket
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MASTER_QUESTIONS } from '@/lib/coding-questions-data';

const LANGUAGES = [
  { id: 'python', label: 'Python 3', monaco: 'python' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'c', label: 'C', monaco: 'c' },
  { id: 'csharp', label: 'C#', monaco: 'csharp' },
  { id: 'go', label: 'Go', monaco: 'go' },
  { id: 'rust', label: 'Rust', monaco: 'rust' }
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
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  
  const [sessionResults, setSessionResults] = useState<Record<number, any>>({});
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("Waiting for your implementation.");
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-green-400 border-green-500/20 bg-green-500/5';
      case 'Medium': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
      case 'Hard': return 'text-red-400 border-red-500/20 bg-red-500/5';
      default: return 'text-accent border-accent/20 bg-accent/5';
    }
  };

  const getTopicLabel = (topic: string) => {
    const map: Record<string, string> = {
      'Strings': 'STRING ENGINE',
      'Arrays': 'DATA STRUCTURES',
      'Stack': 'ALGORITHM CORE',
      'Hash Map': 'HASH ENGINE',
      'Sorting': 'OPTIMIZATION CORE',
      'Searching': 'SCAN PROTOCOL'
    };
    return map[topic] || topic.toUpperCase();
  };

  const finalizeAssessment = useCallback(async () => {
    if (isFinalizing || !user || !db || !journey) return;
    setIsFinalizing(true);
    try {
      for (let i = 0; i < 4; i++) {
        setSubmitStep(i);
        await new Promise(r => setTimeout(r, 800));
      }
      
      const resultsArray = Object.entries(sessionResults);
      const solvedQuestionsCount = resultsArray.filter(([_, r]) => r.status === 'Solved').length;
      const scorePercentage = questions.length > 0 ? Math.round((solvedQuestionsCount / questions.length) * 100) : 0;
      
      for (const [idxStr, res] of resultsArray) {
        const idx = parseInt(idxStr);
        const q = questions[idx];
        
        // Calculate performance metrics (Max execution time and memory among test cases)
        const executionTime = res.results?.length > 0 
          ? Math.max(...res.results.map((r: any) => parseFloat(r.executionTime || 0))) 
          : 0;
        const memory = res.results?.length > 0 
          ? Math.max(...res.results.map((r: any) => {
              const m = parseInt(r.memory || 0);
              return isNaN(m) ? 0 : m;
            })) 
          : 0;

        await addDoc(collection(db, 'users', user.uid, 'coding_results'), {
          interviewId: journey.sessionId || "unknown",
          userId: user.uid,
          questionId: q.id,
          language: res.language,
          score: res.status === 'Solved' ? 100 : Math.round((res.passedCount / res.totalCount) * 100),
          passedTestCases: res.passedCount,
          totalTestCases: res.totalCount,
          status: res.status,
          submittedCode: res.code,
          executionTime,
          memory,
          completedAt: serverTimestamp(),
        });
      }

      await updateDoc(journeyRef!, {
        codingReport: { 
          score: scorePercentage, 
          status: scorePercentage >= 60 ? 'Pass' : 'Fail', 
          totalQuestions: questions.length, 
          passedQuestions: solvedQuestionsCount, 
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

  const handleRunCode = async () => {
    if (isRunning || isSubmitting || isTimeExpired) return;
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
          stdin: questions[currentIdx]?.sampleInput 
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        setTerminalOutput(`[SYSTEM ERROR]\n${data.error}`);
      } else {
        setTerminalOutput(`[SAMPLE SUCCESS]\n\nOutput Trace:\n${data.stdout}\n\nTemporal Audit: ${data.time}s | Memory Load: ${data.memory}KB`);
      }
    } catch (error) {
      setTerminalOutput("[NETWORK FAULT] Execution link interrupted.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (isSubmitting || isRunning || isTimeExpired || !questions[currentIdx]) return;
    setIsSubmitting(true);
    setActiveTerminalTab("cases");
    setTerminalOutput("Connecting to Audit Matrix nodes...");
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          source_code: code, 
          language: selectedLang.id, 
          testCases: questions[currentIdx].hiddenTestCases || [] 
        }),
      });

      if (!response.ok) throw new Error("Audit node timeout.");
      const data = await response.json();
      const results = data.results || [];
      const passed = results.filter((r: any) => r.passed).length;
      const total = results.length || 1;
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
      
      if (allPassed) {
        toast({ title: "Node Synchronized", description: "Audit Matrix verification complete." });
      } else {
        toast({ variant: "destructive", title: "Audit Fault", description: `Synchronized ${passed}/${total} nodes.` });
      }
    } catch (error: any) {
      setTerminalOutput("[CRITICAL FAULT] Matrix node connection lost.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function initEnvironment() {
      if (!db || !journey || questions.length > 0) return;
      
      try {
        const easyPool = [...MASTER_QUESTIONS].filter(q => q.difficulty === 'Easy');
        const medPool = [...MASTER_QUESTIONS].filter(q => q.difficulty === 'Medium');
        const hardPool = [...MASTER_QUESTIONS].filter(q => q.difficulty === 'Hard');

        const mirrorWordIdx = easyPool.findIndex(q => q.title === "The Mirror Word Test");
        let selectedEasy: any[] = [];
        
        if (mirrorWordIdx !== -1) {
          const mirrorWord = easyPool.splice(mirrorWordIdx, 1)[0];
          selectedEasy = [mirrorWord, ...easyPool.sort(() => 0.5 - Math.random()).slice(0, 1)];
        } else {
          selectedEasy = easyPool.sort(() => 0.5 - Math.random()).slice(0, 2);
        }

        const finalQuestions = [
          ...selectedEasy,
          ...medPool.sort(() => 0.5 - Math.random()).slice(0, 2),
          ...hardPool.sort(() => 0.5 - Math.random()).slice(0, 1)
        ];

        await updateDoc(journeyRef!, {
          codingQuestions: finalQuestions,
          updatedAt: serverTimestamp()
        });

        setQuestions(finalQuestions);
      } catch (e: any) {
        console.error("Environment Sync Fault:", e);
        toast({ variant: "destructive", title: "Matrix Sync Fault", description: "Failed to calibrate logic nodes." });
      } finally {
        setIsInitializing(false);
      }
    }
    initEnvironment();
  }, [db, journey, journeyRef, questions.length, toast]);

  useEffect(() => {
    if (questions[currentIdx]) {
      const q = questions[currentIdx];
      const saved = sessionResults[currentIdx]?.code;
      setCode(saved || q.starterCode?.[selectedLang.id] || q.starterCode?.["python"] || "");
      setTerminalOutput(sessionResults[currentIdx] ? "Node submission archived in matrix." : "Waiting for your implementation.");
    }
  }, [currentIdx, selectedLang, questions, sessionResults]);

  useEffect(() => {
    if (isInitializing || isFinalizing || isTimeExpired) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, isFinalizing, isTimeExpired]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isInitializing || journeyLoading) return <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-12"><Brain className="w-12 h-12 text-accent animate-pulse" /><p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Neural Core Synchronizing...</p></div>;

  const currentQ = questions[currentIdx];
  const currentResult = sessionResults[currentIdx];
  const isCurrentSubmitted = !!currentResult;
  const allNodesSubmitted = Object.keys(sessionResults).length === questions.length;

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      
      {/* DEV ONLY BUTTON */}
      <div className="fixed top-2 right-2 z-[200]">
        <Button 
          onClick={finalizeAssessment}
          variant="ghost" 
          className="h-8 px-3 rounded-lg glass border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent opacity-20 hover:opacity-100 transition-opacity"
        >
          DEV SKIP
        </Button>
      </div>

      <header className="h-[72px] border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
             <Code2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">Syntax Matrix Protocol</h1>
            <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Logic Node {currentIdx + 1} of {questions.length}</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-12">
          <div className="flex justify-between items-center mb-1.5 px-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Progression Roadmap</span>
             <span className="text-[8px] font-black uppercase tracking-widest text-accent">α → α → β → β → Ω</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={cn("flex-1 h-full transition-all duration-500", (currentIdx + 1) >= s ? "bg-accent shadow-[0_0_8px_#22d3ee]" : "bg-white/5")} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className={cn(
            "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums tracking-widest flex items-center gap-3",
            timeLeft < 300 ? "text-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "text-accent"
          )}>
            <Timer className="w-5 h-5" /> {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 container-fluid flex overflow-hidden p-4 gap-4">
        {/* Left: Problem Statement */}
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 glass bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar rounded-[2.5rem]">
            <div className="space-y-10">
              <div className="p-6 glass border-accent/20 bg-accent/[0.02] rounded-3xl space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                  <Activity className="w-4 h-4" /> HOW TO SOLVE
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    "Read Problem Narrative",
                    "Understand Input & Output",
                    "Complete the Function",
                    "Run Sample",
                    "Fix Errors",
                    "Submit Node",
                    "Unlock Next Node"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-black", (i+1) <= (isCurrentSubmitted ? 7 : 3) ? "bg-accent border-accent text-black" : "border-white/20 text-white/20")}>
                        {(i+1) <= (isCurrentSubmitted ? 7 : 3) ? <Check className="w-2.5 h-2.5" /> : i + 1}
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", (i+1) <= (isCurrentSubmitted ? 7 : 3) ? "text-white" : "text-white/20")}>{step}</span>
                      {i < 6 && <ArrowDownCircle className={cn("w-2.5 h-2.5 opacity-10", (i+1) < 3 ? "opacity-40 text-accent" : "")} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase tracking-widest">ACTIVE MATRIX NODE 0{currentIdx + 1}</Badge>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-white/40" />
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">ESTIMATED: {currentQ?.estimatedTime}</span>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-white">{currentQ?.title}</h2>
                <div className="flex gap-3">
                  <Badge variant="outline" className={cn("text-[10px] uppercase px-4 py-1 font-black tracking-widest", getDifficultyColor(currentQ?.difficulty))}>
                    {currentQ?.difficulty === 'Easy' ? 'LEVEL α' : currentQ?.difficulty === 'Medium' ? 'LEVEL β' : 'LEVEL Ω'}
                  </Badge>
                  <Badge variant="outline" className="text-white/40 text-[10px] uppercase border-white/10 px-4 py-1 font-black tracking-widest flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> {getTopicLabel(currentQ?.topic)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">PROBLEM NARRATIVE</h4>
                  <p className="text-base text-white/70 leading-relaxed font-light whitespace-pre-wrap">{currentQ?.description}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">INPUT PROTOCOL</h4>
                  <p className="text-sm text-white/50 leading-relaxed italic">{currentQ?.inputFormat}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">OUTPUT PROTOCOL</h4>
                  <p className="text-sm text-white/50 leading-relaxed italic">{currentQ?.outputFormat}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">BOUNDARY CONSTRAINTS</h4>
                  <ul className="space-y-2">
                    {currentQ?.constraints.map((c: string, i: number) => (
                      <li key={i} className="text-sm text-white/50 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0 shadow-[0_0_8px_#22d3ee]" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 p-6 glass border-white/5 rounded-3xl bg-black/40">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">SYSTEM SAMPLE</h4>
                  <div className="space-y-5 font-mono text-[11px]">
                    <div className="space-y-2">
                      <p className="text-white/20 uppercase tracking-widest text-[9px]">INPUT</p>
                      <pre className="text-accent whitespace-pre-wrap p-4 glass rounded-xl bg-white/5 border border-white/5">{currentQ?.sampleInput}</pre>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/20 uppercase tracking-widest text-[9px]">EXPECTED OUTPUT</p>
                      <pre className="text-green-400 whitespace-pre-wrap p-4 glass rounded-xl bg-white/5 border border-white/5">{currentQ?.sampleOutput}</pre>
                    </div>
                  </div>
                </div>

                {currentQ?.walkthrough && (
                  <div className="space-y-4 p-6 glass border-white/5 rounded-3xl bg-white/[0.02]">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">EXAMPLE WALKTHROUGH</h4>
                    <div className="space-y-3 text-[10px] font-mono leading-relaxed">
                       <div className="flex gap-4"><span className="text-white/20 w-24">INPUT:</span> <span className="text-accent">{currentQ.walkthrough.input}</span></div>
                       <div className="flex gap-4"><span className="text-white/20 w-24">RECEIVED:</span> <span className="text-purple-400">{currentQ.walkthrough.received}</span></div>
                       <div className="flex gap-4"><span className="text-white/20 w-24">EXPECTED:</span> <span className="text-green-400">{currentQ.walkthrough.expected}</span></div>
                       <div className="flex gap-4"><span className="text-white/20 w-24">OUTPUT:</span> <span className="text-green-400">{currentQ.walkthrough.output}</span></div>
                    </div>
                  </div>
                )}

                <Card className="p-6 glass border-purple-500/20 bg-purple-500/[0.02] space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI AUDIT NOTE
                  </h4>
                  <p className="text-xs font-light text-white/50 leading-relaxed italic">
                    "This challenge evaluates algorithm design, optimization, edge-case handling and production-grade implementation."
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Code Editor & Results */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="p-6 glass border-accent/20 bg-accent/[0.03] rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                 <Rocket className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">MISSION</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Complete the function provided below. Replace the TODO section.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
               <Info className="w-4 h-4 text-accent" />
               <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Replace the TODO section</span>
            </div>
          </Card>

          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] flex flex-col relative overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center px-10 gap-12">
               <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Function:</span>
                  <Badge variant="outline" className="border-accent/30 text-accent text-[10px] font-mono px-3">{currentQ?.functionInfo?.name || 'solve()'}</Badge>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Return:</span>
                  <span className="text-[10px] font-mono text-purple-400">{currentQ?.functionInfo?.returnType || 'void'}</span>
               </div>
            </div>

            <Editor 
              height="100%" 
              theme="vs-dark" 
              language={selectedLang.monaco} 
              value={code} 
              onChange={(val) => setCode(val || "")} 
              options={{ 
                fontSize: 15, 
                readOnly: isTimeExpired || isFinalizing, 
                minimap: { enabled: false },
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6
              }} 
            />

            <div className="h-32 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-10">
              <div className="flex items-center gap-12">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleRunCode} disabled={isRunning || isSubmitting || isTimeExpired} className="h-12 px-8 glass border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                        {isRunning ? <Loader2 className="w-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />} RUN SAMPLE
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="glass border-white/10 bg-[#0b0e1a] text-white">Run against visible sample only.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleSubmitCode} disabled={isRunning || isSubmitting || isTimeExpired} className="h-12 px-8 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                        {isSubmitting ? <Loader2 className="w-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />} SUBMIT NODE
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="glass border-white/10 bg-[#0b0e1a] text-white">Run against all hidden test cases.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center gap-4">
                <select 
                  value={selectedLang.id} 
                  onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])} 
                  className="h-11 px-4 glass border-white/10 bg-[#0b0e1a] rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent"
                >
                  {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>

                {currentIdx < questions.length - 1 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => setCurrentIdx(prev => prev + 1)} 
                          disabled={!isCurrentSubmitted} 
                          className="h-12 px-8 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 disabled:grayscale transition-all"
                        >
                          NEXT NODE <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="glass border-white/10 bg-[#0b0e1a] text-white">Available after successful submission.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button 
                    onClick={finalizeAssessment} 
                    disabled={!allNodesSubmitted} 
                    className="h-12 px-10 bg-accent/20 border border-accent/40 text-accent text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent/30 disabled:opacity-20 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                  >
                    FINISH SESSION
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Terminal Console */}
          <Card className="h-[35%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden rounded-[2.5rem]">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
              <TabsList className="bg-white/[0.03] px-10 h-14 border-b border-white/5 gap-8">
                <TabsTrigger value="output" className="text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:text-accent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full transition-all">Execution Output</TabsTrigger>
                <TabsTrigger value="cases" className="text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:text-accent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full transition-all">Audit Matrix</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 font-mono text-[12px] overflow-hidden bg-black/20">
                <TabsContent value="output" className="p-10 text-white/60 h-full overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {terminalOutput}
                </TabsContent>

                <TabsContent value="cases" className="p-8 h-full overflow-y-auto space-y-6">
                  {currentResult ? (
                    <div className="space-y-6">
                      <div className={cn("p-6 rounded-2xl border flex items-center justify-between", currentResult.status === 'Solved' ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20")}>
                         <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", currentResult.status === 'Solved' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                               {currentResult.status === 'Solved' ? <Trophy className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                            <div>
                               <h4 className={cn("text-lg font-bold tracking-tight", currentResult.status === 'Solved' ? "text-green-400" : "text-red-400")}>{currentResult.status === 'Solved' ? "NODE CLEARED" : "NODE FAILED"}</h4>
                               <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Audit Trace Summary</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">PASSED NODES</p>
                            <p className="text-lg font-bold text-white tabular-nums">{currentResult.passedCount}/{currentResult.totalCount}</p>
                         </div>
                      </div>

                      <div className="grid gap-3">
                        {currentResult.results.map((r: any, i: number) => (
                          <div key={i} className="p-5 glass border-white/5 rounded-xl bg-white/[0.01] space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-2 h-2 rounded-full", r.passed ? "bg-green-500" : "bg-red-500")} />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Hidden Test #{i + 1}</span>
                              </div>
                              <Badge variant="outline" className={cn("text-[8px] uppercase px-2 py-0", r.passed ? "text-green-400 border-green-500/20" : "text-red-400 border-red-500/20")}>{r.status}</Badge>
                            </div>

                            {!r.passed && (
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase font-bold text-white/20">Input Protocol</p>
                                  <pre className="p-3 bg-black/40 rounded-lg text-white/60 text-[10px] overflow-x-auto">{r.input}</pre>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase font-bold text-white/20">Expected Output</p>
                                  <pre className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg text-green-400/80 text-[10px] overflow-x-auto">{r.expected}</pre>
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <p className="text-[8px] uppercase font-bold text-white/20">Actual System Output</p>
                                  <pre className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400/80 text-[10px] overflow-x-auto">{r.actual || "Empty Output"}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                      <ShieldCheck className="w-12 h-12" />
                      <p className="text-[11px] font-black text-white uppercase tracking-[0.5em]">Waiting for submission...<br/>Run node to initiate audit.</p>
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
            <h2 className="text-5xl font-bold tracking-tighter text-premium uppercase mb-12">Synthesizing Matrix Dossier</h2>
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

