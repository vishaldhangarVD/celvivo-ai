"use client";

import { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Layers, 
  ShieldCheck, 
  Target, 
  ArrowRight,
  Loader2,
  FastForward,
  Activity,
  Cpu,
  RefreshCcw,
  RotateCcw
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function CodingResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const attemptId = searchParams.get('attemptId');

  const attemptRef = useMemo(() => {
    if (!db || !user?.uid || !attemptId) return null;
    return doc(db, 'users', user.uid, 'coding_attempts', attemptId);
  }, [db, user?.uid, attemptId]);

  const { data: attemptDoc, loading: attemptLoading } = useDoc(attemptRef);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  const result = useMemo(() => {
    if (attemptDoc?.codingReport) return attemptDoc.codingReport;
    if (attemptDoc?.score !== undefined) return attemptDoc;
    if (journey?.codingReport && (!attemptId || attemptId === journey.sessionId)) return journey.codingReport;
    
    return { score: 0, status: 'Awaiting', totalQuestions: 8, passedQuestions: 0, failedQuestions: 0, skippedQuestions: 8, totalPassedCases: 0, totalTestCases: 0, submissionTime: "N/A" };
  }, [attemptDoc, journey, attemptId]);

  const isPassed = (result?.score || 0) >= 60;

  const handleContinueToInterview = () => {
    if (!journey && !attemptDoc) {
      toast({ variant: "destructive", title: "Session Context Lost", description: "Return to dashboard." });
      return;
    }
    const activeId = attemptId || journey?.sessionId;
    const sessionRole = attemptDoc?.role || journey?.role || "Software Engineer";
    const sessionCompany = attemptDoc?.company || journey?.company || "Standard Tech";
    const sessionExp = attemptDoc?.experience || journey?.experience || "Senior";
    
    router.push(`/interview/${activeId}?role=${encodeURIComponent(sessionRole)}&company=${encodeURIComponent(sessionCompany)}&exp=${encodeURIComponent(sessionExp)}&round=HR%20Round`);
  };

  if (journeyLoading || attemptLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-y-auto custom-scrollbar">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] text-[10px] uppercase">Simulation Audit Node 05</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Coding Round <span className="text-gradient-purple">Result.</span></h1>
          </header>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="premium-card p-12 flex flex-col items-center text-center space-y-10 relative overflow-hidden bg-white/[0.01]">
              <div className={cn("text-[120px] font-black tracking-tighter tabular-nums drop-shadow-[0_0_50px_rgba(34,211,238,0.2)]", isPassed ? "text-accent" : "text-red-400")}>{result?.score}%</div>
              
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <Button 
                  onClick={handleContinueToInterview} 
                  className="w-full h-20 btn-premium rounded-[2rem] text-lg font-black uppercase tracking-[0.3em] shadow-2xl group"
                >
                  Continue to Interview <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-1" />
                </Button>
                
                {!isPassed && (
                  <Button 
                    onClick={() => router.push('/interview/coding')} 
                    className="w-full h-14 glass border-white/10 hover:bg-white/5 rounded-[2rem] text-xs font-bold uppercase tracking-[0.3em] group"
                  >
                    <RotateCcw className="mr-3 w-5 h-5 group-hover:rotate-180 transition-transform" /> Re-initialize Test
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function RootCodingResultPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}><CodingResultContent /></Suspense>;
}
