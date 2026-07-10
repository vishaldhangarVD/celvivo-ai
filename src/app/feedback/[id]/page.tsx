"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BrainCircuit, 
  Zap,
  Map,
  Download,
  Award,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Code2,
  Trophy,
  History,
  Target,
  Activity,
  MessageSquare,
  CircleAlert,
  CircleCheck,
  Lightbulb,
  Cpu,
  RefreshCcw,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function FinalReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const docId = params.id as string;
  const interviewRef = useMemo(() => {
    if (!db || !user?.uid || !docId) return null;
    return doc(db, 'users', user.uid, 'interviews', docId);
  }, [db, user?.uid, docId]);
  
  const { data: interviewDoc, loading: docLoading } = useDoc(interviewRef);
  const feedback = (interviewDoc as any)?.feedback;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-accent";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const handleDownloadReport = () => {
    toast({ title: "Export Protocol Initialized", description: "Your comprehensive performance PDF is being synthesized." });
  };

  if (docLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-8">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          <BrainCircuit className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter text-premium uppercase">Synthesizing Neural Audit...</h2>
          <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px]">Processing Master Dossier v15.2</p>
        </div>
      </div>
    );
  }

  if (!interviewDoc || !feedback) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816]">
        <CircleAlert className="w-16 h-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-white">Master Dossier Not Found</h2>
        <p className="text-muted-foreground mt-2">The simulation vectors for this session could not be retrieved.</p>
        <Link href="/dashboard" className="mt-8">
          <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Return to command</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="premium-card p-12 border-glow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12">
              <Badge className={`${getScoreColor(feedback.overallScore)} border-none bg-white/5 font-black tracking-[0.4em] uppercase text-xs px-8 py-3 rounded-2xl`}>
                STATUS: {feedback.hiringRecommendation.toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-4 text-center lg:text-left space-y-6">
                <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Final Performance Audit</Badge>
                <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">{(interviewDoc as any).role}<br /><span className="text-gradient-purple">Dossier.</span></h1>
                <p className="text-muted-foreground font-light uppercase tracking-widest text-xs">Target: {(interviewDoc as any).company} • {(interviewDoc as any).experienceLevel} Grade</p>
              </div>

              <div className="lg:col-span-8 flex flex-col md:flex-row items-center gap-12 lg:justify-end">
                <div className="text-center">
                  <div className={`text-8xl font-bold tracking-tighter tabular-nums ${getScoreColor(feedback.overallScore)}`}>{feedback.overallScore}%</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold mt-2">Master Performance Index</div>
                </div>
                <div className="hidden md:block w-px h-24 bg-white/10" />
                <div className="text-center">
                  <div className="text-6xl font-bold text-white tabular-nums">{feedback.interviewReadiness}%</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mt-2">Interview Readiness</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="px-0 pt-0 mb-12 flex flex-row items-center justify-between border-b border-white/5 pb-8">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <BrainCircuit className="w-8 h-8 text-accent" /> Virtual Interview Audit
                  </CardTitle>
                  <Badge variant="outline" className="border-accent/30 text-accent">Node 04: Active</Badge>
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
                  {[
                    { label: "Technical Knowledge", score: feedback.virtualInterviewResult.technicalKnowledge, icon: Cpu, color: "text-blue-400" },
                    { label: "Communication", score: feedback.virtualInterviewResult.communication, icon: MessageSquare, color: "text-green-400" },
                    { label: "Operational Presence", score: feedback.virtualInterviewResult.confidence, icon: Zap, color: "text-yellow-400" },
                    { label: "Problem Solving", score: feedback.virtualInterviewResult.problemSolving, icon: Target, color: "text-purple-400" },
                    { label: "Professionalism", score: feedback.virtualInterviewResult.professionalism, icon: ShieldCheck, color: "text-cyan-400" },
                    { label: "Culture Fit", score: feedback.virtualInterviewResult.hrSkills, icon: Award, color: "text-orange-400" }
                  ].map((m, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
                          <m.icon className={`w-4 h-4 ${m.color}`} /> {m.label}
                        </span>
                        <span className="text-xl font-bold tabular-nums">{m.score}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.score}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full bg-current ${m.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass p-8 rounded-[2.5rem] border-accent/10 bg-accent/[0.01] space-y-6">
                  <h3 className="text-accent text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                    <CircleCheck className="w-6 h-6" /> Strategic Strengths
                  </h3>
                  <div className="space-y-4">
                    {feedback.aiFeedback.strongSkills.map((s: string, i: number) => (
                      <div key={i} className="flex gap-4 text-sm font-light text-white/80 leading-relaxed group">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0 group-hover:scale-125 transition-transform" /> {s}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="glass p-8 rounded-[2.5rem] border-red-500/10 bg-red-500/[0.01] space-y-6">
                  <h3 className="text-red-400 text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                    <CircleAlert className="w-6 h-6" /> Critical Delta Gaps
                  </h3>
                  <div className="space-y-4">
                    {feedback.aiFeedback.weakSkills.map((w: string, i: number) => (
                      <div key={i} className="flex gap-4 text-sm font-light text-white/80 leading-relaxed group">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0 group-hover:scale-125 transition-transform" /> {w}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="px-0 pt-0 mb-10">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <Map className="w-8 h-8 text-blue-400" /> Next Learning Protocol
                  </CardTitle>
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Theoretical Nodes</h4>
                    <div className="grid gap-3">
                      {feedback.learningPlan.topicsToStudy.map((t: string, i: number) => (
                        <div key={i} className="p-4 glass rounded-xl border-white/5 text-sm font-light text-white/60 flex items-center gap-4 hover:bg-white/5 transition-all">
                          <div className="w-1 h-1 rounded-full bg-blue-400" /> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Practice Nodes</h4>
                    <div className="grid gap-3">
                      {feedback.learningPlan.codingPractice.map((p: string, i: number) => (
                        <div key={i} className="p-4 glass rounded-xl border-white/5 text-sm font-light text-white/60 flex items-center gap-4 hover:bg-white/5 transition-all">
                          <Code2 className="w-3.5 h-3.5 text-accent" /> {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              
              <Card className="premium-card bg-accent/5 border-accent/20 p-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-[2.5rem] bg-accent/20 flex items-center justify-center mx-auto border border-accent/30 shadow-2xl relative">
                  <Award className="w-10 h-10 text-accent" />
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-accent/30 scale-125" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Credential Export</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-light">Performance verified for elite industry placement benchmarks.</p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={() => generateCertificatePDF({ 
                      userName: user?.displayName || 'Elite Candidate', 
                      role: (interviewDoc as any).role, 
                      score: feedback.overallScore, 
                      date: new Date().toLocaleDateString() 
                    })}
                    className="w-full h-16 rounded-2xl bg-white text-[#050816] font-bold hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
                  >
                    <Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" /> PDF Master Report
                  </Button>
                  <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 text-[10px] font-bold uppercase tracking-[0.3em]">
                    <ShieldCheck className="w-4 h-4 mr-3" /> Verify Blockchain Link
                  </Button>
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><Target className="w-6 h-6 text-red-400" /> Delta Gap Analysis</h3>
                <div className="space-y-4">
                  {feedback.skillGap.missingSkills.map((s: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 glass rounded-xl border-red-500/10 bg-red-500/[0.02]">
                      <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{s}</span>
                      <CircleAlert className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  ))}
                  {feedback.skillGap.missingSkills.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-8">No critical gaps detected.</p>
                  )}
                </div>
                <Link href={`/roadmap/personalized/${docId}`} className="block mt-8">
                   <Button className="w-full h-12 rounded-xl btn-premium text-white text-[10px] font-bold uppercase tracking-widest">Launch Improvement Roadmap</Button>
                </Link>
              </Card>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 ml-2">Session Directives</h3>
                <div className="grid gap-3">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="h-16 rounded-2xl glass border-white/10 hover:bg-white/5 justify-start px-8 gap-4 group"
                  >
                    <LayoutDashboard className="w-5 h-5 text-white/40 group-hover:text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Return to Command</span>
                  </Button>
                  <Button 
                    onClick={() => router.push('/interview')}
                    className="h-16 rounded-2xl glass border-white/10 hover:bg-white/5 justify-start px-8 gap-4 group"
                  >
                    <RefreshCcw className="w-5 h-5 text-white/40 group-hover:text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Retry New Protocol</span>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
