"use client";

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Activity, 
  FileText, 
  Trophy,
  History,
  ArrowRight,
  Loader2,
  ChevronRight,
  MessageSquare,
  Target,
  Flame,
  Award,
  Sparkles,
  LayoutGrid,
  TrendingUp,
  Clock,
  Command,
  FileBadge,
  Mic,
  Brain,
  Map,
  FileEdit
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, limit } from 'firebase/firestore';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

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

  const resumesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'resumes'),
      orderBy('createdAt', 'desc'),
      limit(5)
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
  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);
  const { data: applications, loading: appsLoading } = useCollection(appsQuery);
  const { data: letters, loading: lettersLoading } = useCollection(lettersQuery);

  useEffect(() => {
    if (!user && !authLoading) router.push('/login');
  }, [user, authLoading, router]);

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
    const shortlisted = applications?.filter((a: any) => a.status === 'Shortlisted').length || 0;
    const interviewedCount = applications?.filter((a: any) => a.status === 'Interview Scheduled').length || 0;
    const selected = applications?.filter((a: any) => a.status === 'Selected').length || 0;
    const rejected = applications?.filter((a: any) => a.status === 'Rejected').length || 0;
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
        shortlisted,
        interviewed: interviewedCount,
        selected,
        rejected,
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
          
          {/* Dashboard Header */}
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div>
              <Badge className="bg-accent/20 text-accent mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Mission Briefing</Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">Welcome back, {formattedName}</h1>
              <p className="text-muted-foreground font-light mt-2">Neural synchronization complete. Your career metrics are live.</p>
            </div>
            <div className="flex gap-4">
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

          {/* Top Statistics Row */}
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
            <div className="lg:col-span-8 space-y-8">
              {/* Recent Interviews Card */}
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
                    interviews.slice(0, 3).map((session: any, i) => (
                      <div key={i} className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 group hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Target className="w-5 h-5" />
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
                      <Link href="/interview">
                        <Button className="btn-premium px-8">Start Your First Interview</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resume Reports Card */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" /> Resume Intelligence
                  </CardTitle>
                  <Link href="/resume">
                    <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-purple-400 hover:text-purple-300">New Audit</Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {resumesLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
                  ) : resumes && resumes.length > 0 ? (
                    resumes.slice(0, 3).map((resume: any, i) => (
                      <div key={i} className="flex items-center justify-between p-5 glass rounded-2xl border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{resume.filename}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{resume.targetRole}</p>
                          </div>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400 border-none font-bold tabular-nums">ATS: {resume.atsScore}%</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center glass rounded-3xl border-white/5 border-dashed">
                      <FileText className="w-12 h-12 text-white/5 mx-auto mb-6" />
                      <h3 className="text-xl font-bold mb-2">No resumes audited</h3>
                      <p className="text-muted-foreground font-light text-sm mb-8">Upload your career blueprints for high-fidelity ATS calibration.</p>
                      <Link href="/resume">
                        <Button className="btn-premium px-8">Initialize Blueprint Audit</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Cover Letters Card */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <FileBadge className="w-5 h-5 text-green-400" /> Recent Directives
                  </CardTitle>
                  <Link href="/cover-letter">
                    <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-green-400 hover:text-green-300">Generate New</Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {lettersLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-400" /></div>
                  ) : letters && letters.length > 0 ? (
                    letters.map((letter: any, i) => (
                      <div key={i} className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 group hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{letter.companyName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{letter.role}</p>
                          </div>
                        </div>
                        <Link href="/cover-letter">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg group-hover:text-green-400 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center glass rounded-3xl border-white/5 border-dashed">
                      <Sparkles className="w-12 h-12 text-white/5 mx-auto mb-6" />
                      <h3 className="text-xl font-bold mb-2">No cover letters generated</h3>
                      <p className="text-muted-foreground font-light text-sm mb-8">Architect mission-specific cover letters using your resume context.</p>
                      <Link href="/cover-letter">
                        <Button className="btn-premium px-8">Synthesize Cover Letter</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Daily Challenge Highlight */}
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

              {/* AI Career Tools Row in Sidebar Style */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 ml-2">AI Career Tools</h3>
                <div className="grid gap-4">
                  {[
                    { title: "Start Interview", icon: Mic, color: "text-accent", href: "/interview" },
                    { title: "Resume Analyzer", icon: FileText, color: "text-purple-400", href: "/resume" },
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

              {/* Deployment Pulse Section (Job Tracker Summary) */}
              <Card className="premium-card bg-blue-500/5 border-blue-500/20 p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-3 text-blue-400">
                    <LayoutGrid className="w-5 h-5" /> Deployment Pulse
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 glass rounded-2xl border-white/5 text-center">
                      <p className="text-2xl font-bold tabular-nums text-blue-400">{stats.tracker.total}</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Applications</p>
                    </div>
                    <div className="p-4 glass rounded-2xl border-white/5 text-center">
                      <p className="text-2xl font-bold tabular-nums text-green-400">{stats.tracker.successRate}</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                  <Link href="/job-tracker">
                    <Button variant="outline" className="w-full h-12 rounded-xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest text-blue-400">Manage Tracker</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
