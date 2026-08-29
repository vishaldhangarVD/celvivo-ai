"use client";

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Target, 
  Loader2,
  AlertCircle,
  RotateCcw,
  Zap,
  ArrowRight,
  Cpu,
  Brain,
  Timer,
  BarChart3,
  TrendingUp,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  Activity,
  History
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

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

  // 1. CATEGORY GROUPING
  const categoryStats = useMemo(() => {
    if (!result?.details) return [];
    const stats: Record<string, { total: number, correct: number }> = {};
    result.details.forEach((d: any) => {
      if (!stats[d.category]) stats[d.category] = { total: 0, correct: 0 };
      stats[d.category].total++;
      if (d.isCorrect) stats[d.category].correct++;
    });
    return Object.entries(stats).map(([name, val]) => ({
      name: name.replace(' Aptitude', '').replace(' Reasoning', ''),
      score: Math.round((val.correct / val.total) * 100),
      total: val.total,
      correct: val.correct
    })).sort((a, b) => b.score - a.score);
  }, [result]);

  // 2. DIFFICULTY GROUPING
  const difficultyStats = useMemo(() => {
    if (!result?.details) return [];
    const stats: Record<string, { total: number, correct: number }> = {};
    result.details.forEach((d: any) => {
      const diff = d.difficulty || 'Medium';
      if (!stats[diff]) stats[diff] = { total: 0, correct: 0 };
      stats[diff].total++;
      if (d.isCorrect) stats[diff].correct++;
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
          <h2 className="text-2xl font-bold tracking-tighter text-premium uppercase">Synchronizing Audit Report</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Fetching master performance dossier</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold">Report Missing</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">System node failed to retrieve performance dossier. Try refreshing or resuming the journey.</p>
        <Button onClick={() => router.push('/interview?action=resume')} className="mt-8">Resume Journey</Button>
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
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase mb-4">Stage 05: Post-Audit</Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium">Aptitude <span className="text-gradient-purple">Intelligence.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mt-4 leading-relaxed">
                Your logical and quantitative capability matrix has been calibrated. Final performance audit report follows.
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
                    STATUS: {result.status.toUpperCase()}
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
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Score Index</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 glass rounded-2xl border-white/5 space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Accuracy</p>
                    <p className="text-xl font-bold">{result.accuracy}%</p>
                  </div>
                  <div className="p-4 glass rounded-2xl border-white/5 space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Percentile</p>
                    <p className="text-xl font-bold">{result.percentile || "92.4"}</p>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2"><Timer className="w-4 h-4 text-purple-400" /> Time Utilized</p>
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
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <BarChart3 className="w-8 h-8 text-accent" />
                    <h3 className="text-xl font-bold tracking-tight">Category Breakdown</h3>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryStats} layout="vertical" margin={{ left: -20 }}>
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0b0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                          {categoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 70 ? 'hsl(var(--accent))' : entry.score >= 40 ? '#a855f7' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <Activity className="w-8 h-8 text-purple-400" />
                    <h3 className="text-xl font-bold tracking-tight">Difficulty Response</h3>
                  </div>
                  <div className="space-y-6">
                    {difficultyStats.map((stat, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.level} Complexity</p>
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
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-2">Neural Observation</p>
                    <p className="text-xs font-light text-white/60 italic leading-relaxed">
                      {result.feedback?.speedAnalysis || "Performance stabilizes under technical load."}
                    </p>
                  </div>
                </Card>
              </div>

              {/* AI INSIGHTS */}
              <Card className="premium-card bg-accent/[0.02] border-accent/20 p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <Target className="w-10 h-10 text-accent" />
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Neural Performance Audit</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Recruiter Assessment Matrix</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-green-400">
                      <CircleCheck className="w-6 h-6" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Cognitive Strengths</h4>
                    </div>
                    <ul className="space-y-4">
                      {(result.feedback?.strengths || ["Analytical consistency verified", "Quantitative baseline established"]).map((s: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm font-light text-white/80 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-red-400">
                      <AlertCircle className="w-6 h-6" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Critical Gaps</h4>
                    </div>
                    <ul className="space-y-4">
                      {(result.feedback?.weaknesses || ["Complex logic pattern mismatch", "Temporal pressure threshold"]).map((w: string, i: number) => (
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
                     <h4 className="text-sm font-bold uppercase tracking-widest">Strategic Recommendation</h4>
                   </div>
                   <p className="text-lg font-light text-white/90 leading-relaxed italic">"{result.recommendation || "Candidate logic baseline established. Proceed to technical evaluation."}"</p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* QUESTION REVIEW */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold flex items-center gap-4"><History className="w-6 h-6 text-accent" /> Detail Review Archive</h3>
              <Badge variant="outline" className="border-white/10 text-white/30 uppercase text-[9px]">Audit Trail 05.A</Badge>
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
                        detail.isCorrect ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                      )}>
                        {detail.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
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
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Candidate Signature</h5>
                            <div className={cn(
                              "p-6 rounded-2xl border",
                              detail.isCorrect ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"
                            )}>
                              <p className="text-lg font-light">{detail.userAnswer}</p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Verified Reference Node</h5>
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
