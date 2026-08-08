
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  History, 
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
  ChevronDown
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { MASTER_QUESTIONS } from '@/lib/coding-questions-data';

export default function CodingResultTerminal() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  const resultsQuery = useMemo(() => {
    if (!db || !user?.uid || !journey?.sessionId) return null;
    return query(
      collection(db, 'users', user.uid, 'coding_results'),
      where('interviewId', '==', journey.sessionId),
      orderBy('completedAt', 'asc')
    );
  }, [db, user?.uid, journey?.sessionId]);

  const { data: questionResults, loading: resultsLoading } = useCollection(resultsQuery);

  const result = useMemo(() => {
    if (journey?.codingReport) return journey.codingReport;
    
    return {
      score: 0,
      status: 'Awaiting',
      totalQuestions: 5,
      passedQuestions: 0,
      submissionTime: "N/A"
    };
  }, [journey]);

  const isPassed = (result?.score || 0) >= 70;

  const getQuestionTitle = (questionId: string) => {
    return MASTER_QUESTIONS.find(q => q.id === questionId)?.title || "Protocol Node";
  };

  if (journeyLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#050816]">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} onBack={() => router.push('/interview/coding')} />
      
      <main className="flex-1 container mx-auto px-6 pt-24 pb-8 flex flex-col gap-6 overflow-hidden">
        
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 shrink-0">
          <div className="space-y-1">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">Simulation Node 03 Audit</Badge>
            <h1 className="text-4xl font-bold tracking-tighter text-premium">Coding Round <span className="text-gradient-purple">Result.</span></h1>
            <p className="text-sm text-muted-foreground font-light uppercase tracking-widest">Your syntax matrix has been successfully evaluated by the neural auditor.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-6 py-2 rounded-2xl">
             <div className={cn("w-2 h-2 rounded-full animate-pulse", isPassed ? "bg-green-500" : "bg-red-500")} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Coding Evaluation Complete</span>
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
                   STATUS: {result?.status.toUpperCase()}
                 </Badge>
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
                      : "Your score is below the 70% proficiency threshold required for elite track progression."}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                {isPassed ? (
                  <Button 
                    onClick={() => router.push(`/interview/hr?role=${encodeURIComponent(journey?.role || '')}&company=${encodeURIComponent(journey?.company || '')}&exp=${encodeURIComponent(journey?.experience || '')}&round=HR%20Round`)}
                    className="w-full h-16 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group"
                  >
                    Enter HR Arena <Mic className="ml-3 w-5 h-5 transition-transform group-hover:scale-110" />
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
            <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-10 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-10 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                  <Activity className="w-4 h-4" /> Telemetry Summary
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Archived Node Results</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0 mb-8">
                {[
                  { label: "Total Questions", val: result?.totalQuestions || 0, icon: Layers, color: "text-blue-400" },
                  { label: "Correct Nodes", val: result?.passedQuestions || 0, icon: CheckCircle2, color: "text-green-400" },
                  { label: "Failed Probes", val: (result?.totalQuestions || 0) - (result?.passedQuestions || 0), icon: XCircle, color: "text-red-400" },
                  { label: "Execution Status", val: "Success", icon: Activity, color: "text-accent" },
                  { label: "Code Integrity", val: "Optimal", icon: Cpu, color: "text-purple-400" },
                  { label: "Master Score", val: `${result?.score}%`, icon: Trophy, color: "text-yellow-400" }
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

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3 ml-2 sticky top-0 bg-[#050816] py-2 z-10">
                   <Code2 className="w-4 h-4 text-accent" /> Coding Challenge Results
                </h4>
                
                {resultsLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
                ) : questionResults && questionResults.length > 0 ? (
                  questionResults.map((res: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <Card 
                        onClick={() => setExpandedNode(expandedNode === res.id ? null : res.id)}
                        className="glass p-6 rounded-[2rem] border-white/5 hover:border-white/20 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black group-hover:text-accent transition-colors">0{idx + 1}</div>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-white/90">{getQuestionTitle(res.questionId)}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span className="text-[9px] text-white/30 uppercase tracking-widest">{res.language}</span>
                              <span className="text-[9px] text-accent font-bold uppercase tracking-widest">{res.passedTestCases}/{res.totalTestCases} Nodes Passed</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className={cn("text-xs font-black uppercase tracking-widest", res.status === 'Solved' ? "text-green-400" : "text-red-400")}>
                              {res.status === 'Solved' ? 'PASSED' : 'FAILED'}
                            </p>
                            <p className="text-[8px] text-white/20 uppercase tracking-tighter">Audit Status</p>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", expandedNode === res.id && "rotate-180")} />
                        </div>
                      </Card>

                      <AnimatePresence>
                        {expandedNode === res.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-8 glass rounded-[2rem] border-accent/10 bg-accent/[0.01] space-y-8 mt-2">
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
                                        <p className="text-[8px] uppercase font-bold text-white/30">Memory usage</p>
                                        <p className="text-xs font-bold text-white tabular-nums">{res.memory || 'N/A'} KB</p>
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

                               {res.auditTrace?.some((tr: any) => tr.status.includes('Error')) && (
                                 <div className="p-6 glass rounded-2xl border-red-500/20 bg-red-500/[0.02] space-y-3">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                                      <AlertTriangle className="w-3 h-3" /> Diagnostic Logs
                                    </h5>
                                    <pre className="text-[10px] font-mono text-red-300/80 whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                                      {res.auditTrace.find((tr: any) => tr.status.includes('Error'))?.rawOutput || "Fatal execution exception captured."}
                                    </pre>
                                 </div>
                               )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center glass rounded-2xl border-white/5 border-dashed">
                    <p className="text-xs font-light text-white/20 uppercase tracking-widest">No implementation archives found.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: "Correct Answers", val: `0${result?.passedQuestions || 0}`, color: "text-green-400" },
                   { label: "Wrong Answers", val: `0${(result?.totalQuestions || 0) - (result?.passedQuestions || 0)}`, color: "text-red-400" },
                   { label: "Accuracy Rate", val: `${result?.score || 0}%`, color: "text-white" },
                   { label: "Submission", val: result?.submissionTime || "N/A", color: "text-white/40" }
                 ].map((s, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">{s.label}</p>
                      <p className={cn("text-xs font-black tabular-nums", s.color)}>{s.val}</p>
                    </div>
                 ))}
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => router.push('/dashboard')} variant="ghost" className="h-12 px-8 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white">
                Exit to Control Panel
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
