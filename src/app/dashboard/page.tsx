
'use client';

import { useEffect } from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const dummyStats = [
  { label: "Resume Score", val: "82%", icon: FileText, color: "text-purple-400" },
  { label: "Interviews Taken", val: "12", icon: Activity, color: "text-accent" },
  { label: "Job Readiness", val: "76%", icon: Target, color: "text-blue-400" },
  { label: "Skill Match", val: "68%", icon: BrainCircuit, color: "text-yellow-400" }
];

const dummyChartData = [
  { name: 'Jan', score: 45 },
  { name: 'Feb', score: 52 },
  { name: 'Mar', score: 48 },
  { name: 'Apr', score: 61 },
  { name: 'May', score: 58 },
  { name: 'Jun', score: 65 },
  { name: 'Jul', score: 72 },
  { name: 'Aug', score: 68 },
  { name: 'Sep', score: 76 },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!user && !authLoading) router.push('/login');
  }, [user, authLoading, router]);

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
            {dummyStats.map((stat, i) => (
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
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dummyChartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050816', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#22d3ee" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-10">
                  <CardTitle className="text-2xl font-bold">Recent Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {[
                    { title: "Resume Audit Complete", desc: "Latest scan shows 82% compatibility with Senior tracks.", link: "/resume", icon: FileText },
                    { title: "Neural Simulation Pending", desc: "Recommended practicing React Design Patterns.", link: "/interview", icon: Zap },
                    { title: "Milestone Reached", desc: "75%+ Job Readiness achieved for Full Stack roles.", link: "/roadmap", icon: Target }
                  ].map((action, i) => (
                    <div key={i} className="flex items-center justify-between p-6 glass rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-accent">
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
                  ))}
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
                  <CardTitle className="text-xl font-bold">Skill Gaps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { skill: "System Design", gap: 32, color: "bg-red-400" },
                    { skill: "Cloud Architecture", gap: 24, color: "bg-yellow-400" },
                    { skill: "Distributed Logs", gap: 18, color: "bg-blue-400" }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>{item.skill}</span>
                        <span>{item.gap}% Gap</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.gap}%` }}></div>
                      </div>
                    </div>
                  ))}
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
