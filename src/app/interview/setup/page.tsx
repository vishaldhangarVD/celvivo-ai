"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  Loader2,
  Check,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Trash2,
  FileText,
  Command,
  Zap,
  Target,
  ChevronRight,
  Info,
  Layers
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

  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Fresher");
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  useEffect(() => {
    if (journey) {
      if (journey.company) setCompany(journey.company);
      if (journey.role) setRole(journey.role);
      if (journey.experience) setExperience(journey.experience);
      if (journey.resumeBase64) {
        setResumeBase64(journey.resumeBase64);
        setIsUploaded(true);
      }
    }
  }, [journey]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Format Error", description: "Only PDF blueprints are supported." });
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
      }, 1000);
    }
  };

  const handleProceed = async (targetPath: 'aptitude' | 'interview') => {
    if (!db || !user?.uid || !resumeBase64) {
      toast({ 
        variant: "destructive", 
        title: "Calibration Incomplete", 
        description: "Please upload your resume to begin." 
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
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="flex-1 container mx-auto px-6 pt-24 pb-4 overflow-hidden flex flex-col min-h-0">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 flex-1 min-h-0 w-full">
          
          {/* LEFT COLUMN: Calibration */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-0">
            <header className="space-y-2 mb-6 shrink-0">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">
                SIMULATION CALIBRATION NODE
              </Badge>
              <h1 className="text-5xl font-bold tracking-tighter text-premium">
                Interview Setup.
              </h1>
              <p className="text-base text-muted-foreground font-light max-w-xl">
                Configure your interview parameters to begin the simulation.
              </p>
            </header>

            <div className="space-y-6 flex-1 min-h-0 overflow-y-auto md:overflow-visible pr-2 custom-scrollbar">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">ORGANIZATION</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger className="h-14 glass border-white/10 bg-transparent rounded-2xl px-6 text-sm font-bold uppercase tracking-widest text-white">
                    <SelectValue placeholder="Select Organization" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">JOB ROLE</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-14 glass border-white/10 bg-transparent rounded-2xl px-6 text-sm font-bold uppercase tracking-widest text-white">
                    <SelectValue placeholder="Select Job Role" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">EXPERIENCE LEVEL</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setExperience(l)}
                      className={cn(
                        "px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
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

              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">SELECTED CONFIGURATION</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Organization", val: company, icon: Building2 },
                    { label: "Job Role", val: role, icon: Briefcase },
                    { label: "Experience Level", val: experience, icon: GraduationCap }
                  ].map((item, i) => (
                    <Card key={i} className="p-4 glass border-accent/20 bg-accent/5 rounded-2xl space-y-2">
                       <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                         <item.icon className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-[12px] font-bold text-white leading-tight truncate">{item.val}</p>
                         <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-1">{item.label}</p>
                       </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => document.getElementById('next-steps-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full h-16 btn-premium text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] mt-4"
              >
                CONTINUE TO NEXT STEP
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Resume & Actions */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-0 gap-6">
            
            {/* RESUME UPLOAD */}
            <div className="space-y-3 shrink-0">
              <h2 className="text-xl font-bold tracking-tighter ml-2">Resume Upload</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest ml-2">Upload your professional blueprint to calibrate the simulation.</p>
              
              <Card 
                onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
                className={cn(
                  "premium-card bg-white/[0.01] border-white/5 p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 h-[240px] relative overflow-hidden shrink-0",
                  isUploaded ? "border-green-500/20 bg-green-500/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
                )}
              >
                <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
                
                <AnimatePresence mode="wait">
                  {isVerifying ? (
                    <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                        <ShieldCheck className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Verifying Blueprint...</p>
                    </motion.div>
                  ) : !isUploaded ? (
                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-accent" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">Choose File</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop Resume area</p>
                      </div>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest">Supported formats: PDF (Max 10MB)</p>
                    </motion.div>
                  ) : (
                    <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 w-full">
                      <div className="relative mx-auto w-16 h-20 glass rounded-xl border-white/10 flex items-center justify-center overflow-hidden">
                        <FileText className="w-8 h-8 text-white/20" />
                        <Badge className="absolute top-1 right-1 bg-red-500/20 text-red-500 border-none text-[8px] font-black px-1 py-0.5">PDF</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-white truncate max-w-[280px] mx-auto">{file?.name || journey?.resumeName}</p>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                          {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "Blueprint Synced"}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} 
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-red-400 transition-all mx-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Blueprint
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>

            {/* NEXT STEPS */}
            <div id="next-steps-section" className="space-y-4 flex-1 min-h-0 flex flex-col justify-end pb-2">
              <div className="space-y-1 ml-2 shrink-0">
                <h3 className="text-xl font-bold tracking-tighter">NEXT STEPS</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Choose how you want to proceed with your assessment</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 shrink-0">
                {/* Aptitude Card */}
                <Card className="glass border-white/5 bg-white/[0.01] p-5 rounded-[2rem] flex flex-col justify-between hover:border-accent/40 transition-all group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Command className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-widest">Aptitude Round</h4>
                      <p className="text-[10px] text-white/30 leading-tight font-medium">Logical, quantitative, and verbal intelligence audit.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProceed('aptitude')}
                    disabled={isInitializing || !isUploaded}
                    className="w-full h-11 mt-4 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
                  >
                    CONTINUE TO APTITUDE
                  </Button>
                </Card>

                {/* Interview Card */}
                <Card className="glass border-white/5 bg-white/[0.01] p-5 rounded-[2rem] flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-widest">Interview Round</h4>
                      <p className="text-[10px] text-white/30 leading-tight font-medium">Hyper-realistic AI virtual executive simulation.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProceed('interview')}
                    disabled={isInitializing || !isUploaded}
                    className="w-full h-11 mt-4 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                  >
                    CONTINUE TO INTERVIEW
                  </Button>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
