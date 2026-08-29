'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Share2, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  Trophy,
  History,
  Target,
  Zap,
  Star,
  Cpu,
  Activity,
  User,
  Calendar,
  Fingerprint,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import Link from 'next/link';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

/**
 * @fileOverview Nexvoro AI AI Achievement Vault / Certificate System.
 * Fully dynamic: ZERO hardcoded scores or user data. 
 * Fetches real performance metrics and interview history from Firestore.
 */

export default function CertificatesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Load all completed interview sessions for this specific user
  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);

  // Determine the 'Master Credential' (highest scoring session)
  const bestInterview = useMemo(() => {
    if (!interviews || interviews.length === 0) return null;
    return [...interviews].sort((a: any, b: any) => (b.overallScore || 0) - (a.overallScore || 0))[0];
  }, [interviews]);

  // Aggregate stats from REAL session data
  const aggregateStats = useMemo(() => {
    if (!interviews || interviews.length === 0) return null;
    const scores = interviews.map((i: any) => i.overallScore || 0);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / interviews.length);
    return {
      totalSessions: interviews.length,
      avgScore: avg,
      bestScore: Math.max(...scores)
    };
  }, [interviews]);

  // Map real performance vectors from the highest achieved session
  const radarData = useMemo(() => {
    if (!bestInterview?.feedback?.virtualInterviewResult) return [];
    const res = bestInterview.feedback.virtualInterviewResult;
    return [
      { subject: 'Technical', A: res.technicalKnowledge || 0, fullMark: 100 },
      { subject: 'Communication', A: res.communication || 0, fullMark: 100 },
      { subject: 'Problem Solving', A: res.problemSolving || 0, fullMark: 100 },
      { subject: 'Confidence', A: res.confidence || 0, fullMark: 100 },
      { subject: 'HR Readiness', A: res.hrSkills || 0, fullMark: 100 },
    ];
  }, [bestInterview]);

  const handleDownload = (cert: any) => {
    if (!user || !cert) return;
    try {
      generateCertificatePDF({
        userName: user.displayName || user.email?.split('@')[0] || 'Elite Candidate',
        role: cert.role || 'Not Available',
        score: cert.overallScore || 0,
        date: cert.createdAt?.seconds 
          ? new Date(cert.createdAt.seconds * 1000).toLocaleDateString() 
          : new Date().toLocaleDateString()
      });
      toast({
        title: "Credential Exported",
        description: "Your mastery certificate has been generated and downloaded.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "System encountered an error during PDF synthesis.",
      });
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-20">
          
          <header className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 blur-[100px] opacity-50 -z-10 animate-pulse" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">AI Achievement Vault</Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium">Career <span className="text-gradient-purple">Credentials.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                Your verified interview achievements, credentials, and career performance synced directly from simulation nodes.
              </p>
            </motion.div>
          </header>

          {interviewsLoading ? (
            <div className="py-20 flex flex-col items-center gap-6">
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Querying Neural Archives...</p>
            </div>
          ) : bestInterview ? (
            <div className="space-y-24">
              
              {/* LARGE VERIFIED CREDENTIAL CARD */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Verified Interview Credential</h3>
                  <Badge className="bg-green-500/20 text-green-400 border-none font-bold text-[10px] tracking-widest">✓ AUTHENTICATED</Badge>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-purple-600/30 rounded-[3rem] blur opacity-20 transition duration-1000"></div>
                  <Card className="premium-card bg-[#0b0e1a]/80 border-white/10 p-12 min-h-[500px] flex flex-col md:flex-row gap-12 relative overflow-hidden">
                    {/* Background Visual Identifiers */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                      <Fingerprint className="w-64 h-64 text-white" />
                    </div>

                    <div className="flex-1 space-y-12 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <Trophy className="w-8 h-8 text-yellow-500" />
                          <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                            <span className="text-[10px] font-bold text-accent tracking-widest">VERIFIED ACHIEVER</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-5xl font-bold tracking-tighter">Nexvoro AI Achievement</h2>
                        <p className="text-accent font-mono text-sm uppercase tracking-widest">{bestInterview.role || 'Not Available'} Performance Mastery</p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Candidate Identity</p>
                          <p className="text-lg font-bold text-white/90">{user?.displayName || 'Dossier Missing'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Overall AI Score</p>
                          <p className="text-lg font-bold text-accent tabular-nums">{bestInterview.overallScore || 'Analysis Pending'}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Completion Node</p>
                          <p className="text-lg font-bold text-white/90">
                            {bestInterview.createdAt?.seconds ? new Date(bestInterview.createdAt.seconds * 1000).toLocaleDateString() : 'Analysis Pending'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Persistent Certificate ID</p>
                          <p className="text-sm font-mono text-white/40 uppercase">{bestInterview.id || 'Handshake Failure'}</p>
                        </div>
                      </div>

                      <div className="pt-12 flex flex-wrap gap-4">
                        <Button onClick={() => handleDownload(bestInterview)} className="h-16 px-12 btn-premium text-[10px] font-black uppercase tracking-widest shadow-2xl">
                          <Download className="w-5 h-5 mr-3" /> Download Certificate PDF
                        </Button>
                        <Button variant="outline" className="h-16 px-8 glass border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5">
                          <Share2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Performance Breakdown Widget */}
                    <div className="md:w-[320px] flex flex-col items-center justify-center p-8 glass rounded-[2.5rem] border-white/5 bg-white/[0.01]">
                      <div className="text-center mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-2">Neural Analysis</h3>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Multi-Dimensional Mapping</p>
                      </div>
                      <div className="w-full h-[220px] mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                              name="Candidate"
                              dataKey="A"
                              stroke="hsl(var(--accent))"
                              fill="hsl(var(--accent))"
                              fillOpacity={0.2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full border-t border-white/5 pt-6">
                        <div className="text-center">
                          <p className="text-[7px] font-bold uppercase text-white/20 mb-1">Communication</p>
                          <p className="text-xs font-bold text-white/70">{bestInterview.feedback?.virtualInterviewResult?.communication || '--'}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[7px] font-bold uppercase text-white/20 mb-1">Confidence</p>
                          <p className="text-xs font-bold text-white/70">{bestInterview.feedback?.virtualInterviewResult?.confidence || '--'}%</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </section>

              {/* PERFORMANCE SNAPSHOT */}
              <section className="space-y-10">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Performance Snapshot</h3>
                  <Badge variant="outline" className="border-white/10 text-white/20 text-[8px] uppercase">Dossier aggregate</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Technical Skills", key: "technicalKnowledge", color: "text-blue-400" },
                    { label: "Communication", key: "communication", color: "text-green-400" },
                    { label: "Problem Solving", key: "problemSolving", color: "text-purple-400" },
                    { label: "Confidence", key: "confidence", color: "text-yellow-400" },
                    { label: "HR Readiness", key: "hrSkills", color: "text-orange-400" }
                  ].map((m, i) => {
                    const score = bestInterview.feedback?.virtualInterviewResult?.[m.key];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="glass p-6 rounded-3xl border-white/5 bg-white/[0.01] flex flex-col items-center text-center space-y-4">
                          <div className={cn("text-2xl font-black tabular-nums", score ? m.color : "text-white/10")}>
                            {score ? `${score}%` : '---'}
                          </div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">{m.label}</p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* INTERVIEW HISTORY LOG */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-xl font-bold flex items-center gap-3">
                     <History className="w-5 h-5 text-accent" /> Completed Sessions
                   </h3>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{aggregateStats?.totalSessions || 0} Intelligence Nodes Captured</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {interviews.map((session: any, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 10) * 0.03 }}
                    >
                      <Card className="glass p-8 rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all group relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-accent transition-colors">
                              <Activity className="w-5 h-5" />
                            </div>
                            <Badge className="bg-accent/10 text-accent border-accent/20 tabular-nums font-black">{session.overallScore || '---'}%</Badge>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg leading-tight group-hover:text-white transition-colors">{session.role || 'Not Available'}</h4>
                            <p className="text-[9px] uppercase tracking-widest text-white/20 flex items-center gap-2">
                              <Calendar className="w-3 h-3" /> 
                              {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Handshake Pending'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                           <div className="space-y-1">
                              <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Protocol</p>
                              <p className="text-[10px] font-bold text-white/60">{session.round || 'N/A'}</p>
                           </div>
                           <Link href={`/feedback/${session.id}`}>
                             <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent">
                               <ExternalLink className="w-4 h-4" />
                             </Button>
                           </Link>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>

            </div>
          ) : (
            <div className="py-40 text-center glass rounded-[4rem] border-white/5 border-dashed bg-white/[0.01] max-w-4xl mx-auto space-y-8">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mx-auto relative overflow-hidden">
                <Award className="w-10 h-10 text-white/10" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold tracking-tighter">Achievement Vault Empty</h3>
                <p className="text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
                  The neural archive contains no verified interview nodes for this identification token. Complete a full simulation to unlock your first credential.
                </p>
              </div>
              <Link href="/interview" className="block pt-4">
                <Button className="btn-premium h-16 px-12 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)]">
                  Launch Neural Simulation <Zap className="ml-2 w-4 h-4 fill-current" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER SYSTEM DIAGNOSTIC */}
      <footer className="container mx-auto px-6 mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Nexvoro AI Credential Engine v5.0.2</p>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-accent" />
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Encrypted Dossier</span>
           </div>
           <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-purple-400" />
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Real-time Node Sync</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
