'use client';

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Zap, 
  Activity, 
  BrainCircuit, 
  FileText, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Briefcase,
  Loader2,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch Interviews
  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user?.uid]);
  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);

  // Fetch Recent Resumes
  const resumesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'resumes'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
  }, [db, user?.uid]);
  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);

  // Calculations
  const totalInterviews = interviews?.length || 0;
  const completedInterviews = interviews?.filter((i: any) => i.overallScore > 0).length || 0;
  const averageScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((acc: number, curr: any) => acc + (curr.overallScore || 0), 0) / totalInterviews) 
    : 0;
  const latestResumeScore = resumes?.[0]?.atsScore || 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
        <p className="text-muted-foreground mb-8">Please login to access your neural command center.</p>
        <Link href="/login">
          <Button className="btn-premium px-12 h-14">Return to Login</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { 
      label: "Total Interviews", 
      val: totalInterviews.toString(), 
      icon: Activity, 
      color: "text-blue-400", 
      change: "All Sessions" 
    },
    { 
      label: "Completed", 
      val: completedInterviews.toString(), 
      icon: CheckCircle2, 
      color: "text-green-400", 
      change: "Finalized" 
    },
    { 
      label: "Average Score", 
      val: `${averageScore}%`, 
      icon: Trophy, 
      color: "text-yellow-400", 
      change: "Neural Rating" 
    },
    { 
      label: "Resume ATS Score", 
      val: latestResumeScore.toString(), 
      icon: FileText, 
      color: "text-purple-400", 
      change: "Latest Audit" 
    }
  ];

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16"
          >
            <div>
              <Badge className="bg-accent/20 text-accent mb-4 border-none px-4 py-1 font-bold tracking-[0.3em] text-[10px]">OPERATIONAL CLEARANCE: GRANTED</Badge>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-premium">Command Center</h1>
              <p className="text-muted-foreground mt-4 font-light tracking-wide">Welcome back, {user.displayName || 'Operator'}. System ready for session initialization.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/interview">
                <Button className="h-14 px-8 btn-premium">Initialize New Session</Button>
              </Link>
            </div>
          </motion.div>

          {/* Core Metrics */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-4 gap-8 mb-16"
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="premium-card p-10 bg-white/[0.02] border-white/5">
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 glass rounded-2xl flex items-center justify-center ${stat.color} bg-white/5`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-white/10 text-muted-foreground uppercase">{stat.change}</Badge>
                </div>
                <div className="text-4xl font-bold mb-2 tabular-nums">{stat.val}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              {/* Performance Chart Placeholder */}
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader className="pb-12 border-b border-white/5 mb-12">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-accent" />
                    Neural Progression
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                  <div className="text-center z-10">
                    <Zap className="w-16 h-16 text-white/10 mx-auto mb-6 animate-pulse" />
                    <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">
                      {interviews?.length ? "Aggregating performance nodes..." : "Awaiting first session data..."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Session History */}
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader className="mb-8">
                  <CardTitle className="text-2xl font-bold">Recent Session Logs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {interviewsLoading ? (
                    <div className="flex justify-center p-12">
                      <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                  ) : interviews && interviews.length > 0 ? (
                    interviews.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-accent">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{session.role}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Clock className="w-3 h-3" /> {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <div className="text-xl font-bold text-accent">{session.overallScore}%</div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Efficiency</div>
                          </div>
                          <Link href={`/feedback/${session.id}`}>
                            <Button variant="ghost" size="icon" className="group-hover:text-accent group-hover:bg-accent/10 rounded-xl">
                              <ArrowUpRight className="w-6 h-6" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-12 border border-dashed border-white/10 rounded-[2.5rem]">
                      <p className="text-muted-foreground">No sessions recorded. Initialize your first simulation to begin.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Tools */}
            <div className="lg:col-span-4 space-y-12">
              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Zap className="w-6 h-6 text-accent" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Link href="/resume" className="block">
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-start gap-4 px-6 text-base font-bold">
                      <FileText className="w-6 h-6 text-accent" />
                      Resume Audit
                    </Button>
                  </Link>
                  <Link href="/interview" className="block">
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-start gap-4 px-6 text-base font-bold">
                      <Target className="w-6 h-6 text-purple-400" />
                      Start Mock
                    </Button>
                  </Link>
                  <Button disabled variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 opacity-50 justify-start gap-4 px-6 text-base font-bold cursor-not-allowed">
                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                    Skill Gap Map (Beta)
                  </Button>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Recent Resume Audits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumesLoading ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  ) : resumes && resumes.length > 0 ? (
                    resumes.map((resume: any) => (
                      <div key={resume.id} className="p-4 glass rounded-2xl border-white/5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm truncate max-w-[150px]">{resume.filename || 'Resume_Report.pdf'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{resume.targetRole}</p>
                        </div>
                        <Badge className="bg-accent/10 text-accent border-accent/20">ATS: {resume.atsScore}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center text-muted-foreground p-6">No resumes analyzed yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
