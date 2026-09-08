"use client";

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  ChevronRight, 
  Cpu, 
  Target, 
  Code2, 
  Layers,
  Loader2,
  ArrowRight,
  FastForward,
  ChevronDown,
  Terminal,
  Activity,
  History
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';

function CodingResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const attemptId = searchParams.get('attemptId');

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  const attemptRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    const idToUse = attemptId || journey?.sessionId;
    if (!idToUse) return null;
    return doc(db, 'users', user.uid, 'coding_attempts', idToUse);
  }, [db, user?.uid, attemptId, journey?.sessionId]);

  const { data: attemptDoc, loading: attemptLoading } = useDoc(attemptRef);

  const activeId = attemptId || journey?.sessionId;

  const resultsQuery = useMemo(() => {
    if (!db || !user?.uid || !activeId) return null;
    return query(
      collection(db, 'users', user.uid, 'coding_results'),
      where('interviewId', '==', activeId),
      orderBy('completedAt', 'asc')
    );
  }, [db, user?.uid, activeId]);

  const { data: questionResults, loading: resultsLoading } = useCollection(resultsQuery);

  const displayQuestions = useMemo(() => {
    return attemptDoc?.questions || journey?.codingQuestions || [];
  }, [attemptDoc, journey]);

  const result = useMemo(() => {
    if (attemptDoc?.score !== undefined) return attemptDoc;
    
    const total = 8;
    // Calculate real-time score from results associated strictly with this attempt
    if (questionResults && questionResults.length > 0) {
      const solved = questionResults.filter((r: any) => r.status === 'Solved').length;
      const failed = questionResults.filter((r: any) => r.status === 'Failed').length;
      const score = Math.round((solved / total) * 100);

      return {
        score,
        status: score >= 60 ? 'Pass' : 'Fail',
        totalQuestions: total,
        passedQuestions: solved,
        failedQuestions: failed,
        skippedQuestions: Math.max(0, total - (solved + failed)),
        totalPassedCases: questionResults.reduce((acc, curr) => acc + (curr.passedTestCases || 0), 0),
        totalTestCases: questionResults.reduce((acc, curr) => acc + (curr.totalTestCases || 0), 0),
      };
    }

    return { score: 0, status: 'Awaiting', totalQuestions: total, passedQuestions: 0, failedQuestions: 0, skippedQuestions: total, totalPassedCases: 0, totalTestCases: 0 };
  }, [attemptDoc, questionResults]);

  const isPassed = (result?.score || 0) >= 60;

  const handleContinueToInterview = async () => {
    if (!journeyRef || !activeId) {
      toast({ variant: "destructive", title: "Session Sync Fault", description: "Identity node lost." });
      return;
    }

    await updateDoc(journeyRef, {
      currentStage: INTERVIEW_STAGES.HR_INTERVIEW,
      step: 8,
      updatedAt: serverTimestamp(),
    });

    router.push(`${STAGE_ROUTES.HR_INTERVIEW}${activeId}`);
  };

  if (attemptLoading || journeyLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      
      <main className="flex-1 container mx-auto px-6 pt-20 pb-4 flex flex-col gap-4 overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 shrink-0">
          <div className="space-y-1">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">Stage 07: Result</Badge>
            <h1 className="text-4xl font-bold tracking-tighter text-premium">Coding Round <span className="text-gradient-purple">Result.</span></h1>
            <p className="text-sm text-muted-foreground font-light uppercase tracking-widest">Syntax Matrix Verification Archive.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-6 py-2 rounded-2xl">
             <div className={cn("w-2 h-2 rounded-full animate-pulse", isPassed ? "bg-green-500" : "bg-red-500")} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Attempt ID: {activeId?.substring(0, 8)}</span>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-12 gap-4 overflow-hidden">
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            <Card className="premium-card bg-white/[0.01] border-white/5 p-6 h-[260px] flex flex-col items-center text-center justify-center relative overflow-hidden shrink-0">
              <div className={cn("text-[100px] font-black tracking-tighter tabular-nums drop-shadow-[0_0_50px_rgba(34,211,238,0.2)] leading-none", 
                isPassed ? "text-accent" : "text-red-400")}>
                {result?.score}%
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mt-2">Overall Efficiency Index</p>
            </Card>

            <div className="space-y-4">
              <Button 
                onClick={handleContinueToInterview} 
                className="w-full h-14 px-10 btn-premium rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-2"
              >
                CONTINUE TO INTERVIEW <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="ghost" 
                className="w-full h-12 px-8 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white"
              >
                Exit to Control Panel
              </Button>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4">
               {displayQuestions.map((q: any, idx: number) => {
                 // Strictly match results to the current question and session
                 const res = questionResults?.find((r: any) => r.questionId === q.id);
                 const statusText = res?.status === 'Solved' ? 'SOLVED' : res?.status === 'Failed' ? 'FAILED' : 'SKIPPED';

                 return (
                   <Card key={idx} className="glass p-6 rounded-[2rem] border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black">0{idx + 1}</div>
                        <p className="text-base font-bold text-white/90">{q.title}</p>
                     </div>
                     <Badge variant="outline" className={cn("text-[9px] uppercase", 
                       statusText === 'SOLVED' ? "text-green-400 border-green-500/20" : 
                       statusText === 'FAILED' ? "text-red-400 border-red-500/20" : 
                       "text-white/20 border-white/5")}>
                        {statusText}
                     </Badge>
                   </Card>
                 );
               })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CodingResultTerminal() {
  return <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}><CodingResultContent /></Suspense>;
}
