"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Target, 
  Loader2, 
  ShieldAlert, 
  History,
  TrendingUp,
  Award,
  Search,
  Building2,
  Calendar,
  Zap,
  LayoutGrid,
  ChevronRight,
  Clock,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function InterviewHistoryPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest">("newest");

  const interviewsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'interviews'), orderBy('createdAt', sortOrder === 'oldest' ? 'asc' : 'desc'));
  }, [db, user?.uid, sortOrder]);

  const { data: interviews, loading: interviewsLoading } = useCollection(interviewsQuery);

  // Derived Analytics Data
  const stats = useMemo(() => {
    const data = interviews || [];
    const total = data.length;
    const scores = data.map((i: any) => i.overallScore || 0);
    const avg = total > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;
    const best = total > 0 ? Math.max(...scores) : 0;
    const readiness = data.map((i: any) => i.feedback?.interviewReadiness || 0);
    const avgReadiness = readiness.length > 0 ? Math.round(readiness.reduce((a, b) => a + b, 0) / readiness.length) : 0;

    return { total, avg, best, avgReadiness };
  }, [interviews]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (!interviews || interviews.length === 0) return [];
    return [...interviews]
      .reverse()
      .map((item: any) => ({
        date: item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent',
        score: item.overallScore || 0,
        readiness: item.feedback?.interviewReadiness || 0
      }));
  }, [interviews]);

  // Filtered List
  const filteredInterviews = useMemo(() => {
    let result = interviews || [];

    if (searchQuery) {
      result = result.filter((i: any) => 
        i.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (companyFilter !== "All") {
      result = result.filter((i: any) => i.company === companyFilter);
    }

    if (sortOrder === "highest") {
      result = [...result].sort((a: any, b: any) => (b.overallScore || 0) - (a.overallScore || 0));
    }

    return result;
  }, [interviews, searchQuery, companyFilter, sortOrder]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    interviews?.forEach((i: any) => set.add(i.company));
    return ["All", ...Array.from(set)];
  }, [interviews]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
        <p className="text-muted-foreground mb-8">Authentication required to view performance archives.</p>
        <Link href="/login"><Button className="btn-premium px-12 h-14">Login to System</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Interview History</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">My Interview <span className="text-gradient-purple">History.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-xl mx-auto">View your past interviews and track your performance progress.</p>
            </div>
            <Link href="/interview">
              <Button className="h-16 px-10 btn-premium flex gap-3 text-xs font-bold tracking-widest uppercase">
                <Zap className="w-5 h-5" /> Start New Interview
              </Button>
            </Link>
          </header>

          {/* Aggregate Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Sessions", val: stats.total, icon: History, color: "text-blue-400" },
              { label: "Average Score", val: `${stats.avg}%`, icon: Trophy, color: "text-accent" },
              { label: "Best Score", val: `${stats.best}%`, icon: Award, color: "text-orange-400" },
              { label: "Avg Readiness", val: `${stats.avgReadiness}%`, icon: Target, color: "text-purple-400" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-8 bg-white/[0.02] border-white/5"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1 tabular-nums">{stat.val}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Progression Chart */}
            <div className="lg:col-span-12">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-12 flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-accent" /> Performance Progress
                  </CardTitle>
                  <div className="flex gap-4">
                    <Badge variant="outline" className="border-accent/30 text-accent font-bold text-[8px] uppercase tracking-widest px-3 py-1">Interview Score</Badge>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-bold text-[8px] uppercase tracking-widest px-3 py-1">Readiness</Badge>
                  </div>
                </CardHeader>
                <div className="h-[350px] w-full">
                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorReadiness" x1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <ChartTooltip 
                          contentStyle={{ backgroundColor: '#0b0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        <Area type="monotone" dataKey="readiness" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorReadiness)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <Activity className="w-16 h-16 text-white/5" />
                      <p className="text-muted-foreground font-light max-w-xs italic">Complete multiple sessions to visualize your performance progress.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Filter & List Section */}
            <div className="lg:col-span-12 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-all" />
                    <Input 
                      placeholder="Search by role or company..."
                      className="h-14 pl-14 glass border-white/10 bg-transparent rounded-2xl"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <select 
                      value={companyFilter}
                      onChange={e => setCompanyFilter(e.target.value)}
                      className="h-14 px-8 glass border-white/10 bg-[#0b0e1a] rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent"
                    >
                      {companies.map(c => <option key={c} value={c}>{c === "All" ? "All Companies" : c}</option>)}
                    </select>
                    <select 
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value as any)}
                      className="h-14 px-8 glass border-white/10 bg-[#0b0e1a] rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Score</option>
                    </select>
                  </div>
                </div>
              </Card>

              {interviewsLoading ? (
                <div className="py-32 flex flex-col items-center gap-6">
                  <Loader2 className="w-12 h-12 text-accent animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Loading Interviews...</p>
                </div>
              ) : filteredInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInterviews.map((session: any, idx: number) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="glass p-8 rounded-[2.5rem] border-white/5 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                          <Badge className="bg-accent/10 text-accent border-accent/20 font-bold tabular-nums">{session.overallScore}%</Badge>
                        </div>

                        <div className="space-y-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold truncate group-hover:text-accent transition-colors">{session.role}</h3>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{session.company} • {session.experienceLevel}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 glass rounded-2xl border-white/5 space-y-2">
                               <p className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Interview Score</p>
                               <div className="flex items-end gap-2">
                                 <span className="text-xl font-bold tabular-nums text-white">{session.overallScore}%</span>
                               </div>
                            </div>
                            <div className="p-4 glass rounded-2xl border-white/5 space-y-2">
                               <p className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Readiness</p>
                               <div className="flex items-end gap-2">
                                 <span className="text-xl font-bold tabular-nums text-purple-400">{session.feedback?.interviewReadiness || 0}%</span>
                               </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/20">
                              <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                              <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {session.round}</span>
                            </div>
                            <Link href={`/feedback/${session.id}`} className="block">
                              <Button className="w-full h-12 rounded-xl glass border-white/10 hover:bg-accent hover:text-black group/btn text-[10px] font-bold uppercase tracking-widest transition-all">
                              View Feedback<ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center glass rounded-[3rem] border-white/5 border-dashed">
                  <LayoutGrid className="w-16 h-16 text-white/5 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">No Interviews Found</h3>
                  <p className="text-muted-foreground font-light max-sm mx-auto">
                    No No interviews found matching your search. Start a new interview to track your progress.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
