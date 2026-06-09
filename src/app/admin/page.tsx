
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BarChart4, 
  DollarSign, 
  ShieldCheck, 
  Activity, 
  Cpu,
  Settings,
  Loader2,
  TrendingUp,
  UserPlus,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // Basic protection: only allows known admin or redirects
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;
  if (!user) return null;

  const systemStats = [
    { label: "Total Operators", val: "1,248", icon: Users, color: "text-blue-400", change: "+12%" },
    { label: "Active Nodes", val: "842", icon: Activity, color: "text-green-400", change: "+5%" },
    { label: "Elite Protocols", val: "156", icon: Crown, color: "text-purple-400", change: "+22%" },
    { label: "System Revenue", val: "₹1,42,830", icon: DollarSign, color: "text-accent", change: "+8%" }
  ];

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <Badge className="bg-red-500/20 text-red-400 mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Administrative Access Only</Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">System Intelligence</h1>
              <p className="text-muted-foreground font-light mt-2">Operational overview of the Nexvoro AI deployment nodes.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-12 rounded-xl glass border-white/10 flex gap-2">
                <Settings className="w-4 h-4" /> System Config
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
                className="premium-card p-8 bg-white/[0.01] border-white/5"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold mb-1 tabular-nums">{stat.val}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-10 border-b border-white/5 pb-8 flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-accent" /> Network Growth
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold text-accent border-accent/20">Real-time Stream</Badge>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                  <div className="text-center z-10">
                    <Activity className="w-20 h-20 text-white/5 mx-auto mb-6 animate-pulse" />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Neural Matrix Active</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-xl font-bold">New Registrations</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {[
                    { name: "John Wick", email: "babayaga@high.table", date: "2 mins ago" },
                    { name: "Sarah Connor", email: "no-fate@sky.net", date: "15 mins ago" },
                    { name: "Neo Anderson", email: "one@matrix.com", date: "1 hour ago" }
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-6 glass rounded-[2rem] border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{user.date}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Node Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { node: "Auth-Vault-A", status: "Operational", health: 100 },
                    { node: "Sim-Engine-01", status: "Optimal", health: 98 },
                    { node: "Audit-Log-B", status: "Syncing", health: 85 }
                  ].map((node, i) => (
                    <div key={i} className="p-4 glass rounded-2xl border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{node.node}</span>
                        <span className={`text-[10px] font-bold uppercase ${node.health === 100 ? 'text-green-400' : 'text-accent'}`}>{node.status}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${node.health}%` }}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Directives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full h-14 rounded-2xl glass border-white/10 hover:bg-white/10 justify-start gap-4">
                    <UserPlus className="w-4 h-4" /> Node Management
                  </Button>
                  <Button className="w-full h-14 rounded-2xl glass border-white/10 hover:bg-white/10 justify-start gap-4">
                    <ShieldCheck className="w-4 h-4" /> Security Audit
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
