"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  ArrowRight,
  Mic,
  MessageSquare,
  Loader2,
  FastForward
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function CodingResultPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  // Fetch active journey context for real session data
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  // Result Data (Uses Firestore data if available, otherwise mocks with zeros for UI preview)
  const result = useMemo(() => {
    if (journey?.codingReport) return journey.codingReport;
    
    return {
      score: 0,
      status: 'Awaiting',
      totalQuestions: 5,
      passedQuestions: 0,
      failedQuestions: 0,
      skippedQuestions: 0,
      accuracy: 0,
      submissionTime: "N/A",
      time: "00:00"
    };
  }, [journey]);

  const isPassed = (result?.score || 0) >= 60;

  if (journeyLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#050816]">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-y-auto custom-scrollbar">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header Section */}
          <header className="text-center space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Audit Node 05</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Coding Round <span className="text-gradient-purple">Result.</span></h1>
            <p className="text-xl text-muted-foreground font-light">Your coding performance has been evaluated by the neural syntax auditor.</p>
          </header>

          {/* Top Master Result Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="premium-card p-12 flex flex-col items-center text-center space-y-10 relative overflow-hidden bg-white/[0.01]">
              <div className="absolute top-0 right-0 p-12">
                <Badge className={cn(
                  "px-8 py-3 rounded-2xl font-black tracking-[0.5em] text-xs border-none shadow-2xl",
                  isPassed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  STATUS: {isPassed ? "PASS" : "FAIL"}
                </Badge>
              </div>

              <div className="relative">
                <div className={cn(
                  "text-[120px] font-black tracking-tighter tabular-nums drop-shadow-[0_0_50px_rgba(34,211,238,0.2)]",
                  isPassed ? "text-accent" : "text-red-400"
                )}>
                  {result?.score}%
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">Overall Efficiency Index</p>
              </div>

              <div className="flex items-center gap-3 text-green-400/80 px-6 py-2 glass rounded-full border-green-500/20 bg-green-500/5">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Submission Verified & Archived</span>
              </div>
            </Card>
          </motion.div>

          {/* Performance Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Questions", val: `0${result?.totalQuestions || 5}`, icon: Layers, color: "text-blue-400" },
              { label: "Correct Solutions", val: `0${result?.passedQuestions || 0}`, icon: CheckCircle2, color: "text-green-400" },
              { label: "Failed Solutions", val: `0${result?.failedQuestions || 0}`, icon: XCircle, color: "text-red-400" },
              { label: "Skipped Nodes", val: `0${result?.skippedQuestions || 0}`, icon: FastForward, color: "text-orange-400" },
              { label: "Accuracy Index", val: `${result?.score}%`, icon: Target, color: "text-accent" },
              { label: "Overall Score", val: `${result?.score}%`, icon: Trophy, color: "text-yellow-400" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.05] transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5 ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold mb-1 tabular-nums">{stat.val}</div>
                <div className="text-[8px] uppercase font-bold tracking-widest text-white/30">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left: Answer Review (Dynamic placeholders based on real session results can go here) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-4">
                 <h3 className="text-xl font-bold flex items-center gap-3">
                   <Target className="w-5 h-5 text-accent" /> Logic Review Matrix
                 </h3>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Simulation Nodes</span>
              </div>
              
              <div className="space-y-4">
                <Card className="glass p-12 rounded-[2rem] border-white/5 flex flex-col items-center justify-center text-center opacity-50 bg-white/[0.01]">
                    <History className="w-12 h-12 text-white/10 mb-6" />
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Launch the Terminal to View Detailed Trace Logs</p>
                </Card>
              </div>
            </div>

            {/* Right: Summary & AI Audit */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                    <History className="w-4 h-4" /> Telemetry Summary
                  </h3>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Temporal & Logic Metrics</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Correct Answers", val: `0${result?.passedQuestions || 0}`, color: "text-green-400" },
                    { label: "Wrong Answers", val: `0${result?.failedQuestions || 0}`, color: "text-red-400" },
                    { label: "Accuracy Rate", val: `${result?.score || 0}%`, color: "text-white" },
                    { label: "Time Taken", val: result?.time || "N/A", color: "text-white" },
                    { label: "Submission", val: result?.submissionTime || "N/A", color: "text-white/40" }
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{s.label}</span>
                      <span className={cn("text-sm font-black tabular-nums", s.color)}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Review Placeholders */}
              <div className="space-y-4">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Neural Code Audit</h3>
                 <div className="grid gap-3">
                   {["Code Logic", "Problem Solving", "Optimization", "Edge Cases", "Coding Style"].map((audit, i) => (
                     <div key={i} className="p-5 glass rounded-2xl border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent"><Sparkles className="w-4 h-4" /></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{audit}</span>
                       </div>
                       <Badge variant="outline" className="text-[8px] border-white/10 text-white/20">Awaiting AI</Badge>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Final Action Node */}
              <div className="pt-8">
                {isPassed ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 text-green-400 p-5 glass rounded-[2rem] border-green-500/20 bg-green-500/5 shadow-[0_0_40px_rgba(74,222,128,0.1)]">
                       <ShieldCheck className="w-6 h-6 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">🟢 Coding Round Passed</span>
                    </div>
                    <Button 
                      onClick={() => router.push('/dashboard')}
                      className="w-full h-20 btn-premium rounded-[2rem] text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(147,51,234,0.3)] group"
                    >
                      Return to Dashboard <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 text-red-400 p-5 glass rounded-[2rem] border-red-500/20 bg-red-500/5">
                       <XCircle className="w-6 h-6" />
                       <span className="text-[10px] font-black uppercase tracking-widest">🔴 Coding Round Failed</span>
                    </div>
                    <Button 
                      onClick={() => router.push('/interview/coding')}
                      className="w-full h-20 glass border-white/10 hover:bg-white/5 rounded-[2rem] text-lg font-black uppercase tracking-[0.3em]"
                    >
                      <RotateCcw className="mr-4 w-6 h-6" /> Retry Coding Round
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
