"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  Loader2,
  Check
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

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  const isFormValid = company && role && experience;

  const handleContinue = async () => {
    if (!db || !user?.uid || !isFormValid) return;

    setIsInitializing(true);
    const sessionId = Math.random().toString(36).substring(7);
    const journeyRef = doc(db, 'users', user.uid, 'journey', 'active');

    try {
      // Clear previous and set new metadata
      await setDoc(journeyRef, {
        sessionId,
        role,
        experience,
        company,
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
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Calibration</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Interview <span className="text-gradient-purple">Setup.</span></h1>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto">Configure your interview parameters to begin the simulation.</p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Company Selection */}
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col h-full shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Building2 className="w-24 h-24 text-accent" /></div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <Building2 className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Organization</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar relative z-10">
                {COMPANIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCompany(c)}
                    className={cn(
                      "p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-center h-14 flex items-center justify-center",
                      company === c ? "bg-accent/20 border-accent text-accent" : "glass border-white/5 text-white/40 hover:bg-white/5"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Card>

            {/* Role Selection */}
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col h-full shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase className="w-24 h-24 text-accent" /></div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <Briefcase className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Job Role</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar relative z-10">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      "p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-center h-14 flex items-center justify-center",
                      role === r ? "bg-accent/20 border-accent text-accent" : "glass border-white/5 text-white/40 hover:bg-white/5"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Card>

            {/* Experience Selection */}
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col h-full shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><GraduationCap className="w-24 h-24 text-accent" /></div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <GraduationCap className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Experience</h2>
              </div>
              <div className="space-y-3 relative z-10">
                {EXPERIENCE_LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setExperience(l)}
                    className={cn(
                      "w-full p-5 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between",
                      experience === l ? "bg-accent/20 border-accent text-accent" : "glass border-white/5 text-white/40 hover:bg-white/5"
                    )}
                  >
                    {l} Grade
                    {experience === l && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-12 relative z-10">
                <Button 
                  onClick={handleContinue}
                  disabled={!isFormValid || isInitializing}
                  className="w-full h-20 btn-premium rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(34,211,238,0.2)]"
                >
                  {isInitializing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Continue to Resume Upload <ArrowRight className="ml-2 w-5 h-5" /></>}
                </Button>
                <p className="text-[8px] text-center text-white/20 uppercase tracking-[0.4em] mt-6">Protocol Verification v5.0.2</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
