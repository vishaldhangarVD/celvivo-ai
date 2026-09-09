'use client';

import React, { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  MessageSquare, 
  History, 
  LayoutDashboard,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Special HR Result Page.
 * Displays the transcript and performance metrics from the D-ID session.
 */

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const sessionId = searchParams.get('sessionId');

  const sessionRef = useMemo(() => {
    if (!db || !user?.uid || !sessionId) return null;
    return doc(db, 'users', user.uid, 'specialHRInterviews', sessionId);
  }, [db, user?.uid, sessionId]);

  const { data: session, loading } = useDoc(sessionRef);

  if (loading) return (
    <div className="h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="h-screen bg-[#050816] flex flex-col items-center justify-center p-12 text-center">
       <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
       <h2 className="text-2xl font-bold">Session Log Not Found</h2>
       <Button onClick={() => router.push('/dashboard')} className="mt-8">Return to Dashboard</Button>
    </div>
  );

  const transcript = (session as any).transcript || [];

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Simulation Archive v5.0</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">Special HR <br /><span className="text-gradient-purple">Report.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-xl">Deep-dive into your real-time neural avatar interaction archives.</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/dashboard')} className="h-16 px-10 glass border-white/10 rounded-2xl flex gap-3 text-xs font-bold tracking-widest uppercase">
                <LayoutDashboard className="w-4 h-4" /> Command Hub
              </Button>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Performance Overview */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/20 p-10 space-y-8">
                <div className="text-center space-y-2">
                  <div className="text-7xl font-black text-white tabular-nums">---</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Neural Audit Pending</p>
                </div>
                
                <div className="space-y-6 pt-8 border-t border-white/5">
                   {[
                     { label: "Communication", score: "---", color: "text-blue-400" },
                     { label: "Confidence", score: "---", color: "text-purple-400" },
                     { label: "Vocal Clarity", score: "---", color: "text-green-400" }
                   ].map((m, i) => (
                     <div key={i} className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{m.label}</span>
                        <span className={cn("text-xs font-black", m.color)}>{m.score}</span>
                     </div>
                   ))}
                </div>

                <div className="p-6 glass rounded-[2rem] border-white/5 bg-white/[0.01]">
                   <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-3">System Note</p>
                   <p className="text-xs font-light text-white/60 leading-relaxed italic text-center">
                     "Automated evaluation of Special HR sessions is currently undergoing neural calibration. Actual transcript data is archived below."
                   </p>
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <Clock className="w-5 h-5 text-accent" />
                   <div>
                     <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Duration</p>
                     <p className="text-sm font-bold">~{Math.round((session as any).duration / 60) || 0} Minutes</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 text-right">
                   <div>
                     <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Status</p>
                     <p className="text-sm font-bold text-green-400">Archived</p>
                   </div>
                 </div>
              </Card>
            </div>

            {/* Detailed Transcript */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-10">
                <div className="flex items-center justify-between">
                   <h3 className="text-2xl font-bold flex items-center gap-4"><MessageSquare className="w-6 h-6 text-accent" /> Interview Transcript</h3>
                   <Badge variant="outline" className="border-white/10 text-white/40">{transcript.length} Nodes</Badge>
                </div>

                <div className="space-y-12">
                   {transcript.length > 0 ? transcript.map((msg: any, i: number) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="relative pl-12"
                     >
                       <div className={cn(
                         "absolute left-0 top-0 w-8 h-8 rounded-xl flex items-center justify-center border",
                         msg.role === 'interviewer' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-accent/10 border-accent/20 text-accent"
                       )}>
                         {msg.role === 'interviewer' ? 'AI' : 'U'}
                       </div>
                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{msg.role}</p>
                         <p className="text-lg font-light leading-relaxed text-white/80">{msg.text}</p>
                       </div>
                     </motion.div>
                   )) : (
                     <div className="py-20 text-center space-y-4 opacity-20">
                        <History className="w-16 h-16 mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest">No transcript nodes captured.</p>
                     </div>
                   )}
                </div>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function SpecialHRResult() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <ResultContent />
    </Suspense>
  );
}
