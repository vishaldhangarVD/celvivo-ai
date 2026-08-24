"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  ChevronRight, 
  FileText, 
  Briefcase, 
  Loader2,
  Zap,
  Rocket,
  ArrowRight,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Target,
  History,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

const IT_ROLES = [
  "Data Analyst", "Data Scientist", "Data Analytics", "Business Analyst", "Power BI Developer",
  "SQL Developer", "Python Developer", "Full Stack Developer", "Frontend Developer",
  "Backend Developer", "React Developer", "React Native Developer", "Java Developer",
  ".NET Developer", "Node.js Developer", "Software Engineer", "Software Developer",
  "DevOps Engineer", "Cloud Engineer", "AWS Developer", "Azure Developer", "AI Engineer",
  "Machine Learning Engineer", "Deep Learning Engineer", "Generative AI Engineer",
  "NLP Engineer", "Computer Vision Engineer", "Cyber Security Analyst", "Ethical Hacker",
  "Database Administrator", "Data Engineer", "UI/UX Designer", "QA Engineer",
  "Automation Tester", "Manual Tester", "Mobile App Developer", "Android Developer",
  "iOS Developer", "Product Manager", "Project Manager", "Technical Support Engineer",
  "IT Support Engineer", "System Administrator", "Network Engineer"
];

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"];

export default function InterviewSetup() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedExp, setSelectedExp] = useState("Senior");

  // Check for active journey to allow resumption
  const activeJourneyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(activeJourneyRef);

  const filteredRoles = useMemo(() => 
    IT_ROLES.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Format Error", description: "Please upload a PDF blueprint." });
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
        return;
      }
      setFile(selected);
      setStep(2);
      toast({ title: "Blueprint Logged", description: "Select your target deployment track." });
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStep(3);
  };

  const handleStartJourney = async () => {
    if (!file || !selectedRole || !user || !db) return;
    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const analysis = await analyzeResume({ 
        resumeDataUri: base64, 
        targetRole: selectedRole 
      });

      const sessionId = Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'users', user.uid, 'journey', 'active'), {
        sessionId,
        role: selectedRole,
        experience: selectedExp,
        resumeName: file.name,
        resumeAnalysis: analysis,
        currentStage: "Aptitude Assessment",
        step: 3,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        aptitudeStatus: "not_started"
      });

      toast({ title: "Simulation Calibrated", description: "Proceeding to Aptitude round." });
      router.push('/interview/aptitude');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Analysis Failed", description: "Could not process professional blueprint." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResumeActiveSession = () => {
    if (!journey) return;
    
    toast({ title: "Resuming Session", description: `Reconnecting to ${journey.currentStage}...` });
    
    if (journey.currentStage === "Aptitude Assessment") router.push('/interview/aptitude');
    else if (journey.currentStage === "Coding Assessment") router.push('/interview/coding');
    else if (journey.currentStage === "HR Interview") router.push(`/interview/${journey.sessionId}`);
    else router.push('/interview/aptitude');
  };

  const handleAbortSession = async () => {
    if (!activeJourneyRef) return;
    await deleteDoc(activeJourneyRef);
    setStep(1);
    setFile(null);
    toast({ title: "Session Aborted", description: "Previous simulation data purged." });
  };

  if (journeyLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="flex-1 container mx-auto px-6 py-32 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          
          {/* Active Session Prompt */}
          {journey && step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card className="glass border-accent/20 bg-accent/5 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <History className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Active Simulation Detected</h3>
                    <p className="text-xs text-white/50 uppercase tracking-widest font-black">{journey.role} • {journey.currentStage}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleResumeActiveSession} className="h-12 px-8 btn-premium text-[10px] font-black tracking-widest">
                    RESUME MISSION
                  </Button>
                  <Button onClick={handleAbortSession} variant="ghost" className="h-12 px-6 rounded-xl border border-white/10 text-[10px] font-black text-red-400 hover:bg-red-500/10">
                    ABORT
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          <header className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Onboarding v6.5</Badge>
            <h1 className="text-5xl font-bold tracking-tighter text-premium">
              Arena <span className="text-gradient-purple">Registration.</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-24 rounded-full transition-all duration-500 ${step >= i ? 'bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`} />
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="step1">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-12 text-center space-y-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                    <Upload className="w-12 h-12 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Resume Blueprint Required</h2>
                    <p className="text-muted-foreground font-light max-w-sm mx-auto italic">Upload your latest professional blueprint to calibrate the neural simulation engine.</p>
                  </div>

                  <div 
                    onClick={() => !isAnalyzing && document.getElementById('resume-upload-calibration')?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer group relative overflow-hidden",
                      file ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/30 hover:bg-white/[0.02]"
                    )}
                  >
                    <input type="file" id="resume-upload-calibration" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    <div className="space-y-4">
                      <FileText className={cn("w-10 h-10 mx-auto transition-colors", file ? "text-accent" : "text-muted-foreground group-hover:text-accent")} />
                      <p className="font-bold text-lg">{file ? file.name : "Select Professional Blueprint"}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF Only • 10MB LIMIT</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : step === 2 ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step2">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Target className="w-6 h-6 text-accent" /> Deployment Track
                      </h2>
                      <p className="text-sm text-muted-foreground font-light">Specify your target job role for role-aware simulation parameters.</p>
                    </div>
                    <div className="relative w-full md:w-72 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search roles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-xl glass border-white/10 bg-transparent text-sm font-light focus:outline-none focus:border-accent/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredRoles.map(role => (
                      <button 
                        key={role} 
                        onClick={() => handleRoleSelect(role)}
                        className="text-left p-4 rounded-xl border border-white/5 glass hover:bg-accent/10 hover:border-accent/30 transition-all text-xs font-bold uppercase tracking-widest group flex items-center justify-between"
                      >
                        {role}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="step3">
                <Card className="premium-card bg-[#0b0e1a]/80 border-accent/20 p-12 text-center space-y-10 relative overflow-hidden">
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl z-50 flex flex-col items-center justify-center space-y-6">
                       <Loader2 className="w-16 h-16 text-accent animate-spin" />
                       <div className="text-center">
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Neural Engine Analyzing</p>
                         <p className="text-xs text-white/40 mt-2">Extracting skills and mapping career nodes...</p>
                       </div>
                    </div>
                  )}

                  <div className="w-24 h-24 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                    <Rocket className="w-12 h-12 text-accent" />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tighter">Calibration Ready</h2>
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-white/60 font-light">Target Role: <span className="text-accent font-bold uppercase tracking-widest">{selectedRole}</span></p>
                       <div className="flex items-center gap-4 mt-4">
                         {EXPERIENCE_LEVELS.map(l => (
                           <button 
                             key={l} 
                             onClick={() => setSelectedExp(l)}
                             className={cn(
                               "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                               selectedExp === l ? "bg-accent text-black" : "glass border-white/10 text-white/40 hover:text-white"
                             )}
                           >
                             {l}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Button 
                      onClick={handleStartJourney}
                      disabled={isAnalyzing}
                      className="w-full h-20 btn-premium rounded-[2.5rem] text-lg font-black uppercase tracking-[0.3em] shadow-2xl group"
                    >
                      Enter Assessment Arena <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" />
                    </Button>
                    <Button onClick={() => setStep(1)} variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white">
                      <RotateCcw className="w-4 h-4 mr-2" /> Recalibrate Settings
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
