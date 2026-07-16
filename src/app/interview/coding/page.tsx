
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
  AlertTriangle
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Multi-Question Bank
const QUESTIONS_BANK = [
  {
    id: 1,
    title: "Array Symmetry Path",
    difficulty: "Hard",
    category: "Dynamic Programming",
    description: "Given an array of integers nums, find the longest continuous subarray where the absolute difference between the sum of the first half and the second half is less than a given threshold.",
    constraints: ["1 <= nums.length <= 10^5", "0 <= nums[i] <= 10^4", "Time Limit: 2.0s", "Memory: 256MB"],
    input: "nums = [1, 2, 3, 4, 5], threshold = 2",
    output: "3"
  },
  {
    id: 2,
    title: "Graph Cycle Isolation",
    difficulty: "Hard",
    category: "Graphs",
    description: "Identify all independent cycles in a directed graph and return the number of nodes present in the cycle with the maximum weight density.",
    constraints: ["Nodes <= 50,000", "Edges <= 100,000", "Time Limit: 1.5s"],
    input: "adj = [[1,2], [2,3], [3,1]]",
    output: "3"
  },
  {
    id: 3,
    title: "LRU Cache Architecture",
    difficulty: "Hard",
    category: "Data Structures",
    description: "Implement a Least Recently Used (LRU) cache that supports GET and PUT operations in O(1) time complexity.",
    constraints: ["Capacity <= 10^4", "Operations <= 10^6", "Time Limit: 1.0s"],
    input: "capacity = 2, put(1,1), put(2,2), get(1)",
    output: "1"
  },
  {
    id: 4,
    title: "Median of Sorted Streams",
    difficulty: "Hard",
    category: "Heaps",
    description: "Given two sorted arrays of size m and n respectively, find the median of the two sorted arrays in O(log(m+n)) time.",
    constraints: ["m, n <= 10^6", "Memory: 512MB"],
    input: "nums1 = [1, 3], nums2 = [2]",
    output: "2.00000"
  },
  {
    id: 5,
    title: "Neural Network Weights",
    difficulty: "Hard",
    category: "Matrix Math",
    description: "Implement a function to perform matrix multiplication for two large sparse matrices representing neural layers efficiently.",
    constraints: ["N x M (10^4 x 10^4)", "Time Limit: 3.0s"],
    input: "matA = [[1,0], [0,1]], matB = [[2,3], [4,5]]",
    output: "[[2,3], [4,5]]"
  }
];

const LANGUAGES = [
  { id: 'java', label: 'Java', starter: 'public class Solution {\n    public static void main(String[] args) {\n        // Question Node Node Node\n    }\n}' },
  { id: 'python', label: 'Python', starter: 'def solution():\n    # Implement logic here\n    pass\n\nif __name__ == "__main__":\n    solution()' },
  { id: 'javascript', label: 'JavaScript', starter: 'function solution() {\n    // Implement logic here\n}\n\nsolution();' },
  { id: 'cpp', label: 'C++', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Implement logic here\n    return 0;\n}' }
];

