
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
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
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  History,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function UserDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const formattedName = useMemo(() => {
    if (!user) return 'Operator';
    const name = user.displayName || user.email?.split('@')[0] || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);
  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);

  const resumesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'resumes'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);
  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);

  const stats = useMemo(() => {
    const total = interviews?.length || 0;
    const completed = interviews?.filter((i: any) => i.overallScore > 0).length || 0;
    const scores = interviews?.filter((i: any) => i.overallScore > 0).map((i: any) => i.overallScore) || [];
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const best = resumes?.[0]?.atsScore || 0;
    return { total, completed, avg, best };
  }, [interviews, resumes]);

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
        <p className="text-muted-foreground mb-8">Authentication required to view system metrics.</p>
        <Link href="/login"><Button className="btn-premium px-12 h-14">Login</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-4 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Identity Verified</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">Performance Hub</h1>
              <p className="text-muted-foreground font-light">Comprehensive session history and growth analytics for {formattedName}.</p>
            </div>
            <Link href="/interview"><Button className="h-14 px-8 btn-premium flex gap-3"><Activity className="w-5 h-5" /> New Simulation</Button></Link>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Total Sessions", val: stats.total, icon: History, color: "text-blue-400" },
              { label: "Audit Complete", val: stats.completed, icon: CheckCircle2, color: "text-green-400" },
              { label: "Neural Score", val: `${stats.avg}%`, icon: Trophy, color: "text-yellow-400" },
              { label: "Best ATS Index", val: `${stats.best}%`, icon: Target, color: "text-purple-400" }
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="premium-card p-8 bg-white/[0.02] border-white/5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1 tabular-nums">{stat.val}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <Card className="premium-card bg-white/[0.01] border-white/5 overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-bold flex items-center gap-4"><History className="w-6 h-6 text-accent" /> Assessment Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-8 py-6">Date</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Track</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Efficiency</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-right pr-8">Audit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviewsLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" /></TableCell></TableRow>
                      ) : interviews && interviews.length > 0 ? (
                        interviews.map((session: any) => (
                          <TableRow key={session.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                            <TableCell className="px-8 font-medium tabular-nums">{session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</TableCell>
                            <TableCell><div className="flex flex-col"><span className="font-bold">{session.role}</span><span className="text-[10px] uppercase text-muted-foreground">{session.round}</span></div></TableCell>
                            <TableCell><Badge className="bg-accent/10 text-accent border-accent/20 tabular-nums">{session.overallScore || 0}%</Badge></TableCell>
                            <TableCell className="text-right pr-8"><Link href={`/feedback/${session.id}`}><Button variant="ghost" size="icon" className="hover:bg-accent/10 hover:text-accent"><ArrowRight className="w-4 h-4" /></Button></Link></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-light italic">No archival records found.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-12">
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3"><Activity className="w-6 h-6 text-accent" /> System Pulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {interviews?.slice(0, 5).map((item: any, i) => (
                    <div key={i} className="flex gap-4 p-4 glass rounded-2xl border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0"><TrendingUp className="w-5 h-5 text-accent" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.role}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toDateString() : 'Pending'}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader><CardTitle className="text-xl font-bold flex items-center gap-3"><Award className="w-6 h-6 text-yellow-400" /> Readiness Index</CardTitle></CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Neural Baseline</span>
                      <span className="text-2xl font-bold text-accent">{stats.avg}%</span>
                    </div>
                    <Progress value={stats.avg} className="h-1.5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed italic">"Your performance vectors are stabilizing. Focus on technical precision nodes to reach the 85% elite threshold."</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
