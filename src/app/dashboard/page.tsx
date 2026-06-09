
'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
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
  AlertCircle
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
      orderBy('createdAt', 'desc'),
      limit(10)
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

  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);
  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);

  useEffect(() => {
    if (!user && !authLoading) router.push('/login');
  }, [user, authLoading, router]);

  // Dynamic Metrics Calculation
  const stats = useMemo(() => {
    const latestResume = resumes?.[0];
    const latestInterview = interviews?.[0];
    
    // Aggregates from profile or latest records
    const resumeScore = latestResume?.atsScore || profile?.resumeScore || 0;
    const totalInterviews = profile?.totalInterviews || 0;
    const interviewScore = latestInterview?.overallScore || 0;
    
    // Skill match from latest resume analysis
    const skillMatch = latestResume?.analysis?.roleMatches?.[0]?.matchPercentage || 0;
    
    // Readiness: Blend of resume score and latest performance
    const jobReadiness = (resumeScore > 0 || interviewScore > 0)
      ? Math.round((resumeScore + interviewScore) / (resumeScore > 0 && interviewScore > 0 ? 2 : 1))
      : 0;

    return {
      resumeScore: `${resumeScore}%`,
      totalInterviews,
      jobReadiness: `${jobReadiness}%`,
      skillMatch: `${skillMatch}%`
    };
  }, [resumes, interviews, profile]);

  // Performance Chart Data
  const chartData = useMemo(() => {
    if (!interviews || interviews.length === 0) {
      return [{ name: 'S-0', score: 0 }];
    }
    return interviews
      .slice()
      .reverse()
      .map((item, i) => ({
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
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div>
              <Badge className="bg-accent/20 text-accent mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Operational Hub Active</Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">Command Center</h1>
              <p className="text-muted-foreground font-light mt-2">Neural synchronization active. Welcome back, {user.displayName || 'Operator'}.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/interview">
                <Button className="h-14 px-8 btn-premium">Initialize Session</Button>
              </Link>
            </div>
          </motion.header>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Resume Score", val: stats.resumeScore, icon: FileText, color: "text-purple-400" },
              { label: "Interviews Taken", val: stats.totalInterviews, icon: Activity, color: "text-accent" },
              { label: "Job Readiness", val: stats.jobReadiness, icon: Target, color: "text-blue-400" },
              { label: "Skill Match", val: stats.skillMatch, icon: BrainCircuit, color: "text-yellow-400" }
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

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-10">
                  <CardTitle className="text-2xl font-bold">Recent Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {interviewsLoading || resumesLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
                  ) : [...(interviews || []), ...(resumes || [])].length === 0 ? (
                    <div className="py-12 text-center glass rounded-[2rem] border-white/5">
                      <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground font-light">No intelligence logs found. Start a simulation to begin tracking.</p>
                    </div>
                  ) : (
                    [
                      ...(interviews?.map(i => ({ type: 'interview', title: `Simulation: ${i.role}`, desc: `Neural score of ${i.overallScore}% recorded.`, link: `/feedback/last?role=${encodeURIComponent(i.role)}&exp=${i.experienceLevel}&data=${encodeURIComponent(JSON.stringify(i.history))}`, icon: Zap, date: i.createdAt })) || []),
                      ...(resumes?.map(r => ({ type: 'resume', title: `Blueprint Audit: ${r.filename}`, desc: `ATS Index calibrated at ${r.atsScore}%.`, link: '/resume', icon: FileText, date: r.createdAt })) || [])
                    ]
                    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
                    .slice(0, 5)
                    .map((action, i) => (
                      <div key={i} className="flex items-center justify-between p-6 glass rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all group">
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 glass rounded-xl flex items-center justify-center ${action.type === 'interview' ? 'text-accent' : 'text-purple-400'}`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold">{action.title}</h4>
                            <p className="text-xs text-muted-foreground">{action.desc}</p>
                          </div>
                        </div>
                        <Link href={action.link}>
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
                  <Link href="/roadmap">
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-between px-6">
                      <div className="flex items-center gap-4">
                        <Target className="w-5 h-5 text-blue-400" />
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

              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Neural Vectors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumesLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  ) : resumes?.[0]?.analysis?.missingSkills?.length > 0 ? (
                    resumes[0].analysis.missingSkills.slice(0, 3).map((skill: string, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span>{skill}</span>
                          <span>Priority Node</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${Math.random() * 40 + 20}%` }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground font-light italic">No skill gaps identified yet.</p>
                  )}
                  <Link href="/roadmap">
                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5">View Full Analysis</Button>
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
