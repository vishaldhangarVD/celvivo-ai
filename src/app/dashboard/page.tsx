"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Zap, 
  Activity, 
  Trophy,
  History,
  ArrowRight,
  Loader2,
  ChevronRight,
  MessageSquare,
  Flame,
  Award,
  Sparkles,
  LayoutGrid,
  Mic,
  Brain,
  Map,
  FileEdit,
  ShieldCheck,
  AlertCircle,
  Clock,
  Wifi
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, limit } from 'firebase/firestore';
import { runGeminiTest } from '@/ai/flows/test-gemini';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  // Test Gemini State
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<any>(null);
  const [testStep, setTestStep] = useState(0);

  // Fetch User Profile for Streaks
  const userProfileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);

  // Personalized Greeting Logic
  const formattedName = useMemo(() => {
    if (!user) return 'User';
    const name = user.displayName || user.email?.split('@')[0] || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  // High-Fidelity Data Queries
  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const appsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'job_applications'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const lettersQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'cover_letters'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
  }, [db, user?.uid]);

  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);
  const { data: applications, loading: appsLoading } = useCollection(appsQuery);
  const { data: letters, loading: lettersLoading } = useCollection(lettersQuery);

  useEffect(() => {
    if (!user && !authLoading) router.push('/login');
  }, [user, authLoading, router]);

  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setTestResult(null);
    setTestError(null);
    setTestStep(0);

    // Staggered loading messages
    const steps = ["Connecting to Gemini...", "Authenticating API...", "Waiting for AI Response..."];
    for (let i = 0; i < steps.length; i++) {
      setTestStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const result = await runGeminiTest();
      if (result.success) {
        setTestResult(result);
      } else {
        setTestError(result);
      }
    } catch (e: any) {
      setTestError({
        status: 'CLIENT_ERROR',
        error: e.message || 'An unexpected client error occurred.'
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  // Strategic Metrics Calculation
  const stats = useMemo(() => {
    const total = interviews?.length || 0;
    const scores = interviews?.map((i: any) => i.overallScore || 0) || [];
    const avg = total > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;
    const best = total > 0 ? Math.max(...scores) : 0;
    
    // Certificates Earned (Score >= 70)
    const certsEarned = interviews?.filter((i: any) => i.overallScore >= 70).length || 0;

    const confScores = interviews?.map((i: any) => i.feedback?.confidenceScore || 0).filter(s => s > 0) || [];
    const commScores = interviews?.map((i: any) => i.feedback?.communicationScore || 0).filter(s => s > 0) || [];
    const techScores = interviews?.map((i: any) => i.feedback?.technicalKnowledgeScore || 0).filter(s => s > 0) || [];

    const avgConf = confScores.length > 0 ? Math.round(confScores.reduce((a, b) => a + b, 0) / confScores.length) : 0;
    const avgComm = commScores.length > 0 ? Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length) : 0;
    const avgTech = techScores.length > 0 ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : 0;

    // Job Tracker Stats
    const totalApps = applications?.length || 0;
    const selected = applications?.filter((a: any) => a.status === 'Selected').length || 0;
    const successRate = totalApps > 0 ? Math.round((selected / totalApps) * 100) : 0;

    return {
      total,
      avg: `${avg}%`,
      best: `${best}%`,
      certsEarned,
      confidence: `${avgConf}%`,
      communication: `${avgComm}%`,
      technical: `${avgTech}%`,
      tracker: {
        total: totalApps,
        successRate: `${successRate}%`
      }
    };
  }, [interviews, applications]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Mission Briefing</Badge>
                <Button 
                  onClick={handleTestGemini}
                  className="h-8 px-4 rounded-full bg-gradient-to-r from-red-600 to-red-400 text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all animate-pulse-glow"
                >
                  🔴 Test Gemini Connection
                </Button>
              </div>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">Welcome back, {formattedName}</h1>
              <p className="text-muted-foreground font-light mt-2">Neural synchronization complete. Your career metrics are live.</p>
            </div>
            <div className="flex gap-4">
              <FeedbackDialog />
              <Link href="/job-tracker">
                <Button variant="outline" className="h-14 px-8 glass border-white/10 flex gap-3 text-[10px] tracking-widest uppercase">
                  <LayoutGrid className="w-4 h-4" />
                  Mission Tracker
                </Button>
              </Link>
              <Link href="/daily-challenge">
                <Button className="h-14 px-8 btn-premium flex gap-3">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Daily Challenge
                </Button>
              </Link>
            </div>
          </motion.header>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: "Interviews", val: stats.total, icon: History, color: "text-blue-400" },
              { label: "Avg Score", val: stats.avg, icon: Activity, color: "text-accent" },
              { label: "Best Score", val: stats.best, icon: Trophy, color: "text-yellow-400" },
              { label: "Certs Earned", val: stats.certsEarned, icon: Award, color: "text-orange-300" },
              { label: "Confidence", val: stats.confidence, icon: Zap, color: "text-purple-400" },
              { label: "Communication", val: stats.communication, icon: MessageSquare, color: "text-green-400" },
              { label: "Technical", val: stats.technical, icon: Brain, color: "text-orange-400" }
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
                <div className="text-2xl font-bold mb-1 tabular-nums">{stat.val}</div>
                <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-orange-500/5 border-orange-500/20 p-8">
                <CardHeader className="p-0 mb-6 flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-3 text-orange-400">
                    <Flame className="w-5 h-5" /> Neural Streak
                  </CardTitle>
                  <Badge className="bg-orange-500/20 text-orange-400 border-none font-bold text-[10px]">ACTIVE</Badge>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold tabular-nums">{profile?.currentStreak || 0}</div>
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30">Current Streak</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold tabular-nums text-white/60">{profile?.bestStreak || 0}</div>
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30">Best Streak</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { days: 7, icon: Award, label: "Bronze" },
                      { days: 30, icon: Sparkles, label: "Silver" },
                      { days: 100, icon: Trophy, label: "Gold" }
                    ].map((badge, i) => (
                      <div key={i} className={`p-4 glass rounded-2xl flex flex-col items-center gap-2 border-white/5 ${(profile?.currentStreak || 0) >= badge.days ? 'bg-orange-500/10 border-orange-500/20' : 'opacity-20'}`}>
                        <badge.icon className={`w-4 h-4 ${(profile?.currentStreak || 0) >= badge.days ? 'text-orange-400' : 'text-white'}`} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">{badge.label}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/daily-challenge">
                    <Button className="w-full h-14 btn-premium bg-gradient-to-r from-orange-600 to-red-600 group">
                      Take Today's Challenge
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 ml-2">AI Career Tools</h3>
                <div className="grid gap-4">
                  {[
                    { title: "Start AI Interview", icon: Mic, color: "text-accent", href: "/interview?action=resume" },
                    { title: "Certificates", icon: Award, color: "text-orange-300", href: "/certificates" },
                    { title: "Skill Gap Analysis", icon: Brain, color: "text-yellow-400", href: "/skill-gap" },
                    { title: "Career Roadmap", icon: Map, color: "text-blue-400", href: "/roadmap" },
                    { title: "Cover Letter Architect", icon: FileEdit, color: "text-green-400", href: "/cover-letter" }
                  ].map((action, i) => (
                    <Link href={action.href} key={i}>
                      <div className="p-5 glass rounded-2xl border-white/5 group hover:bg-white/[0.05] transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${action.color} transition-all group-hover:scale-110 group-hover:bg-white/10`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold">{action.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Zap className="w-5 h-5 text-accent" /> Recent Interviews
                  </CardTitle>
                  {interviews && interviews.length > 0 && (
                    <Link href="/user-dashboard">
                      <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-accent hover:text-accent/80">View History</Button>
                    </Link>
                  )}
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {interviewsLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
                  ) : interviews && interviews.length > 0 ? (
                    interviews.slice(0, 3).map((session: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 group hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Mic className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{session.role}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-accent/20 text-accent border-none font-bold tabular-nums">{session.overallScore}%</Badge>
                          <Link href={`/feedback/${session.id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg group-hover:text-accent transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center glass rounded-3xl border-white/5 border-dashed">
                      <History className="w-12 h-12 text-white/5 mx-auto mb-6" />
                      <h3 className="text-xl font-bold mb-2">No interviews yet</h3>
                      <p className="text-muted-foreground font-light text-sm mb-8">Initialize your first simulation to start tracking performance metrics.</p>
                      <Link href="/interview?action=start">
                        <Button className="btn-premium px-8">Start Your First Interview</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>

      {/* DEV DIAGNOSTIC DIALOGS */}
      <Dialog open={isTestingGemini} onOpenChange={() => {}}>
        <DialogContent className="glass border-white/10 bg-[#0b0e1a] text-white max-w-sm rounded-[2rem] p-12 text-center outline-none">
          <DialogHeader>
            <DialogTitle>Gemini Connection Test</DialogTitle>
            <DialogDescription>
              Testing Gemini API connection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
              <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin duration-[3s]" />
              <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-accent animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Neural Diagnostic</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
                {["Connecting to Gemini...", "Authenticating API...", "Waiting for AI Response..."][testStep]}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!testResult} onOpenChange={() => setTestResult(null)}>
        <DialogContent className="glass border-green-500/20 bg-[#0b0e1a] text-white max-w-md rounded-[2.5rem] p-10 outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Gemini Connection Success</DialogTitle>
            <DialogDescription>Successfully established neural link with Gemini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Gemini Connected</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-400/60">Neural Link Verified</p>
              </div>
            </div>

            <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.01] space-y-4">
              <p className="text-lg font-light italic text-white/90">"{testResult?.data}"</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Model</p>
                  <p className="text-[10px] font-bold text-accent">{testResult?.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Latency</p>
                  <p className="text-[10px] font-bold text-accent">{testResult?.latency}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Status</p>
                  <p className="text-[10px] font-bold text-green-400 flex items-center gap-1"><Wifi className="w-3 h-3" /> ONLINE</p>
                </div>
              </div>
            </div>

            <Button onClick={() => setTestResult(null)} className="w-full h-14 btn-premium rounded-xl uppercase text-[10px] font-black tracking-widest">Acknowledge</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!testError} onOpenChange={() => setTestError(null)}>
        <DialogContent className="glass border-red-500/20 bg-[#0b0e1a] text-white max-w-md rounded-[2.5rem] p-10 outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Gemini Connection Failed</DialogTitle>
            <DialogDescription>System node failed to establish neural bridge.</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Connection Failed</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400/60">Neural Protocol Error</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 glass rounded-2xl border-white/5 bg-red-500/[0.02] space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                   <span>Error Code</span>
                   <span className="text-red-400">{testError?.status}</span>
                 </div>
                 <p className="text-xs font-light text-white/60 leading-relaxed">{testError?.error}</p>
              </div>

              <div className="p-5 glass rounded-2xl border-white/5 space-y-2">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-accent">Suggested Resolution</p>
                 <p className="text-xs font-medium text-white/80">
                   {testError?.status === '429' ? "Wait 60s for quota recovery or check billing usage." : 
                    testError?.status === '401' ? "Verify GOOGLE_GENAI_API_KEY in environment configuration." :
                    testError?.status === '403' ? "Ensure Generative AI API is enabled in Google Cloud Console." :
                    "Check server logs and network connectivity protocols."}
                 </p>
              </div>
            </div>

            <Button onClick={() => setTestError(null)} variant="outline" className="w-full h-14 glass border-white/10 rounded-xl uppercase text-[10px] font-black tracking-widest">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
