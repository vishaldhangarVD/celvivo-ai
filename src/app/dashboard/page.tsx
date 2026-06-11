"use client";

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Zap, 
  Activity, 
  FileText, 
  BrainCircuit, 
  TrendingUp,
  Award,
  ChevronRight,
  Loader2,
  ArrowUpRight,
  AlertCircle,
  History,
  Star,
  FileSearch,
  CheckCircle2,
  Layers,
  Map
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  // Personalized Greeting Logic
  const formattedName = useMemo(() => {
    if (!user) return 'User';
    const name = user.displayName || user.email?.split('@')[0] || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  // Fetch User Profile for aggregate stats
  const userRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  // Memoized queries for intelligence lists
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
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const skillGapQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'skill_gap'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);

  const roadmapQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'roadmaps'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);

  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);
  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);
  const { data: latestGap } = useCollection(skillGapQuery);
  const { data: latestRoadmap } = useCollection(roadmapQuery);

  useEffect(() => {
    if (!user && !authLoading) router.push('/login');
  }, [user, authLoading, router]);

  // Dynamic Metrics Calculation
  const stats = useMemo(() => {
    const latestResume = resumes?.[0];
    const latestInterview = interviews?.[0];
    const latestSkillMatch = latestGap?.[0]?.skillMatchPercentage || 0;
    
    const resumeScore = latestResume?.atsScore || profile?.resumeScore || 0;
    const totalInterviews = interviews?.length || 0;
    const totalResumes = resumes?.length || 0;
    const latestScore = latestInterview?.overallScore || 0;
    
    const averageScore = interviews?.length 
      ? Math.round(interviews.reduce((acc, curr: any) => acc + (curr.overallScore || 0), 0) / interviews.length)
      : 0;
    
    const jobReadiness = (resumeScore > 0 || averageScore > 0)
      ? Math.round((resumeScore + averageScore) / (resumeScore > 0 && averageScore > 0 ? 2 : 1))
      : 0;

    return {
      resumeScore: `${resumeScore}%`,
      totalInterviews,
      totalResumes,
      latestScore: `${latestScore}%`,
      averageScore: `${averageScore}%`,
      jobReadiness: `${jobReadiness}%`,
      skillMatch: `${latestSkillMatch}%`
    };
  }, [resumes, interviews, profile, latestGap]);

  // Performance Chart Data
  const chartData = useMemo(() => {
    if (!interviews || interviews.length === 0) {
      return [{ name: 'S-0', score: 0 }];
    }
    return interviews
      .slice(0, 7)
      .reverse()
      .map((item: any, i) => ({
        name: `S-${i+1}`,
        score: item.overallScore || 0
      }));
  }, [interviews]);

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
              <Badge className="bg-accent/20 text-accent mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Operational Hub Active</Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">Career Dashboard</h1>
              <p className="text-muted-foreground font-light mt-2">Neural synchronization active. Welcome back, {formattedName}.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/interview">
                <Button className="h-14 px-8 btn-premium">Initialize Session</Button>
              </Link>
            </div>
          </motion.header>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Neural Readiness", val: stats.jobReadiness, icon: Target, color: "text-accent" },
              { label: "Skill Vector Match", val: stats.skillMatch, icon: BrainCircuit, color: "text-purple-400" },
              { label: "Resume ATS Index", val: stats.resumeScore, icon: FileSearch, color: "text-blue-400" },
              { label: "Neural Efficiency", val: stats.averageScore, icon: Activity, color: "text-yellow-400" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-8 bg-white/[0.01] border-white/5"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1 tabular-nums">{stat.val}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              {/* Performance Graph */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-10 border-b border-white/5 pb-8 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Performance Projection</CardTitle>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Growth tracking over current cycle</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-accent" />
                </CardHeader>
                <CardContent className="p-0 h-[300px]">
                  {interviewsLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                  ) : chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#050816', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#22d3ee" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <TrendingUp className="w-12 h-12 mb-4" />
                      <p className="text-xs uppercase tracking-widest font-bold">Insufficient Data Nodes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skill Gap Analysis Summary */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-10 border-b border-white/5 pb-8 flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <BrainCircuit className="w-8 h-8 text-purple-400" />
                    Neural Gap Audit
                  </CardTitle>
                  {latestGap?.[0] && (
                    <Badge variant="outline" className="text-[10px] font-bold text-purple-400 border-purple-400/20">
                      Track: {latestGap[0].role}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {!latestGap || latestGap.length === 0 ? (
                    <div className="py-20 text-center glass rounded-[2rem] border-white/5 border-dashed">
                      <Layers className="w-12 h-12 text-white/20 mx-auto mb-6" />
                      <p className="text-lg font-light text-muted-foreground">No skill gap audits synchronized.</p>
                      <Link href="/skill-gap" className="mt-8 block">
                        <Button variant="outline" className="rounded-xl border-purple-400/20 text-purple-400 hover:bg-purple-400/5">Calibrate Skill Track</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Current Proficiency</p>
                          <p className="text-4xl font-bold text-purple-400">{latestGap[0].skillMatchPercentage}%</p>
                        </div>
                        <Link href="/skill-gap">
                          <Button variant="ghost" className="text-accent text-[10px] font-bold uppercase tracking-widest gap-2">
                            View Full Analysis <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Critical Gaps</p>
                          <div className="flex flex-wrap gap-2">
                            {latestGap[0].criticalMissingSkills?.map((s: string, i: number) => (
                              <Badge key={i} className="bg-red-400/10 text-red-400 border-red-400/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next Milestone</p>
                          <div className="p-4 glass rounded-2xl border-white/5">
                            <p className="text-sm font-light leading-relaxed">{latestRoadmap?.[0]?.plans?.thirtyDay?.[0]?.title || latestGap[0].recommendedRoadmap?.[0]}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interview History */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-10">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <History className="w-8 h-8 text-accent" />
                    Interview History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {interviewsLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
                  ) : !interviews || interviews.length === 0 ? (
                    <div className="py-20 text-center glass rounded-[2rem] border-white/5 border-dashed">
                      <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-6" />
                      <p className="text-lg font-light text-muted-foreground">No interview history available yet.</p>
                      <Link href="/interview" className="mt-8 block">
                        <Button variant="outline" className="rounded-xl border-accent/20 text-accent hover:bg-accent/5">Start First Session</Button>
                      </Link>
                    </div>
                  ) : (
                    interviews.slice(0, 5).map((session: any, i) => (
                      <div key={i} className="flex items-center justify-between p-6 glass rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-accent">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">Simulation: {session.role}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>Score: {session.overallScore}%</span>
                              <span className="w-1 h-1 rounded-full bg-white/10"></span>
                              <span>{session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/feedback/${session.id}`}>
                          <Button variant="ghost" size="icon" className="group-hover:text-accent rounded-xl">
                            <ArrowUpRight className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Zap className="w-6 h-6 text-accent" /> Strategic Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/resume">
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-between px-6">
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="font-bold text-sm">Resume Auditor Pro</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </Button>
                  </Link>
                  <Link href="/skill-gap">
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-between px-6">
                      <div className="flex items-center gap-4">
                        <BrainCircuit className="w-5 h-5 text-accent" />
                        <span className="font-bold text-sm">Skill Gap Analysis</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </Button>
                  </Link>
                  <Link href="/roadmap">
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-between px-6">
                      <div className="flex items-center gap-4">
                        <Map className="w-5 h-5 text-blue-400" />
                        <span className="font-bold text-sm">Neural Roadmap</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </Button>
                  </Link>
                  <Link href="/certificates">
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-between px-6">
                      <div className="flex items-center gap-4">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-sm">Achievement Vault</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {latestRoadmap?.[0] && (
                <Card className="premium-card bg-white/[0.01] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-400" />
                      Active Protocol
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 glass rounded-2xl border-white/5 space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Current Phase: 30 Day</p>
                      <p className="text-sm font-light leading-relaxed">{latestRoadmap[0].plans.thirtyDay[0].title}</p>
                      <Link href="/roadmap">
                        <Button variant="link" className="p-0 h-auto text-accent text-xs uppercase tracking-widest font-bold">
                          Resume Training <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Job Readiness</span>
                      <span>{stats.jobReadiness}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: stats.jobReadiness }}></div>
                    </div>
                  </div>
                  <div className="p-4 glass rounded-2xl border-white/5">
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      Calibration complete. Your technical trajectory is trending <b>upward</b> based on the last 3 sessions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
