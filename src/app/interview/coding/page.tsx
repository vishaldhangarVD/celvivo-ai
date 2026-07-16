
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  RotateCcw, 
  Clock, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  ChevronRight, 
  Loader2,
  AlertTriangle,
  Command,
  Settings,
  Database,
  Layers,
  ShieldCheck,
  ChevronDown,
  Trophy,
  History,
  Activity,
  Mic
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { id: 'java', label: 'Java', starter: 'public class Solution {\n    public static void main(String[] args) {\n        // Implement logic here\n    }\n}' },
  { id: 'python', label: 'Python', starter: 'def solution():\n    # Implement logic here\n    pass\n\nif __name__ == "__main__":\n    solution()' },
  { id: 'javascript', label: 'JavaScript', starter: 'function solution() {\n    // Implement logic here\n}\n\nsolution();' },
  { id: 'cpp', label: 'C++', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Implement logic here\n    return 0;\n}' },
  { id: 'csharp', label: 'C#', starter: 'using System;\n\npublic class Program {\n    public static void Main() {\n        // Implement logic here\n    }\n}' },
  { id: 'go', label: 'Go', starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Implement logic here\n}' },
  { id: 'rust', label: 'Rust', starter: 'fn main() {\n    // Implement logic here\n}' }
];

const LOADING_STEPS = [
  "Running Hidden Test Cases...",
  "Evaluating Solution Complexity...",
  "Checking Memory Constraints...",
  "Preparing AI Performance Audit..."
];

