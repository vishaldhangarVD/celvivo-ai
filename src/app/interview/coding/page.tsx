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
  Mic, 
  Sparkles 
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateCodingQuestion } from '@/ai/flows/ai-coding-generator';

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
  const [customInput, setCustomInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [sessionResults, setSessionResults] = useState<Record<number, any>>({});
  
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

  useEffect(() => {
    async function initEnvironment() {
      if (!db || !journey || questions.length > 0) return;
      
      try {
        const snap = await getDoc(journeyRef!);
        const data = snap.data();
        
        if (data?.codingQuestions && data.codingQuestions.length > 0) {
          setQuestions(data.codingQuestions);
          setIsInitializing(false);
          return;
        }

        // Map experience to difficulty
        let targetDiff: 'Easy' | 'Medium' | 'Hard' = "Medium";
        const exp = journey.experience?.toLowerCase() || "";
        if (exp.includes("fresher") || exp.includes("0-1")) targetDiff = "Easy";
        else if (exp.includes("senior") || exp.includes("8+")) targetDiff = "Hard";

        let selectedQuestion: any = null;
        let aiSuccess = false;

        // 1. Try AI Generation
        try {
          const aiResponse = await generateCodingQuestion({
            role: journey.role,
            company: journey.company,
            experienceLevel: journey.experience,
            difficulty: targetDiff
          });
          
          if (aiResponse?.question) {
            const docRef = await addDoc(collection(db, 'generatedCodingQuestions'), {
              ...aiResponse.question,
              userId: user!.uid,
              source: 'Gemini 2.0 Flash',
              createdAt: serverTimestamp(),
              context: { role: journey.role, company: journey.company }
            });
            
            selectedQuestion = { ...aiResponse.question, id: docRef.id };
            aiSuccess = true;
          }
        } catch (e) {
          console.warn("AI Generation Failed, using Fallback Repository.");
        }

        // 2. Fallback to Static Repository
        if (!selectedQuestion) {
          const q = query(
            collection(db, "codingQuestions"),
            where("difficulty", "==", targetDiff)
          );
          const querySnap = await getDocs(q);
          const available = querySnap.docs.map(d => ({ ...d.data(), id: d.id }));
          
          if (available.length > 0) {
            const shuffled = available.sort(() => 0.5 - Math.random());
            selectedQuestion = shuffled[0];
          }
        }

        if (!selectedQuestion) {
          throw new Error("No intelligence nodes available in system.");
        }

        await updateDoc(journeyRef!, {
          codingQuestions: [selectedQuestion],
          aiGenerated: aiSuccess,
          updatedAt: serverTimestamp()
        });

        setQuestions([selectedQuestion]);
        toast({ title: aiSuccess ? "AI Challenge Synthesized" : "Static Repository Synced" });
      } catch (e: any) {
        console.error("Initialization Fault:", e);
        toast({ variant: "destructive", title: "Protocol Node Failure", description: e.message });
      } finally {
        setIsInitializing(false);
      }
    }
    initEnvironment();
  }, [db, journey, journeyRef, questions.length, toast, user]);

  useEffect(() => {
    if (questions[currentIdx]) {
      const q = questions[currentIdx];
      const saved = sessionResults[currentIdx]?.code;
      const starter = q.starterCode?.[selectedLang.id] || q.starterCode?.["python"] || "// Implementation required";
      setCode(saved || starter);
      setCustomInput("");
      setTerminalOutput("Ready to execute your code.");
      setActiveTerminalTab("output");
    }
  }, [currentIdx, selectedLang, questions, sessionResults]);

  const performSubmission = useCallback(async () => {
    if (isSubmitting || isRunning || !questions[currentIdx]) return;
    setIsSubmitting(true);
    setActiveTerminalTab("cases");
    setTerminalOutput("Initializing hidden verification matrix...");
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source_code: code, 
          language: selectedLang.id, 
          testCases: questions[currentIdx].hiddenTestCases || [] 
        }),
      });

      if (!response.ok) throw new Error("Execution node timeout.");
      const data = await response.json();
      const results = data.results || [];
      const passed = results.filter((r: any) => r.passed).length;
      const total = results.length || 1;
      const allPassed = passed === total && total > 0;

      const submissionReport = { 
        code, 
        results, 
        allPassed, 
        passedCount: passed, 
        totalCount: total, 
        language: selectedLang.label, 
        status: allPassed ? 'Accepted' : 'Failed' 
      };

      setSessionResults(prev => ({ ...prev, [currentIdx]: submissionReport }));
      
      if (allPassed) toast({ title: "Node Verified", description: "All hidden test cases passed." });
      else toast({ variant: "destructive", title: "Logic Failed", description: `Passed ${passed}/${total} nodes.` });
      
      setTerminalOutput(allPassed ? "Accepted — All Test Cases Passed." : `Wrong Answer — Passed ${passed}/${total} nodes.`);
    } catch (error: any) {
      console.error("Submission Error:", error);
      setTerminalOutput("[CRITICAL FAULT] Verification node connection lost.");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, selectedLang, currentIdx, questions, isSubmitting, isRunning, toast]);

  useEffect(() => {
    if (isInitializing || isFinalizing || isTimeExpired) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeExpired(true);
          performSubmission().catch(console.error);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, isFinalizing, isTimeExpired, performSubmission]);

  const runCode = async () => {
    if (isRunning || isSubmitting || isTimeExpired) return;
    setIsRunning(true);
    setActiveTerminalTab("output");
    setTerminalOutput("Executing Code...");
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language: selectedLang.id, stdin: customInput }),
      });
      const data = await response.json();
      if (data.error) setTerminalOutput(`[SYSTEM ERROR]\n${data.error}`);
      else setTerminalOutput(`[STATUS: ${data.status?.description || 'Finished'}]\nTime: ${data.time}s | Memory: ${data.memory}\n\nOutput:\n${data.stdout}`);
    } catch (error) {
      setTerminalOutput("[NETWORK FAULT] Failed to connect to execution node.");
    } finally {
      setIsRunning(false);
    }
  };

  const finalizeAssessment = async () => {
    if (isFinalizing || !user || !db || !journey) return;
    setIsFinalizing(true);
    try {
      for (let i = 0; i < 4; i++) {
        setSubmitStep(i);
        await new Promise(r => setTimeout(r, 800));
      }
      
      const resultsArray = Object.entries(sessionResults);
      const passedQuestionsCount = resultsArray.filter(([_, r]) => r.allPassed).length;
      const scorePercentage = Math.round((passedQuestionsCount / questions.length) * 100);
      
      for (const [idxStr, res] of resultsArray) {
        const idx = parseInt(idxStr);
        const q = questions[idx];
        await addDoc(collection(db, 'users', user.uid, 'coding_results'), {
          interviewId: journey.sessionId || "unknown",
          userId: user.uid,
          questionId: q.id,
          language: res.language,
          score: res.allPassed ? 100 : Math.round((res.passedCount / res.totalCount) * 100),
          passedTestCases: res.passedCount,
          failedTestCases: res.totalCount - res.passedCount,
          totalTestCases: res.totalCount,
          executionTime: res.results?.[0]?.time || "0.00",
          submittedCode: res.code,
          completedAt: serverTimestamp(),
          status: res.allPassed ? "Passed" : "Failed"
        });
      }

      await updateDoc(journeyRef!, {
        codingReport: { 
          score: scorePercentage, 
          status: scorePercentage >= 70 ? 'Pass' : 'Fail', 
          totalQuestions: questions.length, 
          passedQuestions: passedQuestionsCount, 
          submissionTime: new Date().toLocaleTimeString(),
          codingRoundCompleted: true
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
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isInitializing || journeyLoading) return <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-12"><Brain className="w-12 h-12 text-accent animate-pulse" /><p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Neural Environment Calibrating...</p></div>;

  const currentQ = questions[currentIdx];
  const currentResult = sessionResults[currentIdx];

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <Code2 className="w-6 h-6 text-accent" />
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">Syntax Matrix Engine</h1>
            <p className="text-[9px] font-bold text-accent uppercase">Node {currentIdx + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className={cn("px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums tracking-widest", timeLeft < 300 ? "text-red-500 animate-pulse" : "text-accent")}>
            CODING TIME LEFT: {formatTime(timeLeft)}
          </div>
          <select 
            value={selectedLang.id} 
            onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])} 
            className="h-12 px-4 glass border-white/10 bg-[#0b0e1a] rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent transition-all"
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-[35%] flex flex-col gap-4">
          <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] font-black uppercase">Challenge Matrix</Badge>
                {journey?.aiGenerated && (
                  <Badge className="bg-accent/10 text-accent border-none text-[8px] font-black uppercase flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> AI Generated</Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{currentQ?.title}</h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-accent text-[8px] uppercase border-accent/20">{currentQ?.difficulty}</Badge>
                <Badge variant="outline" className="text-white/40 text-[8px] uppercase border-white/10">{currentQ?.topic || currentQ?.category}</Badge>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-wrap">{currentQ?.problemStatement || currentQ?.description}</p>
              
              {currentQ?.constraints && currentQ.constraints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Constraints</h4>
                  <ul className="space-y-2">
                    {currentQ.constraints.map((c: string, i: number) => (
                      <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-accent mt-1.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-5 glass border-white/5 rounded-2xl bg-black/40 space-y-3 font-mono text-[10px]">
                <p className="text-white/30 uppercase text-[8px]">Sample Input</p>
                <pre className="text-accent whitespace-pre-wrap">{currentQ?.sampleInput}</pre>
                <p className="text-white/30 uppercase text-[8px]">Sample Output</p>
                <pre className="text-green-400 whitespace-pre-wrap">{currentQ?.sampleOutput}</pre>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 glass border-white/5 bg-[#0b0e1a] flex flex-col relative overflow-hidden">
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
                scrollBeyondLastLine: false,
                padding: { top: 20 }
              }} 
            />
            <div className="h-20 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <Button onClick={runCode} disabled={isRunning || isSubmitting || isTimeExpired} className="h-12 px-8 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10">
                  {isRunning ? <Loader2 className="w-4 animate-spin" /> : "RUN CODE"}
                </Button>
                <Button onClick={performSubmission} disabled={isRunning || isSubmitting || isTimeExpired} className="h-12 px-8 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {isSubmitting ? <Loader2 className="w-4 animate-spin" /> : "SUBMIT CODE"}
                </Button>
              </div>
              <div className="flex items-center gap-4">
                {currentIdx < questions.length - 1 ? (
                  <Button onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))} variant="ghost" className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5">
                    NEXT QUESTION <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={finalizeAssessment} className="h-12 px-8 bg-accent/20 border border-accent/40 text-accent text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent/30 transition-all">
                    VIEW CODING RESULTS
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="h-[35%] glass border-white/5 bg-[#0b0e1a] flex flex-col overflow-hidden">
            <Tabs value={activeTerminalTab} onValueChange={setActiveTerminalTab} className="h-full flex flex-col">
              <TabsList className="bg-white/[0.02] px-4 h-10 border-b border-white/5">
                <TabsTrigger value="output" className="text-[9px] font-black uppercase tracking-widest">Execution Output</TabsTrigger>
                <TabsTrigger value="input" className="text-[9px] font-black uppercase tracking-widest">Custom Stdin</TabsTrigger>
                <TabsTrigger value="cases" className="text-[9px] font-black uppercase tracking-widest">Test Status</TabsTrigger>
              </TabsList>
              <div className="flex-1 font-mono text-[11px] overflow-hidden">
                <TabsContent value="output" className="p-6 text-white/60 h-full overflow-y-auto whitespace-pre-wrap">{terminalOutput}</TabsContent>
                <TabsContent value="input" className="h-full">
                  <textarea 
                    value={customInput} 
                    onChange={(e) => setCustomInput(e.target.value)} 
                    className="w-full h-full bg-transparent outline-none p-6 text-white/60 resize-none font-mono" 
                    placeholder="Enter manual parameter input for node debugging..." 
                  />
                </TabsContent>
                <TabsContent value="cases" className="p-6 space-y-4 h-full overflow-y-auto">
                  {currentResult ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                          <span className={cn("text-xs font-black uppercase tracking-widest", currentResult.allPassed ? "text-green-400" : "text-red-400")}>{currentResult.status}</span>
                          <p className="text-[10px] text-white/30 uppercase">Audit of {currentResult.totalCount} logical nodes</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Passed {currentResult.passedCount}/{currentResult.totalCount}</span>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {currentResult.results.map((r: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-4 glass border-white/5 rounded-xl bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-1.5 h-1.5 rounded-full", r.passed ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]")} />
                              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Hidden Case Node {i + 1}</span>
                            </div>
                            <Badge className={cn("text-[8px] border-none font-black px-3 py-1", r.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                              {r.passed ? "PASSED" : "FAILED"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <ShieldCheck className="w-12 h-12 text-white/5" />
                      <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Awaiting Neural Logic Verification</p>
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
            <h2 className="text-4xl font-bold tracking-tighter text-premium uppercase mb-12">Synthesizing Audit Report</h2>
            <div className="space-y-4 max-w-sm w-full">
              {["Compiling Node Data...", "Running Neural Audit...", "Validating Metrics...", "Finalizing Dossier..."].map((step, idx) => (
                <div key={idx} className={cn("flex items-center gap-4 transition-opacity duration-500", submitStep >= idx ? "opacity-100" : "opacity-20")}>
                  <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black", submitStep > idx ? "bg-green-500 border-green-500 text-black" : "border-white/20 text-white/20")}>
                    {submitStep > idx ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
