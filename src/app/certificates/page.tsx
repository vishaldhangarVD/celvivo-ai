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
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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
 * @fileOverview Nexvoro AI Achievement Vault.
 * Unified result tracking for Standard Arena and Special HR sessions.
 * Implements strict score-gating (70%) for verified credentials.
 */

const MASTERY_THRESHOLD = 70;

export default function CertificatesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Unified data sources
  const standardInterviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const specialHRQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'specialHRInterviews'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: standardData, loading: standardLoading } = useCollection(standardInterviewsQuery);
  const { data: specialData, loading: specialLoading } = useCollection(specialHRQuery);

  const allSessions = useMemo(() => {
    const combined = [
      ...(standardData || []).map(s => ({ ...s, stream: 'standard' })),
      ...(specialData || []).map(s => ({ ...s, stream: 'special', role: s.role || 'Special HR Interview' }))
    ];
    return combined.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [standardData, specialData]);

  const certifiedSessions = useMemo(() => 
    allSessions.filter((s: any) => (s.overallScore || 0) >= MASTERY_THRESHOLD), 
  [allSessions]);

  const bestCertified = useMemo(() => {
    if (certifiedSessions.length === 0) return null;
    return [...certifiedSessions].sort((a: any, b: any) => (b.overallScore || 0) - (a.overallScore || 0))[0];
  }, [certifiedSessions]);

  const radarData = useMemo(() => {
    if (!bestCertified?.feedback?.virtualInterviewResult) return [];
    const res = bestCertified.feedback.virtualInterviewResult;
    return [
      { subject: 'Technical', A: res.technicalKnowledge || 0 },
      { subject: 'Communication', A: res.communication || 0 },
      { subject: 'Problem Solving', A: res.problemSolving || 0 },
      { subject: 'Confidence', A: res.confidence || 0 },
      { subject: 'HR Readiness', A: res.hrSkills || 0 },
    ];
  }, [bestCertified]);

  const handleDownload = (cert: any) => {
    if (!user || !cert) return;
    try {
      generateCertificatePDF({
        userName: user.displayName || user.email?.split('@')[0] || 'Elite Candidate',
        role: cert.role,
        score: cert.overallScore,
        date: cert.createdAt?.seconds 
          ? new Date(cert.createdAt.seconds * 1000).toLocaleDateString() 
          : new Date().toLocaleDateString(),
        certId: cert.id || 'NEX-' + Math.random().toString(36).substring(7).toUpperCase(),
        metrics: cert.feedback?.virtualInterviewResult
      });
      toast({ title: "Credential Exported", description: "Your high-fidelity PDF is ready." });
    } catch (e) {
      toast({ variant: "destructive", title: "Synthesis Error" });
    }
  };

  const handleShareToLinkedIn = (cert: any) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://nexvoroai.com')}`;
    window.open(url, '_blank');
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Achievement Vault</Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium">Career <span className="text-gradient-purple">Credentials.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                Verified interview mastery records, issued directly from high-fidelity simulations.
              </p>
            </motion.div>
          </header>

          {standardLoading || specialLoading ? (
            <div className="py-20 flex flex-col items-center gap-6">
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Syncing Intelligence Nodes...</p>
            </div>
          ) : bestCertified ? (
            <div className="space-y-24">
              
              {/* PRIMARY VERIFIED CREDENTIAL */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Verified Mastery Node</h3>
                  <Badge className="bg-green-500/20 text-green-400 border-none font-bold text-[10px] tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> AUTHENTICATED
                  </Badge>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="premium-card bg-[#0b0e1a]/80 border-white/10 p-12 min-h-[500px] flex flex-col md:flex-row gap-12 relative overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)]">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                      <Fingerprint className="w-64 h-64 text-white" />
                    </div>

                    <div className="flex-1 space-y-12 relative z-10">
                      <div className="flex items-center gap-4">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                          <span className="text-[10px] font-bold text-accent tracking-widest uppercase">Elite Performer</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-5xl font-bold tracking-tighter">Nexvoro Mastery</h2>
                        <p className="text-accent font-mono text-sm uppercase tracking-widest">{bestCertified.role} Specialization</p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Candidate</p>
                          <p className="text-lg font-bold text-white/90">{user?.displayName || 'Operator'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Efficiency Rating</p>
                          <p className="text-lg font-bold text-accent tabular-nums">{bestCertified.overallScore}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Issue Node</p>
                          <p className="text-lg font-bold text-white/90">
                            {bestCertified.createdAt?.seconds ? new Date(bestCertified.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Credential ID</p>
                          <p className="text-sm font-mono text-white/40 uppercase">{bestCertified.id?.substring(0, 16)}</p>
                        </div>
                      </div>

                      <div className="pt-8 flex flex-wrap gap-4">
                        <Button onClick={() => handleDownload(bestCertified)} className="h-16 px-12 btn-premium text-[10px] font-black uppercase tracking-widest shadow-2xl group">
                          <Download className="w-5 h-5 mr-3 transition-transform group-hover:-translate-y-1" /> Download Master PDF
                        </Button>
                        <Button onClick={() => handleShareToLinkedIn(bestCertified)} variant="outline" className="h-16 px-8 glass border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 flex gap-3">
                          <Linkedin className="w-5 h-5 text-[#0077b5]" /> Add to LinkedIn
                        </Button>
                      </div>
                    </div>

                    <div className="md:w-[320px] flex flex-col items-center justify-center p-8 glass rounded-[2.5rem] border-white/5 bg-white/[0.01]">
                      <div className="text-center mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-2">Neural Mapping</h3>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Audit Analytics</p>
                      </div>
                      <div className="w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Candidate" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </section>

              {/* RECENT SESSION HISTORY */}
              <section className="space-y-10">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-xl font-bold flex items-center gap-3">
                     <History className="w-6 h-6 text-accent" /> Intelligence Archive
                   </h3>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{allSessions.length} Nodes Captured</span>
                </div>
                
                <div className="grid gap-4">
                  {allSessions.map((session: any, i) => {
                    const isCertified = (session.overallScore || 0) >= MASTERY_THRESHOLD;
                    return (
                      <motion.div key={session.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: (i % 10) * 0.05 }}>
                        <Card className="glass px-8 py-6 rounded-2xl border-white/5 hover:border-accent/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                          <div className="flex items-center gap-8 w-full md:w-auto">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                              isCertified ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-white/30"
                            )}>
                              {isCertified ? <Award className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                            </div>
                            <div>
                               <h4 className="font-bold text-lg text-white group-hover:text-accent transition-colors">{session.role}</h4>
                               <div className="flex gap-4 items-center mt-1">
                                  <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> {session.stream === 'special' ? 'D-ID Arena' : session.round || 'Arena'}
                                  </span>
                               </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Score Index</p>
                              <p className={cn("text-xl font-black tabular-nums", isCertified ? "text-accent" : "text-white/40")}>{session.overallScore || 0}%</p>
                            </div>
                            <Badge className={cn(
                              "px-4 py-1 border-none text-[8px] font-black uppercase tracking-widest",
                              isCertified ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"
                            )}>
                              {isCertified ? "Certified" : "Practice Attempt"}
                            </Badge>
                            <Link href={session.stream === 'special' ? `/special-hr-interview/result?sessionId=${session.id}` : `/feedback/${session.id}`}>
                              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

            </div>
          ) : (
            <div className="py-40 text-center glass rounded-[4rem] border-white/5 border-dashed bg-white/[0.01] max-w-4xl mx-auto space-y-8 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mx-auto relative overflow-hidden group">
                <Award className="w-10 h-10 text-white/10 group-hover:text-accent/40 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold tracking-tighter">Vault Protocol Empty</h3>
                <p className="text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
                  Achieve an efficiency score of 70% or higher in any simulation to synchronize your first verified mastery credential.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link href="/interview/setup">
                  <Button className="btn-premium h-16 px-12 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">
                    Technical Track <Zap className="ml-2 w-4 h-4 fill-current" />
                  </Button>
                </Link>
                <Link href="/special-hr-resume-upload">
                  <Button variant="outline" className="h-16 px-12 glass border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                    Special HR Arena <Sparkles className="ml-2 w-4 h-4 text-purple-400" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-6 mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em]">Vault Engine v5.2.0 &middot; {new Date().getFullYear()}</p>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-accent" />
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Authenticated Nodes</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
