'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Lock, 
  Zap, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  Circle,
  Trophy
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ROADMAP_DEFINITIONS } from '@/lib/roadmap-data';
import { useToast } from '@/hooks/use-toast';

export default function CareerRoadmapDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const path = params.path as string;
  const roadmap = ROADMAP_DEFINITIONS[path];

  const roadmapRef = useMemo(() => {
    if (!db || !user?.uid || !path) return null;
    return doc(db, 'users', user.uid, 'roadmaps', path);
  }, [db, user?.uid, path]);

  const { data: userProgress, loading: dataLoading } = useDoc(roadmapRef);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Protocol Path Not Found</h1>
        <Button onClick={() => router.push('/roadmap')}>Return to Command</Button>
      </div>
    );
  }

  const completedTopics = (userProgress as any)?.completedTopics || [];
  const currentProgress = (userProgress as any)?.progress || 0;

  const handleCompleteTopic = async (topicId: string) => {
    if (!user || !db || !roadmapRef || isUpdating) return;

    setIsUpdating(true);
    try {
      const newCompleted = [...new Set([...completedTopics, topicId])];
      const progress = Math.round((newCompleted.length / roadmap.steps.length) * 100);

      await setDoc(roadmapRef, {
        progress,
        completedTopics: newCompleted,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Node Synchronized",
        description: "Your technical mastery has been updated in the cloud archives.",
      });

      if (progress === 100) {
        toast({
          title: "Curriculum Mastery Achieved!",
          description: "You have completed the full neural roadmap for this career track.",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to persist mastery node to Firestore."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    const previousTopicId = roadmap.steps[index - 1].id;
    return completedTopics.includes(previousTopicId);
  };

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
                Neural Growth Track
              </Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">
                {roadmap.title} <span className="text-gradient-purple">Pathway.</span>
              </h1>
              <p className="text-xl text-muted-foreground font-light max-w-xl">
                {roadmap.description}
              </p>
            </div>

            <div className="text-right">
              <div className="text-6xl font-bold text-accent tabular-nums mb-1">{currentProgress}%</div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Mastery Index</p>
            </div>
          </header>

          {/* Progress Visualizer */}
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-24 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            />
          </div>

          {/* Learning Path */}
          <div className="relative space-y-12">
            {/* Connecting Line */}
            <div className="absolute left-[31px] top-8 bottom-8 w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent z-0 hidden md:block" />

            {roadmap.steps.map((step, i) => {
              const unlocked = isUnlocked(i);
              const completed = completedTopics.includes(step.id);
              const isCurrent = unlocked && !completed;

              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative z-10 flex flex-col md:flex-row gap-8 md:items-start group"
                >
                  {/* Status Indicator */}
                  <div className="relative shrink-0 pt-2 flex justify-center md:block">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                      completed ? 'bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]' :
                      unlocked ? 'bg-white/5 border-white/20 text-white group-hover:border-accent/50' :
                      'bg-black/40 border-white/5 text-white/20'
                    }`}>
                      {completed ? <CheckCircle2 className="w-8 h-8" /> : 
                       unlocked ? <Zap className={`w-7 h-7 ${isCurrent ? 'animate-pulse text-accent' : ''}`} /> : 
                       <Lock className="w-7 h-7" />}
                    </div>
                  </div>

                  {/* Step Content */}
                  <Card className={`flex-1 premium-card p-10 transition-all duration-500 ${
                    !unlocked ? 'opacity-40 grayscale pointer-events-none' : 
                    completed ? 'border-accent/10 bg-accent/[0.02]' : 
                    'hover:bg-white/[0.02] border-white/5'
                  }`}>
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Module 0{i + 1}</span>
                          {completed && <Badge className="bg-accent/20 text-accent border-none text-[8px] uppercase font-bold tracking-widest">Mastered</Badge>}
                          {isCurrent && <Badge className="bg-purple-500/20 text-purple-400 border-none text-[8px] uppercase font-bold tracking-widest animate-pulse">Active Node</Badge>}
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-white">{step.title}</h3>
                        <p className="text-lg font-light text-muted-foreground leading-relaxed max-w-2xl">
                          {step.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <Button 
                          onClick={() => handleCompleteTopic(step.id)}
                          disabled={!unlocked || completed || isUpdating}
                          className={`h-16 px-10 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all ${
                            completed ? 'bg-white/5 text-white/20 border-white/5 cursor-default' : 
                            'btn-premium shadow-2xl'
                          }`}
                        >
                          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                           completed ? 'Node Mastered' : 'Complete Topic'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Achievement Footer */}
            {currentProgress === 100 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-20 p-12 glass rounded-[3rem] border-accent/20 bg-accent/5 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto shadow-2xl">
                  <Trophy className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-4xl font-bold tracking-tighter">Career Mastery Validated</h2>
                <p className="text-muted-foreground font-light max-w-sm mx-auto">
                  You have successfully navigated the neural roadmap for the {roadmap.title} track.
                </p>
                <Button onClick={() => router.push('/certificates')} variant="outline" className="h-14 px-10 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs">
                  Claim Performance Credential
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
