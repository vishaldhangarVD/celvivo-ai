"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  Zap, 
  Target, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  BrainCircuit, 
  Code2, 
  Cpu,
  ChevronRight,
  Loader2,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Star,
  Flame,
  Lightbulb,
  Rocket,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { generatePersonalizedRoadmap, type LearningRoadmapOutput } from '@/ai/flows/ai-learning-roadmap';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PersonalizedRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [roadmap, setRoadmap] = useState<LearningRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);

  const interviewId = params.id as string;

  useEffect(() => {
    async function initializeRoadmap() {
      if (!user || !db || !interviewId) return;

      try {
        // 1. Check persistence
        const existingRef = doc(db, 'users', user.uid, 'roadmaps', interviewId);
        const existingSnap = await getDoc(existingRef);

        if (existingSnap.exists()) {
          setRoadmap(existingSnap.data() as LearningRoadmapOutput);
          setIsLoading(false);
          return;
        }

        // 2. Fetch required context
        const sessionRef = doc(db, 'users', user.uid, 'interviews', interviewId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          toast({ variant: "destructive", title: "Session Not Found", description: "Assessment dossier unavailable." });
          router.push('/dashboard');
          return;
        }

        const session = sessionSnap.data();
        const feedback = session.feedback;

        // Fetch latest resume context if available
        const resumesRef = collection(db, 'users', user.uid, 'resumes');
        const resumeSnap = await getDocs(query(resumesRef, orderBy('createdAt', 'desc'), limit(1)));
        const latestResume = !resumeSnap.empty ? resumeSnap.docs[0].data() : null;

        // 3. Trigger Synthesis
        const result = await generatePersonalizedRoadmap({
          role: session.role,
          company: session.company,
          experienceLevel: session.experienceLevel,
          transcript: session.history?.map((t: any) => `${t.role}: ${t.text}`).join('\n') || "",
          resumeContext: latestResume ? {
            skills: latestResume.analysis?.skillAnalysis?.map((s: any) => s.skill) || [],
            missingSkills: latestResume.analysis?.missingSkills || [],
            weaknesses: latestResume.analysis?.weaknesses || [],
          } : undefined,
          interviewFeedback: {
            weakSkills: feedback.aiFeedback?.weakSkills || [],
            mistakesMade: feedback.aiFeedback?.mistakesMade || [],
            scores: {
              technical: feedback.virtualInterviewResult?.technicalKnowledge || 0,
              communication: feedback.virtualInterviewResult?.communication || 0,
              problemSolving: feedback.virtualInterviewResult?.problemSolving || 0,
            }
          },
          aptitudeScore: session.aptitudeScore || 0,
          codingScore: session.codingScore || 0
        });

        // 4. Persist
        await setDoc(existingRef, {
          ...result,
          createdAt: new Date().toISOString(),
          interviewId
        });

        setRoadmap(result);
      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Synthesis Error", description: "Failed to architect evolution path." });
      } finally {
        setIsLoading(false);
      }
    }

    initializeRoadmap();
  }, [user, db, interviewId, router, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-8">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          <Map className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter text-premium">Architecting Personalized Roadmap...</h2>
          <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px]">Mapping multi-round performance vectors</p>
        </div>
      </div>
    );
  }

  if (!roadmap) return (
     <div className="h-screen flex flex-col items-center justify-center bg-[#050816] p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold">Insufficient Assessment Data</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">Complete a full interview session to generate a personalized roadmap.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-8">Return to Dashboard</Button>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Evidence-Based Growth Path</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">Career <br /><span className="text-gradient-purple">Roadmap.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-xl">A 5-phase evolution roadmap calibrated from your simulation performance.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-4xl font-bold text-accent">{roadmap.estimatedTimeToReadiness}</div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground text-right">Target Readiness Horizon</p>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/20 p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-8 h-8 text-accent" />
                  <h3 className="text-xl font-bold">Skill Priorities</h3>
                </div>
                <div className="space-y-4">
                  {roadmap.skillGapPriority.map((item, i) => (
                    <div key={i} className="p-4 glass rounded-xl border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white">{item.skill}</span>
                        <Badge className={cn(
                          "text-[8px] font-black uppercase py-0.5",
                          item.priority === 'High' ? 'bg-red-500/20 text-red-400' : 
                          item.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                        )}>{item.priority}</span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Daily Mastery Protocol</h3>
                </div>
                <div className="space-y-6">
                  {roadmap.dailyRoutine.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                      <p className="text-xs font-light text-white/70 leading-relaxed italic">"{item}"</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Soft Skill Optimization</h3>
                <div className="space-y-4">
                  {roadmap.softSkillDirectives.map((item, i) => (
                    <div key={i} className="p-4 glass rounded-xl border-white/5 flex items-center gap-4">
                      <BrainCircuit className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-light text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-4">
                 <Button onClick={() => router.push('/dashboard')} className="w-full h-16 rounded-2xl glass border-white/10 flex gap-4 uppercase tracking-[0.3em] text-[10px] font-bold">
                    <LayoutDashboard className="w-4 h-4" /> Return to Command
                 </Button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-12">
              <div className="grid grid-cols-5 gap-2 p-2 glass rounded-[2.5rem] bg-white/[0.01] border-white/5">
                {roadmap.phases.map((phase, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhaseIdx(idx)}
                    className={cn(
                      "h-20 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500",
                      activePhaseIdx === idx ? 'bg-accent/20 border border-accent/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'hover:bg-white/5 opacity-40'
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Phase {idx + 1}</span>
                    <span className="text-[8px] font-light text-muted-foreground mt-1 truncate px-2">{phase.title}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-4">
                   <Zap className="w-6 h-6 text-accent" />
                   <h2 className="text-2xl font-bold">{roadmap.phases[activePhaseIdx].title}</h2>
                   <Badge variant="outline" className="border-white/10 text-white/40">{roadmap.phases[activePhaseIdx].duration}</Badge>
                </div>

                {roadmap.phases[activePhaseIdx].modules.map((module, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10 relative overflow-hidden group hover:bg-white/[0.03] transition-all">
                      <div className="absolute top-0 right-0 p-8">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/10 group-hover:text-accent/20 transition-colors">Node {activePhaseIdx + 1}.{i + 1}</span>
                      </div>
                      
                      <div className="space-y-8">
                        <div className="grid md:grid-cols-12 gap-8">
                          <div className="md:col-span-4 space-y-4">
                            <h3 className="text-2xl font-bold text-white leading-tight">{module.title}</h3>
                            <div className="flex items-center gap-2">
                               <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Current Node Level:</p>
                               <Badge variant="outline" className="text-[8px] uppercase font-bold border-accent/30 text-accent">{module.currentLevel}</Badge>
                            </div>
                            <div className="p-4 glass rounded-xl border-accent/10 bg-accent/[0.01]">
                               <p className="text-[9px] font-black uppercase text-accent tracking-widest mb-2 flex items-center gap-2">
                                 <Lightbulb className="w-3 h-3" /> Why this matters
                               </p>
                               <p className="text-xs font-light text-white/70 leading-relaxed italic">{module.evidence}</p>
                            </div>
                          </div>
                          <div className="md:col-span-8 space-y-6">
                            <div className="space-y-3">
                               <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Mastery Tasks</p>
                               <div className="grid gap-3">
                                 {module.tasks.map((task, j) => (
                                   <div key={j} className="flex items-start gap-4 p-4 glass rounded-2xl border-white/5 hover:border-accent/20 transition-all">
                                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                      <p className="text-xs font-light text-white/80">{task}</p>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                           <div className="p-6 glass rounded-[2rem] border-purple-500/10 space-y-3">
                              <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                <Rocket className="w-3 h-3" /> Project Laboratory
                              </h4>
                              <p className="text-xs font-light text-white/70 leading-relaxed">{module.realWorldProject}</p>
                           </div>
                           <div className="p-6 glass rounded-[2rem] border-green-500/10 space-y-3">
                              <h4 className="text-[9px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> Validation Goal
                              </h4>
                              <p className="text-xs font-light text-white/70 leading-relaxed">{module.validationCriteria}</p>
                           </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
