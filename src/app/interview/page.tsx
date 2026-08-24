"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Interview Route Dispatcher.
 * Handles the logic for starting or resuming the multi-stage interview journey.
 */

function InterviewDispatcherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const action = searchParams.get('action') || 'resume';

  useEffect(() => {
    if (authLoading || !db || !user?.uid) return;

    async function dispatch() {
      const journeyRef = doc(db, 'users', user!.uid, 'journey', 'active');

      if (action === 'start') {
        // 1. Initialize Fresh Journey
        await deleteDoc(journeyRef);
        const sessionId = Math.random().toString(36).substring(7);
        
        await setDoc(journeyRef, {
          sessionId,
          currentStage: INTERVIEW_STAGES.RESUME_UPLOAD,
          step: 1,
          role: "Software Engineer", // Default calibration
          experience: "Senior",
          company: "Standard Tech",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        toast({ title: "Protocol Initialized", description: "Beginning resume registration." });
        router.push(STAGE_ROUTES.RESUME_UPLOAD);
      } else {
        // 2. Resume Existing Journey
        const snap = await getDoc(journeyRef);
        
        if (snap.exists()) {
          const data = snap.data();
          const stage = data.currentStage as keyof typeof INTERVIEW_STAGES;
          const route = STAGE_ROUTES[stage] || STAGE_ROUTES.RESUME_UPLOAD;

          toast({ title: "Session Reconnected", description: `Active stage: ${stage.replace('_', ' ')}` });
          
          if (stage === INTERVIEW_STAGES.HR_INTERVIEW || stage === INTERVIEW_STAGES.FEEDBACK) {
            router.push(`${route}${data.sessionId}`);
          } else {
            router.push(route);
          }
        } else {
          // No active journey, start fresh
          router.replace('/interview?action=start');
        }
      }
    }

    dispatch();
  }, [user, authLoading, db, action, router, toast]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Neural Archives...</p>
      </div>
    </div>
  );
}

export default function InterviewDispatcher() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <InterviewDispatcherContent />
    </Suspense>
  );
}
