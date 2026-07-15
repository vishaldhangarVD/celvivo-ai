
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
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useMemo } from 'react';
import Link from 'next/link';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export default function CertificatesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      orderBy('overallScore', 'desc')
    );
  }, [db, user?.uid]);

  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);

  const bestInterview = useMemo(() => {
    if (!interviews || interviews.length === 0) return null;
    return interviews[0]; // Already sorted by score desc
  }, [interviews]);

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
    if (!user) return;
    try {
      generateCertificatePDF({
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        role: cert.role,
        score: cert.overallScore,
        date: cert.createdAt?.seconds ? new Date(cert.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()
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

  const handleShare = (cert: any) => {
    const text = encodeURIComponent(`I've just achieved a ${cert.overallScore}% Efficiency Rating in my ${cert.role} interview simulation at Nexvoro AI! #AI #TechInterview #CareerGrowth`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://nexvoro.ai')}&summary=${text}`, '_blank');
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-20">
          
          <header className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 blur-[100px] opacity-50 -z-10 animate-pulse" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Credential Vault</Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium">AI Achievement <span className="text-gradient-purple">Vault.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                Every verified interview unlocks a permanent credential stored inside your Nexvoro AI profile.
              </p>
            </motion.div>
          </header>

          {interviewsLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-accent" /></div>
          ) : bestInterview ? (
            <div className="space-y-24">
              {/* Massive Master Identity Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 to-purple-600/50 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <Card className="premium-card bg-[#0b0e1a]/80 border-white/10 p-12 min-h-[600px] flex flex-col md:flex-row gap-12 relative overflow-hidden">
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Fingerprint className="w-64 h-64 text-white" />
                  </div>

                  {/* Identity Section */}
                  <div className="flex-1 space-y-12 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">Verified Credential</span>
                      </div>
                      <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        <span className="text-[10px] font-bold text-accent tracking-widest">AUTHENTICATED</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-5xl font-bold tracking-tighter">Nexvoro AI Interview Credential</h2>
                      <p className="text-accent font-mono text-sm uppercase tracking-widest">{bestInterview.role} Mastery</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Candidate Name</p>
                        <p className="text-lg font-bold text-white/90">{user?.displayName || 'User Entity'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Overall AI Score</p>
                        <p className="text-lg font-bold text-accent tabular-nums">{bestInterview.overallScore}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Completion Date</p>
                        <p className="text-lg font-bold text-white/90">
                          {bestInterview.createdAt?.seconds ? new Date(bestInterview.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Certificate ID</p>
                        <p className="text-sm font-mono text-white/50">{bestInterview.id.substring(0, 16).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="pt-12 flex gap-4">
                      <Button onClick={() => handleDownload(bestInterview)} className="h-16 px-12 btn-premium text-xs font-bold uppercase tracking-widest">
                        <Download className="w-5 h-5 mr-3" /> Export Master PDF
                      </Button>
                      <Button onClick={() => handleShare(bestInterview)} variant="outline" className="h-16 px-8 glass border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5">
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Neural Radar Section */}
                  <div className="md:w-1/3 flex flex-col items-center justify-center space-y-8 p-8 glass rounded-[2.5rem] border-white/5">
                    <div className="text-center">
                      <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-2">Neural Analysis</h3>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest">Multi-round performance vector</p>
                    </div>
                    <div className="w-full h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                            name="Candidate"
                            dataKey="A"
                            stroke="hsl(var(--accent))"
                            fill="hsl(var(--accent))"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="text-center">
                        <p className="text-[8px] font-bold uppercase text-white/20 mb-1">Communication</p>
                        <p className="text-xs font-bold text-white/80">{bestInterview.feedback?.virtualInterviewResult?.communication}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-bold uppercase text-white/20 mb-1">Confidence</p>
                        <p className="text-xs font-bold text-white/80">{bestInterview.feedback?.virtualInterviewResult?.confidence}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Session Archive Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-xl font-bold flex items-center gap-3">
                     <History className="w-5 h-5 text-accent" /> Session Archive
                   </h3>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{interviews.length} Total Sessions</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {interviews.slice(1).map((session: any, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <Card className="glass p-6 rounded-2xl border-white/5 hover:bg-white/[0.03] transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-accent transition-colors">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{session.role}</p>
                            <p className="text-[9px] uppercase tracking-widest text-white/20">
                              {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-bold tabular-nums text-white/70">{session.overallScore}%</p>
                            <p className="text-[8px] uppercase tracking-widest text-white/20">Score</p>
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
              </div>
            </div>
          ) : (
            <div className="py-32 text-center glass rounded-[3rem] border-white/5 border-dashed">
              <Trophy className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">No Credentials Found</h3>
              <p className="text-muted-foreground font-light max-w-sm mx-auto">
                Achieve an Efficiency Rating of 70% or higher in any arena simulation to unlock a verified mastery certificate.
              </p>
              <Link href="/interview" className="mt-8 block">
                <Button className="btn-premium h-14 px-8 uppercase tracking-widest text-xs font-bold">Initialize Session</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
