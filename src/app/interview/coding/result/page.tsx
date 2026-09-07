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
  RotateCcw, 
  Cpu, 
  ShieldCheck, 
  Target, 
  Code2, 
  Layers,
  Loader2,
  AlertTriangle,
  ArrowRight,
  FastForward,
  ChevronDown,
  Terminal,
  Activity
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function CodingResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const attemptId = searchParams.get('attemptId');
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

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

  const activeId = attemptId || journey?.sessionId;

  const resultsQuery = useMemo(() => {
    if (!db || !user?.uid || !activeId) return null;
    return query(
      collection(db, 'users', user.uid, 'coding_results'),
      where('interviewId', '==', activeId),
      orderBy('completedAt', 'desc')
    );
  }, [db, user?.uid, activeId]);

  const { data: questionResults, loading: resultsLoading } = useCollection(resultsQuery);

  const displayQuestions = useMemo(() => {
    return attemptDoc?.questions || journey?.codingQuestions || [];
  }, [attemptDoc, journey]);

  // Unified result mapping to ensure we only use results from the current attempt window
  const currentAttemptResultsMap = useMemo(() => {
    if (!questionResults || questionResults.length === 0) return new Map();
    
    const map = new Map();
    const attemptTime = attemptDoc?.createdAt?.seconds || journey?.updatedAt?.seconds || (Date.now() / 1000);
    
    // We filter results that occurred before or roughly at the same time as the attempt finalization
    // and take the most recent one for each questionId
    questionResults.forEach((res: any) => {
      if (!map.has(res.questionId)) {
        const resultTime = res.completedAt?.seconds || 0;
        // Check if result is part of this specific attempt (within the last 2 hours of completion)
        if (resultTime <= attemptTime + 10 && resultTime >= attemptTime - 7200) {
          map.set(res.questionId, res);
        }
      }
    });
    return map;
  }, [questionResults, attemptDoc, journey]);

  const result = useMemo(() => {
    if (attemptDoc?.score !== undefined) return attemptDoc;
    if (journey?.codingReport && (!attemptId || attemptId === journey.sessionId)) return journey.codingReport;
    
    const total = 8;
    const resultsArray = Array.from(currentAttemptResultsMap.values());
    
    if (resultsArray.length > 0) {
      const solved = resultsArray.filter((r: any) => r.status === 'Solved').length;
      const failed = resultsArray.filter((r: any) => r.status === 'Failed').length;
      const score = Math.round((solved / total) * 100);

      return {
        score,
        status: score >= 60 ? 'Pass' : 'Fail',
        totalQuestions: total,
        passedQuestions: solved,
        failedQuestions: failed,
        skippedQuestions: Math.max(0, total - (solved + failed)),
        totalPassedCases: resultsArray.reduce((acc, curr: any) => acc + (curr.passedTestCases || 0), 0),
        totalTestCases: resultsArray.reduce((acc, curr: any) => acc + (curr.totalTestCases || 0), 0),
      };
    }

    return { score: 0, status: 'Awaiting', totalQuestions: total, passedQuestions: 0, failedQuestions: 0, skippedQuestions: total, totalPassedCases: 0, totalTestCases: 0 };
  }, [attemptDoc, journey, currentAttemptResultsMap, attemptId]);

  const isPassed = (result?.score || 0) >= 60;

  const handleContinueToInterview = () => {
    if (!journey && !attemptDoc) {
      toast({ variant: "destructive", title: "Session Context Lost", description: "Return to dashboard to continue." });
      return;
    }
    const sessionRole = attemptDoc?.role || journey?.role || "Software Engineer";
    const sessionCompany = attemptDoc?.company || journey?.company || "Standard Tech";
    const sessionExp = attemptDoc?.experience || journey?.experience || "Senior";
    router.push(`/interview/${activeId}?role=${encodeURIComponent(sessionRole)}&company=${encodeURIComponent(sessionCompany)}&exp=${encodeURIComponent(sessionExp)}&round=HR%20Round`);
  };

  if (attemptLoading || journeyLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <main className="flex-1 container mx-auto px-6 pt-24 pb-8 flex flex-col gap-6 overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 shrink-0">
          <div className="space-y-1">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">Simulation Node 03 Audit</Badge>
            <h1 className="text-4xl font-bold tracking-tighter text-premium">Coding Round <span className="text-gradient-purple">Result.</span></h1>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-12 gap-6 overflow-hidden">
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col items-center text-center justify-center relative overflow-hidden">
              <div className="text-[100px] font-black tracking-tighter tabular-nums drop-shadow-[0_0_50px_rgba(34,211,238,0.2)] leading-none text-accent">{result?.score}%</div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mt-2">Overall Proficiency Index</p>
            </Card>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleContinueToInterview}
                className="w-full h-16 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl group"
              >
                CONTINUE TO INTERVIEW <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full h-12 glass border-white/10 hover:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white"
              >
                Exit to Control Panel
              </Button>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4">
               {displayQuestions.map((q: any, idx: number) => {
                 const res = currentAttemptResultsMap.get(q.id);
                 const status = res?.status;
                 
                 return (
                   <Card key={idx} className="glass p-6 rounded-[2rem] border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black">0{idx + 1}</div>
                        <div><p className="text-base font-bold text-white/90">{q.title}</p></div>
                     </div>
                     <Badge variant="outline" className={cn("text-[9px] uppercase font-black tracking-widest", 
                       status === 'Solved' ? "text-green-400 border-green-500/20" : 
                       status === 'Failed' || status === 'Skipped' ? "text-red-400 border-red-500/20" : 
                       "text-white/20 border-white/5"
                     )}>
                        {status === 'Solved' ? "SOLVED" : 
                         status === 'Failed' ? "FAILED" : 
                         status === 'Skipped' ? "SKIPPED" : "NOT ATTEMPTED"}
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