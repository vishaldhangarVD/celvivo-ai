"use client";

import { useState, useMemo, useCallback, useRef } from 'react';
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
  ShieldCheck,
  Upload,
  RotateCcw,
  CheckCircle2,
  Trash2,
  FileText,
  Command,
  Zap,
  Target
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';

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
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Resume State
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  const isFormValid = company && role && experience;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Format Error", description: "Only PDF blueprints are supported." });
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
        return;
      }

      setFile(selected);
      setIsVerifying(true);
      
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(selected);
      });
      
      setResumeBase64(base64);
      setTimeout(() => {
        setIsUploaded(true);
        setIsVerifying(false);
        toast({ title: "Blueprint Detected", description: "Identity file loaded successfully." });
      }, 800);
    }
  };

  const handleProceed = async (targetPath: 'aptitude' | 'interview') => {
    if (!db || !user?.uid || !isFormValid || !resumeBase64) {
      toast({ 
        variant: "destructive", 
        title: "Calibration Incomplete", 
        description: "Please ensure all selections are made and resume is uploaded." 
      });
      return;
    }

    setIsInitializing(true);
    const sessionId = journey?.sessionId || Math.random().toString(36).substring(7);

    try {
      const finalStage = targetPath === 'aptitude' ? INTERVIEW_STAGES.APTITUDE : INTERVIEW_STAGES.HR_INTERVIEW;
      const step = targetPath === 'aptitude' ? 4 : 8;

      await setDoc(journeyRef!, {
        sessionId,
        role,
        experience,
        company,
        resumeName: file?.name || journey?.resumeName || "resume.pdf",
        resumeBase64: resumeBase64,
        currentStage: finalStage,
        step,
        updatedAt: serverTimestamp(),
        createdAt: journey?.createdAt || serverTimestamp()
      }, { merge: true });

      if (targetPath === 'aptitude') {
        router.push(STAGE_ROUTES.APTITUDE);
      } else {
        router.push(`${STAGE_ROUTES.HR_INTERVIEW}${sessionId}`);
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Protocol Fault", description: "Failed to persist identity node." });
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
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          
          {/* LEFT SIDE: Calibration Controls */}
          <div className="lg:col-span-7 space-y-12">
            <header className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">
                Simulation Calibration Node
              </Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">
                Interview <span className="text-gradient-purple">Setup.</span>
              </h1>
              <p className="text-lg text-muted-foreground font-light max-w-xl">
                Configure your interview parameters to begin the simulation.
              </p>
            </header>

            <div className="space-y-8">
              {/* Organization Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                  <Building2 className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Select Organization</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COMPANIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={cn(
                        "p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-left flex items-center justify-between",
                        company === c 
                          ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                          : "glass border-white/5 text-white/40 hover:bg-white/5"
                      )}
                    >
                      {c}
                      {company === c && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                  <Briefcase className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Select Job Role</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        "p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-left flex items-center justify-between",
                        role === r 
                          ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                          : "glass border-white/5 text-white/40 hover:bg-white/5"
                      )}
                    >
                      {r}
                      {role === r && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                  <GraduationCap className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Select Experience</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {EXPERIENCE_LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setExperience(l)}
                      className={cn(
                        "px-6 py-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                        experience === l 
                          ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                          : "glass border-white/5 text-white/40 hover:bg-white/5"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Configuration Summary */}
              {isFormValid && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6 glass border-accent/20 bg-accent/5 rounded-2xl flex flex-wrap gap-8">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Organization</p>
                      <p className="text-xs font-bold text-accent">{company}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Target Role</p>
                      <p className="text-xs font-bold text-accent">{role}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Experience</p>
                      <p className="text-xs font-bold text-accent">{experience}</p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Resume & Execution */}
          <div className="lg:col-span-5 space-y-8">
            {/* Resume Upload Card */}
            <Card 
              onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
              className={cn(
                "premium-card bg-white/[0.01] border-white/5 p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 min-h-[340px] relative overflow-hidden",
                isUploaded ? "border-green-500/20 bg-green-500/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
              )}
            >
              <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
              
              <AnimatePresence mode="wait">
                {isVerifying ? (
                  <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                      <ShieldCheck className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Verifying Blueprint...</p>
                  </motion.div>
                ) : !isUploaded ? (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Resume Upload</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">PDF ONLY • MAX 10MB</p>
                    </div>
                    <Button variant="outline" className="h-10 px-8 glass border-white/10 text-[9px] font-black uppercase rounded-full">Choose File</Button>
                  </motion.div>
                ) : (
                  <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 w-full">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Blueprint Received</p>
                      <p className="text-xl font-bold text-white truncate max-w-[300px] mx-auto">{file?.name}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} 
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-red-400 transition-all mx-auto"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Blueprint
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Next Steps / Protocol Selection */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 ml-2">Select Mission Protocol</h3>
              <div className="grid gap-4">
                {/* Aptitude Round Card */}
                <Card 
                  onClick={() => isFormValid && isUploaded && handleProceed('aptitude')}
                  className={cn(
                    "glass p-6 rounded-[2rem] border transition-all duration-300 group/btn relative overflow-hidden",
                    !isFormValid || !isUploaded ? "opacity-40 grayscale cursor-not-allowed border-white/5" : "hover:border-accent/40 hover:bg-accent/5 cursor-pointer border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover/btn:text-accent group-hover/btn:bg-accent/10 transition-all">
                        <Command className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-bold">Aptitude Round</h4>
                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Logical & Quantitative Audit</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full glass border-white/10 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>

                {/* Interview Round Card */}
                <Card 
                  onClick={() => isFormValid && isUploaded && handleProceed('interview')}
                  className={cn(
                    "glass p-6 rounded-[2rem] border transition-all duration-300 group/btn relative overflow-hidden",
                    !isFormValid || !isUploaded ? "opacity-40 grayscale cursor-not-allowed border-white/5" : "hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover/btn:text-purple-400 group-hover/btn:bg-purple-400/10 transition-all">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-bold">Interview Round</h4>
                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">AI Virtual HR Simulation</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full glass border-white/10 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex items-center justify-center gap-6 opacity-30 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Secure Session</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Target Aware</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
