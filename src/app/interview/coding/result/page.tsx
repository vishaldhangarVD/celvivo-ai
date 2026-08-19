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
  Loader2
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

  // Result Data - Derived from the actual completed session report
  const result = useMemo(() => {
    if (!journey || !journey.codingReport) return null;
    return journey.codingReport;
  }, [journey]);

  const isPassed = (result?.score || 0) >= 60;

  if (journeyLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#050816]">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (!result) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050816] text-center p-8 space-y-6">
      <AlertTriangle className="w-16 h-16 text-orange-400" />
      <h2 className="text-2xl font-bold text-white">Dossier Processing</h2>
      <p className="text-muted-foreground max-w-xs mx-auto">The neural auditor is still calculating your performance index. Please wait a moment.</p>
      <Button onClick={() => window.location.reload()} className="btn-premium px-8">Refresh Protocol</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-y-auto custom-scrollbar">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header Section */}
          <header className="text-center space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Audit Node 05</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Coding Round <span className="text-gradient-purple">Result.</span></h1>
            <p className="text-xl text-muted-foreground font-light">Your technical implementation has been analyzed by the neural syntax auditor.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Questions", val: `${result?.totalQuestions || 10}`, icon: Layers, color: "text-blue-400" },
              { label: "Correct Nodes", val: `0${result?.passedQuestions || 0}`, icon: CheckCircle2, color: "text-green-400" },
              { label: "Failed Probes", val: `0${result?.failedQuestions || 0}`, icon: XCircle, color: "text-red-400" },
              { label: "Execution Status", val: "Success", icon: Activity, color: "text-accent" },
              { label: "Code Integrity", val: result?.score >= 80 ? "Optimal" : "Standard", icon: Cpu, color: "text-purple-400" },
              { label: "Master Score", val: `${result?.score}%`, icon: Trophy, color: "text-yellow-400" }
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

          {/* Final Action Node */}
          <div className="flex justify-center pt-8">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="h-16 px-12 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group"
            >
              RETURN TO COMMAND CENTER <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </main>

      <NavigationControls onHome={() => router.push('/')} />
    </div>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  );
}
