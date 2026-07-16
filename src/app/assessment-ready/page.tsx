"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Zap, 
  Timer, 
  Trophy, 
  Target, 
  Cpu, 
  BrainCircuit, 
  Lock, 
  LayoutDashboard,
  Loader2,
  FileText,
  AlertCircle,
  Monitor
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const READINESS_STEPS = [
  "Resume Uploaded",
  "File Verified",
  "Candidate Validated",
  "AI Session Ready",
  "Assessment Access Granted"
];

export default function AssessmentReadyPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (journey && !journeyLoading) {
      const interval = setInterval(() => {
        setVisibleSteps(prev => (prev < READINESS_STEPS.length ? prev + 1 : prev));
      }, 600);
      return () => clearInterval(interval);
    }
  }, [journey, journeyLoading]);

  if (journeyLoading) return <div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative selection:bg-accent/30">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="flex-1 container mx-auto px-6 flex items-center justify-center relative z-10 pt-16">
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl w-full">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 flex flex-col justify-center gap-8"
          >
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Assessment Ready</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">Resume Successfully <br /><span className="text-gradient-purple">Verified.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-lg leading-relaxed">
                Your resume has been securely validated. You are now ready to begin the Aptitude Assessment.
              </p>
            </div>

            <Card className="premium-card bg-white/[0.01] border-white/5 p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <CheckCircle2 className="w-32 h-32 text-accent" />
               </div>

               <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <ShieldCheck className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Verification Sequence</h3>
                      <p className="text-[10px] uppercase tracking-widest text-green-400 font-bold">Protocol Active</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                   {READINESS_STEPS.map((step, idx) => (
                     <motion.div 
                       key={idx}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ 
                         opacity: visibleSteps > idx ? 1 : 0.2, 
                         x: visibleSteps > idx ? 0 : -10 
                       }}
                       className="flex items-center gap-4"
                     >
                       <div className={cn(
                         "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-500",
                         visibleSteps > idx ? "bg-green-500 border-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "border-white/10"
                       )}>
                         {visibleSteps > idx && <CheckCircle2 className="w-3 h-3" />}
                       </div>
                       <span className={cn(
                         "text-xs font-bold uppercase tracking-widest",
                         visibleSteps > idx ? "text-white" : "text-white/20"
                       )}>{step}</span>
                     </motion.div>
                   ))}
                 </div>
               </div>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 flex flex-col justify-center gap-6"
          >
            <Card className="premium-card bg-accent/[0.02] border-accent/20 p-8 space-y-8">
               <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> Simulation Blueprint
                    </h3>
                    <div className="p-4 glass rounded-xl border-white/5">
                      <p className="text-sm font-bold truncate">{journey?.role || "Software Engineer"}</p>
                      <p className="text-[10px] text-accent font-bold uppercase mt-1 tracking-widest">{journey?.company || "Standard Agency"} • {journey?.experience || "Senior"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> Assessment Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                          <span className="text-[8px] font-bold text-white/40 uppercase">Questions</span>
                          <p className="text-xs font-bold">20 Nodes</p>
                       </div>
                       <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                          <span className="text-[8px] font-bold text-white/40 uppercase">Time Limit</span>
                          <p className="text-xs font-bold">45 Minutes</p>
                       </div>
                       <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                          <span className="text-[8px] font-bold text-white/40 uppercase">Difficulty</span>
                          <p className="text-xs font-bold text-accent">Enterprise</p>
                       </div>
                       <div className="p-4 glass rounded-xl border-white/5 space-y-1">
                          <span className="text-[8px] font-bold text-white/40 uppercase">Logic Type</span>
                          <p className="text-xs font-bold">Quantitative</p>
                       </div>
                    </div>
                  </div>

                  <div>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                       <Lock className="w-3.5 h-3.5" /> Security Protocol
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       {["AI Monitored", "Secure Link", "Single Attempt", "Auto-Save"].map((feat, i) => (
                         <Badge key={i} variant="outline" className="bg-white/5 border-white/5 text-[8px] font-bold uppercase py-1 px-3">
                           {feat}
                         </Badge>
                       ))}
                     </div>
                  </div>
               </div>

               <div className="pt-4">
                 <Button 
                   onClick={() => router.push('/interview/aptitude')}
                   className="w-full h-20 btn-premium rounded-2xl text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group relative overflow-hidden"
                 >
                   <motion.div 
                     animate={{ scale: [1, 1.05, 1] }} 
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-white/5 pointer-events-none"
                   />
                   <span className="relative z-10 flex items-center justify-center">
                     Enter Aptitude Test <ChevronRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                   </span>
                 </Button>
                 <div className="mt-4 flex items-center justify-center gap-2 text-white/20">
                   <Monitor className="w-3 h-3" />
                   <span className="text-[8px] font-bold uppercase tracking-widest">Fullscreen mode recommended for session stability</span>
                 </div>
               </div>
            </Card>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
