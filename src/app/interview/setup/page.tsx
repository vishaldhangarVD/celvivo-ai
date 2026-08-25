"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  Loader2,
  Check,
  Search,
  Layers,
  Sparkles,
  Command,
  X,
  ShieldCheck
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "TCS", "Infosys", "Wipro", 
  "Accenture", "Deloitte", "Cognizant", "Capgemini", "Other"
];

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer",
  "Cloud Engineer", "Cyber Security Analyst", "UI/UX Designer", ".NET Developer",
  "Python Developer", "Java Developer", "Other"
];

const EXPERIENCE_LEVELS = ["Fresher", "0–1 Years", "1–3 Years", "3–5 Years", "5+ Years"];

const ROUNDS = [
  { id: "Technical Round", label: "Technical Round" },
  { id: "HR Round", label: "HR Round" },
  { id: "Technical + HR", label: "Technical + HR" },
  { id: "Final HR Round", label: "Final HR Round" }
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const [searchQuery, setSearchQuery] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [roundType, setRoundType] = useState("Technical + HR");
  const [isInitializing, setIsInitializing] = useState(false);

  const filteredCompanies = useMemo(() => 
    COMPANIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())), 
  [searchQuery]);

  const filteredRoles = useMemo(() => 
    ROLES.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase())), 
  [searchQuery]);

  const filteredExp = useMemo(() => 
    EXPERIENCE_LEVELS.filter(e => e.toLowerCase().includes(searchQuery.toLowerCase())), 
  [searchQuery]);

  const isFormValid = company && role && experience && roundType;

  const handleContinue = async () => {
    if (!db || !user?.uid || !isFormValid) return;

    setIsInitializing(true);
    const sessionId = Math.random().toString(36).substring(7);
    const journeyRef = doc(db, 'users', user.uid, 'journey', 'active');

    try {
      await setDoc(journeyRef, {
        sessionId,
        role,
        experience,
        company,
        roundType,
        currentStage: "RESUME_UPLOAD",
        step: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push('/resume-upload');
    } catch (e) {
      console.error(e);
      setIsInitializing(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="container mx-auto px-6 pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="text-center space-y-4 mb-16">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] text-[10px] uppercase">
              Simulation Calibration Node
            </Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">
              Interview <span className="text-gradient-purple">Setup.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto">
              Configure your interview parameters to begin the simulation.
            </p>
          </header>

          {/* Global Search Interface */}
          <div className="max-w-2xl mx-auto mb-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 to-purple-600/50 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
            <div className="relative glass border-white/10 rounded-2xl flex items-center px-6">
              <Search className="w-5 h-5 text-white/20 group-focus-within:text-accent transition-colors" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, job role, or experience..."
                className="h-16 border-none bg-transparent text-white placeholder:text-white/20 focus-visible:ring-0 text-lg font-light"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Organization Selection */}
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col h-[500px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Building2 className="w-24 h-24 text-accent" />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-accent" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Organization</h2>
                </div>
                {company && <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black uppercase">Selected</Badge>}
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(c => (
                      <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={c}
                        onClick={() => setCompany(c)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-left flex items-center justify-between group/item",
                          company === c 
                            ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                            : "glass border-white/5 text-white/40 hover:bg-white/5 hover:border-white/20"
                        )}
                      >
                        {c}
                        <div className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                          company === c ? "bg-accent border-accent text-black scale-110" : "border-white/10"
                        )}>
                          {company === c && <Check className="w-3 h-3" />}
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                      <X className="w-4 h-4 text-white/40" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching companies</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            {/* Role Selection */}
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col h-[500px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase className="w-24 h-24 text-accent" />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-accent" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Job Role</h2>
                </div>
                {role && <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black uppercase">Selected</Badge>}
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map(r => (
                      <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={r}
                        onClick={() => setRole(r)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-left flex items-center justify-between",
                          role === r 
                            ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                            : "glass border-white/5 text-white/40 hover:bg-white/5 hover:border-white/20"
                        )}
                      >
                        {r}
                        <div className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                          role === r ? "bg-accent border-accent text-black scale-110" : "border-white/10"
                        )}>
                          {role === r && <Check className="w-3 h-3" />}
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                      <X className="w-4 h-4 text-white/40" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching roles</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            {/* Experience Selection */}
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col h-[500px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <GraduationCap className="w-24 h-24 text-accent" />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-accent" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Experience</h2>
                </div>
                {experience && <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black uppercase">Selected</Badge>}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredExp.length > 0 ? (
                    filteredExp.map(l => (
                      <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={l}
                        onClick={() => setExperience(l)}
                        className={cn(
                          "w-full p-5 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between",
                          experience === l 
                            ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                            : "glass border-white/5 text-white/40 hover:bg-white/5 hover:border-white/20"
                        )}
                      >
                        {l} Grade
                        <div className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                          experience === l ? "bg-accent border-accent text-black scale-110" : "border-white/10"
                        )}>
                          {experience === l && <Check className="w-3 h-3" />}
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                      <X className="w-4 h-4 text-white/40" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching grade</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>

          {/* Round Selection Protocol */}
          <Card className="premium-card bg-white/[0.01] border-white/5 p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Interview Protocol</h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Select the assessment depth</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {ROUNDS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRoundType(r.id)}
                    className={cn(
                      "px-6 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                      roundType === r.id 
                        ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]" 
                        : "glass border-white/10 text-white/40 hover:bg-white/5"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex flex-col items-center pt-8">
            <Button 
              onClick={handleContinue}
              disabled={!isFormValid || isInitializing}
              className="w-full max-w-2xl h-20 btn-premium rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(34,211,238,0.2)] group"
            >
              {isInitializing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Continue to Upload Resume 
                  <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
            <div className="mt-8 flex items-center gap-6 opacity-30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">Encrypted Handshake</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-2">
                <Command className="w-4 h-4 text-purple-400" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">Neural Calibration v5.0</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
