'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
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
  BookOpen,
  Plus,
  RefreshCcw,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLearningRoadmap, type LearningRoadmapOutput } from '@/ai/flows/ai-learning-roadmap';
import { useToast } from '@/hooks/use-toast';

export default function CareerRoadmap() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTier, setActiveTier] = useState("30");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch latest roadmap
  const roadmapQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'roadmaps'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestRoadmaps, loading: roadmapLoading } = useCollection(roadmapQuery);

  // Fetch latest skill gap for calibration
  const gapQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'skill_gap'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestGaps } = useCollection(gapQuery);

  const handleGenerateRoadmap = async () => {
    if (!user || !db) return;
    setIsGenerating(true);

    try {
      const gap = latestGaps?.[0];
      const result = await generateLearningRoadmap({
        role: gap?.role || "Senior IT Engineer",
        experienceLevel: "Senior",
        existingSkills: gap?.existingSkills || [],
        missingSkills: gap?.missingSkills || []
      });

      const roadmapData = {
        userId: user.uid,
        role: gap?.role || "Senior IT Engineer",
        ...result,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users', user.uid, 'roadmaps'), roadmapData);
      
      toast({
        title: "Growth Architecture Generated",
        description: "Your 90-day evolution path has been synchronized.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Protocol Failed",
        description: "Could not generate roadmap. Ensure skill gap analysis is complete.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  const currentRoadmap = latestRoadmaps?.[0];

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
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
            </div>
          ) : !currentRoadmap ? (
            <div className="text-center py-20 space-y-8">
              <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-10">
                <LayoutDashboard className="w-10 h-10 text-white/20" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold">No Active Roadmap</h3>
                <p className="text-muted-foreground font-light max-w-md mx-auto">
                  Initialize your growth architecture by comparing your skills against an industry track.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/skill-gap">
                  <Button variant="outline" className="h-16 px-10 rounded-2xl glass border-white/10 hover:bg-white/10">Analyze Skill Gap First</Button>
                </Link>
                <Button 
                  onClick={handleGenerateRoadmap} 
                  disabled={isGenerating}
                  className="h-16 px-10 btn-premium"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Plus className="w-5 h-5 mr-3" />}
                  Generate Full Roadmap
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{currentRoadmap.role} Track</h2>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Generated: {new Date(currentRoadmap.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleGenerateRoadmap}
                  disabled={isGenerating}
                  className="rounded-xl glass border-white/10 h-12 px-6 hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                  Recalibrate Architecture
                </Button>
              </div>

              <Tabs defaultValue="30" onValueChange={setActiveTier} className="w-full">
                <div className="flex justify-center mb-16">
                  <TabsList className="glass border-white/5 p-2 rounded-[2rem] h-auto bg-white/[0.01]">
                    <TabsTrigger value="30" className="h-14 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-[#050816]">30 Day Protocol</TabsTrigger>
                    <TabsTrigger value="60" className="h-14 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-[#050816]">60 Day Strategic</TabsTrigger>
                    <TabsTrigger value="90" className="h-14 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-[#050816]">90 Day Executive</TabsTrigger>
                  </TabsList>
                </div>

                <AnimatePresence mode="wait">
                  <TabsContent value="30" className="outline-none">
                    <div className="grid md:grid-cols-2 gap-8">
                      {currentRoadmap.plans.thirtyDay.map((module: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card className="premium-card bg-white/[0.01] border-white/5 p-10 h-full flex flex-col hover:bg-white/[0.03] transition-all">
                            <div className="flex justify-between items-start mb-8">
                              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-accent"><Layers className="w-7 h-7" /></div>
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
                  </TabsContent>
                  <TabsContent value="60" className="outline-none">
                    <div className="grid md:grid-cols-2 gap-8">
                      {currentRoadmap.plans.sixtyDay.map((module: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card className="premium-card bg-white/[0.01] border-white/5 p-10 h-full flex flex-col hover:bg-white/[0.03] transition-all">
                            <div className="flex justify-between items-start mb-8">
                              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-purple-400"><Layers className="w-7 h-7" /></div>
                              <Badge variant="outline" className="border-purple-400/30 text-purple-400 font-bold text-[10px] tracking-widest uppercase">Phase 0{i+1}</Badge>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{module.title}</h3>
                            <p className="text-muted-foreground font-light mb-10 leading-relaxed">{module.desc}</p>
                            <div className="space-y-4 mt-auto">
                              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">Action Nodes</p>
                              {module.tasks.map((task: string, j: number) => (
                                <div key={j} className="flex gap-4 items-center p-4 glass rounded-2xl border-white/5 text-sm font-light">
                                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                  {task}
                                </div>
                              ))}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="90" className="outline-none">
                    <div className="grid md:grid-cols-2 gap-8">
                      {currentRoadmap.plans.ninetyDay.map((module: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card className="premium-card bg-white/[0.01] border-white/5 p-10 h-full flex flex-col hover:bg-white/[0.03] transition-all">
                            <div className="flex justify-between items-start mb-8">
                              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-blue-400"><Layers className="w-7 h-7" /></div>
                              <Badge variant="outline" className="border-blue-400/30 text-blue-400 font-bold text-[10px] tracking-widest uppercase">Phase 0{i+1}</Badge>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{module.title}</h3>
                            <p className="text-muted-foreground font-light mb-10 leading-relaxed">{module.desc}</p>
                            <div className="space-y-4 mt-auto">
                              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">Action Nodes</p>
                              {module.tasks.map((task: string, j: number) => (
                                <div key={j} className="flex gap-4 items-center p-4 glass rounded-2xl border-white/5 text-sm font-light">
                                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                  {task}
                                </div>
                              ))}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                   <Card className="premium-card bg-white/[0.02] border-white/5 p-10">
                      <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-accent" /> Recommended Projects
                      </h4>
                      <div className="space-y-4">
                        {currentRoadmap.recommendedProjects?.map((proj: string, i: number) => (
                          <div key={i} className="p-5 glass rounded-2xl border-white/5 flex items-center justify-between group cursor-default">
                            <span className="text-sm font-light">{proj}</span>
                            <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-accent transition-colors" />
                          </div>
                        ))}
                      </div>
                   </Card>
                   <Card className="premium-card bg-white/[0.02] border-white/5 p-10">
                      <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Rocket className="w-6 h-6 text-purple-400" /> Prep Directives
                      </h4>
                      <div className="space-y-4">
                        {currentRoadmap.interviewPrepTasks?.map((task: string, i: number) => (
                          <div key={i} className="flex gap-4 items-center p-4 glass rounded-2xl border-white/5 text-sm font-light">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                            {task}
                          </div>
                        ))}
                      </div>
                   </Card>
                </div>
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
