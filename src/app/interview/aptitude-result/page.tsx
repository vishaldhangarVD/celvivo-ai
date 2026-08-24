"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Target, 
  ChevronRight,
  Loader2,
  AlertCircle,
  History,
  CircleCheck,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { cn } from '@/lib/utils';

export default function AptitudeResultPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading } = useDoc(journeyRef);

  const handleProceed = async () => {
    if (!journeyRef) return;
    
    await updateDoc(journeyRef, {
      currentStage: INTERVIEW_STAGES.CODING,
      step: 6,
      codingUnlocked: true,
      updatedAt: serverTimestamp(),
    });

    router.push(STAGE_ROUTES.CODING);
  };

  const handleRetry = async () => {
    if (!journeyRef) return;
    
    await updateDoc(journeyRef, {
      currentStage: INTERVIEW_STAGES.APTITUDE,
      aptitudeStatus: "not_started",
      aptitudeReport: null,
      aptitudeAnswers: null,
      updatedAt: serverTimestamp(),
    });

    router.push(STAGE_ROUTES.APTITUDE);
  };

  if (loading) return <div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  const result = journey?.aptitudeReport;

  if (!result) {
    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold">Report Missing</h2>
        <Button onClick={() => router.push('/interview?action=resume')} className="mt-8">Resume Journey</Button>
      </div>
    );
  }

  const isPassed = result.status === 'Pass';

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="text-center space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Stage 05: Evaluation</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Aptitude <span className="text-gradient-purple">Result.</span></h1>
          </header>

          <Card className="premium-card p-16 flex flex-col items-center text-center space-y-12 bg-white/[0.01] border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12">
              <Badge className={cn("px-10 py-4 rounded-2xl font-black tracking-[0.4em] text-xs border-none", 
                isPassed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                STATUS: {result.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="relative">
               <div className={cn("text-[140px] font-black tracking-tighter tabular-nums leading-none drop-shadow-[0_0_60px_rgba(34,211,238,0.2)]", 
                 isPassed ? "text-accent" : "text-red-400")}>
                 {result.overallScore}%
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.8em] text-accent mt-4">Cognitive Precision Index</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-5xl pt-12 border-t border-white/5">
              {[
                { label: "Correct Nodes", val: result.correctCount, icon: CheckCircle2, color: "text-green-400" },
                { label: "Failed Probes", val: result.wrongCount, icon: XCircle, color: "text-red-400" },
                { label: "Not Answered", val: result.notAnsweredCount || 0, icon: AlertCircle, color: "text-orange-400" },
                { label: "Accuracy", val: `${result.accuracy}%`, icon: Target, color: "text-purple-400" }
              ].map((s, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase text-white/30"><s.icon className={cn("w-4 h-4", s.color)} /> {s.label}</div>
                  <p className="text-3xl font-bold text-white/90">{s.val}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-center gap-6">
            {isPassed ? (
              <Button onClick={handleProceed} className="h-20 px-24 btn-premium rounded-[2.5rem] text-xl font-black uppercase tracking-[0.4em] shadow-2xl group">
                Proceed to Coding Round <ArrowRight className="ml-4 w-8 h-8 transition-transform group-hover:translate-x-2" />
              </Button>
            ) : (
              <Button onClick={handleRetry} className="h-20 px-16 glass border-white/10 rounded-[2.5rem] text-xl font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                <RotateCcw className="mr-4 w-8 h-8" /> Retake Assessment
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
