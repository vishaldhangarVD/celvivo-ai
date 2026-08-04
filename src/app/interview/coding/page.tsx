"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Code2, 
  Play, 
  Send, 
  RotateCcw, 
  Clock, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  Settings,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Check,
  SkipForward,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Sparkles,
  Command,
  Brain,
  Keyboard,
  XCircle
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { generateCodingQuestions, type CodingProblem } from '@/ai/flows/ai-coding-generator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getJudge0LanguageId } from '@/lib/judge0-languages';

const LANGUAGES = [
  { id: 'python', label: 'Python 3' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'c', label: 'C' },
  { id: 'csharp', label: 'C#' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' }
];

const INITIALIZATION_MESSAGES = [
  "Initializing Coding Environment...",
  "Analyzing Candidate Profile...",
  "Generating FAANG-Level Coding Questions...",
  "Preparing Secure Assessment..."
];

export default function CodingEnginePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Core Simulation State
  const [questions, setQuestions] = useState<CodingProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questionStatuses, setQuestionStatuses] = useState<('current' | 'submitted' | 'skipped' | 'pending')[]>(Array(5).fill('pending'));
  const [hasUsedSkip, setHasUsedSkip] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Stats Tracking for Firestore
  const [sessionResults, setSessionResults] = useState<any[]>([]);

  // Initialization State
  const [isInitializing, setIsInitializing] = useState(true);
  const [initMsgIdx, setInitMsgIdx] = useState(0);
  
  // UI Flow State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  // 1. Initialization Logic (Generate Questions via Gemini)
  useEffect(() => {
    async function initEnvironment() {
      if (!journey || !journeyRef || questions.length > 0) return;

      const msgInterval = setInterval(() => {
        setInitMsgIdx(prev => Math.min(prev + 1, INITIALIZATION_MESSAGES.length - 1));
      }, 1500);

      try {
        const snap = await getDoc(journeyRef);
        const data = snap.data();

        if (data?.codingQuestions && data.codingQuestions.length === 5) {
          setQuestions(data.codingQuestions);
          const initialStatuses = Array(5).fill('pending') as any;
          initialStatuses[0] = 'current';
          setQuestionStatuses(initialStatuses);
        } else {
          const response = await generateCodingQuestions({
            role: journey.role,
            company: journey.company,
            experienceLevel: journey.experience,
          });

          await updateDoc(journeyRef, {
            codingQuestions: response.questions,
            updatedAt: serverTimestamp(),
          });

          setQuestions(response.questions);
          const initialStatuses = Array(5).fill('pending') as any;
          initialStatuses[0] = 'current';
          setQuestionStatuses(initialStatuses);
        }
      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Synthesis Error", description: "Could not architect coding challenges." });
      } finally {
        clearInterval(msgInterval);
        setIsInitializing(false);
      }
    }
    initEnvironment();
  }, [journey, journeyRef, questions.length, toast]);

  // 2. Code Calibration
  useEffect(() => {
    if (questions[currentIdx]) {
      const q = questions[currentIdx];
      const saved = localStorage.getItem(`nexvoro_code_session_${q.id}_${selectedLang.id}`);
      if (saved) {
        setCode(saved);
      } else {
        const starter = q.starterCode[selectedLang.id as keyof typeof q.starterCode] || "// No starter code available.";
        setCode(starter);
      }
      setCustomInput(q.sampleInput || "");
    }
  }, [currentIdx, selectedLang, questions]);

  // 3. Timer Logic
  useEffect(() => {
    if (isInitializing || isFinalizing) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          forceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, isFinalizing]);

  // 4. Auto-Save Logic
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (code && questions[currentIdx]) {
        localStorage.setItem(`nexvoro_code_session_${questions[currentIdx].id}_${selectedLang.id}`, code);
      }
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [code, currentIdx, questions, selectedLang]);

  const forceSubmit = async () => {
    setIsFinalizing(true);
    toast({ title: "Time Over", description: "Submitting your solution...", variant: "destructive" });
    await finalizeAssessment();
  };

  const runCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveTerminalTab("output");
    setTerminalOutput("Compiling Code...\nRunning Implementation...\nWaiting for Execution Result...");

    try {
      const response = await fetch('/api/judge0/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language_id: getJudge0LanguageId(selectedLang.id),
          stdin: customInput
        }),
      });

      const data = await response.json();

      if (data.error) {
        setTerminalOutput(`[SYSTEM ERROR]\n${data.error}\n${data.details || ''}`);
      } else {
        let output = `[EXECUTION COMPLETED]\n\n`;
        output += `Status: ${data.status?.description || 'Unknown'}\n`;
        if (data.time) output += `Time: ${data.time}s\n`;
        if (data.memory) output += `Memory: ${Math.round(data.memory / 1024)}MB\n`;
        
        if (data.stdout) output += `\nOutput:\n${data.stdout}`;
        if (data.stderr) output += `\nError:\n${data.stderr}`;
        if (data.compile_output) output += `\nCompile Output:\n${data.compile_output}`;

        setTerminalOutput(output);
      }
    } catch (error: any) {
      setTerminalOutput(`[NETWORK ERROR]\nFailed to connect to execution node: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNextQuestion = async (wasSkipped: boolean = false) => {
    const newStatuses = [...questionStatuses];
    newStatuses[currentIdx] = wasSkipped ? 'skipped' : 'submitted';
    
    if (currentIdx < 4) {
      newStatuses[currentIdx + 1] = 'current';
      setQuestionStatuses(newStatuses);
      setCurrentIdx(currentIdx + 1);
      setIsSubmitting(false);
      setTerminalOutput("");
    } else {
      setQuestionStatuses(newStatuses);
      await finalizeAssessment();
    }
  };

  const submitQuestion = async () => {
    if (isSubmitting || isRunning) return;
    setIsSubmitting(true);
    setActiveTerminalTab("output");
    setTerminalOutput("Checking Hidden Test Cases...\nEvaluating Solution...");

    const currentQ = questions[currentIdx];

    try {
      const response = await fetch('/api/judge0/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language_id: getJudge0LanguageId(selectedLang.id),
          testCases: currentQ.hiddenTestCases
        }),
      });

      const data = await response.json();

      if (data.error) {
        setTerminalOutput(`[EVALUATION ERROR]\n${data.error}`);
        setIsSubmitting(false);
        return;
      }

      const results = data.results || [];
      const total = results.length;
      const passed = results.filter((r: any) => r.passed).length;
      const allPassed = passed === total;

      setSessionResults(prev => [...prev, {
        questionId: currentQ.id,
        results,
        allPassed,
        language: selectedLang.label
      }]);

      if (allPassed) {
        setTerminalOutput(`[QUESTION SUBMITTED]\nAll ${total} Hidden Test Cases Passed.\nNode Verification: SUCCESS`);
        setTimeout(() => handleNextQuestion(false), 1000);
      } else {
        setTerminalOutput(`[EVALUATION FAILED]\nPassed: ${passed}/${total} Test Cases.\nNeural Verification: FAILED\n\nPlease refine your logic and retry.`);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      setTerminalOutput(`[SYSTEM ERROR]\nEvaluation node connection failed.`);
      setIsSubmitting(false);
    }
  };

  const skipQuestion = () => {
    if (hasUsedSkip) return;
    setHasUsedSkip(true);
    setSessionResults(prev => [...prev, {
      questionId: questions[currentIdx].id,
      allPassed: false,
      skipped: true
    }]);
    handleNextQuestion(true);
  };

  const finalizeAssessment = async () => {
    setIsFinalizing(true);
    const steps = ["Compiling Final Submission...", "Running Hidden Test Cases...", "Checking Performance...", "Generating Coding Report..."];
    for (let i = 0; i < steps.length; i++) {
      setSubmitStep(i);
      await new Promise(r => setTimeout(r, 1200));
    }

    if (user && db && journeyRef) {
      const passedCount = sessionResults.filter(r => r.allPassed).length;
      const totalTC = sessionResults.reduce((acc, r) => acc + (r.results?.length || 0), 0);
      const passedTC = sessionResults.reduce((acc, r) => acc + (r.results?.filter((res: any) => res.passed).length || 0), 0);

      const finalReport = {
        score: Math.round((passedCount / 5) * 100),
        status: passedCount >= 3 ? 'Pass' : 'Fail',
        totalQuestions: 5,
        passedQuestions: passedCount,
        failedQuestions: 5 - passedCount,
        totalTestCases: totalTC,
        passedTestCases: passedTC,
        failedTestCases: totalTC - passedTC,
        accuracy: totalTC > 0 ? Math.round((passedTC / totalTC) * 100) : 0,
        timeTaken: formatTime((45 * 60) - timeLeft),
        submissionTime: new Date().toLocaleTimeString(),
        results: sessionResults
      };
      
      await updateDoc(journeyRef, {
        codingReport: finalReport,
        currentStage: finalReport.status === 'Pass' ? 'HR Interview' : 'Coding Assessment',
        step: finalReport.status === 'Pass' ? 6 : 5
      });
    }

    router.push('/interview/coding-result');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isInitializing || journeyLoading) {
    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Brain className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter text-premium uppercase">Environment Calibration</h2>
          <div className="h-1 w-64 bg-white/5 rounded-full overflow-hidden mx-auto">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((initMsgIdx + 1) / INITIALIZATION_MESSAGES.length) * 100}%` }}
              className="h-full bg-accent"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.p 
              key={initMsgIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/60"
            >
              {INITIALIZATION_MESSAGES[initMsgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className={cn("h-screen bg-[#050816] flex flex-col overflow-hidden relative", isFullScreen && "fixed inset-0 z-[1000]")}>
      <div className="particles-bg" />
      <Navbar />
      
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">NEXVORO AI CODING ENGINE</h1>
            <div className="flex items-center gap-4 mt-0.5">
               <div className="flex gap-1.5">
                 {questionStatuses.map((status, i) => (
                   <div key={i} className={cn(
                     "w-6 h-1.5 rounded-full transition-all duration-500",
                     status === 'current' ? "bg-accent shadow-[0_0_10px_#22d3ee]" :
                     status === 'submitted' ? "bg-green-500" :
                     status === 'skipped' ? "bg-orange-500" :
                     "bg-white/10"
                   )} />
                 ))}
               </div>
               <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Node {currentIdx + 1} / 5</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Session Duration</span>
            <div className={cn(
              "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums transition-all",
              timeLeft < 300 ? "text-red-500 animate-pulse border-red-500/30" : "text-accent"
            )}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex gap-4">
            <select 
              disabled={isSubmitting || isFinalizing}
              value={selectedLang.id}
              onChange={(e) => {
                const lang = LANGUAGES.find(l => l.id === e.target.value);
                if (lang) setSelectedLang(lang);
              }}
              className="h-12 px-4 glass border-white/10 bg-[#0b0e1a] rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent disabled:opacity-50"
            >
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <Button 
              variant="ghost" 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="w-12 h-12 rounded-xl glass border-white/10 p-0"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Panel: Problem Statement */}
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              <div className="space-y-3">
                <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase">Node 0{currentIdx + 1} of 05</Badge>
                <h2 className="text-3xl font-bold tracking-tight leading-tight">{currentQ?.title}</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-red-500/20 text-red-400 text-[8px] font-black uppercase">{currentQ?.difficulty}</Badge>
                  <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-black uppercase">{currentQ?.topic}</Badge>
                </div>
              </div>

              <div className="prose prose-invert prose-sm">
                <p className="text-white/70 leading-relaxed font-light">{currentQ?.problemStatement}</p>
                
                <h4 className="text-xs font-black uppercase tracking-widest text-white/90 mt-8 mb-4">Implementation Constraints</h4>
                <ul className="space-y-2 list-none p-0">
                  {currentQ?.constraints.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/40 text-[10px] font-medium">
                      <div className="w-1 h-1 rounded-full bg-accent" /> {c}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-white/40 text-[10px] font-medium">
                    <div className="w-1 h-1 rounded-full bg-accent" /> Time Limit: {currentQ?.timeLimit}
                  </li>
                  <li className="flex items-center gap-3 text-white/40 text-[10px] font-medium">
                    <div className="w-1 h-1 rounded-full bg-accent" /> Memory Limit: {currentQ?.memoryLimit}
                  </li>
                </ul>

                <h4 className="text-xs font-black uppercase tracking-widest text-white/90 mt-8 mb-4">Sample Scenario</h4>
                <div className="p-5 glass border-white/5 rounded-2xl bg-black/40 space-y-4 font-mono text-[11px]">
                  <div>
                    <p className="text-white/30 uppercase text-[9px] mb-1">Input</p>
                    <p className="text-accent">{currentQ?.sampleInput}</p>
                  </div>
                  <div>
                    <p className="text-white/30 uppercase text-[9px] mb-1">Output</p>
                    <p className="text-green-400">{currentQ?.sampleOutput}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Editor & Terminal */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] relative overflow-hidden flex flex-col">
            <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/40" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                <div className="w-2 h-2 rounded-full bg-green-500/40" />
                <span className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">
                  solution.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'javascript' ? 'js' : selectedLang.id === 'cpp' ? 'cpp' : 'java'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-white/10 text-white/20 text-[7px] font-black uppercase tracking-widest">Auto-Save Protocol Active</Badge>
              </div>
            </div>

            <div className="flex-1 flex font-mono text-sm relative">
              <div className="w-12 bg-white/[0.01] border-r border-white/5 flex flex-col items-center pt-4 text-white/10 select-none">
                {Array.from({length: 40}).map((_, i) => <span key={i} className="leading-6 text-[10px]">{i + 1}</span>)}
              </div>
              <textarea 
                disabled={isSubmitting || isFinalizing || timeLeft <= 0}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-transparent outline-none p-4 leading-6 text-white/80 resize-none custom-scrollbar disabled:opacity-50"
                placeholder="// Implement your algorithmic node here..."
              />
            </div>

            <div className="h-16 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <Button onClick={runCode} disabled={isRunning || isSubmitting || isFinalizing} variant="ghost" className="h-10 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-2 text-green-400" />}
                  Run Code
                </Button>

                {!hasUsedSkip && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="h-10 px-6 rounded-xl glass border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/10">
                        <SkipForward className="w-3.5 h-3.5 mr-2" /> Skip Node
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass border-white/10 bg-[#0b0e1a] text-white rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-3"><AlertTriangle className="text-orange-400" /> Bypass this Question?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                          This logic node will be marked as <span className="text-orange-400 font-bold">Failed</span>. You cannot return to this node. Only one bypass is permitted per session.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl glass border-white/10 bg-transparent text-white/40 hover:bg-white/5 uppercase text-[10px] font-bold tracking-widest">Abort</AlertDialogCancel>
                        <AlertDialogAction onClick={skipQuestion} className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white uppercase text-[10px] font-bold tracking-widest border-none">Bypass Node</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <Button 
                onClick={submitQuestion} 
                disabled={isRunning || isSubmitting || isFinalizing || timeLeft <= 0} 
                className="h-10 px-10 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(147,51,234,0.3)]"
              >
                Submit Node <Send className="ml-2 w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>

          <Card className="h-[35%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
              <div className="px-4 h-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <TabsList className="bg-transparent gap-6 p-0 h-full">
                  <TabsTrigger value="output" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Execution Output</TabsTrigger>
                  <TabsTrigger value="input" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Custom Stdin</TabsTrigger>
                  <TabsTrigger value="cases" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Test Status</TabsTrigger>
                </TabsList>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Neural Terminal v7.0</span>
              </div>
              <div className="flex-1 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                <TabsContent value="output" className="mt-0 p-6 whitespace-pre-wrap text-white/60 leading-relaxed h-full">
                  {terminalOutput || "// Execute current logic to see telemetry streams"}
                </TabsContent>
                <TabsContent value="input" className="mt-0 p-0 h-full">
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full h-full bg-transparent outline-none p-6 text-white/60 font-mono text-[11px] resize-none"
                    placeholder="// Provide input for execution..."
                  />
                </TabsContent>
                <TabsContent value="cases" className="mt-0 p-6 space-y-4 h-full">
                   <div className="space-y-3">
                     <p className="text-white/40 uppercase text-[9px] mb-2">Hidden Verification Matrix</p>
                     <div className="grid gap-2">
                        {sessionResults[currentIdx]?.results?.map((res: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            <span className="text-[10px] font-bold text-white/40">Case Node {i+1}</span>
                            {res.passed ? (
                              <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] uppercase">✓ PASS</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 border-none text-[8px] uppercase">× FAIL</Badge>
                            )}
                          </div>
                        )) || <p className="text-white/20 italic">Awaiting submission for verification...</p>}
                     </div>
                   </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </main>

      {/* Submission Overlay */}
      <AnimatePresence>
        {isFinalizing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050816]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-48 h-48 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
              <div className="absolute inset-4 glass rounded-full flex flex-col items-center justify-center">
                <Cpu className="w-12 h-12 text-accent animate-pulse mb-2" />
                <span className="text-[9px] font-black text-accent uppercase tracking-widest">Final Audit</span>
              </div>
            </div>

            <div className="space-y-8 max-w-md w-full">
              <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">Evaluating Submission</h2>
              
              <div className="grid gap-3 text-left">
                {["Compiling Final Submission...", "Running Hidden Test Cases...", "Checking Performance...", "Generating Coding Report..."].map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: submitStep >= idx ? 1 : 0.2,
                      x: submitStep >= idx ? 0 : -20,
                    }}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl transition-all duration-500",
                      submitStep === idx ? "bg-accent/5 border border-accent/20" : "border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
                      submitStep > idx ? "bg-green-500 border-green-500 text-black" : 
                      submitStep === idx ? "border-accent animate-pulse" : "border-white/10"
                    )}>
                      {submitStep > idx ? <Check className="w-4 h-4 font-black" /> : <span className="text-[10px]">{idx + 1}</span>}
                    </div>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      submitStep > idx ? "text-green-400" : 
                      submitStep === idx ? "text-accent" : "text-white/20"
                    )}>
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavigationControls onHome={() => router.push('/')} />
    </div>
  );
}
