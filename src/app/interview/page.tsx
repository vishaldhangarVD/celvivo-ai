"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, Briefcase, GraduationCap, Building2, Layers, ChevronRight, Command } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ROLES = [
  "Software Engineer", "Data Analyst", "Data Scientist", "Machine Learning Engineer",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Python Developer",
  "Java Developer", "DevOps Engineer", "Cloud Engineer", "SQL Developer",
  "Business Analyst", "Product Manager", "Other"
];

const EXPERIENCE_LEVELS = ["Fresher", "0–1 Years", "1–3 Years", "3–5 Years", "5+ Years"];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Oracle", "IBM", "Cisco",
  "TCS", "Infosys", "Wipro", "Accenture", "Deloitte", "Capgemini", "Cognizant", "Other"
];

const ROUNDS = ["Technical Round", "HR Round", "Technical + HR", "Final HR Round"];

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const action = searchParams.get('action') || 'resume';
  const [isDispatching, setIsDispatching] = useState(true);
  
  // Form State
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
        setIsDispatching(false); // Show the setup form
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
          setIsDispatching(false); // No journey to resume, show setup
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
      toast({ variant: "destructive", title: "Config Incomplete", description: "All fields are required." });
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

      toast({ title: "Protocol Initiated", description: "Calibration dossiers ready." });
      router.push(STAGE_ROUTES.RESUME_UPLOAD);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Sync Fault", description: "Could not initialize journey." });
      setIsInitializing(false);
    }
  };

  const isFormValid = (role === "Other" ? customRole : role) && 
                      experience && 
                      (company === "Other" ? customCompany : company) && 
                      roundType;

  if (authLoading || isDispatching) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Synchronizing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <header className="text-center space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Calibration v5.2</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium uppercase">Interview <span className="text-gradient-purple">Configuration.</span></h1>
            <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
              Define your deployment parameters to architect a high-fidelity simulation.
            </p>
          </header>

          <Card className="premium-card bg-white/[0.01] border-white/5 p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <Command className="w-48 h-48 text-white" />
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
              {/* Job Role */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                  <Briefcase className="w-4 h-4 text-accent" /> 01. Job Role Track
                </label>
                <Select onValueChange={setRole} value={role}>
                  <SelectTrigger className="h-16 rounded-2xl glass border-white/10 bg-transparent px-6 text-sm">
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {role === "Other" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Input 
                      placeholder="Specify Custom Role..." 
                      className="h-14 rounded-xl glass border-accent/20 mt-2"
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value)}
                    />
                  </motion.div>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                  <GraduationCap className="w-4 h-4 text-accent" /> 02. Seniority Grade
                </label>
                <Select onValueChange={setExperience} value={experience}>
                  <SelectTrigger className="h-16 rounded-2xl glass border-white/10 bg-transparent px-6 text-sm">
                    <SelectValue placeholder="Select Experience" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {EXPERIENCE_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                  <Building2 className="w-4 h-4 text-accent" /> 03. Target Organization
                </label>
                <Select onValueChange={setCompany} value={company}>
                  <SelectTrigger className="h-16 rounded-2xl glass border-white/10 bg-transparent px-6 text-sm">
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {company === "Other" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Input 
                      placeholder="Specify Custom Company..." 
                      className="h-14 rounded-xl glass border-accent/20 mt-2"
                      value={customCompany}
                      onChange={e => setCustomCompany(e.target.value)}
                    />
                  </motion.div>
                )}
              </div>

              {/* Rounds */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                  <Layers className="w-4 h-4 text-accent" /> 04. Simulation Protocol
                </label>
                <Select onValueChange={setRoundType} value={roundType}>
                  <SelectTrigger className="h-16 rounded-2xl glass border-white/10 bg-transparent px-6 text-sm">
                    <SelectValue placeholder="Select Round Type" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {ROUNDS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-16 flex flex-col items-center">
              <Button 
                onClick={handleStartJourney}
                disabled={!isFormValid || isInitializing}
                className="w-full max-w-md h-20 btn-premium rounded-[2.5rem] text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(34,211,238,0.2)] group"
              >
                {isInitializing ? (
                  <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Initializing Node...</>
                ) : (
                  <>Continue to Resume Upload <ChevronRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" /></>
                )}
              </Button>
              <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Awaiting final authorization handshake...</p>
            </div>
          </Card>
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
