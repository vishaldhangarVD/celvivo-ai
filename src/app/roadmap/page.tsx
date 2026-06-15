'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  BrainCircuit,
  Rocket,
  Loader2,
  CheckCircle2,
  Layers,
  Zap,
  RefreshCcw,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLearningRoadmap } from '@/ai/flows/ai-learning-roadmap';
import { useToast } from '@/hooks/use-toast';

export default function CareerRoadmap() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTier, setActiveTier] = useState("30");
  const [isGenerating, setIsGenerating] = useState(false);

  const roadmapQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'roadmaps'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestRoadmaps } = useCollection(roadmapQuery);

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
        plans: {
          thirtyDay: result.plans.thirtyDay || [],
          sixtyDay: result.plans.sixtyDay || [],
          ninetyDay: result.plans.ninetyDay || []
        },
        recommendedProjects: result.recommendedProjects || [],
        interviewPrepTasks: result.interviewPrepTasks || [],
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

          {!currentRoadmap && !isGenerating ? (
            <Card className="premium-card bg-white/[0.01] border-white/5 p-16 text-center">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-10 border border-accent/20">
                <Target className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-6">No Roadmap Detected</h2>
              <p className="text-muted-foreground font-light max-w-md mx-auto mb-12 leading-relaxed">
                We need a skill gap analysis to architect your personalized growth trajectory. Initialize the process now.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/skill-gap">
                  <Button className="h-16 px-10 btn-premium flex gap-3 text-xs font-bold uppercase tracking-widest">
                    <BrainCircuit className="w-5 h-5" /> Analyze Skill Gaps
                  </Button>
                </Link>
                <Button 
                  onClick={handleGenerateRoadmap}
                  variant="outline" 
                  className="h-16 px-10 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                >
                  Force Generation
                </Button>
              </div>
            </Card>
          ) : isGenerating ? (
            <div className="py-40 flex flex-col items-center gap-10">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-40 h-40 rounded-full border-2 border-accent/10 border-t-accent shadow-[0_0_50px_rgba(34,211,238,0.2)]"
                />
                <Rocket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-accent animate-pulse" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-bold tracking-tighter text-premium uppercase italic">Synthesizing 90-Day Blueprint...</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold">Aligning Knowledge Nodes with Industry Standards</p>
              </div>
            </div>
          ) : currentRoadmap && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter">{currentRoadmap.role} Path</h2>
                  <p className="text-muted-foreground font-light">Last calibrated: {currentRoadmap.createdAt?.seconds ? new Date(currentRoadmap.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
                </div>
                <Button 
                  onClick={handleGenerateRoadmap}
                  variant="outline" 
                  className="h-12 px-6 rounded-xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest flex gap-2"
                >
                  <RefreshCcw className="w-4 h-4" /> Recalibrate Pathway
                </Button>
              </div>

              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                  <Tabs value={activeTier} onValueChange={setActiveTier} className="w-full">
                    <TabsList className="glass border-white/5 p-2 rounded-[2rem] h-auto mb-10 w-full md:w-fit">
                      <TabsTrigger value="30" className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest">30-Day Protocol</TabsTrigger>
                      <TabsTrigger value="60" className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest">60-Day Evolution</TabsTrigger>
                      <TabsTrigger value="90" className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest">90-Day Mastery</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent key={activeTier} value={activeTier} className="space-y-6">
                        {((activeTier === "30" ? currentRoadmap.plans?.thirtyDay : activeTier === "60" ? currentRoadmap.plans?.sixtyDay : currentRoadmap.plans?.ninetyDay) || []).map((module: any, i: number) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i}
                          >
                            <Card className="glass p-8 rounded-[2.5rem] border-white/5 group hover:bg-white/[0.04] transition-all">
                              <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                  <span className="text-xl font-bold text-accent">0{i+1}</span>
                                </div>
                                <div className="space-y-6 flex-1">
                                  <div>
                                    <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                                    <p className="text-sm font-light text-white/50">{module.desc}</p>
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {(module.tasks || []).map((task: string, j: number) => (
                                      <div key={j} className="flex items-center gap-4 p-4 glass rounded-2xl border-white/5 bg-white/[0.01]">
                                        <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                                        <span className="text-xs font-light text-white/80">{task}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="text-lg font-bold flex items-center gap-3">
                        <Zap className="w-5 h-5 text-purple-400" /> Recommended Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      {(currentRoadmap.recommendedProjects || []).map((proj: string, i: number) => (
                        <div key={i} className="p-4 glass rounded-2xl border-white/5 text-xs font-light text-white/70 leading-relaxed italic">
                          &quot;{proj}&quot;
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="premium-card bg-accent/5 border-accent/10 p-8">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="text-lg font-bold flex items-center gap-3">
                        <Layers className="w-5 h-5 text-accent" /> Prep Protocols
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      {(currentRoadmap.interviewPrepTasks || []).map((task: string, i: number) => (
                        <div key={i} className="flex items-center gap-4">
                          <CheckCircle2 className="w-4 h-4 text-accent/50 shrink-0" />
                          <span className="text-xs font-light text-white/80">{task}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Link href="/dashboard" className="block">
                    <Button variant="ghost" className="w-full h-14 rounded-2xl border border-dashed border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest flex gap-3">
                      <LayoutDashboard className="w-4 h-4" /> Return to Command
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}