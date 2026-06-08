'use client';

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
  ArrowUpRight,
  Search,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-32">
        <div className="max-w-7xl mx-auto space-y-16">
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <Badge className="bg-red-500/20 text-red-400 mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Administrative Access Only</Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">System Intelligence</h1>
              <p className="text-muted-foreground font-light mt-4">Operational overview of the Nexvoro AI deployment nodes.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-12 rounded-xl glass border-white/10 flex gap-2">
                <Settings className="w-4 h-4" /> Protocol Config
              </Button>
            </div>
          </header>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Active Nodes", val: "1,248", icon: Users, color: "text-blue-400" },
              { label: "Neural Sessions", val: "4,829", icon: Activity, color: "text-accent" },
              { label: "Protocol Revenue", val: "$52,830", icon: DollarSign, color: "text-green-400" },
              { label: "Core Efficiency", val: "99.9%", icon: Cpu, color: "text-purple-400" }
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
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-8 border-b border-white/5">
                  <CardTitle className="text-xl font-bold flex items-center gap-4">
                    <BarChart4 className="w-6 h-6 text-accent" /> Node Performance
                  </CardTitle>
                  <div className="flex gap-4">
                    <Badge variant="outline" className="text-[10px] font-bold border-accent/20 text-accent">Real-time</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center p-0">
                  <div className="text-center opacity-20">
                    <Activity className="w-24 h-24 mx-auto mb-6 animate-pulse" />
                    <p className="text-xs uppercase tracking-[0.4em] font-bold">Neural Stream Active</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Protocol Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { node: "Sim-Engine-01", status: "Optimal", health: 98 },
                    { node: "Auth-Vault-A", status: "Secure", health: 100 },
                    { node: "Audit-Log-B", status: "Syncing", health: 85 }
                  ].map((node, i) => (
                    <div key={i} className="p-4 glass rounded-2xl border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">{node.node}</span>
                        <span className={`text-[10px] font-bold uppercase ${node.health === 100 ? 'text-green-400' : 'text-accent'}`}>{node.status}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${node.health}%` }}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Quick Directives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full h-12 rounded-xl glass border-white/10 hover:bg-white/10 justify-start gap-3">
                    <Users className="w-4 h-4" /> Node Management
                  </Button>
                  <Button className="w-full h-12 rounded-xl glass border-white/10 hover:bg-white/10 justify-start gap-3">
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