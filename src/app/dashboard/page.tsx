'use client';

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
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

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
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-premium">Command Center</h1>
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
            {[
              { label: "Job Readiness", val: "84%", icon: Trophy, color: "text-yellow-400", change: "+4.2%" },
              { label: "Neural Precision", val: "92%", icon: BrainCircuit, color: "text-blue-400", change: "+1.5%" },
              { label: "Mock Sessions", val: "12", icon: Activity, color: "text-purple-400", change: "2 active" },
              { label: "Skill Delta", val: "-14%", icon: Target, color: "text-green-400", change: "Decreasing" }
            ].map((stat, i) => (
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
              <Card className="premium-card bg-white/[0.01] border-white/5 h-full">
                <CardHeader className="pb-12 border-b border-white/5 mb-12">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-accent" />
                    Neural Progression
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                  <div className="text-center z-10">
                    <Zap className="w-16 h-16 text-white/10 mx-auto mb-6 animate-pulse" />
                    <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">Awaiting real-time sync data...</p>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader className="mb-8">
                  <CardTitle className="text-2xl font-bold">Session Logs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { role: "Backend Architect", date: "2 hours ago", score: "92%", type: "Verified" },
                    { role: "Staff Engineer", date: "Yesterday", score: "78%", type: "Incomplete" },
                    { role: "Data Scientist", date: "3 days ago", score: "88%", type: "Verified" }
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-accent">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{session.role}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {session.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right">
                          <div className="text-xl font-bold text-accent">{session.score}</div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{session.type}</div>
                        </div>
                        <Button variant="ghost" size="icon" className="group-hover:text-accent group-hover:bg-accent/10 rounded-xl">
                          <ArrowUpRight className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/10 justify-start gap-4 px-6 text-base font-bold opacity-50 cursor-not-allowed">
                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                    Skill Gap Map (Beta)
                  </Button>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Active Challenges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>System Design Elite</span>
                      <span>3/5</span>
                    </div>
                    <Progress value={60} className="h-2 bg-white/5" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Nuanced Comm Protocols</span>
                      <span>8/10</span>
                    </div>
                    <Progress value={80} className="h-2 bg-white/5" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}