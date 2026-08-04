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
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  Check, 
  SkipForward, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  Brain, 
  XCircle,
  Command,
  ArrowRight
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

  // Stats & Results Tracking
  const [sessionResults, setSessionResults] = useState<Record<number, any>>({});
  
  // Initialization & UI Flow State
  const [isInitializing, setIsInitializing] = useState(true);
  const [initMsgIdx, setInitMsgIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("Ready to execute your code.");
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  // Initialization Logic
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

  // Code Calibration
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
      setTerminalOutput("Ready to execute your code.");
    }
  }, [currentIdx, selectedLang, questions]);

  // Timer Logic
  useEffect(() => {
    if (isInitializing || isFinalizing) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finalizeAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, isFinalizing]);

  const runCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveTerminalTab("output");
    setTerminalOutput("Executing Code...");

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
        let output = `[EXECUTION RESULT: ${data.status?.description || 'Unknown'}]\n`;
        if (data.time) output += `Execution Time: ${data.time}s\n`;
        if (data.memory) output += `Memory Usage: ${Math.round(data.memory / 1024)}MB\n`;
        
        if (data.stdout) output += `\nOutput:\n${data.stdout}`;
        if (data.stderr) output += `\nError:\n${data.stderr}`;
        if (data.compile_output) output += `\nCompile Output:\n${data.compile_output}`;

        if (!data.stdout && !data.stderr && !data.compile_output) {
          output += "\n(No output returned)";
        }

        setTerminalOutput(output);
      }
    } catch (error: any) {
      setTerminalOutput(`[NETWORK FAULT]\nFailed to connect to execution node: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitQuestion = async () => {
    if (isSubmitting || isRunning) return;
    setIsSubmitting(true);
    setActiveTerminalTab("cases");
    setTerminalOutput("Initializing hidden verification matrix...\nAuditing implementation logic...");

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
        setTerminalOutput(`[AUDIT ERROR]\n${data.error}`);
        setIsSubmitting(false);
        return;
      }

      const results = data.results || [];
      const total = results.length;
      const passed = results.filter((r: any) => r.passed).length;
      const allPassed = passed === total;

      setSessionResults(prev => ({
        ...prev,
        [currentIdx]: {
          questionId: currentQ.id,
          results,
          allPassed,
          passedCount: passed,
          totalCount: total,
          language: selectedLang.label
        }
      }));

      if (allPassed) {
        toast({ title: "Node Verified", description: "All hidden test cases passed." });
        setTerminalOutput("✓ All Hidden Test Cases Passed.");
      } else {
        toast({ 
          variant: "destructive", 
          title: "Node Logic Failed", 
          description: `Passed ${passed}/${total} test cases. Please refine your implementation.` 
        });
        setTerminalOutput(`× Assessment failed logic check. Passed ${passed}/${total} nodes.`);
      }
    } catch (error: any) {
      setTerminalOutput(`[CRITICAL FAULT]\nVerification node connection lost.`);
    } finally {
      setIsSubmitting(false);
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
      setTerminalOutput("Ready to execute your code.");
    } else {
      setQuestionStatuses(newStatuses);
      await finalizeAssessment();
    }
  };

  const skipQuestion = () => {
    setSessionResults(prev => ({
      ...prev,
      [currentIdx]: {
        questionId: questions[currentIdx].id,
        allPassed: false,
        skipped: true
      }
    }));
    handleNextQuestion(true);
  };

  const finalizeAssessment = async () => {
    setIsFinalizing(true);
    const steps = ["Compiling Master Submission...", "Running Final Audit...", "Validating Performance Metrics...", "Generating Dossier..."];
    for (let i = 0; i < steps.length; i++) {
      setSubmitStep(i);
      await new Promise(r => setTimeout(r, 1200));
    }

    if (user && db && journeyRef) {
      const resultsArray = Object.values(sessionResults);
      const passedCount = resultsArray.filter(r => r.allPassed).length;
      
      const finalReport = {
        score: Math.round((passedCount / 5) * 100),
        status: passedCount >= 3 ? 'Pass' : 'Fail',
        totalQuestions: 5,
        passedQuestions: passedCount,
        results: sessionResults,
        timeTaken: formatTime((45 * 60) - timeLeft),
        submissionTime: new Date().toLocaleTimeString(),
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
            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 6, ease: "linear" }} className="h-full bg-accent" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/60">NODE SYNTHESIS ACTIVE</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className={cn("h-screen bg-[#050816] flex flex-col overflow-hidden relative", isFullScreen && "fixed inset-0 z-[1000]")}>
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />
      
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
          <div className={cn(
            "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums",
            timeLeft < 300 ? "text-red-500 animate-pulse" : "text-accent"
          )}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4">
            <select 
              value={selectedLang.id}
              onChange={(e) => {
                const lang = LANGUAGES.find(l => l.id === e.target.value);
                if (lang) setSelectedLang(lang);
              }}
              className="h-12 px-4 glass border-white/10 bg-[#0b0e1a] rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent"
            >
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase">Node 0{currentIdx + 1}</Badge>
                <h2 className="text-2xl font-bold tracking-tight">{currentQ?.title}</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-red-500/20 text-red-400 text-[8px] font-black uppercase">{currentQ?.difficulty}</Badge>
                  <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-black uppercase">{currentQ?.topic}</Badge>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-light">{currentQ?.problemStatement}</p>
              
              <div className="p-5 glass border-white/5 rounded-2xl bg-black/40 space-y-3 font-mono text-[10px]">
                <p className="text-white/30 uppercase text-[8px]">Sample Input</p>
                <p className="text-accent">{currentQ?.sampleInput}</p>
                <p className="text-white/30 uppercase text-[8px] pt-2">Sample Output</p>
                <p className="text-green-400">{currentQ?.sampleOutput}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] flex flex-col relative">
            <div className="flex-1 flex font-mono text-sm relative">
              <div className="w-12 bg-white/[0.01] border-r border-white/5 flex flex-col items-center pt-4 text-white/10 select-none">
                {Array.from({length: 40}).map((_, i) => <span key={i} className="leading-6 text-[10px]">{i + 1}</span>)}
              </div>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-transparent outline-none p-4 leading-6 text-white/80 resize-none custom-scrollbar"
                placeholder="// Implement your algorithmic node here..."
              />
            </div>

            <div className="h-16 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={runCode} 
                  disabled={isRunning || isSubmitting} 
                  className="h-10 px-6 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all"
                >
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-2 text-green-400" />}
                  RUN CODE
                </Button>
                <Button 
                  onClick={submitQuestion} 
                  disabled={isRunning || isSubmitting}
                  className="h-10 px-6 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 mr-2" />}
                  SUBMIT CODE
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={skipQuestion} 
                  variant="ghost" 
                  className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  SKIP / NEXT QUESTION <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="h-[35%] glass border-white/5 bg-[#0b0e1a] flex flex-col">
            <Tabs defaultValue="output" className="h-full flex flex-col">
              <div className="px-4 h-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <TabsList className="bg-transparent gap-6 p-0 h-full">
                  <TabsTrigger value="output" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent text-[9px] font-black uppercase tracking-widest">EXECUTION OUTPUT</TabsTrigger>
                  <TabsTrigger value="input" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent text-[9px] font-black uppercase tracking-widest">CUSTOM STDIN</TabsTrigger>
                  <TabsTrigger value="cases" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent text-[9px] font-black uppercase tracking-widest">TEST STATUS</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 font-mono text-[11px] overflow-hidden">
                <TabsContent value="output" className="p-6 text-white/60 whitespace-pre-wrap overflow-y-auto h-full custom-scrollbar">
                  {terminalOutput}
                </TabsContent>
                <TabsContent value="input" className="h-full">
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full h-full bg-transparent outline-none p-6 text-white/60 font-mono text-[11px] resize-none"
                    placeholder="Enter manual input nodes for execution..."
                  />
                </TabsContent>
                <TabsContent value="cases" className="p-6 space-y-4 overflow-y-auto h-full custom-scrollbar">
                  {sessionResults[currentIdx] ? (
                    <div className="space-y-3">
                      {sessionResults[currentIdx].results.map((res: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 glass border-white/5 rounded-xl">
                          <span className="text-white/40 uppercase tracking-widest">Verification Node {i+1}</span>
                          <Badge className={cn("border-none text-[8px] font-black uppercase px-3 py-1", res.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                            {res.passed ? "PASSED" : "FAILED"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <ShieldCheck className="w-8 h-8 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting logic submission</p>
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
              <div className="w-48 h-48 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
              <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold tracking-tighter text-premium mb-8 uppercase">Evaluating Submission</h2>
            <div className="space-y-4 max-w-sm w-full">
               {["Compiling Master Submission...", "Running Final Audit...", "Validating Performance Metrics...", "Generating Dossier..."].map((step, idx) => (
                 <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: submitStep >= idx ? 1 : 0.2, x: submitStep >= idx ? 0 : -20 }} className="flex items-center gap-4">
                   <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center text-[10px]", submitStep > idx ? "bg-green-500 border-green-500 text-black" : "border-white/20")}>
                     {submitStep > idx ? "✓" : idx + 1}
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest">{step}</span>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
