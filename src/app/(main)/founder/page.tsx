'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Cpu,
  Settings,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart4,
  DollarSign,
  MessageSquare,
  Lock,
  Flag,
  ServerCrash
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FounderConsole() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    // 1. Wait for auth to initialize
    if (authLoading) return;

    // 2. Redirect if not authenticated
    if (!user) {
      router.replace('/login');
      return;
    }

    // 3. Wait for profile to load
    if (profileLoading) return;

    // 4. Redirect if role is not founder
    if (profile?.role !== 'founder') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, profile, profileLoading, router]);

  if (authLoading || profileLoading || (user && profile?.role !== 'founder')) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Verifying Authority...</p>
        </div>
      </div>
    );
  }

  const systemStats = [
    { label: "Total Operators", val: "1,248", icon: Users, color: "text-blue-400" },
    { label: "AI Latency", val: "42ms", icon: Cpu, color: "text-accent" },
    { label: "Node Health", val: "99.9%", icon: Activity, color: "text-green-400" },
    { label: "Total Revenue", val: "₹1,42,830", icon: DollarSign, color: "text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase mb-4 block w-fit">Restricted Access: Founder Protocol</Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">Founder Console</h1>
              <p className="text-muted-foreground font-light mt-2">Core system intelligence and neural infrastructure management.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-12 rounded-xl glass border-white/10 flex gap-2 text-[10px] font-bold uppercase tracking-widest">
                <Settings className="w-4 h-4" /> Global Config
              </Button>
            </div>
          </header>

          <div className="grid md:grid-cols-4 gap-6">
            {systemStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-8 bg-white/[0.01] border-white/5 group hover:border-accent/30 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 tabular-nums">{stat.val}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-10 border-b border-white/5 pb-8">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-accent" /> Platform Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-auto flex items-center justify-center relative p-0">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                     {[
                       { label: "Active Interviews", val: "842", icon: Zap, color: "text-accent" },
                       { label: "API Usage", val: "92.4k", icon: BarChart4, color: "text-purple-400" },
                       { label: "Feedback Loop", val: "4.8/5", icon: MessageSquare, color: "text-blue-400" },
                       { label: "Uptime", val: "100%", icon: ShieldCheck, color: "text-green-400" },
                       { label: "Error Logs", val: "0", icon: ServerCrash, color: "text-red-400" },
                       { label: "Tokens Synced", val: "1.2M", icon: Cpu, color: "text-yellow-400" }
                     ].map((m, idx) => (
                       <div key={idx} className="p-6 glass rounded-2xl border-white/5 space-y-2 hover:bg-white/[0.03] transition-all">
                         <div className="flex items-center gap-3 text-white/40">
                           <m.icon className={`w-4 h-4 ${m.color}`} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
                         </div>
                         <p className="text-2xl font-bold">{m.val}</p>
                       </div>
                     ))}
                   </div>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-xl font-bold">User Management Protocol</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {[
                    { name: "John Wick", status: "Active", level: "Elite" },
                    { name: "Sarah Connor", status: "Active", level: "Standard" },
                    { name: "Neo Anderson", status: "Active", level: "Elite" }
                  ].map((usr, i) => (
                    <div key={i} className="flex items-center justify-between p-6 glass rounded-[2rem] border-white/5 hover:border-accent/20 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {usr.name[0]}
                        </div>
                        <div>
                          <p className="font-bold">{usr.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{usr.level} Operator</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400 font-bold uppercase">{usr.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Security Vault</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 glass rounded-2xl border-white/5 space-y-3">
                    <div className="flex items-center gap-3 text-white/40">
                      <Lock className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Auth Integrity</span>
                    </div>
                    <p className="text-sm font-bold text-green-400 uppercase tracking-widest">Optimized</p>
                  </div>
                  <div className="p-4 glass rounded-2xl border-white/5 space-y-3">
                    <div className="flex items-center gap-3 text-white/40">
                      <Flag className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Feature Flags</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-accent/20 text-accent font-bold text-[9px]">BETA_V6</Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 font-bold text-[9px]">AVATAR_NEXT</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Founder Directives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <Button className="w-full h-14 rounded-2xl glass border-white/10 hover:bg-white/10 justify-start gap-4 text-[10px] uppercase font-bold tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-accent" /> Security Audit
                  </Button>
                  <Button className="w-full h-14 rounded-2xl glass border-white/10 hover:bg-white/10 justify-start gap-4 text-[10px] uppercase font-bold tracking-widest">
                    <TrendingUp className="w-4 h-4 text-purple-400" /> Marketing Deck
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
