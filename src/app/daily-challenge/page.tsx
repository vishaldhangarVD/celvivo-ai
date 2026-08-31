'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, 
  BrainCircuit, 
  Trophy, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Flame,
  Award,
  ArrowRight,
  History,
  Sparkles,
  Timer
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getQuestionOfTheDay } from '@/lib/daily-questions';
import { generateDailyQuestion } from '@/ai/flows/ai-daily-question-generator';
import { evaluateDailyChallenge, type EvaluationOutput } from '@/ai/flows/ai-daily-challenge-eval';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function DailyChallengePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationOutput | null>(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    async function initializeProtocol() {
      if (!user || !db) return;
      
      try {
        // 1. Check Completion Status & Streak
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setStreak(data.currentStreak || 0);
          if (data.lastChallengeDate === todayStr) {
            setHasCompletedToday(true);
          }
        }

        // 2. Fetch/Generate Daily Question
        const cacheKey = `nexvoro_daily_q_${todayStr}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          setQuestion(JSON.parse(cached));
        } else {
          try {
            const dynamicQuestion = await generateDailyQuestion(todayStr);
            localStorage.setItem(cacheKey, JSON.stringify(dynamicQuestion));
            setQuestion(dynamicQuestion);
          } catch (aiError) {
            console.warn("[Daily Challenge] AI Generation failed, using static fallback.");
            const fallback = getQuestionOfTheDay();
            setQuestion(fallback);
          }
        }
      } catch (err) {
        console.error("[Daily Challenge] Protocol init error:", err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    initializeProtocol();
  }, [user, db, todayStr]);

  const handleSubmit = async () => {
    if (!answer.trim() || !user || !db || !question) return;
    
    setIsEvaluating(true);
    try {
      const evalResult = await evaluateDailyChallenge({
        question: question.question,
        answer: answer,
        category: question.category
      });
      
      setResult(evalResult);

      // Persistence Logic
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      const lastDate = userData?.lastChallengeDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = 1;
      if (lastDate === yesterdayStr) {
        newStreak = (userData?.currentStreak || 0) + 1;
      } else if (lastDate === todayStr) {
        newStreak = userData?.currentStreak || 0;
      }

      const bestStreak = Math.max(userData?.bestStreak || 0, newStreak);

      await updateDoc(userRef, {
        currentStreak: newStreak,
        bestStreak: bestStreak,
        lastChallengeDate: todayStr
      });

      await addDoc(collection(db, 'users', user.uid, 'daily_challenges'), {
        question: question.question,
        category: question.category,
        answer: answer,
        score: evalResult.score,
        feedback: evalResult.feedback,
        tips: evalResult.improvementTips,
        completedAt: serverTimestamp()
      });

      setStreak(newStreak);
      setHasCompletedToday(true);
      
      toast({
        title: "Challenge Secured",
        description: `Neural streak active: ${newStreak} days!`,
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Evaluation Fault", description: "Could not analyze response node." });
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isInitialLoading || !question) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="relative">
             <div className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
             <BrainCircuit className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Daily Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <header className="text-center space-y-4">
            <Badge className="bg-accent/20 text-accent mb-4 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Habit Protocol</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Daily <span className="text-gradient-purple">Challenge.</span></h1>
            <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
              Complete one strategic prompt every 24 hours to maintain cognitive momentum and expand your neural streak.
            </p>
          </header>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              {!result && !hasCompletedToday ? (
                <Card className="premium-card bg-white/[0.02] border-white/5 p-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-accent/30 text-accent px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
                      {question.category} Track
                    </Badge>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Timer className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Resets in 14h</span>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-white/90">
                    {question.question}
                  </h2>

                  <div className="space-y-6">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 ml-2">Your Professional Insight</label>
                    <Textarea 
                      placeholder="Synthesize your response..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-[250px] rounded-[2rem] glass border-white/10 bg-transparent p-8 text-lg font-light leading-relaxed resize-none focus:border-accent transition-all"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isEvaluating}
                    className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em] shadow-[0_0_60px_rgba(147,51,234,0.2)]"
                  >
                    {isEvaluating ? (
                      <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Analyzing Intelligence...</>
                    ) : (
                      <><Send className="w-5 h-5 mr-3" /> Transmit Response</>
                    )}
                  </Button>
                </Card>
              ) : (
                <div className="space-y-8">
                  {hasCompletedToday && !result && (
                    <Card className="premium-card bg-accent/5 border-accent/20 p-12 text-center">
                      <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8 border border-accent/30 shadow-2xl">
                        <CheckCircle2 className="w-10 h-10 text-accent" />
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Challenge Secured</h3>
                      <p className="text-muted-foreground font-light mb-10 max-w-sm mx-auto">
                        Your professional node for today is synchronized. Return in 24 hours for the next calibration.
                      </p>
                      <Link href="/dashboard">
                        <Button variant="outline" className="h-14 px-10 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest">Return to Command Center</Button>
                      </Link>
                    </Card>
                  )}

                  {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <Card className="premium-card bg-white/[0.02] border-white/5 p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
                          <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold mb-2">Evaluation Complete</h3>
                            <p className="text-sm text-muted-foreground font-light uppercase tracking-widest">Neural Precision Index</p>
                          </div>
                          <div className="text-7xl font-bold text-gradient-purple">{result.score}%</div>
                        </div>

                        <div className="p-8 glass rounded-[2.5rem] bg-accent/[0.02] border-accent/10 mb-12">
                          <div className="flex items-center gap-3 text-accent mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Executive Feedback</span>
                          </div>
                          <p className="text-lg font-light leading-relaxed text-white/80 italic">"{result.feedback}"</p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Improvement Roadmaps</h4>
                          <div className="grid gap-4">
                            {result.improvementTips.map((tip, i) => (
                              <div key={i} className="flex items-start gap-4 p-5 glass rounded-2xl border-white/5">
                                <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                                <p className="text-sm font-light text-white/70">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-orange-500/5 border-orange-500/20 p-8">
                <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-orange-400">
                    <Flame className="w-6 h-6" /> Neural Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                  <div className="text-center py-6">
                    <div className="text-6xl font-bold tabular-nums text-white mb-2">{streak}</div>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-orange-400/60">Consecutive Days</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Milestone Progress</p>
                    {[
                      { days: 7, label: "Bronze Badge", color: "text-orange-300" },
                      { days: 30, label: "Silver Badge", color: "text-gray-300" },
                      { days: 100, label: "Gold Badge", color: "text-yellow-400" }
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                        <div className="flex items-center gap-3">
                          <Award className={`w-4 h-4 ${streak >= m.days ? m.color : 'text-white/10'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${streak >= m.days ? 'text-white' : 'text-white/20'}`}>{m.label}</span>
                        </div>
                        <div className="text-[10px] font-bold tabular-nums text-white/20">{Math.min(streak, m.days)}/{m.days}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-3">
                    <History className="w-5 h-5 text-accent" /> History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <p className="text-xs text-muted-foreground font-light text-center py-10 italic">Archival records synced to Pulse.</p>
                  <Link href="/user-dashboard">
                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/10">View Log History</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
