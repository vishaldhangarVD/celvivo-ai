'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Lock, 
  Zap, 
  Loader2, 
  Trophy,
  ChevronRight
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ROADMAP_DEFINITIONS } from '@/lib/roadmap-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

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
        <Button onClick={() => router.push('/roadmap')}>Return to Command Hub</Button>
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
        title: "Neural Node Mastered",
        description: "Progress synchronized with cloud archives.",
      });

      if (progress === 100) {
        toast({
          title: "Curriculum Mastery!",
          description: "Full career roadmap completed.",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Sync Failure",
        description: "Could not persist mastery node."
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

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-5xl mx-auto">
          
          <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
                Interactive Learning Path
              </Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">
                {roadmap.title} <span className="text-gradient-purple">Intelligence.</span>
              </h1>
              <p className="text-xl text-muted-foreground font-light max-xl">
                Master the curriculum nodes sequentially to achieve {roadmap.title} elite certification.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-right"
            >
              <div className="text-6xl font-bold text-accent tabular-nums mb-1">{currentProgress}%</div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Mastery Index</p>
            </motion.div>
          </header>

          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-24 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            />
          </div>

          <div className="relative space-y-12">
            <div className="absolute left-[31px] top-8 bottom-8 w-px bg-gradient-to-b from-accent/30 via-white/5 to-transparent z-0 hidden md:block" />

            {roadmap.steps.map((step, i) => {
              const unlocked = isUnlocked(i);
              const completed = completedTopics.includes(step.id);
              const isCurrent = unlocked && !completed;

              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative z-10 flex flex-col md:flex-row gap-8 md:items-start group"
                >
                  <div className="relative shrink-0 pt-2 flex justify-center md:block">
                    <motion.div 
                      animate={isCurrent ? { 
                        boxShadow: ["0 0 0px rgba(34,211,238,0)", "0 0 20px rgba(34,211,238,0.3)", "0 0 0px rgba(34,211,238,0)"] 
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500",
                        completed ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                        unlocked ? 'bg-white/5 border-accent/40 text-accent' :
                        'bg-black/40 border-white/5 text-white/10'
                      )}
                    >
                      {completed ? <CheckCircle2 className="w-8 h-8" /> : 
                       unlocked ? <Zap className={`w-7 h-7 ${isCurrent ? 'animate-pulse' : ''}`} /> : 
                       <Lock className="w-7 h-7" />}
                    </motion.div>
                  </div>

                  <Card className={cn(
                    "flex-1 premium-card p-10 transition-all duration-500",
                    !unlocked ? 'opacity-30 grayscale' : 
                    completed ? 'border-green-500/10 bg-green-500/[0.01]' : 
                    'hover:bg-white/[0.02] border-white/10 bg-white/[0.01]'
                  )}>
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", unlocked ? 'text-accent' : 'text-white/20')}>Node 0{i + 1}</span>
                          {completed && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] uppercase font-bold tracking-widest">Protocol Mastered</Badge>
                            </motion.div>
                          )}
                          {isCurrent && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-none text-[8px] uppercase font-bold tracking-widest animate-pulse">Active Focus</Badge>
                          )}
                        </div>
                        <h3 className={cn("text-2xl font-bold tracking-tight transition-colors", unlocked ? 'text-white' : 'text-white/20')}>{step.title}</h3>
                        <p className={cn("text-lg font-light leading-relaxed max-w-2xl transition-colors", unlocked ? 'text-muted-foreground' : 'text-white/10')}>
                          {step.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <AnimatePresence mode="wait">
                          {unlocked && !completed ? (
                            <motion.div
                              key="complete-btn"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                            >
                              <Button 
                                onClick={() => handleCompleteTopic(step.id)}
                                disabled={isUpdating}
                                className="h-16 px-10 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs btn-premium shadow-2xl"
                              >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Node'}
                              </Button>
                            </motion.div>
                          ) : completed ? (
                            <motion.div 
                              key="completed-label"
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2 text-green-400"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Archived</span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-2 text-white/10">
                              <Lock className="w-5 h-5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Locked</span>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {currentProgress === 100 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mt-20 p-12 glass rounded-[3rem] border-accent/20 bg-accent/5 text-center space-y-8"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
                  <div className="relative w-full h-full rounded-full bg-accent/20 flex items-center justify-center shadow-2xl border border-accent/30">
                    <Trophy className="w-12 h-12 text-accent" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter">Mission Success.</h2>
                  <p className="text-muted-foreground font-light max-sm mx-auto mt-2">
                    You have achieved 100% mastery on the {roadmap.title} track.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button onClick={() => router.push('/certificates')} className="h-14 px-10 rounded-2xl btn-premium font-bold uppercase tracking-widest text-xs">
                    Claim Credential
                  </Button>
                  <Button onClick={() => router.push('/roadmap')} variant="outline" className="h-14 px-10 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs">
                    Explore Other Paths
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
