"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Command, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Cpu,
  Brain,
  Zap,
  Activity,
  Award,
  RotateCcw,
  LayoutGrid,
  Trophy,
  Target
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { generateAptitudeTest } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AptitudeEnginePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [warnings, setWarnings] = useState(0);

  // Fetch Session Context
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  // Initialize Test
  useEffect(() => {
    async function init() {
      if (!journey || questions.length > 0) return;
      
      try {
        const response = await generateAptitudeTest({
          role: journey.role,
          company: journey.company,
          experienceLevel: journey.experience,
        });
        setQuestions(response.questions);
      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Neural Synthesis Error", description: "Could not generate assessment nodes." });
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, [journey]);

  // Timer & Security
  useEffect(() => {
    if (isInitializing || isEvaluating || result) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibility = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= 4) {
            handleSubmit();
            toast({ variant: "destructive", title: "Security Breach", description: "Automated submission triggered due to multiple tab switches." });
          } else {
            toast({ 
              variant: "destructive", 
              title: `Warning ${next}/3`, 
              description: "Unauthorized tab switch detected. High-fidelity monitoring is active." 
            });
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isInitializing, isEvaluating, result]);

  const handleOptionSelect = (ans: string) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: ans }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (isEvaluating || !journey) return;
    setIsEvaluating(true);

    const formattedResults = questions.map((q, idx) => ({
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      userAnswer: answers[idx] || "",
      correctAnswer: q.answer,
      isCorrect: answers[idx] === q.answer
    }));

    // Start evaluation steps
    const steps = [
      "Analyzing logical reasoning...",
      "Analyzing analytical thinking...",
      "Analyzing quantitative ability...",
      "Calculating enterprise readiness..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setEvaluationStep(i);
      await new Promise(r => setTimeout(r, 1200));
    }

    try {
      const report = await evaluateAptitude({
        role: journey.role,
        company: journey.company,
        experienceLevel: journey.experience,
        timeTakenSeconds: (45 * 60) - timeLeft,
        totalQuestions: questions.length,
        results: formattedResults
      });

      setResult(report);
      
      // Update Firestore Journey
      await updateDoc(journeyRef!, {
        aptitudeReport: report,
        currentStage: report.status === 'Pass' ? 'Coding Assessment' : 'Aptitude Assessment',
        step: report.status === 'Pass' ? 4 : 3,
        updatedAt: serverTimestamp()
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Evaluation Error" });
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isInitializing || journeyLoading) {
    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-premium">Synthesizing Aptitude Nodes</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Calibrating for {journey?.company} Protocol</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      
      {/* 1. Header Protocol */}
      <header className="h-20 border-b border-white/5 bg-[#0b0e1a]/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-premium">{journey?.company} APTITUDE ENGINE</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{journey?.role}</span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <Badge className="bg-accent/10 text-accent border-none text-[8px] font-black px-2 py-0">AI ONLINE</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className={cn(
              "px-6 py-2 rounded-xl glass border-white/10 font-mono text-xl tabular-nums transition-colors duration-500",
              timeLeft < 60 ? "text-red-500 border-red-500/50 animate-pulse" : "text-accent"
            )}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-6 grid lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left: Question Arena */}
        <div className="lg:col-span-9 flex flex-col gap-6 overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!result && !isEvaluating ? (
              <motion.div 
                key="arena"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col gap-6 overflow-hidden"
              >
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Intelligence Node {currentIdx + 1} of {questions.length}</span>
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">Progress: {Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                      className="h-full bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    />
                  </div>
                </div>

                {/* Question Card */}
                <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-12 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <Badge variant="outline" className="border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest">{questions[currentIdx].difficulty} LEVEL</Badge>
                  </div>
                  
                  <div className="max-w-3xl mx-auto w-full space-y-12">
                    <div className="space-y-4">
                      <Badge className="bg-purple-500/10 text-purple-400 border-none text-[10px] font-black uppercase tracking-[0.2em]">{questions[currentIdx].category}</Badge>
                      <h2 className="text-3xl font-bold tracking-tight text-white/90 leading-tight">
                        {questions[currentIdx].question}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questions[currentIdx].options.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(opt)}
                          className={cn(
                            "group p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden",
                            answers[currentIdx] === opt 
                              ? "bg-accent/20 border-accent text-accent shadow-[0_0_30px_rgba(34,211,238,0.2)]" 
                              : "glass border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                              "w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all",
                              answers[currentIdx] === opt ? "bg-accent border-accent text-black" : "border-white/10 group-hover:border-white/30"
                            )}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="text-sm font-medium">{opt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Bottom Actions */}
                <div className="h-24 glass rounded-[2.5rem] border-white/5 p-4 flex items-center justify-between">
                  <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="h-16 px-8 rounded-2xl glass border-white/10 text-[10px] font-black uppercase tracking-widest"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={toggleMarkForReview}
                      className={cn(
                        "h-16 px-8 rounded-2xl glass border-white/10 text-[10px] font-black uppercase tracking-widest",
                        markedForReview.has(currentIdx) && "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      )}
                    >
                      Mark for Review
                    </Button>
                  </div>

                  <div className="flex gap-4">
                    {currentIdx < questions.length - 1 ? (
                      <Button 
                        onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                        className="h-16 px-12 btn-premium rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
                      >
                        Save & Next <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSubmit}
                        className="h-16 px-12 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                      >
                        Submit Assessment <ShieldCheck className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : isEvaluating ? (
              <motion.div 
                key="evaluating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="relative mb-12">
                  <div className="w-32 h-32 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                  <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-6 max-w-md">
                  <h2 className="text-4xl font-bold tracking-tighter text-premium">AI Final Audit Active</h2>
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
                      {["Analyzing logical reasoning...", "Analyzing analytical thinking...", "Analyzing quantitative ability...", "Calculating enterprise readiness..."][evaluationStep]}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col gap-6"
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
                    <div className="text-[100px] font-black tracking-tighter text-premium tabular-nums">{result.overallScore}%</div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">Master Performance Index</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl pt-8 border-t border-white/5">
                    {[
                      { label: "Accuracy", val: `${result.accuracy}%`, icon: Target, color: "text-blue-400" },
                      { label: "Correct Nodes", val: result.correctCount, icon: CheckCircle2, color: "text-green-400" },
                      { label: "Temporal Efficiency", val: formatTime((45 * 60) - timeLeft), icon: Clock, color: "text-purple-400" },
                      { label: "Percentile", val: result.percentile, icon: Award, color: "text-accent" }
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

                  <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl pt-8">
                     <div className="p-8 glass rounded-[2rem] border-accent/10 space-y-6">
                        <h3 className="text-accent text-xs font-black uppercase tracking-widest flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5" /> Strategic Strengths
                        </h3>
                        <div className="space-y-3">
                          {result.feedback.strengths.map((s: string, i: number) => (
                            <div key={i} className="flex gap-4 text-xs font-light text-white/70 text-left">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /> {s}
                            </div>
                          ))}
                        </div>
                     </div>
                     <div className="p-8 glass rounded-[2rem] border-red-500/10 space-y-6">
                        <h3 className="text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5" /> Remediation Nodes
                        </h3>
                        <div className="space-y-3">
                          {result.feedback.weaknesses.map((w: string, i: number) => (
                            <div key={i} className="flex gap-4 text-xs font-light text-white/70 text-left">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" /> {w}
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>

                  <div className="pt-8">
                    {result.status === 'Pass' ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-center gap-3 text-green-400">
                          <Zap className="w-6 h-6" />
                          <span className="text-lg font-bold tracking-tight">SYNTAX MATRIX (CODING) UNLOCKED</span>
                        </div>
                        <Button onClick={() => router.push('/interview/coding')} className="h-20 px-20 btn-premium rounded-2xl text-lg font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(34,211,238,0.2)]">
                           Proceed to Coding Round <ChevronRight className="ml-4 w-6 h-6" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-col items-center gap-2 text-red-400">
                           <LayoutGrid className="w-8 h-8" />
                           <span className="text-lg font-bold tracking-tight">CODING ROUND LOCKED</span>
                           <p className="text-xs font-light text-white/40 uppercase tracking-widest">Minimum 70% precision required for protocol clearance.</p>
                        </div>
                        <Button onClick={() => window.location.reload()} className="h-16 px-12 glass border-white/10 hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                           <RotateCcw className="w-4 h-4 mr-3" /> Re-initialize Assessment
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

        </div>

        {/* Right: Palette Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-8 h-fit">
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" /> Node Palette
              </h3>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Session Logic Map</p>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {questions.map((_, i) => {
                const isCurrent = currentIdx === i;
                const isAnswered = answers[i] !== undefined;
                const isMarked = markedForReview.has(i);

                return (
                  <button
                    key={i}
                    onClick={() => !result && !isEvaluating && setCurrentIdx(i)}
                    className={cn(
                      "w-full aspect-square rounded-xl border text-[10px] font-black transition-all duration-300",
                      isCurrent ? "bg-accent border-accent text-black scale-110 shadow-[0_0_15px_rgba(34,211,238,0.4)]" :
                      isMarked ? "bg-orange-500/20 border-orange-500/40 text-orange-400" :
                      isAnswered ? "bg-green-500/20 border-green-500/40 text-green-400" :
                      "glass border-white/5 text-white/20 hover:border-white/20"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.4em] mb-4">Legend</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md bg-accent" />
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md bg-green-500/20 border border-green-500/40" />
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md bg-orange-500/20 border border-orange-500/40" />
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Marked</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md glass border border-white/5" />
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Pending</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass border-accent/20 bg-accent/[0.02] p-8 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-3">
              <ShieldCheck className="w-4 h-4" /> Security Active
            </h4>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/40">
                 <span>Full-Screen Protocol</span>
                 <span className="text-green-400">ACTIVE</span>
               </div>
               <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/40">
                 <span>Neural Monitoring</span>
                 <span className="text-green-400">OPTIMAL</span>
               </div>
               <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/40">
                 <span>Session Warnings</span>
                 <span className={cn(warnings > 0 ? "text-orange-400" : "text-white/20")}>{warnings} / 3</span>
               </div>
            </div>
          </Card>
        </div>
      </main>

      <NavigationControls onHome={() => router.push('/')} />
    </div>
  );
}
