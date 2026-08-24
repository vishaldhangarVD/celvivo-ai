"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { 
  Cpu, 
  Loader2, 
  Check, 
  Search,
  ChevronRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LOADING_STEPS = [
  "Reading Document",
  "Extracting Experience Nodes",
  "Mapping Skills Matrix",
  "Calibrating Targets",
  "Finalizing Dossier"
];

const IT_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Analyst",
  "UI/UX Designer", "Product Manager", "QA Engineer", "Mobile Developer"
];

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isRoleSelection, setIsRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [roleSearch, setRoleSearch] = useState("");

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing && loadingStepIdx < LOADING_STEPS.length) {
      interval = setInterval(() => {
        setLoadingStepIdx(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, loadingStepIdx]);

  useEffect(() => {
    async function startAnalysis() {
      if (!journey || !journey.resumeBase64 || !isAnalyzing || loadingStepIdx < LOADING_STEPS.length) return;

      try {
        const result = await analyzeResume({
          resumeDataUri: journey.resumeBase64,
          targetRole: selectedRole
        });

        await updateDoc(journeyRef!, {
          resumeAnalysis: result,
          updatedAt: serverTimestamp(),
        });

        setIsAnalyzing(false);
        setIsRoleSelection(true);
      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Analysis Failed", description: "Neural engine could not parse dossier." });
        router.push('/resume-upload');
      }
    }

    startAnalysis();
  }, [journey, isAnalyzing, loadingStepIdx, selectedRole, journeyRef, toast, router]);

  const handleFinalize = async () => {
    if (!journeyRef) return;
    
    await updateDoc(journeyRef, {
      role: selectedRole,
      currentStage: INTERVIEW_STAGES.RESUME_RESULT,
      step: 3,
      updatedAt: serverTimestamp(),
    });

    router.push(STAGE_ROUTES.RESUME_RESULT);
  };

  if (journeyLoading) return <div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />

      <main className="flex-1 container mx-auto px-6 flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="max-w-xl w-full text-center space-y-12"
            >
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin duration-[3s]" />
                <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
                  <Cpu className="w-16 h-16 text-accent animate-pulse" />
                </div>
              </div>
              <div className="space-y-8">
                <h2 className="text-4xl font-bold tracking-tighter text-premium">Nexvoro AI Scanner</h2>
                <div className="grid gap-3">
                  {LOADING_STEPS.map((step, idx) => (
                    <div key={idx} className={cn("flex items-center gap-4 transition-all duration-500 px-8 py-2 rounded-xl", 
                      loadingStepIdx > idx ? "opacity-100 scale-100" : loadingStepIdx === idx ? "opacity-100 scale-105 bg-accent/5" : "opacity-20 scale-95")}>
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", loadingStepIdx > idx ? "bg-green-500 border-green-500 text-black" : "border-white/20")}>
                        {loadingStepIdx > idx ? <Check className="w-3 h-3 font-black" /> : idx + 1}
                      </div>
                      <span className={cn("text-xs font-bold uppercase tracking-widest", loadingStepIdx > idx ? "text-green-400" : "text-white")}>{step}</span>
                      {loadingStepIdx === idx && <Loader2 className="w-3 h-3 animate-spin ml-auto text-accent" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="role-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl w-full grid lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
                <header className="space-y-4">
                  <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Stage 02: Calibration</Badge>
                  <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">Define Your <br /><span className="text-gradient-purple">Trajectory.</span></h1>
                  <p className="text-lg text-muted-foreground font-light leading-relaxed">Select your target deployment track. Our neural models will adapt the simulation to these standards.</p>
                </header>

                <Card className="p-8 glass border-white/5 bg-white/[0.01] space-y-6">
                   <div className="flex items-center gap-4">
                      <ShieldCheck className="w-6 h-6 text-accent" />
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Dossier Quality</p>
                        <p className="text-lg font-bold text-white">{journey?.resumeAnalysis?.atsScore}% ATS Score</p>
                      </div>
                   </div>
                   <div className="h-px bg-white/5" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                         <p className="text-[8px] font-black uppercase text-white/20 tracking-tighter">Readiness</p>
                         <p className="text-sm font-bold text-accent">{journey?.resumeAnalysis?.interviewReadinessScore}%</p>
                      </div>
                      <div className="space-y-1 text-left">
                         <p className="text-[8px] font-black uppercase text-white/20 tracking-tighter">Skills Index</p>
                         <p className="text-sm font-bold text-purple-400">{journey?.resumeAnalysis?.technicalSkillsScore}%</p>
                      </div>
                   </div>
                </Card>
              </div>

              <div className="lg:col-span-7">
                <Card className="premium-card bg-[#0b0e1a]/80 border-white/10 p-10 min-h-[500px] flex flex-col gap-8 relative overflow-hidden shadow-2xl">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-3"><Search className="w-5 h-5 text-accent" /> Target Role</h3>
                    <input 
                      type="text"
                      placeholder="Search industry tracks..."
                      value={roleSearch || selectedRole}
                      onChange={(e) => { setRoleSearch(e.target.value); setSelectedRole(""); }}
                      className="w-full h-14 px-6 rounded-2xl glass border-white/10 bg-transparent text-white focus:outline-none focus:border-accent transition-all text-sm font-light"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                    {(roleSearch ? IT_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())) : IT_ROLES).map(role => (
                      <button 
                        key={role} 
                        onClick={() => { setSelectedRole(role); setRoleSearch(""); }}
                        className={cn("text-left p-5 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest group flex items-center justify-between",
                          selectedRole === role ? "bg-accent/20 border-accent text-accent" : "glass border-white/5 hover:border-white/20 text-white/40")}
                      >
                        {role}
                        <ChevronRight className={cn("w-4 h-4 transition-all", selectedRole === role ? "opacity-100 translate-x-1" : "opacity-0")} />
                      </button>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <Button 
                      onClick={handleFinalize}
                      disabled={!selectedRole}
                      className="w-full h-18 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(147,51,234,0.2)]"
                    >
                      Initialize Assessment <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
