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
  ShieldCheck,
  Upload,
  Trash2,
  FileText,
  Command,
  Zap,
  ChevronRight,
  RotateCcw,
  Layers
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

const COMPANIES = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "TCS", domain: "tcs.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "Wipro", domain: "wipro.com" },
  { name: "Cognizant", domain: "cognizant.com" },
  { name: "Capgemini", domain: "capgemini.com" },
  { name: "Other", domain: "" }
];

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer",
  "Cloud Engineer", "Cyber Security Analyst", "UI/UX Designer", ".NET Developer",
  "Python Developer", "Java Developer", "Other"
];

const EXPERIENCE_LEVELS = ["Fresher", "0–1 Years", "1–3 Years", "3–5 Years", "5+ Years"];

// Local SVG Brand Logos to ensure reliability and offline support
const CompanyLogo = ({ name, className }: { name: string, className?: string }) => {
  const size = "100%";
  
  switch (name) {
    case "Google":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ width: size, height: size }}>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      );
    case "Microsoft":
      return (
        <svg viewBox="0 0 23 23" className={className} style={{ width: size, height: size }}>
          <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
        </svg>
      );
    case "Amazon":
      return (
        <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
          <path fill="#FF9900" d="M20.5 66.8c18.5 12.3 40.5 12.3 59 0-1.8-1.5-3.8-2.5-6-3.2-16.5 9-34.5 9-50.5 0-1.2.7-2 1.8-2.5 3.2z"/>
          <path fill="#000000" d="M79.5 56.5c1.8 1.5 3.5 3.2 4.8 5.2.8 1.2.8 2.8 0 4-.5.8-1.2 1.5-2 2L80 66c-1.5 1-3.2 1-4.8 0l-2.5-1.5c-.8-.5-1.2-1.2-1.5-2 0-1.2.5-2.5 1.5-3.2l6.8-4.8z"/>
        </svg>
      );
    case "Meta":
      return (
        <svg viewBox="0 0 512 512" className={className} style={{ width: size, height: size }}>
          <path fill="#0668E1" d="M437 175c-35-51-105-51-140 0L135 348c-8 11-20 17-33 17-25 0-46-21-46-46 0-13 6-25 17-33l35-25c4-3 5-8 2-12s-8-5-12-2l-35 25C26 295 10 326 10 359c0 53 43 96 96 96 35 0 67-18 85-48l162-241c8-11 20-17 33-17 25 0 46 21 46 46 0 13-6 25-17 33l-35 25c-4 3-5 8-2 12s8 5 12 2l35-25c37-23 53-54 53-87 0-53-43-96-96-96-35 0-67 18-85 48L114 348c-35 51 35 102 70 51L346 226c8-11 20-17 33-17 25 0 46 21 46 46 0 13-6 25-17 33l-35 25c-4 3-5 8-2 12s8 5 12 2l35-25c37-23 53-54 53-87 0-13-4-26-11-38z"/>
        </svg>
      );
    case "Apple":
      return (
        <svg viewBox="0 0 512 512" className={className} style={{ width: size, height: size }}>
          <path fill="#FFFFFF" d="M388.5 352.7c-5.6-3.4-11.2-6.5-16.7-9.5-38.3-21.2-69.7-18.3-95.2 7-23.7 23.5-51.5 24.2-76 6.8-21.5-15.3-33-39.7-33-72.3 0-56.4 34.3-107.5 90.7-107.5 31 0 54.3 16.5 73.2 16.5 17.5 0 42-17.5 75.8-17.5 13.8 0 27.5 2.8 40.2 8.3-43.4 23.2-65.4 69.5-54.3 118.8 11.2 49.3 46 83.2 92.5 99.3-18.7 54.3-51.5 101.5-97.2 142.2zM286.2 56.5c0-42.5 35.3-77 78.5-77 3.4 0 6.8.2 10.1.7-2.3 43-37.4 76-78.5 76.3-3.4 0-6.8-.2-10.1-.7z"/>
        </svg>
      );
    case "IBM":
      return (
        <svg viewBox="0 0 32 32" className={className} style={{ width: size, height: size }}>
          <path fill="#0062ff" d="M22 6h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8zM2 6h8v2H2zm0 4h8v2H2zm0 4h8v2H2zm0 4h8v2H2zm10-12h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8z"/>
        </svg>
      );
    case "Accenture":
      return (
        <svg viewBox="0 0 256 256" className={className} style={{ width: size, height: size }}>
          <path fill="#a100ff" d="M128 0C57.314 0 0 57.314 0 128s57.314 128 128 128 128-57.314 128-128S198.686 0 128 0zm64 128h-32l-32-32 32-32h32l-32 32 32 32z"/>
        </svg>
      );
    case "Deloitte":
      return (
        <svg viewBox="0 0 256 256" className={className} style={{ width: size, height: size }}>
          <circle cx="210" cy="190" r="24" fill="#86bc25"/><path fill="#FFFFFF" d="M40 70h20v116H40zm40 0h50c25 0 40 12 40 34 0 18-10 28-24 32 16 4 28 14 28 34 0 22-15 36-44 36H80zm20 18v34h30c12 0 20-6 20-17s-8-17-20-17zm0 50v34h34c12 0 20-6 20-17s-8-17-20-17z"/>
        </svg>
      );
    case "TCS":
      return (
        <svg viewBox="0 0 120 120" className={className} style={{ width: size, height: size }}>
          <path fill="#0054a6" d="M60 10C32.4 10 10 32.4 10 60s22.4 50 50 50 50-22.4 50-50S87.6 10 60 10zm0 85c-19.3 0-35-15.7-35-35s15.7-35 35-35 35 15.7 35 35-15.7 35-35 35z"/>
          <path fill="#0054a6" d="M60 40c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20z"/>
        </svg>
      );
    case "Infosys":
      return (
        <svg viewBox="0 0 128 128" className={className} style={{ width: size, height: size }}>
          <path fill="#007cc3" d="M10 20h108v88H10z"/><path fill="#FFFFFF" d="M25 40h15v10H25zm25 0h15v10H50zm25 0h15v10H75zm25 0h15v10h-15zm-75 25h15v10H25zm25 0h15v10H50zm25 0h15v10H75zm25 0h15v10h-15zm-75 25h15v10H25zm25 0h15v10H50zm25 0h15v10H75zm25 0h15v10h-15z"/>
        </svg>
      );
    default:
      return <Building2 className={cn("text-accent", className)} style={{ width: size, height: size }} />;
  }
};

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
      toast({ variant: "destructive", title: "Calibration Incomplete", description: "Please upload your resume to begin." });
      return;
    }

    setIsInitializing(true);
    const sessionId = journey?.sessionId || Math.random().toString(36).substring(7);

    try {
      // CALIBRATE NEURAL ENGINE WITH FRESH RESUME DATA
      const analysisResult = await analyzeResume({
        resumeDataUri: resumeBase64,
        targetRole: role,
        experienceLevel: experience,
        targetCompany: company
      });

      const finalStage = targetPath === 'aptitude' ? INTERVIEW_STAGES.APTITUDE : INTERVIEW_STAGES.HR_INTERVIEW;
      const step = targetPath === 'aptitude' ? 4 : 8;

      await setDoc(journeyRef!, {
        sessionId,
        role,
        experience,
        company,
        resumeName: file?.name || journey?.resumeName || "resume.pdf",
        resumeBase64: resumeBase64,
        resumeAnalysis: analysisResult,
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
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 flex-1 min-h-0 w-full">
          
          <div className="lg:col-span-7 flex flex-col h-full min-h-0">
            <header className="space-y-1 mb-4 shrink-0">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-0.5 text-[9px] tracking-[0.4em] font-black uppercase">
                INTERVIEW PREPARATION
              </Badge>
              <h1 className="text-4xl font-bold tracking-tighter text-premium">
                Set Up Your Interview.
              </h1>
              <p className="text-sm text-muted-foreground font-light max-w-xl">
                Choose your company, job role, experience level, and upload your resume to get started.
              </p>
            </header>

            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto md:overflow-visible pr-2 custom-scrollbar">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">ORGANIZATION</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger className="h-12 glass border-white/10 bg-transparent rounded-xl px-4 text-sm font-bold uppercase tracking-widest text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <CompanyLogo name={company} />
                      </div>
                      <SelectValue placeholder="Select Organization" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {COMPANIES.map(c => (
                      <SelectItem key={c.name} value={c.name}>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <CompanyLogo name={c.name} />
                          </div>
                          <span>{c.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">JOB ROLE</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 glass border-white/10 bg-transparent rounded-xl px-4 text-sm font-bold uppercase tracking-widest text-white">
                    <SelectValue placeholder="Select Job Role" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">EXPERIENCE LEVEL</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setExperience(l)}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                        experience === l 
                          ? "bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                          : "glass border-white/5 text-white/40 hover:bg-white/5"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">SELECTED CONFIGURATION</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Organization", val: company, icon: Building2 },
                    { label: "Job Role", val: role, icon: Briefcase },
                    { label: "Experience Level", val: experience, icon: GraduationCap }
                  ].map((item, i) => (
                    <Card key={i} className="p-3 glass border-accent/20 bg-accent/5 rounded-2xl space-y-1.5">
                       <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                         {item.label === "Organization" ? (
                           <div className="w-4 h-4 flex items-center justify-center">
                             <CompanyLogo name={item.val} />
                           </div>
                         ) : <item.icon className="w-4 h-4" />}
                       </div>
                       <div>
                         <p className="text-[11px] font-bold text-white leading-tight truncate">{item.val}</p>
                         <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-0.5">{item.label}</p>
                       </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => document.getElementById('next-steps-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full h-14 btn-premium text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] mt-2"
              >
                CONTINUE TO NEXT STEP
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col h-full min-h-0 gap-4">
            <div className="space-y-2 shrink-0">
              <h2 className="text-lg font-bold tracking-tighter ml-2 uppercase">Resume Upload</h2>
              <Card 
                onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
                className={cn(
                  "premium-card bg-white/[0.01] border-white/5 p-4 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 h-[180px] relative overflow-hidden shrink-0",
                  isUploaded ? "border-green-500/20 bg-green-500/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
                )}
              >
                <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
                <AnimatePresence mode="wait">
                  {isVerifying ? (
                    <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                        <ShieldCheck className="w-5 h-5 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Verifying Blueprint...</p>
                    </motion.div>
                  ) : !isUploaded ? (
                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-accent" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold">Choose File</h3>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop Resume area</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 w-full">
                      <div className="relative mx-auto w-12 h-14 glass rounded-lg border-white/10 flex items-center justify-center overflow-hidden">
                        <FileText className="w-6 h-6 text-white/20" />
                        <Badge className="absolute top-0.5 right-0.5 bg-red-500/20 text-red-500 border-none text-[6px] font-black px-1">PDF</Badge>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-white truncate max-w-[240px] mx-auto">{file?.name || journey?.resumeName}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} 
                          className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/30 hover:text-red-400 transition-all mx-auto pt-2"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remove Blueprint
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>

            <div id="next-steps-section" className="space-y-3 flex-1 min-h-0 flex flex-col justify-end pb-2">
              <div className="space-y-0.5 ml-2 shrink-0">
                <h3 className="text-lg font-bold tracking-tighter uppercase">NEXT STEPS</h3>
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Choose how you want to proceed with your assessment</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <Card className="glass border-white/5 bg-white/[0.01] p-4 rounded-[1.5rem] flex flex-col justify-between hover:border-accent/40 transition-all group">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Command className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest">Aptitude Round</h4>
                      <p className="text-[8px] text-white/30 leading-tight font-medium">Logical intelligence audit.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProceed('aptitude')}
                    disabled={isInitializing || !isUploaded}
                    className="w-full h-9 mt-3 rounded-lg glass border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
                  >
                    {isInitializing ? <Loader2 className="w-3 h-3 animate-spin" /> : "CONTINUE TO APTITUDE"}
                  </Button>
                </Card>

                <Card className="glass border-white/5 bg-white/[0.01] p-4 rounded-[1.5rem] flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest">Interview Round</h4>
                      <p className="text-[8px] text-white/30 leading-tight font-medium">AI executive simulation.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProceed('interview')}
                    disabled={isInitializing || !isUploaded}
                    className="w-full h-9 mt-3 rounded-lg glass border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                  >
                    {isInitializing ? <Loader2 className="w-3 h-3 animate-spin" /> : "CONTINUE TO INTERVIEW"}
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
