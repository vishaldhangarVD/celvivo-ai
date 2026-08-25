"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Zap, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  Command,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Target,
  ArrowRight
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { INTERVIEW_STAGES, STAGE_ROUTES, type InterviewStage } from '@/lib/interview-stages';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer",
  "Cloud Engineer", "Cybersecurity Analyst", "UI/UX Designer", "Product Manager",
  ".NET Developer", "Python Developer", "Java Developer", "Other"
];

const EXPERIENCE_LEVELS = [
  { id: "Fresher", label: "Fresher Grade", desc: "0 years experience" },
  { id: "0–1 Years", label: "Junior Grade", desc: "Entry level exposure" },
  { id: "1–3 Years", label: "Associate Grade", desc: "Developing professional" },
  { id: "3–5 Years", label: "Mid-Senior Grade", desc: "Independent contributor" },
  { id: "5+ Years", label: "Expert Grade", desc: "Strategic leadership" }
];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "TCS", "Infosys", "Wipro", 
  "Accenture", "Deloitte", "Cognizant", "Capgemini", "Other"
];

const ROUNDS = [
  { id: 'Technical Round', label: 'Technical Round', desc: 'Focus on core logic & implementation' },
  { id: 'HR Round', label: 'HR Round', desc: 'Behavioral & culture fit assessment' },
  { id: 'Technical + HR', label: 'Hybrid Protocol', desc: 'Full-spectrum simulation' },
  { id: 'Final HR Round', label: 'Executive Board', desc: 'High-stakes senior evaluation' }
];

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const action = searchParams.get('action') || 'resume';
  const [isDispatching, setIsDispatching] = useState(true);
  
  const [setupStep, setSetupStep] = useState(1);
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [roundType, setRoundType] = useState("Technical + HR");
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
          
          if (stage === INTERVIEW_STAGES.HR_INTERVIEW) {
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

    if (!finalRole || !experience || !finalCompany || !roundType) {
      toast({ variant: "destructive", title: "Config Incomplete", description: "Select all parameters." });
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
        roundType,
        currentStage: INTERVIEW_STAGES.RESUME_UPLOAD,
        step: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push(STAGE_ROUTES.RESUME_UPLOAD);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Sync Fault", description: "Protocol initialization failed." });
      setIsInitializing(false);
    }
  };

  const nextStep = () => setSetupStep(prev => prev + 1);
  const prevStep = () => setSetupStep(prev => prev - 1);

  if (authLoading || isDispatching) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Querying Active Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-40 flex flex-col items-center">
        <header className="max-w-4xl w-full text-center mb-16 space-y-4">
          <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Calibration Protocol</Badge>
          <h1 className="text-6xl font-bold tracking-tighter text-premium">Simulation <span className="text-gradient-purple">Setup.</span></h1>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-20 rounded-full transition-all duration-500 ${setupStep >= s ? 'bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </header>

        <div className="max-w-4xl w-full relative">
          <AnimatePresence mode="wait">
            {setupStep === 1 && (
              <motion.div 
                key="step-company" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Select Your Company</h2>
                  <p className="text-muted-foreground font-light mt-2">Choose the target organization you are preparing for.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {COMPANIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={`p-6 rounded-2xl border transition-all text-center group flex flex-col gap-3 h-full items-center justify-center ${
                        company === c ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 hover:bg-white/5 text-white/40'
                      }`}
                    >
                      <Building2 className={`w-6 h-6 mb-2 ${company === c ? 'text-accent' : 'text-white/10 group-hover:text-accent'} transition-colors`} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">{c}</span>
                    </button>
                  ))}
                </div>
                {company === "Other" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
                    <Input 
                      placeholder="Enter Custom Company Name..." 
                      className="h-16 rounded-2xl glass border-accent/30 text-lg"
                      value={customCompany}
                      onChange={e => setCustomCompany(e.target.value)}
                    />
                  </motion.div>
                )}
                <div className="flex justify-center pt-8">
                  <Button 
                    onClick={nextStep} 
                    disabled={!company || (company === "Other" && !customCompany)}
                    className="h-18 px-12 btn-premium text-xs font-black uppercase tracking-[0.3em]"
                  >
                    Select Role <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {setupStep === 2 && (
              <motion.div 
                key="step-role" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Select Your Role</h2>
                  <p className="text-muted-foreground font-light mt-2">Choose your professional track for calibration.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-6 rounded-2xl border transition-all text-left group flex flex-col gap-3 h-full ${
                        role === r ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 hover:bg-white/5 text-white/60'
                      }`}
                    >
                      <Briefcase className={`w-5 h-5 ${role === r ? 'text-accent' : 'text-white/20 group-hover:text-accent'} transition-colors`} />
                      <span className="text-xs font-black uppercase tracking-widest leading-tight">{r}</span>
                    </button>
                  ))}
                </div>
                {role === "Other" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
                    <Input 
                      placeholder="Specify Custom Role..." 
                      className="h-16 rounded-2xl glass border-accent/30 text-lg"
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value)}
                    />
                  </motion.div>
                )}
                <div className="flex justify-center gap-6 pt-8">
                  <Button variant="ghost" onClick={prevStep} className="h-18 px-8 glass border-white/10 text-xs font-black uppercase tracking-widest">Back</Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!role || (role === "Other" && !customRole)}
                    className="h-18 px-12 btn-premium text-xs font-black uppercase tracking-[0.3em]"
                  >
                    Select Seniority <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {setupStep === 3 && (
              <motion.div 
                key="step-exp" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Select Your Seniority</h2>
                  <p className="text-muted-foreground font-light mt-2">Adjust simulation difficulty based on your grade.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    {EXPERIENCE_LEVELS.map(exp => (
                      <button
                        key={exp.id}
                        onClick={() => setExperience(exp.id)}
                        className={`w-full p-6 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                          experience === exp.id ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 hover:bg-white/5 text-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${experience === exp.id ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/5 group-hover:border-accent/30'}`}>
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-widest">{exp.label}</p>
                            <p className="text-[10px] text-white/40 font-light mt-0.5">{exp.desc}</p>
                          </div>
                        </div>
                        {experience === exp.id && <CheckCircle2 className="w-6 h-6 text-accent" />}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-2">Assessment Protocol</label>
                    <div className="space-y-3">
                      {ROUNDS.map(round => (
                        <button
                          key={round.id}
                          onClick={() => setRoundType(round.id)}
                          className={`w-full p-5 rounded-xl border text-left transition-all group ${
                            roundType === round.id ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 hover:bg-white/5 text-white/60'
                          }`}
                        >
                          <p className="text-xs font-black uppercase tracking-widest">{round.label}</p>
                          <p className="text-[9px] text-white/30 font-light mt-1 uppercase tracking-tighter">{round.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-6 pt-8">
                  <Button variant="ghost" onClick={prevStep} className="h-18 px-8 glass border-white/10 text-xs font-black uppercase tracking-widest">Back</Button>
                  <Button 
                    onClick={handleStartJourney}
                    disabled={!experience || isInitializing}
                    className="h-20 px-16 btn-premium rounded-[2.5rem] text-sm font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(34,211,238,0.2)]"
                  >
                    {isInitializing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Enter Simulation Room <ArrowRight className="ml-3 w-5 h-5" /></>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
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
