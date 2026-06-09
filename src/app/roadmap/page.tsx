
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Award, 
  BrainCircuit,
  Rocket,
  ArrowRight,
  Loader2,
  Lock,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ROADMAP_DATA = {
  "30": [
    { title: "Node Architecture Mastery", desc: "Complete 10 sessions focused on distributed system logic.", tasks: ["Master Event Loops", "Study Microservices Architecture", "Implement Edge Caching"] },
    { title: "ATS Optimization", desc: "Audit and refine resume keyword density for target Senior tracks.", tasks: ["Refine Professional Summary", "Quantify Impact Metrics"] }
  ],
  "60": [
    { title: "System Scalability Round", desc: "Enter Advanced simulations for multi-regional scaling scenarios.", tasks: ["Global Database Partitioning", "Load Balancing Strategies"] },
    { title: "Strategic Leadership", desc: "Refine behavioral archetypes for lead engineer placements.", tasks: ["Master Conflict Resolution Scenarios", "Strategy Presentation Logic"] }
  ],
  "90": [
    { title: "Executive Placement", desc: "Final readiness audit with direct network deployment initialization.", tasks: ["Complete Final Readiness Scan", "Optimize Neural Profile for Partners"] }
  ]
};

export default function CareerRoadmap() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [activeTier, setActiveTier] = useState("30");

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-6xl mx-auto space-y-16">
          <header className="text-center">
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Personalized Growth Architecture</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Neural Roadmap</h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mt-4">
              Your dynamically calculated evolution path. Calibrated every session to bridge your professional gaps.
            </p>
          </header>

          {!user ? (
            <div className="relative py-20 flex items-center justify-center">
              <Card className="premium-card p-12 text-center max-w-md border-accent/20 relative z-10">
                <Lock className="w-16 h-16 text-accent mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Neural Gate Active</h3>
                <p className="text-muted-foreground mb-8 text-sm">Identity verification required to generate your personalized growth pathway.</p>
                <Link href="/login?redirectTo=/roadmap">
                  <Button className="btn-premium px-12 h-14 w-full">Access Protocol</Button>
                </Link>
              </Card>
              <div className="absolute inset-0 bg-black/40 blur-3xl -z-0"></div>
            </div>
          ) : (
            <div className="space-y-12">
              <Tabs defaultValue="30" onValueChange={setActiveTier} className="w-full">
                <div className="flex justify-center mb-16">
                  <TabsList className="glass border-white/5 p-2 rounded-[2rem] h-auto bg-white/[0.01]">
                    <TabsTrigger value="30" className="h-14 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-[#050816]">30 Day Protocol</TabsTrigger>
                    <TabsTrigger value="60" className="h-14 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-[#050816]">60 Day Strategic</TabsTrigger>
                    <TabsTrigger value="90" className="h-14 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-[#050816]">90 Day Executive</TabsTrigger>
                  </TabsList>
                </div>

                <AnimatePresence mode="wait">
                  <TabsContent value={activeTier} className="space-y-12 mt-0 outline-none">
                    <div className="grid md:grid-cols-2 gap-8">
                      {(ROADMAP_DATA as any)[activeTier].map((module: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card className="premium-card bg-white/[0.01] border-white/5 p-10 h-full flex flex-col hover:bg-white/[0.03] transition-all">
                            <div className="flex justify-between items-start mb-8">
                              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-accent">
                                <Layers className="w-7 h-7" />
                              </div>
                              <Badge variant="outline" className="border-accent/30 text-accent font-bold text-[10px] tracking-widest uppercase">Phase 0{i+1}</Badge>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{module.title}</h3>
                            <p className="text-muted-foreground font-light mb-10 leading-relaxed">{module.desc}</p>
                            
                            <div className="space-y-4 mt-auto">
                              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">Action Nodes</p>
                              {module.tasks.map((task: string, j: number) => (
                                <div key={j} className="flex gap-4 items-center p-4 glass rounded-2xl border-white/5 text-sm font-light">
                                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                                  {task}
                                </div>
                              ))}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <Card className="premium-card bg-accent/5 border-accent/10 p-12 text-center">
                      <Zap className="w-12 h-12 text-accent mx-auto mb-6" />
                      <h4 className="text-2xl font-bold mb-4">Acceleration Strategy</h4>
                      <p className="text-muted-foreground font-light max-w-2xl mx-auto mb-10">
                        Based on your current trajectory, completing these nodes will boost your Job Readiness Index by an estimated 12% in the next 30 days.
                      </p>
                      <Button className="btn-premium h-16 px-12 uppercase tracking-widest text-xs font-bold">Initialize Phase Training</Button>
                    </Card>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Daily Pulse", desc: "15-minute quick-fire logic challenges.", icon: Clock },
              { title: "Neural Audit", desc: "Weekly comprehensive session tracking.", icon: Award },
              { title: "Partner Network", desc: "Direct node deployment for elite roles.", icon: Rocket }
            ].map((feature, i) => (
              <div key={i} className="glass p-10 rounded-[3rem] border-white/5 text-center group hover:bg-white/[0.03] transition-all">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white/40 group-hover:text-accent transition-colors" />
                </div>
                <h5 className="font-bold text-lg mb-2">{feature.title}</h5>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
