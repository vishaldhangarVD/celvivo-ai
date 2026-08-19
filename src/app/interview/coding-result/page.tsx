"use client";

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Activity, 
  Clock, 
  ChevronRight, 
  RotateCcw, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Target, 
  Code2, 
  Layers,
  Sparkles, 
  Command,
  Mic,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Flame,
  Check,
  Timer,
  Terminal,
  ChevronDown,
  PieChart,
  ArrowRight,
  FastForward
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { MASTER_QUESTIONS } from '@/lib/coding-questions-data';

export default function CodingResultTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();

  const attemptId = searchParams.get('attemptId');
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  // PRIMARY SOURCE OF TRUTH: HISTORICAL ATTEMPT DOC
  const attemptRef = useMemo(() => {
    if (!db || !user?.uid || !attemptId) return null;
    return doc(db, 'users', user.uid, 'coding_attempts', attemptId);
  }, [db, user?.uid, attemptId]);

  const { data: attemptDoc, loading: attemptLoading } = useDoc(attemptRef);

  // FALLBACK SOURCE OF TRUTH: ACTIVE JOURNEY
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  const activeId = attemptId || journey?.sessionId;

  const resultsQuery = useMemo(() => {
    if (!db || !user?.uid || !activeId) return null;
    return query(
      collection(db, 'users', user.uid, 'coding_results'),
      where('interviewId', '==', activeId),
      orderBy('completedAt', 'asc')
    );
  }, [db, user?.uid, activeId]);

  const { data: questionResults, loading: resultsLoading } = useCollection(resultsQuery);

  const displayQuestions = useMemo(() => {
    return attemptDoc?.questions || journey?.codingQuestions || [];
  }, [attemptDoc, journey]);

  const result = useMemo(() => {
    if (attemptDoc?.score !== undefined) return attemptDoc;
    if (journey?.codingReport && (!attemptId || attemptId === journey.sessionId)) return journey.codingReport;
    
    const total = 8;
    if (questionResults && questionResults.length > 0) {
      const solved = questionResults.filter((r: any) => r.status === 'Solved').length;
      const failed = questionResults.filter((r: any) => r.status === 'Failed').length;
      const score = Math.round((solved / total) * 100);

      return {
        score,
        status: score >= 60 ? 'Pass' : 'Fail',
        totalQuestions: total,
        passedQuestions: solved,
        failedQuestions: failed,
        skippedQuestions: Math.max(0, total - (solved + failed)),
        totalPassedCases: questionResults.reduce((acc, curr) => acc + (curr.passedTestCases || 0), 0),
        totalTestCases: questionResults.reduce((acc, curr) => acc + (curr.totalTestCases || 0), 0),
      };
    }

    return {
      score: 0,
      status: 'Awaiting',
      totalQuestions: total,
      passedQuestions: 0,
      failedQuestions: 0,
      skippedQuestions: total,
      totalPassedCases: 0,
      totalTestCases: 0,
    };
  }, [attemptDoc, journey, questionResults, attemptId]);

  const aggregateStats = useMemo(() => {
    if (!questionResults || questionResults.length === 0) return null;
    
    const passedTests = questionResults.reduce((acc, curr) => acc + (curr.passedTestCases || 0), 0);
    const totalTests = questionResults.reduce((acc, curr) => acc + (curr.totalTestCases || 0), 0);
    const maxTime = Math.max(...questionResults.map(r => parseFloat(r.executionTime) || 0));
    const maxMemory = Math.max(...questionResults.map(r => parseInt(r.memory) || 0));
    
    return {
      passedTests,
      totalTests,
      maxTime: maxTime > 0 ? maxTime.toFixed(2) : "0.00",
      maxMemory: maxMemory > 0 ? maxMemory : "N/A",
      successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };
  }, [questionResults]);

  const recommendation = useMemo(() => {
    if (!result || result.status === 'Awaiting') return "Evaluation unavailable";
    const score = result.score || 0;
    if (result.status === 'Pass' || score >= 60) return score >= 85 ? "PASS (OPTIMAL)" : "PASS";
    return "FAIL";
  }, [result]);

  const isPassed = (result?.score || 0) >= 60;

  if (attemptLoading || journeyLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#050816]">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 pt-24 pb-8 flex flex-col gap-6 overflow-hidden">
        
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 shrink-0">
          <div className="space-y-1">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">Simulation Node 03 Audit</Badge>
            <h1 className="text-4xl font-bold tracking-tighter text-premium">Coding Round <span className="text-gradient-purple">Result.</span></h1>
            <p className="text-sm text-muted-foreground font-light uppercase tracking-widest">Your syntax matrix has been successfully evaluated by the neural auditor.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-6 py-2 rounded-2xl">
             <div className={cn("w-2 h-2 rounded-full animate-pulse", isPassed ? "bg-green-500" : "bg-red-500")} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Attempt ID: {activeId?.substring(0, 8) || "Unknown"}</span>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-12 gap-6 overflow-hidden">
          
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col items-center text-center justify-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <div className="relative">
                <div className={cn(
                  "text-[100px] font-black tracking-tighter tabular-nums drop-shadow-[0_0_50px_rgba(34,211,238,0.2)] leading-none",
                  isPassed ? "text-accent" : "text-red-400"
                )}>
                  {result?.score}%
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mt-2">Overall Proficiency Index</p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                 <Badge className={cn(
                   "px-6 py-2 rounded-xl font-black tracking-[0.4em] text-[10px] border-none",
                   isPassed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                 )}>
                   STATUS: {result?.status?.toUpperCase() || "AWAITING"}
                 </Badge>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Target className="w-24 h-24 text-accent" />
               </div>
               <div className="space-y-2 relative z-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                   <ShieldCheck className="w-4 h-4" /> Final Recommendation
                 </h3>
                 <div className="pt-4">
                   <p className={cn(
                     "text-3xl font-black tracking-tighter",
                     recommendation.includes("PASS") ? "text-green-400" : "text-red-400"
                   )}>
                     {recommendation}
                   </p>
                   <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Based on algorithmic performance</p>
                 </div>
               </div>
            </Card>

            <Card className={cn(
              "flex-1 p-8 rounded-[2.5rem] border flex flex-col justify-between relative overflow-hidden",
              isPassed ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
            )}>
              <div className="space-y-4 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  isPassed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  {isPassed ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">
                    {isPassed ? "🎉 Neural Verification Passed" : "Proficiency Threshold Not Met"}
                  </h3>
                  <p className="text-xs font-light text-white/60 leading-relaxed">
                    {isPassed 
                      ? "Your algorithmic logic has been verified. The Virtual HR Arena is now unlocked for final deployment."
                      : "Your score is below the 60% proficiency threshold required for track progression."}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                {isPassed ? (
                  <Button 
                    onClick={() => router.push(`/interview/${activeId}?role=${encodeURIComponent(journey?.role || '')}&company=${encodeURIComponent(journey?.company || '')}&exp=${encodeURIComponent(journey?.experience || '')}&round=HR%20Round`)}
                    className="w-full h-16 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group"
                  >
                    CONTINUE TO INTERVIEW <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push('/interview/coding')}
                    className="w-full h-16 glass border-white/10 hover:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-[0.3em]"
                  >
                    <RotateCcw className="mr-3 w-5 h-5" /> Re-initialize Assessment
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
                {[
                  { label: "Total Questions", val: result?.totalQuestions || 8, icon: Layers, color: "text-blue-400" },
                  { label: "Correct Nodes", val: result?.passedQuestions || 0, icon: CheckCircle2, color: "text-green-400" },
                  { label: "Failed Probes", val: result?.failedQuestions || 0, icon: XCircle, color: "text-red-400" },
                  { label: "Skipped Nodes", val: result?.skippedQuestions || 0, icon: FastForward, color: "text-orange-400" },
                  { label: "Accuracy Index", val: `${result?.score || 0}%`, icon: Target, color: "text-accent" },
                  { label: "Master Score", val: `${result?.score || 0}%`, icon: Trophy, color: "text-yellow-400" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 glass rounded-2xl border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white/5", stat.color)}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold tabular-nums text-white/90">{stat.val}</div>
                    <div className="text-[8px] uppercase font-bold tracking-widest text-white/30">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3 ml-2">
                   <Code2 className="w-4 h-4 text-accent" /> Coding Challenge Results
                </h4>
                
                {resultsLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
                ) : displayQuestions.length > 0 ? (
                  displayQuestions.map((q: any, idx: number) => {
                    const res = questionResults?.find((r: any) => r.questionId === q.id);
                    return (
                      <div key={idx} className="space-y-4">
                        <Card 
                          onClick={() => res && setExpandedNode(expandedNode === res.id ? null : res.id)}
                          className={cn("glass p-6 rounded-[2rem] border-white/5 transition-all flex items-center justify-between group", res ? "cursor-pointer hover:border-white/20" : "opacity-50")}
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black group-hover:text-accent transition-colors">0{idx + 1}</div>
                            <div className="space-y-1">
                              <p className="text-base font-bold text-white/90">{q.title}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className="text-[9px] text-white/30 uppercase tracking-widest">{res?.language || "---"}</span>
                                <span className="text-[9px] text-accent font-bold uppercase tracking-widest">{res?.passedTestCases || 0}/{res?.totalTestCases || q.hiddenTestCases?.length || 0} Nodes Passed</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className={cn("text-xs font-black uppercase tracking-widest", res?.status === 'Solved' ? "text-green-400" : "text-red-400")}>
                                {res?.status === 'Solved' ? 'PASSED' : res?.status === 'Skipped' ? 'SKIPPED' : res ? 'FAILED' : 'NO SUBMISSION'}
                              </p>
                              <p className="text-[8px] text-white/20 uppercase tracking-tighter">Audit Status</p>
                            </div>
                            {res && <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", expandedNode === res.id && "rotate-180")} />}
                          </div>
                        </Card>

                        <AnimatePresence>
                          {res && expandedNode === res.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-8 glass rounded-[2.5rem] border-accent/10 bg-accent/[0.01] space-y-8 mt-2">
                                 <div className="grid md:grid-cols-2 gap-8">
                                   <div className="space-y-4">
                                     <h5 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                                       <Terminal className="w-3 h-3" /> Execution Details
                                     </h5>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                                          <p className="text-[8px] uppercase font-bold text-white/30">Language</p>
                                          <p className="text-xs font-bold text-white">{res.language}</p>
                                        </div>
                                        <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                                          <p className="text-[8px] uppercase font-bold text-white/30">Status</p>
                                          <p className={cn("text-xs font-bold", res.status === 'Solved' ? "text-green-400" : "text-red-400")}>{res.status}</p>
                                        </div>
                                        <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                                          <p className="text-[8px] uppercase font-bold text-white/30">Execution Time</p>
                                          <p className="text-xs font-bold text-white tabular-nums">{res.executionTime || '0.00'}s</p>
                                        </div>
                                        <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                                          <p className="text-[8px] uppercase font-bold text-white/30">Memory Usage</p>
                                          <p className="text-xs font-bold text-white tabular-nums">{res.memory || '---'} KB</p>
                                        </div>
                                     </div>
                                   </div>

                                   <div className="space-y-4">
                                     <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                       <Activity className="w-3 h-3" /> Audit Trace Summary
                                     </h5>
                                     <div className="p-4 glass rounded-xl border-white/5 h-full max-h-[160px] overflow-y-auto custom-scrollbar">
                                        {res.auditTrace && res.auditTrace.length > 0 ? (
                                          <div className="space-y-3">
                                            {res.auditTrace.map((tr: any, tIdx: number) => (
                                              <div key={tIdx} className="flex items-center justify-between text-[10px]">
                                                <span className="text-white/40">Test Case #{tIdx + 1}</span>
                                                <Badge variant="outline" className={cn("text-[8px] uppercase py-0", tr.passed ? "text-green-400 border-green-500/20" : "text-red-400 border-red-500/20")}>
                                                  {tr.status}
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-[10px] text-white/20 italic">No diagnostic trace available.</p>
                                        )}
                                     </div>
                                   </div>
                                 </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center glass rounded-2xl border-white/5 border-dashed">
                    <p className="text-xs font-light text-white/20 uppercase tracking-widest">No implementation archives found for this attempt.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 shrink-0 pt-4 border-t border-white/5">
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="ghost" 
                className="h-12 px-8 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white"
              >
                Exit to Control Panel
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