export default function CodingEnginePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(selectedLang.starter);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");
  const [terminalOutput, setTerminalOutput] = useState("");

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  useEffect(() => {
    if (journey && !journeyLoading) {
      if (journey.step < 3) {
        router.replace('/interview/aptitude');
      }
    }
  }, [journey, journeyLoading, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLanguageChange = (langId: string) => {
    const lang = LANGUAGES.find(l => l.id === langId);
    if (lang) {
      setSelectedLang(lang);
      setCode(lang.starter);
    }
  };

  const runCode = () => {
    setActiveTerminalTab("output");
    setTerminalOutput("Compiling... \nExecuting test cases... \n\n[SUCCESS] Sample Test Case 1: Passed\n[SUCCESS] Sample Test Case 2: Passed\n\nExecution Time: 42ms");
    toast({ title: "Node Executed", description: "Sample test cases passed." });
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setSubmitStep(0);

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setSubmitStep(i);
      await new Promise(r => setTimeout(r, 1200));
    }

    // Mock Result
    const mockResult = {
      status: 'Pass',
      score: 85,
      passed: 12,
      total: 12,
      time: "124ms",
      memory: "14.2MB",
      complexity: "O(n log n)"
    };

    setResult(mockResult);

    if (journeyRef) {
      await updateDoc(journeyRef, {
        codingReport: mockResult,
        currentStage: "HR Interview",
        step: 5,
        updatedAt: serverTimestamp()
      });
    }

    setIsSubmitting(false);
  };

  if (journeyLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      
      {/* Dynamic Header */}
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">NEXVORO AI CODING ENGINE</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{journey?.company} • {journey?.role}</span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <Badge className="bg-accent/10 text-accent border-none text-[8px] font-black px-2 py-0">AI MONITORING ACTIVE</Badge>
            </div>
          </div>
        </div>

        {!result && (
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Time Remaining</span>
              <div className={cn(
                "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums",
                timeLeft < 300 ? "text-red-500 animate-pulse" : "text-accent"
              )}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex gap-4">
              <select 
                value={selectedLang.id}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="h-12 px-4 glass border-white/10 bg-[#0b0e1a] rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent"
              >
                {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <AnimatePresence mode="wait">
          {!result && !isSubmitting ? (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex gap-4 overflow-hidden"
            >
              {/* Left Panel: Problem Statement */}
              <div className="w-[35%] flex flex-col gap-4">
                <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase">Question 1 of 2</Badge>
                      <h2 className="text-3xl font-bold tracking-tight">Array Symmetry Path</h2>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-red-500/20 text-red-400 text-[8px] font-black uppercase">Hard</Badge>
                        <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-black uppercase">Dynamic Programming</Badge>
                      </div>
                    </div>

                    <div className="prose prose-invert prose-sm">
                      <p className="text-white/70 leading-relaxed font-light">
                        Given an array of integers <code className="text-accent">nums</code>, find the longest continuous subarray where the absolute difference between the sum of the first half and the second half is less than a given <code className="text-accent">threshold</code>.
                      </p>
                      
                      <h4 className="text-xs font-black uppercase tracking-widest text-white/90 mt-8 mb-4">Constraints</h4>
                      <ul className="space-y-2 list-none p-0">
                        {['1 <= nums.length <= 10^5', '0 <= nums[i] <= 10^4', 'Time Limit: 2.0s', 'Memory: 256MB'].map((c, i) => (
                          <li key={i} className="flex items-center gap-3 text-white/40 text-[10px] font-medium">
                            <div className="w-1 h-1 rounded-full bg-accent" /> {c}
                          </li>
                        ))}
                      </ul>

                      <h4 className="text-xs font-black uppercase tracking-widest text-white/90 mt-8 mb-4">Sample Test Case</h4>
                      <div className="p-5 glass border-white/5 rounded-2xl bg-black/40 space-y-4 font-mono text-[11px]">
                        <div>
                          <p className="text-white/30 uppercase text-[9px] mb-1">Input</p>
                          <p className="text-accent">nums = [1, 2, 3, 4, 5], threshold = 2</p>
                        </div>
                        <div>
                          <p className="text-white/30 uppercase text-[9px] mb-1">Output</p>
                          <p className="text-green-400">3</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Panel: Editor & Terminal */}
              <div className="flex-1 flex flex-col gap-4">
                <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] relative overflow-hidden flex flex-col">
                  {/* Editor Header */}
                  <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/40" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                      <div className="w-2 h-2 rounded-full bg-green-500/40" />
                      <span className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">solution.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'java' ? 'java' : 'js'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setCode(selectedLang.starter)} className="text-white/20 hover:text-accent transition-colors"><RotateCcw className="w-3 h-3" /></button>
                      <button className="text-white/20 hover:text-accent transition-colors"><Settings className="w-3 h-3" /></button>
                    </div>
                  </div>

                  {/* High-Fidelity Editor Mock */}
                  <div className="flex-1 flex font-mono text-sm relative">
                    <div className="w-12 bg-white/[0.01] border-r border-white/5 flex flex-col items-center pt-4 text-white/10 select-none">
                      {Array.from({length: 30}).map((_, i) => <span key={i} className="leading-6 text-[10px]">{i + 1}</span>)}
                    </div>
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      className="flex-1 bg-transparent outline-none p-4 leading-6 text-white/80 resize-none custom-scrollbar"
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="h-16 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                      <Button onClick={runCode} variant="ghost" className="h-10 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                        <Play className="w-3.5 h-3.5 mr-2 text-green-400" /> Run Code
                      </Button>
                      <Button variant="ghost" className="h-10 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                        <Terminal className="w-3.5 h-3.5 mr-2" /> Custom Input
                      </Button>
                    </div>
                    <Button onClick={submitCode} className="h-10 px-10 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(147,51,234,0.3)]">
                      Submit Solution <Send className="ml-2 w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>

                {/* Bottom Terminal */}
                <Card className="h-[30%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden">
                  <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
                    <div className="px-4 h-10 border-b border-white/5 flex items-center justify-between">
                      <TabsList className="bg-transparent gap-6 p-0 h-full">
                        <TabsTrigger value="output" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Output</TabsTrigger>
                        <TabsTrigger value="cases" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Test Cases</TabsTrigger>
                        <TabsTrigger value="console" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-accent bg-transparent text-[9px] font-black uppercase tracking-widest text-white/30 data-[state=active]:text-accent">Console</TabsTrigger>
                      </TabsList>
                      <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Simulation Terminal v1.2</span>
                    </div>
                    <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                      <TabsContent value="output" className="mt-0 whitespace-pre-wrap text-white/60 leading-relaxed">
                        {terminalOutput || "// Execute code to see telemetry output"}
                      </TabsContent>
                      <TabsContent value="cases" className="mt-0">
                         <div className="grid grid-cols-2 gap-4">
                           {[1, 2, 3].map(i => (
                             <div key={i} className="p-4 glass rounded-xl border-white/5 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                 <span className="text-[10px] font-bold uppercase text-white/40">Test Case 0{i}</span>
                               </div>
                               <span className="text-[8px] font-black text-white/10 uppercase">Passed</span>
                             </div>
                           ))}
                         </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>
              </div>
            </motion.div>
          ) : isSubmitting ? (
            <motion.div 
              key="evaluating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="relative mb-12">
                <div className="w-32 h-32 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-6 max-w-md">
                <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase">Executing Logic Audit</h2>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 5, ease: "linear" }} 
                    className="h-full bg-accent" 
                  />
                </div>
                <div className="h-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">
                    {LOADING_STEPS[submitStep]}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 max-w-5xl mx-auto flex flex-col gap-8 justify-center"
            >
               <Card className="premium-card p-12 flex flex-col items-center text-center space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12">
                  <Badge className={cn(
                    "px-8 py-3 rounded-2xl font-black tracking-[0.5em] text-xs border-none",
                    result.status === 'Pass' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  )}>
                    STATUS: {result.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="relative">
                  <div className="text-[100px] font-black tracking-tighter text-premium tabular-nums">{result.score}%</div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">Syntax Precision Rating</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl pt-8 border-t border-white/5">
                  {[
                    { label: "Passed Cases", val: `${result.passed}/${result.total}`, icon: CheckCircle2, color: "text-green-400" },
                    { label: "Execution Time", val: result.time, icon: Clock, color: "text-blue-400" },
                    { label: "Memory Usage", val: result.memory, icon: Database, color: "text-purple-400" },
                    { label: "Time Complexity", val: result.complexity, icon: Activity, color: "text-accent" }
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <s.icon className={cn("w-4 h-4", s.color)} />
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{s.label}</span>
                      </div>
                      <p className="text-xl font-bold">{s.val}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-8 w-full max-w-md">
                   {result.status === 'Pass' ? (
                     <div className="space-y-6">
                        <div className="flex items-center justify-center gap-3 text-green-400 p-4 glass rounded-2xl border-green-500/20 bg-green-500/5">
                           <Trophy className="w-5 h-5" />
                           <span className="text-xs font-black uppercase tracking-widest">Virtual Arena Gateway Unlocked</span>
                        </div>
                        <Button onClick={() => router.push('/interview/hr')} className="w-full h-20 btn-premium rounded-[2rem] text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(147,51,234,0.3)] group">
                           🎤 HR Interview <ChevronRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" />
                        </Button>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <div className="flex items-center justify-center gap-3 text-red-400 p-4 glass rounded-2xl border-red-500/20 bg-red-500/5">
                           <ShieldCheck className="w-5 h-5" />
                           <span className="text-xs font-black uppercase tracking-widest">Protocol Retake Required</span>
                        </div>
                        <Button onClick={() => window.location.reload()} className="w-full h-20 glass border-white/10 rounded-[2rem] text-lg font-black uppercase tracking-[0.3em] hover:bg-white/5">
                           <RotateCcw className="mr-4 w-6 h-6" /> Retake Coding Test
                        </Button>
                     </div>
                   )}
                </div>
              </Card>

              <div className="flex justify-center gap-6">
                 <Button onClick={() => router.push('/dashboard')} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white">
                    Abort Session
                 </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <NavigationControls onHome={() => router.push('/')} onBack={() => router.push('/interview/aptitude')} />
    </div>
  );
}

