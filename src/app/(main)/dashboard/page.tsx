"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';
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
  ShieldCheck,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

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

  // High-Fidelity Data Queries for BOTH Interview Setups
  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const specialHRQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'specialHRInterviews'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: standardInterviews, loading: interviewsLoading } = useCollection(interviewsQuery);
  const { data: specialHRInterviews, loading: specialLoading } = useCollection(specialHRQuery);

  // Combine both sources into a unified session stream
  const allSessions = useMemo(() => {
    const combined = [
      ...(standardInterviews || []).map(i => ({ ...i, type: 'standard' })),
      ...(specialHRInterviews || []).map(i => ({ 
        ...i, 
        type: 'special',
        role: i.role || 'Special HR Interview',
        overallScore: i.overallScore || 0 
      }))
    ];

    return combined.sort((a: any, b: any) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  }, [standardInterviews, specialHRInterviews]);

  useEffect(() => {
    if (!user && !authLoading) router.push('/login');
  }, [user, authLoading, router]);

  // Strategic Metrics Calculation - Aggregated across ALL sessions
  const stats = useMemo(() => {
    const total = allSessions.length;
    
    const scoredSessions = allSessions.filter((i: any) => (i.overallScore || 0) > 0);
    const avg = scoredSessions.length > 0 
      ? Math.round(scoredSessions.reduce((a, b) => a + (b.overallScore || 0), 0) / scoredSessions.length) 
      : 0;
    
    const best = total > 0 ? Math.max(...allSessions.map((i: any) => i.overallScore || 0)) : 0;
    
    const certsEarned = allSessions.filter((i: any) => (i.overallScore || 0) >= 70).length;

    const extractSubScore = (i: any, key: string) => i.feedback?.virtualInterviewResult?.[key] || 0;
    
    const confidenceScores = allSessions.map(i => extractSubScore(i, 'confidence')).filter(s => s > 0);
    const commScores = allSessions.map(i => extractSubScore(i, 'communication')).filter(s => s > 0);
    const techScores = allSessions.map(i => extractSubScore(i, 'technicalKnowledge')).filter(s => s > 0);

    const avgConf = confidenceScores.length > 0 ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) : 0;
    const avgComm = commScores.length > 0 ? Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length) : 0;
    const avgTech = techScores.length > 0 ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : 0;

    return {
      total,
      avg: `${avg}%`,
      best: `${best}%`,
      certsEarned,
      confidence: `${avgConf}%`,
      communication: `${avgComm}%`,
      technical: `${avgTech}%`
    };
  }, [allSessions]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      
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
              </div>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">Welcome back, {formattedName}</h1>
              <p className="text-muted-foreground font-light mt-2">Neural synchronization complete. Your combined career metrics are live.</p>
            </div>
            <div className="flex gap-4">
              <FeedbackDialog />
              <div className="relative group cursor-not-allowed">
                <Button disabled variant="outline" className="h-14 px-8 glass border-white/10 flex gap-3 text-[10px] tracking-widest uppercase opacity-50">
                  <LayoutGrid className="w-4 h-4" />
                  Mission Tracker
                  <Lock className="w-3 h-3 text-white/40 ml-1" />
                </Button>
              </div>
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
                    { title: "Start AI Interview", icon: Mic, color: "text-accent", href: "/interview/setup" },
                    { title: "Special HR Interview", icon: Sparkles, color: "text-purple-400", href: "/special-hr-resume-upload" },
                    { title: "Certificates", icon: Award, color: "text-orange-300", href: "/certificates" }
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
                  {allSessions.length > 0 && (
                    <Link href="/user-dashboard">
                      <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-accent hover:text-accent/80">View Full History</Button>
                    </Link>
                  )}
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {interviewsLoading || specialLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
                  ) : allSessions.length > 0 ? (
                    allSessions.slice(0, 3).map((session: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 group hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            session.type === 'special' ? "bg-purple-500/10 text-purple-400" : "bg-accent/10 text-accent"
                          )}>
                            {session.type === 'special' ? <Sparkles className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{session.role}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              {session.type === 'special' ? 'Executive HR' : 'Technical Simulation'} • {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {session.overallScore > 0 ? (
                            <Badge className="bg-accent/20 text-accent border-none font-bold tabular-nums">{session.overallScore}%</Badge>
                          ) : (
                            <Badge variant="outline" className="border-white/10 text-white/20 text-[8px]">PENDING</Badge>
                          )}
                          <Link href={session.type === 'special' ? `/special-hr-interview/result?sessionId=${session.id}` : `/feedback/${session.id}`}>
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
                      <div className="flex justify-center gap-4">
                        <Link href="/interview/setup">
                          <Button className="btn-premium px-8">Technical Track</Button>
                        </Link>
                        <Link href="/special-hr-resume-upload">
                          <Button variant="outline" className="px-8 rounded-xl glass border-white/10">Special HR</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
