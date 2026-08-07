"use client";

import { useState, useMemo } from 'react';
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
  Check
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function CodingResultTerminal() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  // Fetch active journey context for real session data
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  // High-fidelity evaluation data (Integrated with real logic nodes)
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
        
        {/* Header Protocol */}
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

        {/* Master Content Matrix */}
        <div className="flex-1 grid lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* Left Column: Master Score & Decision */}
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

          {/* Right Column: Performance Summary */}
          <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
            <Card className="flex-1 premium-card bg-white/[0.01] border-white/5 p-10 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                  <Activity className="w-4 h-4" /> Telemetry Summary
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Archived Node Results</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Challenges", val: result?.totalQuestions || 5, icon: Layers, color: "text-blue-400" },
                  { label: "Passed Nodes", val: result?.passedQuestions || 0, icon: CheckCircle2, color: "text-green-400" },
                  { label: "Failed Probes", val: (result?.totalQuestions || 5) - (result?.passedQuestions || 0), icon: XCircle, color: "text-red-400" },
                  { label: "Accuracy Rate", val: `${result?.score}%`, icon: Target, color: "text-accent" },
                  { label: "Submission Node", val: result?.submissionTime, icon: Clock, color: "text-purple-400" },
                  { label: "Audit Protocol", val: "Verified", icon: ShieldCheck, color: "text-orange-400" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 glass rounded-2xl border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5", stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-bold tabular-nums text-white/90">{stat.val}</div>
                    <div className="text-[8px] uppercase font-bold tracking-widest text-white/30">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                   <Sparkles className="w-4 h-4 text-accent" /> Neural Performance Matrix
                 </h4>
                 <div className="grid gap-4">
                   <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-bold uppercase text-white/40">
                       <span>Implementation Accuracy</span>
                       <span>{result?.score}%</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${result?.score}%` }} className="h-full bg-accent" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-bold uppercase text-white/40">
                       <span>Logic Persistence</span>
                       <span>{Math.round((result?.passedQuestions / result?.totalQuestions) * 100)}%</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${(result?.passedQuestions / result?.totalQuestions) * 100}%` }} className="h-full bg-purple-500" />
                     </div>
                   </div>
                 </div>
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
