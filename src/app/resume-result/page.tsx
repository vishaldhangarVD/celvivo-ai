"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Cpu, 
  ChevronRight,
  Loader2,
  FileText,
  Target
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { cn } from '@/lib/utils';

export default function ResumeResultPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading } = useDoc(journeyRef);

  const handleProceed = async () => {
    if (!journeyRef) return;
    
    await updateDoc(journeyRef, {
      currentStage: INTERVIEW_STAGES.APTITUDE,
      step: 4,
      updatedAt: serverTimestamp(),
    });

    router.push(STAGE_ROUTES.APTITUDE);
  };

  if (loading) return <div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  const analysis = journey?.resumeAnalysis;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Stage 03: Result</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">Neural Analysis <br /><span className="text-gradient-purple">Report.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-xl">Calibration of your professional dossier against {journey?.role} benchmarks.</p>
            </div>
            <div className="flex flex-col items-end gap-4">
               <div className="text-8xl font-black text-accent tabular-nums">{analysis?.atsScore || 0}%</div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">ATS Compatibility Index</p>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/20 p-10 text-center space-y-8">
                <div className="w-20 h-20 rounded-[2.5rem] bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  <ShieldCheck className="w-10 h-10 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">Dossier Verified</h3>
                  <p className="text-xs text-muted-foreground font-light">Your professional nodes have been successfully mapped to the simulation arena.</p>
                </div>
                <Button onClick={handleProceed} className="w-full h-18 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl group">
                  Enter Aptitude Round <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Card>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Capability Matrix</h3>
                 {[
                   { label: "Technical Skills", val: analysis?.technicalSkillsScore, color: "text-blue-400" },
                   { label: "Readiness Index", val: analysis?.interviewReadinessScore, color: "text-purple-400" },
                   { label: "Keyword Density", val: analysis?.keywordOptimizationScore, color: "text-accent" }
                 ].map((stat, i) => (
                   <Card key={i} className="glass p-6 rounded-2xl border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{stat.label}</span>
                      <span className={cn("text-xl font-bold tabular-nums", stat.color)}>{stat.val}%</span>
                   </Card>
                 ))}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <Card className="glass rounded-[30px] border-white/5 p-10 bg-white/[0.01] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="w-48 h-48 text-accent" /></div>
                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-6 flex items-center gap-3">
                  <Cpu className="w-5 h-5" /> Executive Summary
                </h3>
                <p className="text-xl font-light leading-relaxed text-white/90 italic">"{analysis?.summary}"</p>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass p-8 rounded-[2.5rem] border-green-500/10 bg-green-500/[0.01] space-y-6">
                   <h3 className="text-green-400 text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                     <CheckCircle2 className="w-6 h-6" /> Strategic Strengths
                   </h3>
                   <div className="space-y-4">
                     {analysis?.strengths?.map((s: string, i: number) => (
                       <div key={i} className="flex gap-4 text-sm font-light text-white/70">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /> {s}
                       </div>
                     ))}
                   </div>
                </Card>

                <Card className="glass p-8 rounded-[2.5rem] border-red-500/10 bg-red-500/[0.01] space-y-6">
                   <h3 className="text-red-400 text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                     <XCircle className="w-6 h-6" /> Critical Gap Alerts
                   </h3>
                   <div className="space-y-4">
                     {analysis?.weaknesses?.map((w: string, i: number) => (
                       <div key={i} className="flex gap-4 text-sm font-light text-white/70">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /> {w}
                       </div>
                     ))}
                   </div>
                </Card>
              </div>

              <Card className="glass p-10 rounded-[30px] border-white/5 bg-white/[0.01]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-8 flex items-center gap-3">
                   <Target className="w-4 h-4 text-accent" /> Role Match Calibration
                </h3>
                <div className="space-y-8">
                  {analysis?.roleMatches?.map((match: any, i: number) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{match.role}</span>
                        <span className="text-sm font-black text-accent">{match.matchPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${match.matchPercentage}%` }} className="h-full bg-accent shadow-[0_0_10px_#22d3ee]" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
