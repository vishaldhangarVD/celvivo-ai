"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Rocket
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generatePersonalizedRoadmap, type LearningRoadmapOutput } from '@/ai/flows/ai-learning-roadmap';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PersonalizedRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [roadmap, setRoadmap] = useState<LearningRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<'horizon1' | 'horizon2' | 'horizon3'>('horizon1');

  const interviewId = params.id as string;

  useEffect(() => {
    async function initializeRoadmap() {
      if (!user || !db || !interviewId) return;

      try {
        // 1. Check if roadmap already exists in user's roadmaps collection
        const existingRef = doc(db, 'users', user.uid, 'roadmaps', interviewId);
        const existingSnap = await getDoc(existingRef);

        if (existingSnap.exists()) {
          setRoadmap(existingSnap.data() as LearningRoadmapOutput);
          setIsLoading(false);
          return;
        }

        // 2. If not, fetch the interview session to generate it
        const sessionRef = doc(db, 'users', user.uid, 'interviews', interviewId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          toast({ variant: "destructive", title: "Session Not Found", description: "Could not retrieve assessment dossiers." });
          router.push('/dashboard');
          return;
        }

        const session = sessionSnap.data();
        const feedback = session.feedback;

        // 3. Trigger AI Synthesis
        const result = await generatePersonalizedRoadmap({
          role: session.role,
          company: session.company,
          experienceLevel: session.experienceLevel,
          resumeContext: {
            missingSkills: feedback.skillGap.missingSkills,
            weaknesses: feedback.aiFeedback.weakSkills,
          },
          aptitudeContext: {
            weakCategories: [feedback.aiFeedback.weakSkills[0] || "Logic"],
            speedAnalysis: "Analyze speed relative to complexity.",
          },
          codingContext: {
            optimizationTips: feedback.learningPlan.codingPractice,
            complexityIssues: feedback.aiFeedback.mistakesMade[0] || "Standard Big-O deviations.",
          },
          interviewContext: {
            weakSkills: feedback.aiFeedback.weakSkills,
            mistakesMade: feedback.aiFeedback.mistakesMade,
            communicationFeedback: feedback.aiFeedback.performanceSummary,
          }
        });

        // 4. Save for future access
        await setDoc(existingRef, {
          ...result,
          createdAt: new Date().toISOString(),
          interviewId
        });

        setRoadmap(result);
      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Synthesis Error", description: "Failed to architect personalized evolution path." });
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
          <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px]">Mapping your evolution horizon v5.0</p>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Personalized Evolution Protocol</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">Career <br /><span className="text-gradient-purple">Roadmap.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-xl">Bespoke 90-day learning timeline calibrated for elite performance.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-4xl font-bold text-accent">{roadmap.estimatedTimeToReadiness}</div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Estimated Time to Readiness</p>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Main Evolution Timeline */}
            <div className="lg:col-span-8 space-y-12">
              
              <div className="flex gap-4 p-2 glass rounded-[2.5rem] bg-white/[0.01] border-white/5">
                {(['horizon1', 'horizon2', 'horizon3'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setActivePhase(h)}
                    className={`flex-1 h-20 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 ${
                      activePhase === h ? 'bg-accent/20 border border-accent/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'hover:bg-white/5 opacity-40'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">{roadmap.phases[h].title}</span>
                    <span className="text-xs font-light text-muted-foreground mt-1">{roadmap.phases[h].duration}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                {roadmap.phases[activePhase].modules.map((module, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10 relative overflow-hidden group hover:bg-white/[0.03] transition-all">
                      <div className="absolute top-0 right-0 p-8">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/10 group-hover:text-accent/20 transition-colors">Node 0{i + 1}</span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 space-y-4">
                          <h3 className="text-2xl font-bold text-white leading-tight">{module.title}</h3>
                          <p className="text-sm font-light text-muted-foreground leading-relaxed">{module.desc}</p>
                          <Badge variant="outline" className="border-accent/30 text-accent text-[8px] uppercase tracking-widest px-3 py-1">
                            {module.milestone}
                          </Badge>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-1 gap-4">
                          {module.tasks.map((task, j) => (
                            <div key={j} className="flex items-start gap-4 p-5 glass rounded-2xl border-white/5 hover:border-accent/20 transition-all">
                              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                              <p className="text-sm font-light text-white/80">{task}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recommended Projects Node */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  <h3 className="text-2xl font-bold tracking-tight">Project Laboratory</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {roadmap.recommendedProjects.map((proj, i) => (
                    <Card key={i} className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-6 group hover:border-purple-500/20 transition-all">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{proj.name}</h4>
                        <Badge className="bg-purple-500/10 text-purple-400 border-none text-[8px] font-bold uppercase">{proj.difficulty}</Badge>
                      </div>
                      <p className="text-sm font-light text-muted-foreground leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {proj.techStack.map((tech, j) => (
                          <Badge key={j} variant="outline" className="text-[8px] border-white/10 uppercase">{tech}</Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategy Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              
              <Card className="premium-card bg-accent/5 border-accent/20 p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <Flame className="w-8 h-8 text-accent animate-pulse" />
                  <h3 className="text-xl font-bold">Daily Protocol</h3>
                </div>
                <div className="space-y-6">
                  {roadmap.dailyRoutine.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                      <p className="text-sm font-light text-white/80 italic">"{item}"</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Weekly Learning Goals</h3>
                <div className="space-y-4">
                  {roadmap.weeklyGoals.map((goal, i) => (
                    <div key={i} className="p-4 glass rounded-xl border-white/5 flex items-center gap-4">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-xs font-light text-white/60">{goal}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Syntax Practice Directives</h3>
                <div className="space-y-4">
                  {roadmap.codingPracticeSuggestions.map((item, i) => (
                    <div key={i} className="p-4 glass rounded-xl border-white/5 flex items-center gap-4 group hover:bg-white/5 transition-all">
                      <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-xs font-light text-white/60 group-hover:text-white transition-colors">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Soft Skill Optimization</h3>
                <div className="space-y-4">
                  {roadmap.softSkillDirectives.map((item, i) => (
                    <div key={i} className="p-4 glass rounded-xl border-white/5 flex items-center gap-4">
                      <BrainCircuit className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-xs font-light text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-4">
                 <Button onClick={() => router.push('/dashboard')} className="w-full h-16 rounded-2xl glass border-white/10 flex gap-4 uppercase tracking-[0.3em] text-[10px] font-bold">
                    <LayoutDashboard className="w-4 h-4" /> Return to Command
                 </Button>
                 <Button onClick={() => router.push('/interview')} className="w-full h-16 rounded-2xl btn-premium flex gap-4 uppercase tracking-[0.3em] text-[10px] font-bold shadow-2xl">
                    <Zap className="w-4 h-4" /> Retry Assessment
                 </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
