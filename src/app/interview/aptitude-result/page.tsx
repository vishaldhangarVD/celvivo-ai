"use client";

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  Target, 
  Loader2,
  AlertCircle,
  RotateCcw,
  Zap,
  ArrowRight,
  Cpu,
  Timer,
  BarChart3,
  TrendingUp,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  Activity,
  History,
  Star
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { cn } from '@/lib/utils';

export default function AptitudeResultPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [showMissingError, setShowMissingError] = useState(false);
  const [expandedIndex, setExpandedIdx] = useState<number | null>(null);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading } = useDoc(journeyRef);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!loading && journey && !journey.aptitudeReport) {
      timer = setTimeout(() => {
        setShowMissingError(true);
      }, 3000);
    } else if (journey?.aptitudeReport) {
      setShowMissingError(false);
    }
    return () => clearTimeout(timer);
  }, [loading, journey]);

  const result = journey?.aptitudeReport;

  // DIFFICULTY GROUPING
  const difficultyStats = useMemo(() => {
    if (!result?.details) return [];
    const stats: Record<string, { total: number, correct: number }> = {};
    result.details.forEach((d: any) => {
      const diff = d.difficulty || 'Medium';
      if (!stats[diff]) stats[diff] = { total: 0, correct: 0 };
      stats[diff].total++;
      if (d.isCorrect === true) stats[diff].correct++;
    });
    return ['Easy', 'Medium', 'Hard'].map(level => ({
      level,
      score: stats[level] ? Math.round((stats[level].correct / stats[level].total) * 100) : 0,
      total: stats[level]?.total || 0,
      correct: stats[level]?.correct || 0
    })).filter(s => s.total > 0);
  }, [result]);

  const handleProceed = async () => {
    if (!journeyRef) return;
    await updateDoc(journeyRef, {
      currentStage: INTERVIEW_STAGES.CODING,
      step: 6,
      codingUnlocked: true,
      updatedAt: serverTimestamp(),
    });
    router.push(STAGE_ROUTES.CODING);
  };

  const handleRetry = async () => {
    if (!journeyRef) return;
    await updateDoc(journeyRef, {
      currentStage: INTERVIEW_STAGES.APTITUDE,
      aptitudeStatus: "not_started",
      aptitudeReport: null,
      aptitudeAnswers: null,
      updatedAt: serverTimestamp(),
    });
    router.push(STAGE_ROUTES.APTITUDE);
  };

  if (loading || (!result && !showMissingError)) {
    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Cpu className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-premium uppercase">Loading Report</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Fetching your results</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold">Report Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">We couldn't retrieve your test results. Please try refreshing or restarting the session.</p>
        <Button onClick={() => router.push('/interview?action=resume')} className="mt-8">Resume Session</Button>
      </div>
    );
  }

  const isPassed = result.status === 'Pass';
  const timeLimit = 1800; // 30 mins
  const timeTaken = result.timeTakenSeconds || 0;
  const timePct = Math.round((timeTaken / timeLimit) * 100);

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <header className="text-center space-y-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase mb-4">Step 5: Assessment Result</Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium">Aptitude <span className="text-gradient-purple">Result.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mt-4 leading-relaxed">
                Your logical and math assessment is complete. See your performance breakdown below.
              </p>
            </motion.div>
          </header>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* HERO SCORE & TIME */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="lg:col-span-4 space-y-8"
            >
              <Card className="premium-card p-12 flex flex-col items-center text-center space-y-8 bg-white/[0.01] border-white/5 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-8">
                  <Badge className={cn("px-6 py-2 rounded-xl font-black tracking-[0.4em] text-[10px] border-none shadow-xl", 
                    isPassed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                    <circle 
                      cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" 
                      className={cn("transition-all duration-1000", isPassed ? "text-accent" : "text-red-400")}
                      strokeDasharray={552}
                      strokeDashoffset={552 - (552 * result.overallScore) / 100}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 15px ${isPassed ? 'rgba(34,211,238,0.5)' : 'rgba(248,113,113,0.5)'})` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black tabular-nums tracking-tighter">{result.overallScore}%</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Total Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 glass rounded-2xl border-white/5 space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Accuracy</p>
                    <p className="text-xl font-bold">{result.accuracy}%</p>
                  </div>
                  <div className="p-4 glass rounded-2xl border-white/5 space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Questions Correct</p>
                    <p className="text-xl font-bold">{result.correctCount} / {result.details?.length || 20}</p>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2"><Timer className="w-4 h-4 text-purple-400" /> Time Taken</p>
                    <p className="text-xs font-bold text-white/80">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s <span className="text-white/20">/ 30m</span></p>
                  </div>
                  <Progress value={timePct} className="h-1 bg-white/5" />
                </div>
              </Card>
            </motion.div>

            {/* PERFORMANCE ANALYSIS */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 space-y-8"
            >
              <div className="grid md:grid-cols-1 gap-8">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <Activity className="w-8 h-8 text-purple-400" />
                    <h3 className="text-xl font-bold tracking-tight">Performance by Difficulty</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {difficultyStats.map((stat, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.level}</p>
                          <p className="text-xs font-bold text-accent">{stat.correct} / {stat.total}</p>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${stat.score}%` }} 
                            className={cn("h-full", stat.level === 'Easy' ? 'bg-green-400' : stat.level === 'Medium' ? 'bg-orange-400' : 'bg-red-400')} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 glass rounded-2xl border-white/5 bg-white/[0.01] text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-2">AI Observation</p>
                    <p className="text-xs font-light text-white/60 italic leading-relaxed">
                      {result.feedback?.speedAnalysis || "Analysis available after processing."}
                    </p>
                  </div>
                </Card>
              </div>

              {/* AI INSIGHTS */}
              <Card className="premium-card bg-accent/[0.02] border-accent/20 p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <Target className="w-10 h-10 text-accent" />
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Performance Summary</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Detailed Analysis</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-green-400">
                      <CircleCheck className="w-6 h-6" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Strong Areas</h4>
                    </div>
                    <ul className="space-y-4">
                      {(result.feedback?.strengths || ["Correct logic and consistency verified."]).map((s: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm font-light text-white/80 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-red-400">
                      <AlertCircle className="w-6 h-6" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Needs Improvement</h4>
                    </div>
                    <ul className="space-y-4">
                      {(result.feedback?.weaknesses || ["Review complex logic questions to improve score."]).map((w: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm font-light text-white/80 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                   <div className="flex items-center gap-4 text-accent mb-4">
                     <TrendingUp className="w-5 h-5" />
                     <h4 className="text-sm font-bold uppercase tracking-widest">Next Step Recommendation</h4>
                   </div>
                   <p className="text-lg font-light text-white/90 leading-relaxed italic">"{result.recommendation || "Baseline established. You are ready for the technical round."}"</p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* QUESTION REVIEW */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold flex items-center gap-4"><History className="w-6 h-6 text-accent" /> Review Questions</h3>
              <Badge variant="outline" className="border-white/10 text-white/30 uppercase text-[9px]">Review List</Badge>
            </div>
            
            <div className="grid gap-4">
              {result.details?.map((detail: any, idx: number) => (
                <Card 
                  key={idx} 
                  className={cn(
                    "glass border-white/5 transition-all duration-300 rounded-[2rem] overflow-hidden",
                    expandedIndex === idx ? "border-accent/40" : "hover:border-white/20"
                  )}
                >
                  <button 
                    onClick={() => setExpandedIdx(expandedIndex === idx ? null : idx)}
                    className="w-full p-8 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-8">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                        detail.isCorrect === true ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                      )}>
                        {detail.isCorrect === true ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-white/90 line-clamp-1 max-w-xl group-hover:text-white transition-colors">{detail.question}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[9px] font-black uppercase text-accent tracking-widest">{detail.category}</span>
                          <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">{detail.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    {expandedIndex === idx ? <ChevronUp className="w-5 h-5 text-white/20" /> : <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-accent transition-colors" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedIndex === idx && (
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden bg-black/40 border-t border-white/5"
                      >
                        <div className="p-10 grid md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Your Answer</h5>
                            <div className={cn(
                              "p-6 rounded-2xl border",
                              detail.isCorrect === true ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"
                            )}>
                              <p className="text-lg font-light">{detail.userAnswer}</p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Correct Answer</h5>
                            <div className="p-6 rounded-2xl border bg-accent/5 border-accent/20">
                              <p className="text-lg font-bold text-accent">{detail.correctAnswer}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          </section>

          {/* NAVIGATION */}
          <div className="flex justify-center gap-6 pt-12 border-t border-white/5">
            <Button onClick={handleProceed} className="h-20 px-24 btn-premium rounded-[2.5rem] text-xl font-black uppercase tracking-[0.4em] shadow-2xl group">
              Proceed to Coding Round <ArrowRight className="ml-4 w-8 h-8 transition-transform group-hover:translate-x-2" />
            </Button>
            {!isPassed && (
              <Button onClick={handleRetry} className="h-20 px-16 glass border-white/10 rounded-[2.5rem] text-xl font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                <RotateCcw className="mr-4 w-8 h-8" /> Retake Assessment
              </Button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
