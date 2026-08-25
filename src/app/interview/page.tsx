
"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Command,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { INTERVIEW_STAGES, STAGE_ROUTES, type InterviewStage } from '@/lib/interview-stages';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst", "UI/UX Designer",
  ".NET Developer", "Python Developer", "Java Developer", "Other"
];

const EXPERIENCE_LEVELS = ["Fresher", "0–1 Years", "1–3 Years", "3–5 Years", "5+ Years"];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "TCS", "Infosys", "Wipro", 
  "Accenture", "Deloitte", "Cognizant", "Capgemini", "Other"
];

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const action = searchParams.get('action') || 'resume';
  const [isDispatching, setIsDispatching] = useState(true);
  
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (authLoading || !db || !user?.uid) return;

    async function checkExisting() {
      const journeyRef = doc(db, 'users', user!.uid, 'journey', 'active');
      
      if (action === 'start') {
        await deleteDoc(journeyRef);
        setIsDispatching(false);
      } else {
        const snap = await getDoc(journeyRef);
        if (snap.exists()) {
          const data = snap.data();
          const stage = data.currentStage as InterviewStage;
          const route = STAGE_ROUTES[stage] || STAGE_ROUTES.RESUME_UPLOAD;
          
          if (stage === 'HR_INTERVIEW') {
            router.push(`${route}${data.sessionId}`);
          } else {
            router.push(route);
          }
        } else {
          setIsDispatching(false);
        }
      }
    }

    checkExisting();
  }, [user, authLoading, db, action, router]);

  const handleStartJourney = async () => {
    if (!db || !user?.uid) return;
    
    const finalRole = role === "Other" ? customRole : role;
    const finalCompany = company === "Other" ? customCompany : company;

    if (!finalRole || !experience || !finalCompany) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please complete the simulation parameters." });
      return;
    }

    setIsInitializing(true);
    const sessionId = Math.random().toString(36).substring(7);
    const journeyRef = doc(db, 'users', user.uid, 'journey', 'active');

    try {
      await setDoc(journeyRef, {
        sessionId,
        role: finalRole,
        experience,
        company: finalCompany,
        roundType: "Technical + HR",
        currentStage: INTERVIEW_STAGES.RESUME_UPLOAD,
        step: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push(STAGE_ROUTES.RESUME_UPLOAD);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Sync Fault", description: "Failed to initialize configuration." });
      setIsInitializing(false);
    }
  };

  const isFormValid = (role && (role !== "Other" || customRole)) && experience && (company && (company !== "Other" || customCompany));

  if (authLoading || isDispatching) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="text-center space-y-4 mb-16">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Calibration</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Interview <span className="text-gradient-purple">Setup.</span></h1>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto">Configure your professional nodes for simulation deployment.</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Company Section */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <Building2 className="w-6 h-6 text-accent" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Target Organization</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMPANIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={cn(
                        "p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all h-16 flex items-center justify-center text-center",
                        company === c ? "bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "glass border-white/5 text-white/30 hover:bg-white/5"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {company === "Other" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 max-w-md">
                    <Input 
                      placeholder="Enter Company Name..." 
                      className="h-14 rounded-xl glass border-accent/20 bg-transparent text-white px-6"
                      value={customCompany}
                      onChange={e => setCustomCompany(e.target.value)}
                    />
                  </motion.div>
                )}
              </Card>

              {/* Role Section */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <Briefcase className="w-6 h-6 text-accent" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Job Role</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        "p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all h-16 flex items-center justify-center text-center",
                        role === r ? "bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "glass border-white/5 text-white/30 hover:bg-white/5"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {role === "Other" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 max-w-md">
                    <Input 
                      placeholder="Enter Custom Role..." 
                      className="h-14 rounded-xl glass border-accent/20 bg-transparent text-white px-6"
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value)}
                    />
                  </motion.div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              {/* Experience Section */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <GraduationCap className="w-6 h-6 text-accent" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Experience</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {EXPERIENCE_LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setExperience(l)}
                      className={cn(
                        "w-full py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        experience === l ? "bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "glass border-white/5 text-white/30 hover:bg-white/5"
                      )}
                    >
                      {l} Grade
                    </button>
                  ))}
                </div>
              </Card>

              {/* Action Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleStartJourney}
                  disabled={!isFormValid || isInitializing}
                  className="w-full h-20 btn-premium rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(34,211,238,0.2)]"
                >
                  {isInitializing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Continue to Upload <ArrowRight className="ml-3 w-5 h-5" /></>}
                </Button>
                <div className="mt-8 flex items-center justify-center gap-4 opacity-20">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em]">Protocol Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewSetup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <InterviewSetupContent />
    </Suspense>
  );
}
