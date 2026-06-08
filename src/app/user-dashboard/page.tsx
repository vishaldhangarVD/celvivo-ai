'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Trophy, 
  Target, 
  Activity, 
  FileText, 
  Clock, 
  Briefcase, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  BrainCircuit,
  Calendar,
  ArrowRight,
  History,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
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

export default function UserDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  // Fetch User Profile
  const userProfileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);

  // Fetch Interviews (Unlimited for history table)
  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);
  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);

  // Fetch Resumes (Unlimited for history table)
  const resumesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'resumes'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);
  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);

  // Stats Calculations
  const totalInterviews = interviews?.length || 0;
  const completedInterviews = interviews?.filter((i: any) => i.overallScore > 0).length || 0;
  const averageScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((acc: number, curr: any) => acc + (curr.overallScore || 0), 0) / totalInterviews) 
    : 0;
  const latestResumeScore = resumes?.[0]?.atsScore || 0;

  // Derive Learning Progress from recent analysis
  const learningProgress = useMemo(() => {
    if (!resumes?.[0]?.analysis) return { completed: 0, pending: 0, total: 0 };
    const skills = resumes[0].analysis.skillAnalysis || [];
    const missing = resumes[0].analysis.missingSkills || [];
    return {
      completed: skills.length,
      pending: missing.length,
      total: skills.length + missing.length
    };
  }, [resumes]);

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
        <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
        <p className="text-muted-foreground mb-8">Authentication required to view system metrics.</p>
        <Link href="/login">
          <Button className="btn-premium px-12 h-14">Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">System: Online</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">User Dashboard</h1>
              <p className="text-muted-foreground font-light">Performance analytics and session history for {user.displayName || 'Operator'}.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/interview">
                <Button className="h-14 px-8 btn-premium flex gap-3">
                  <Activity className="w-5 h-5" />
                  New Session
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* 1. Statistics Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-4 gap-6"
          >
            {[
              { label: "Total Interviews", val: totalInterviews, icon: History, color: "text-blue-400" },
              { label: "Completed Sessions", val: completedInterviews, icon: CheckCircle2, color: "text-green-400" },
              { label: "Avg. Neural Score", val: `${averageScore}%`, icon: Trophy, color: "text-yellow-400" },
              { label: "Latest ATS Score", val: latestResumeScore, icon: Target, color: "text-purple-400" }
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="premium-card p-8 bg-white/[0.02] border-white/5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.val}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* 3. Interview History Table */}
              <Card className="premium-card bg-white/[0.01] border-white/5 overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-bold flex items-center gap-4">
                    <History className="w-6 h-6 text-accent" />
                    Interview Performance Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-8 py-6">Date</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Deployment Track</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Neural Score</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Duration</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-right pr-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviewsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                          </TableCell>
                        </TableRow>
                      ) : interviews && interviews.length > 0 ? (
                        interviews.map((session: any) => (
                          <TableRow key={session.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                            <TableCell className="px-8 font-medium">
                              {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-bold">{session.role}</span>
                                <span className="text-[10px] uppercase text-muted-foreground">{session.experienceLevel}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-accent/10 text-accent border-accent/20">
                                {session.overallScore}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right pr-8">
                              <Link href={`/feedback/${session.id}`}>
                                <Button variant="ghost" size="sm" className="rounded-xl hover:bg-accent/10 hover:text-accent">
                                  View Audit
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-light italic">
                            No interview sessions recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* 4. Resume Analysis History */}
              <Card className="premium-card bg-white/[0.01] border-white/5 overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-bold flex items-center gap-4">
                    <FileText className="w-6 h-6 text-purple-400" />
                    Resume Audit History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-8 py-6">Audit Date</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Filename</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">ATS Index</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-right pr-8">Readiness</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resumesLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                          </TableCell>
                        </TableRow>
                      ) : resumes && resumes.length > 0 ? (
                        resumes.map((resume: any) => (
                          <TableRow key={resume.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                            <TableCell className="px-8 font-medium">
                              {resume.createdAt?.seconds ? new Date(resume.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate max-w-[150px]">{resume.filename}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={resume.atsScore} className="w-20 h-1.5" />
                                <span className="text-xs font-bold">{resume.atsScore}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                {resume.analysis?.roleMatches?.[0]?.matchPercentage || 0}% Match
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-light italic">
                            No resume audits performed yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-12">
              
              {/* 2. Recent Activity */}
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Activity className="w-6 h-6 text-accent" />
                    Recent Pulse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {interviews?.slice(0, 3).map((item: any, i) => (
                    <div key={i} className="flex gap-4 p-4 glass rounded-2xl border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <History className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">Interview: {item.role}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toDateString() : 'Recent'}</p>
                      </div>
                    </div>
                  ))}
                  {resumes?.slice(0, 2).map((item: any, i) => (
                    <div key={`res-${i}`} className="flex gap-4 p-4 glass rounded-2xl border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">Audit: {item.targetRole}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toDateString() : 'Recent'}</p>
                      </div>
                    </div>
                  ))}
                  {(!interviews?.length && !resumes?.length) && (
                    <p className="text-xs text-center text-muted-foreground p-8">No activity logs found.</p>
                  )}
                </CardContent>
              </Card>

              {/* 5. Learning Progress */}
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-yellow-400" />
                    Neural Acquisition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Skill Vector Progress</span>
                      <span className="text-lg font-bold text-yellow-400">
                        {learningProgress.total > 0 ? Math.round((learningProgress.completed / learningProgress.total) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={learningProgress.total > 0 ? (learningProgress.completed / learningProgress.total) * 100 : 0} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 glass rounded-[2rem] border-green-500/10 text-center">
                      <p className="text-2xl font-bold text-green-400">{learningProgress.completed}</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Verified</p>
                    </div>
                    <div className="p-6 glass rounded-[2rem] border-red-500/10 text-center">
                      <p className="text-2xl font-bold text-red-400">{learningProgress.pending}</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Gaps</p>
                    </div>
                  </div>

                  <Link href="/resume">
                    <Button variant="outline" className="w-full h-14 rounded-2xl glass border-white/10 hover:bg-white/10 flex gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                      Update Neural Roadmap
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* System Integrity */}
              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Neural Calibration</span>
                    <span className="text-xs font-bold text-accent">Optimal</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Sync</span>
                    <span className="text-xs font-bold text-green-400">Active</span>
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
