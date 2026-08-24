"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ShieldCheck,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
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

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const action = searchParams.get('action');
  
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedExp, setSelectedExp] = useState("Senior");
  const [selectedCompany, setSelectedCompany] = useState("Standard Tech");

  // Check for active journey to allow resumption
  const activeJourneyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(activeJourneyRef);

  // Automatic Resumption Logic
  useEffect(() => {
    if (journeyLoading || !journey || action === 'start') return;

    if (action === 'resume') {
      const stage = journey.currentStage;
      toast({ title: "Reconnecting Session", description: `Active stage: ${stage}` });
      
      if (stage === "Aptitude Assessment") router.push('/interview/aptitude');
      else if (stage === "Coding Assessment") router.push('/interview/coding');
      else if (stage === "HR Interview") router.push(`/interview/${journey.sessionId}`);
      else router.push('/interview/aptitude');
    }
  }, [journey, journeyLoading, action, router, toast]);

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
        company: selectedCompany,
        experience: selectedExp,
        resumeName: file.name,
        resumeAnalysis: analysis,
        currentStage: "Aptitude Assessment",
        step: 3,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        aptitudeStatus: "not_started",
        codingUnlocked: false
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

  const handleAbortSession = async () => {
    if (!activeJourneyRef) return;
    await deleteDoc(activeJourneyRef);
    setStep(1);
    setFile(null);
    setSelectedRole("");
    router.push('/interview?action=start');
    toast({ title: "Session Purged", description: "Starting fresh calibration." });
  };

  if (journeyLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Neural Archives...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />
      
      <div className="flex-1 container mx-auto px-6 py-32 flex items-center justify-center">
        <div className="max-w-5xl w-full">
          
          {/* Active Session Warning for Start Action */}
          {journey && action === 'start' && step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card className="glass border-orange-500/20 bg-orange-500/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">In-Progress Simulation</h3>
                    <p className="text-xs text-white/50 uppercase tracking-widest font-black">
                      {journey.role} • {journey.currentStage}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => router.push('/interview?action=resume')} className="h-12 px-8 btn-premium text-[10px] font-black tracking-widest">
                    RESUME ACTIVE
                  </Button>
                  <Button onClick={handleAbortSession} variant="ghost" className="h-12 px-6 rounded-xl border border-white/10 text-[10px] font-black text-red-400 hover:bg-red-500/10">
                    PURGE & RESTART
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          <header className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Onboarding v7.0</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">
              Arena <span className="text-gradient-purple">Registration.</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                   <div className={cn(
                     "h-1.5 w-32 rounded-full transition-all duration-700",
                     step >= i ? "bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "bg-white/10"
                   )} />
                   <span className={cn("text-[8px] font-black uppercase tracking-widest", step >= i ? "text-accent" : "text-white/20")}>
                     {["Upload", "Target", "Calibrate"][i-1]}
                   </span>
                </div>
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="step1">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-16 text-center space-y-12">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 shadow-2xl">
                    <Upload className="w-12 h-12 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight">Professional Blueprint Required</h2>
                    <p className="text-lg text-muted-foreground font-light max-w-md mx-auto italic leading-relaxed">Upload your latest PDF resume to synchronize your professional nodes with the neural simulation engine.</p>
                  </div>

                  <div 
                    onClick={() => !isAnalyzing && document.getElementById('resume-upload-calibration')?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-[3rem] p-16 transition-all duration-500 cursor-pointer group relative overflow-hidden",
                      file ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/40 hover:bg-white/[0.02]"
                    )}
                  >
                    <input type="file" id="resume-upload-calibration" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    <div className="space-y-6">
                      <FileText className={cn("w-12 h-12 mx-auto transition-colors duration-500", file ? "text-accent animate-pulse" : "text-muted-foreground group-hover:text-accent")} />
                      <div className="space-y-2">
                        <p className="font-bold text-2xl tracking-tight">{file ? file.name : "Select Resume Blueprint"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-black">PDF ARCHIVE • 10MB LIMIT</p>
                      </div>
                    </div>
                    {!file && <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </Card>
              </motion.div>
            ) : step === 2 ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step2">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold flex items-center gap-4 tracking-tight">
                        <Target className="w-8 h-8 text-accent" /> Deployment Track
                      </h2>
                      <p className="text-muted-foreground font-light max-w-lg leading-relaxed text-lg">Define your target job role. Our neural tracks will adapt the complexity and logic probes based on industry benchmarks.</p>
                    </div>
                    <div className="relative w-full md:w-80 group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search roles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl glass border-white/10 bg-transparent text-sm font-light focus:outline-none focus:border-accent/50 transition-all placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-4">
                    {filteredRoles.map(role => (
                      <button 
                        key={role} 
                        onClick={() => handleRoleSelect(role)}
                        className="text-left p-6 rounded-[2rem] border border-white/5 glass hover:bg-white/[0.03] hover:border-accent/40 transition-all text-xs font-black uppercase tracking-widest group flex items-center justify-between"
                      >
                        <span className="group-hover:text-accent transition-colors">{role}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" />
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="step3">
                <Card className="premium-card bg-[#0b0e1a]/80 border-accent/20 p-16 text-center space-y-12 relative overflow-hidden">
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl z-50 flex flex-col items-center justify-center space-y-8">
                       <div className="relative">
                          <Loader2 className="w-20 h-20 text-accent animate-spin" />
                          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
                       </div>
                       <div className="text-center space-y-4">
                         <p className="text-2xl font-bold tracking-tight text-white">Neural Engine Analyzing</p>
                         <p className="text-[10px] font-black uppercase tracking-[0.6em] text-accent animate-pulse">Extracting skills and mapping career nodes...</p>
                       </div>
                    </div>
                  )}

                  <div className="w-24 h-24 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(34,211,238,0.2)]">
                    <Rocket className="w-12 h-12 text-accent" />
                  </div>
                  
                  <div className="space-y-6">
                    <h2 className="text-5xl font-bold tracking-tighter">Calibration Ready</h2>
                    <div className="space-y-6">
                       <div className="flex flex-wrap justify-center gap-6">
                          <div className="px-8 py-3 glass rounded-2xl border-white/5 space-y-1">
                             <p className="text-[8px] font-black uppercase text-white/30 tracking-widest text-left">Target Role</p>
                             <p className="text-lg font-bold text-accent uppercase tracking-wider">{selectedRole}</p>
                          </div>
                          <div className="px-8 py-3 glass rounded-2xl border-white/5 space-y-1">
                             <p className="text-[8px] font-black uppercase text-white/30 tracking-widest text-left">Company Track</p>
                             <p className="text-lg font-bold text-purple-400 uppercase tracking-wider">{selectedCompany}</p>
                          </div>
                       </div>

                       <div className="flex items-center justify-center gap-4 mt-8">
                         <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mr-4">SENIORITY GRADE:</p>
                         {EXPERIENCE_LEVELS.map(l => (
                           <button 
                             key={l} 
                             onClick={() => setSelectedExp(l)}
                             className={cn(
                               "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                               selectedExp === l ? "bg-accent text-black shadow-[0_0_30px_rgba(34,211,238,0.3)]" : "glass border-white/10 text-white/40 hover:text-white"
                             )}
                           >
                             {l}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-12 border-t border-white/5">
                    <Button 
                      onClick={handleStartJourney}
                      disabled={isAnalyzing}
                      className="w-full h-24 btn-premium rounded-[2.5rem] text-xl font-black uppercase tracking-[0.4em] shadow-2xl group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        ENTER SIMULATION <ArrowRight className="ml-6 w-8 h-8 transition-transform group-hover:translate-x-2" />
                      </span>
                    </Button>
                    <div className="flex items-center justify-center gap-8">
                       <Button onClick={() => setStep(1)} variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white group">
                         <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" /> Recalibrate Blueprint
                       </Button>
                    </div>
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

export default function InterviewSetup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>}>
      <InterviewSetupContent />
    </Suspense>
  );
}