export default function CodingEnginePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Core State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questionStatuses, setQuestionStatuses] = useState<('current' | 'submitted' | 'skipped' | 'pending')[]>(['current', 'pending', 'pending', 'pending', 'pending']);
  const [hasUsedSkip, setHasUsedSkip] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(selectedLang.starter);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  // 1. Timer Logic
  useEffect(() => {
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
  }, []);

  // 2. Exit Protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Leaving this Coding Round will automatically submit your current progress.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 3. Auto-Save Logic (5s)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (code) {
        localStorage.setItem(`nexvoro_code_q${currentIdx}`, code);
      }
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [code, currentIdx]);

  // Restore Code on Index Change
  useEffect(() => {
    const saved = localStorage.getItem(`nexvoro_code_q${currentIdx}`);
    if (saved) setCode(saved);
    else setCode(selectedLang.starter);
  }, [currentIdx, selectedLang.starter]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const forceSubmit = async () => {
    setIsFinalizing(true);
    toast({ title: "Time Expired", description: "Automatically submitting your final solution.", variant: "destructive" });
    await finalizeAssessment();
  };

  const runCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveTerminalTab("output");
    setTerminalOutput("Compiling...\n");
    await new Promise(r => setTimeout(r, 800));
    setTerminalOutput(prev => prev + "Running Sample Test Cases...\n");
    await new Promise(r => setTimeout(r, 1200));
    setTerminalOutput(prev => prev + `Execution Completed.\n\n[SUCCESS] Sample Input: ${QUESTIONS_BANK[currentIdx].input}\n[SUCCESS] Output: ${QUESTIONS_BANK[currentIdx].output}\n\nExecution Time: 28ms`);
    setIsRunning(false);
  };

  const handleNextQuestion = async (wasSkipped: boolean = false) => {
    const newStatuses = [...questionStatuses];
    newStatuses[currentIdx] = wasSkipped ? 'skipped' : 'submitted';
    
    if (currentIdx < 4) {
      newStatuses[currentIdx + 1] = 'current';
      setQuestionStatuses(newStatuses);
      setCurrentIdx(currentIdx + 1);
      setIsSubmitting(false);
    } else {
      setQuestionStatuses(newStatuses);
      await finalizeAssessment();
    }
  };

  const submitQuestion = async () => {
    if (isSubmitting || isRunning) return;
    setIsSubmitting(true);
    setTerminalOutput("Checking Hidden Test Cases...\n");
    await new Promise(r => setTimeout(r, 1000));
    setTerminalOutput(prev => prev + "Evaluating Solution...\n");
    await new Promise(r => setTimeout(r, 800));
    setTerminalOutput(prev => prev + "Question Submitted Successfully.\n");
    await new Promise(r => setTimeout(r, 500));
    handleNextQuestion(false);
  };

  const skipQuestion = () => {
    if (hasUsedSkip) return;
    setHasUsedSkip(true);
    handleNextQuestion(true);
  };

  const finalizeAssessment = async () => {
    setIsFinalizing(true);
    const steps = ["Compiling Final Submission...", "Running Hidden Test Cases...", "Checking Performance...", "Generating Coding Report..."];
    for (let i = 0; i < steps.length; i++) {
      setSubmitStep(i);
      await new Promise(r => setTimeout(r, 1000));
    }

    if (user && db && journeyRef) {
      const passedCount = questionStatuses.filter(s => s === 'submitted').length;
      const finalReport = {
        score: Math.round((passedCount / 5) * 100),
        status: passedCount >= 3 ? 'Pass' : 'Fail',
        totalQuestions: 5,
        correctAnswers: passedCount,
        wrongAnswers: 5 - passedCount,
        accuracy: Math.round((passedCount / 5) * 100),
        timeTaken: formatTime(2700 - timeLeft),
        submissionTime: new Date().toLocaleTimeString(),
        language: selectedLang.label,
        executionTime: "34ms",
        memoryUsage: "128MB"
      };
      
      await updateDoc(journeyRef, {
        codingReport: finalReport,
        currentStage: finalReport.status === 'Pass' ? 'HR Interview' : 'Coding Assessment',
        step: finalReport.status === 'Pass' ? 6 : 5
      });
    }

    router.push('/interview/coding-result');
  };

  if (journeyLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

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
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Session Limit</span>
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
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              <div className="space-y-3">
                <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase">Node 0{currentIdx + 1} of 05</Badge>
                <h2 className="text-3xl font-bold tracking-tight">{QUESTIONS_BANK[currentIdx].title}</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-red-500/20 text-red-400 text-[8px] font-black uppercase">{QUESTIONS_BANK[currentIdx].difficulty}</Badge>
                  <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-black uppercase">{QUESTIONS_BANK[currentIdx].category}</Badge>
                </div>
              </div>

              <div className="prose prose-invert prose-sm">
                <p className="text-white/70 leading-relaxed font-light">{QUESTIONS_BANK[currentIdx].description}</p>
                
                <h4 className="text-xs font-black uppercase tracking-widest text-white/90 mt-8 mb-4">Constraints</h4>
                <ul className="space-y-2 list-none p-0">
                  {QUESTIONS_BANK[currentIdx].constraints.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/40 text-[10px] font-medium">
                      <div className="w-1 h-1 rounded-full bg-accent" /> {c}
                    </li>
                  ))}
                </ul>

                <h4 className="text-xs font-black uppercase tracking-widest text-white/90 mt-8 mb-4">Sample Test Case</h4>
                <div className="p-5 glass border-white/5 rounded-2xl bg-black/40 space-y-4 font-mono text-[11px]">
                  <div>
                    <p className="text-white/30 uppercase text-[9px] mb-1">Input</p>
                    <p className="text-accent">{QUESTIONS_BANK[currentIdx].input}</p>
                  </div>
                  <div>
                    <p className="text-white/30 uppercase text-[9px] mb-1">Output</p>
                    <p className="text-green-400">{QUESTIONS_BANK[currentIdx].output}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] relative overflow-hidden flex flex-col">
            <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/40" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                <div className="w-2 h-2 rounded-full bg-green-500/40" />
                <span className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">
                  solution.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'cpp' ? 'cpp' : 'java'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-white/10 text-white/20 text-[7px] font-black uppercase tracking-widest">Auto-Save Active</Badge>
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
                placeholder="// Logic Node Implementation..."
              />
            </div>

            <div className="h-16 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <Button onClick={runCode} disabled={isRunning || isSubmitting || isFinalizing} variant="ghost" className="h-10 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-2 text-green-400" />}
                  Run Sample
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
                        <AlertDialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-3"><AlertTriangle className="text-orange-400" /> Skip this Question?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                          This node will be marked as <span className="text-orange-400 font-bold">Incorrect</span> in the final audit. You cannot return to this node later. Only one skip is permitted per simulation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl glass border-white/10 bg-transparent text-white/40 hover:bg-white/5 uppercase text-[10px] font-bold tracking-widest">Abort</AlertDialogCancel>
                        <AlertDialogAction onClick={skipQuestion} className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white uppercase text-[10px] font-bold tracking-widest border-none">Skip Node</AlertDialogAction>
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

          <Card className="h-[30%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
              <div className="px-4 h-10 border-b border-white/5 flex items-center justify-between">
                <TabsList className="bg-transparent gap-6 p-0 h-full">
                  <TabsTrigger value="output" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Output</TabsTrigger>
                  <TabsTrigger value="console" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Console</TabsTrigger>
                </TabsList>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Simulation Terminal v4.2</span>
              </div>
              <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                <TabsContent value="output" className="mt-0 whitespace-pre-wrap text-white/60 leading-relaxed">
                  {terminalOutput || "// Execute code to see telemetry output"}
                </TabsContent>
                <TabsContent value="console" className="mt-0 text-white/30 italic">
                  [SYSTEM] Node 0{currentIdx + 1} logic sequence active.
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </main>

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
                <span className="text-[9px] font-black text-accent uppercase tracking-widest">Neural Audit</span>
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
