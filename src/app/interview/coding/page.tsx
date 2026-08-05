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
import { 
  Code2, 
  Play, 
  Send, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  Brain, 
  XCircle,
  Command,
  Activity,
  Target,
  Layers,
  Sparkles,
  Check,
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { generateCodingQuestions, type CodingProblem } from '@/ai/flows/ai-coding-generator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

  // Core Simulation State
  const [questions, setQuestions] = useState<CodingProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 Minutes
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Stats & Results Tracking
  const [sessionResults, setSessionResults] = useState<Record<number, any>>({});
  
  // Initialization & UI Flow State
  const [isInitializing, setIsInitializing] = useState(true);
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

      try {
        const snap = await getDoc(journeyRef);
        const data = snap.data();

        if (data?.codingQuestions && data.codingQuestions.length === 5) {
          setQuestions(data.codingQuestions);
        } else {
          const response = await generateCodingQuestions({
            role: journey.role,
            company: journey.company,
            experienceLevel: journey.experience,
          });

          if (!response || !response.questions) {
            throw new Error("Invalid response from coding generator");
          }

          await updateDoc(journeyRef, {
            codingQuestions: response.questions,
            updatedAt: serverTimestamp(),
          });

          setQuestions(response.questions);
        }
      } catch (e: any) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("Coding Round Error (Init):", message);
        toast({ variant: "destructive", title: "Synthesis Error", description: message || "Could not architect coding challenges." });
      } finally {
        setIsInitializing(false);
      }
    }
    initEnvironment().catch(err => {
      console.error("Unhandled init error:", err);
    });
  }, [journey, journeyRef, questions.length, toast]);

  // Code Calibration per Question
  useEffect(() => {
    if (questions[currentIdx]) {
      const q = questions[currentIdx];
      const saved = sessionResults[currentIdx]?.code;
      const starter = saved || q.starterCode[selectedLang.id as keyof typeof q.starterCode] || "// Implement solution here";
      setCode(starter);
      setCustomInput("");
      setTerminalOutput("Ready to execute your code.");
      setActiveTerminalTab("output");
    }
  }, [currentIdx, selectedLang, questions, sessionResults]);

  // Submit Flow Helper
  const performSubmission = useCallback(async () => {
    if (isSubmitting || isRunning || !questions[currentIdx]) return;
    
    setIsSubmitting(true);
    setActiveTerminalTab("cases");
    setTerminalOutput("Initializing hidden verification matrix...");

    const currentQ = questions[currentIdx];

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language: selectedLang.id,
          testCases: currentQ.hiddenTestCases
        }),
      });

      if (!response.ok) {
        throw new Error(`Execution service returned status ${response.status}`);
      }

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

      const submissionReport = {
        questionId: currentQ.id,
        code: code,
        results,
        allPassed,
        passedCount: passed,
        totalCount: total,
        language: selectedLang.label,
        time: results[0]?.time || "0.0",
        memory: results[0]?.memory || "0",
        status: allPassed ? 'Accepted' : 'Failed'
      };

      setSessionResults(prev => ({
        ...prev,
        [currentIdx]: submissionReport
      }));

      if (allPassed) {
        toast({ title: "Node Verified", description: "Accepted — All hidden test cases passed." });
        setTerminalOutput("Accepted — All Test Cases Passed.");
      } else {
        toast({ 
          variant: "destructive", 
          title: "Logic Failed", 
          description: `Wrong Answer — Passed ${passed}/${total} nodes.` 
        });
        setTerminalOutput(`Wrong Answer — Some Test Cases Failed.\nPassed: ${passed}/${total}`);
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Coding Round Error (Submit):", message);
      setTerminalOutput(`[CRITICAL FAULT]\n${message || "Verification node connection lost."}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, selectedLang, currentIdx, questions, isSubmitting, isRunning, toast]);

  // Timer Logic
  useEffect(() => {
    if (isInitializing || isFinalizing || isTimeExpired) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeExpired(true);
          toast({ variant: "destructive", title: "Time Expired", description: "Submission automatically submitted." });
          // Trigger final submission node safely
          performSubmission().catch(err => {
            console.error("Auto-submission protocol failure:", err);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isInitializing, isFinalizing, isTimeExpired, performSubmission, toast]);

  const runCode = async () => {
    if (isRunning || isSubmitting || isTimeExpired) return;
    
    setIsRunning(true);
    setActiveTerminalTab("output");
    setTerminalOutput("Executing Code...");

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language: selectedLang.id,
          stdin: customInput
        }),
      });

      if (!response.ok) {
        throw new Error(`Execution service returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setTerminalOutput(`[SYSTEM ERROR]\n${data.error}`);
      } else {
        let output = `[STATUS: ${data.status?.description || 'Unknown'}]\n`;
        if (data.time) output += `Time: ${data.time}s | Memory: ${data.memory}\n\n`;
        
        if (data.stdout) output += `Output:\n${data.stdout}`;
        if (data.stderr) output += `Error:\n${data.stderr}`;
        if (data.compile_output) output += `Compile Error:\n${data.compile_output}`;

        if (!data.stdout && !data.stderr && !data.compile_output) {
          output += "(Execution finished with no output)";
        }

        setTerminalOutput(output);
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Coding Round Error (Run):", message);
      setTerminalOutput(`[NETWORK FAULT]\n${message || "Failed to connect to execution node."}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < 4) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const finalizeAssessment = async () => {
    if (isFinalizing) return;
    
    setIsFinalizing(true);
    try {
      const steps = ["Compiling Master Submission...", "Running Final Audit...", "Validating Performance Metrics...", "Generating Dossier..."];
      for (let i = 0; i < steps.length; i++) {
        setSubmitStep(i);
        await new Promise(r => setTimeout(r, 1000));
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
          timeTaken: formatTime((30 * 60) - timeLeft),
          submissionTime: new Date().toLocaleTimeString(),
        };
        
        await updateDoc(journeyRef, {
          codingReport: finalReport,
          currentStage: 'HR Interview',
          step: 6
        });
      }

      router.push('/interview/coding-result');
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Coding Round Error (Finalize):", message);
      toast({ variant: "destructive", title: "Final Audit Failed", description: message });
      setIsFinalizing(false);
    }
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
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/60">NODE SYNTHESIS ACTIVE</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const currentResult = sessionResults[currentIdx];

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
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
               <span className="text-[9px] font-bold text-accent uppercase tracking-widest">QUESTION {currentIdx + 1} OF 5</span>
               <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
               <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-black px-2 py-0 uppercase">PHASE 03</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className={cn(
            "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums tracking-widest",
            timeLeft < 300 ? "text-red-500 animate-pulse border-red-500/30" : "text-accent"
          )}>
            <span className="text-[8px] font-bold uppercase opacity-50 block mb-0.5">Coding Time Left</span>
            {formatTime(timeLeft)}
          </div>
          <select 
            value={selectedLang.id}
            onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])}
            disabled={isTimeExpired || isFinalizing}
            className="h-12 px-4 glass border-white/10 bg-[#0b0e1a] rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent disabled:opacity-50"
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase">Challenge Node</Badge>
                <h2 className="text-2xl font-bold tracking-tight">{currentQ?.title}</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-red-500/20 text-red-400 text-[8px] font-black uppercase">{currentQ?.difficulty}</Badge>
                  <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-black uppercase">{currentQ?.topic}</Badge>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-light">{currentQ?.problemStatement}</p>
              
              <div className="p-5 glass border-white/5 rounded-2xl bg-black/40 space-y-3 font-mono text-[10px]">
                <p className="text-white/30 uppercase text-[8px]">Sample Input</p>
                <pre className="text-accent">{currentQ?.sampleInput}</pre>
                <p className="text-white/30 uppercase text-[8px] pt-2">Sample Output</p>
                <pre className="text-green-400">{currentQ?.sampleOutput}</pre>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] flex flex-col relative overflow-hidden">
            {(isTimeExpired || isFinalizing) && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                 <Badge className="bg-red-500 text-white text-[10px] font-black uppercase px-6 py-2 rounded-xl shadow-2xl">
                   {isTimeExpired ? "Time Expired — Editor Locked" : "Audit in Progress"}
                 </Badge>
              </div>
            )}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                theme="vs-dark"
                language={selectedLang.monaco}
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  fontSize: 14,
                  readOnly: isTimeExpired || isFinalizing,
                  minimap: { enabled: false },
                  scrollbar: { vertical: 'hidden' },
                  automaticLayout: true,
                  padding: { top: 20 }
                }}
              />
            </div>

            <div className="h-20 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => runCode().catch(console.error)} 
                  disabled={isRunning || isSubmitting || isTimeExpired || isFinalizing} 
                  className="h-12 px-8 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 text-green-400 fill-current" />}
                  RUN CODE
                </Button>
                <Button 
                  onClick={() => performSubmission().catch(console.error)} 
                  disabled={isRunning || isSubmitting || isTimeExpired || isFinalizing}
                  className="h-12 px-8 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  SUBMIT CODE
                </Button>
              </div>

              {currentIdx < 4 ? (
                <Button 
                  onClick={handleNextQuestion} 
                  variant="ghost" 
                  disabled={isFinalizing}
                  className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  NEXT QUESTION <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => finalizeAssessment().catch(console.error)} 
                  disabled={isRunning || isSubmitting || isFinalizing}
                  className="h-12 px-8 bg-accent/20 border border-accent/40 text-accent text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent/30 transition-all"
                >
                  VIEW CODING RESULTS <Zap className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>

          <Card className="h-[35%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
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
                    disabled={isTimeExpired || isFinalizing}
                    className="w-full h-full bg-transparent outline-none p-6 text-white/60 font-mono text-[11px] resize-none"
                    placeholder="Enter manual input nodes for execution..."
                  />
                </TabsContent>
                <TabsContent value="cases" className="p-6 space-y-4 overflow-y-auto h-full custom-scrollbar">
                  {currentResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                        <div className="flex items-center gap-3">
                          {currentResult.allPassed ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                          <span className={cn("text-xs font-black uppercase tracking-widest", currentResult.allPassed ? "text-green-400" : "text-red-400")}>
                            {currentResult.allPassed ? "Accepted — All Test Cases Passed" : "Wrong Answer — Some Test Cases Failed"}
                          </span>
                        </div>
                        <div className="flex gap-4">
                           <span className="text-[9px] text-white/20 uppercase font-bold">Passed: {currentResult.passedCount}/{currentResult.totalCount}</span>
                           <span className="text-[9px] text-white/20 uppercase font-bold">Time: {currentResult.time}s</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {currentResult.results.map((res: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 glass border-white/5 rounded-xl">
                            <span className="text-white/40 uppercase tracking-widest text-[9px]">Test Case {i+1}</span>
                            <Badge className={cn("border-none text-[8px] font-black uppercase px-3 py-1", res.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                {res.passed ? "PASSED" : "FAILED"}
                              </Badge>
                          </div>
                        ))}
                      </div>
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
