"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Building2, 
  Upload, 
  SearchCheck, 
  Zap, 
  Code2, 
  Mic, 
  FileText, 
  Loader2, 
  CircleCheck, 
  ShieldCheck, 
  Search, 
  Layers, 
  Database, 
  GraduationCap, 
  Clock, 
  Award, 
  Globe,
  Trash2,
  CircleAlert,
  TrendingUp,
  Sparkles,
  Timer as TimerIcon,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Cpu,
  Monitor,
  Cloud,
  MessageSquare,
  History,
  LayoutDashboard,
  Target,
  CheckCircle2,
  FileSearch2,
  BarChart3,
  Lightbulb,
  User,
  FileStack,
  Calendar,
  ClipboardCheck,
  RotateCcw,
  BookOpen,
  ArrowRight,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  LogOut,
  AlertCircle,
  Home,
  ArrowLeft
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUser, useFirestore } from '@/firebase';
import { doc, serverTimestamp, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { generateAptitudeTest } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { generateCodingChallenge } from '@/ai/flows/ai-coding-generator';
import { evaluateCodingSubmission } from '@/ai/flows/ai-coding-evaluator';
import { executeCode } from '@/lib/piston';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_ROLES = [
  { id: 'fullstack', name: "Full Stack Developer", category: "Full Stack", icon: Layers },
  { id: 'java', name: "Java Developer", category: "Software Development", icon: Code2 },
  { id: 'python', name: "Python Developer", category: "Software Development", icon: Code2 },
  { id: 'c', name: "C Developer", category: "Software Development", icon: Code2 },
  { id: 'cpp', name: "C++ Developer", category: "Software Development", icon: Code2 },
  { id: 'csharp', name: "C# Developer", category: "Software Development", icon: Code2 },
  { id: 'dotnet', name: ".NET Developer", category: "Software Development", icon: Code2 },
  { id: 'golang', name: "Golang Developer", category: "Software Development", icon: Code2 },
  { id: 'rust', name: "Rust Developer", category: "Software Development", icon: Code2 },
  { id: 'php', name: "PHP Developer", category: "Software Development", icon: Code2 },
  { id: 'react', name: "React Developer", category: "Frontend", icon: Monitor },
  { id: 'angular', name: "Angular Developer", category: "Frontend", icon: Monitor },
  { id: 'vue', name: "Vue.js Developer", category: "Frontend", icon: Monitor },
  { id: 'frontend', name: "Frontend Developer", category: "Frontend", icon: Monitor },
  { id: 'nodejs', name: "Node.js Developer", category: "Backend", icon: Database },
  { id: 'springboot', name: "Spring Boot Developer", category: "Backend", icon: Database },
  { id: 'django', name: "Django Developer", category: "Backend", icon: Database },
  { id: 'laravel', name: "Laravel Developer", category: "Backend", icon: Database },
  { id: 'backend', name: "Backend Developer", category: "Backend", icon: Database },
  { id: 'data-analyst', name: "Data Analyst", category: "Data", icon: TrendingUp },
  { id: 'data-scientist', name: "Data Scientist", category: "Data", icon: Database },
  { id: 'data-engineer', name: "Data Engineer", category: "Data", icon: Layers },
  { id: 'devops', name: "DevOps Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'ai', name: "AI Engineer", category: "AI & ML", icon: Zap },
];

const EXPERIENCE_OPTIONS = [
  { id: 'fresher', label: 'Fresher', desc: 'Entry-level talent', icon: Zap },
  { id: '0-1', label: '0–1 Years', desc: 'Early career', icon: Clock },
  { id: '1-3', label: '1–3 Years', desc: 'Junior / Mid-level', icon: Award },
  { id: '3-5', label: '3–5 Years', desc: 'Mid / Senior grade', icon: ShieldCheck },
  { id: '5+', label: '5+ Years', desc: 'Expert / Lead grade', icon: Target },
];

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "TCS", "Infosys", "Wipro", "Accenture", "Deloitte"];

const INTERVIEW_STEPS = [
  { id: 1, title: 'Job Role', icon: Briefcase },
  { id: 2, title: 'Experience', icon: GraduationCap },
  { id: 3, title: 'Company', icon: Building2 },
  { id: 4, title: 'Resume', icon: Upload },
  { id: 5, title: 'Analysis', icon: SearchCheck },
  { id: 6, title: 'Aptitude', icon: Zap },
  { id: 7, title: 'Aptitude Result', icon: FileText },
  { id: 8, title: 'Coding Round', icon: Code2 },
  { id: 9, title: 'Coding Result', icon: Award },
  { id: 10, title: 'HR Interview', icon: Mic },
];

export default function InterviewJourney() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  
  const [isGeneratingAptitude, setIsGeneratingAptitude] = useState(false);
  const [aiAptitudeQuestions, setAiAptitudeQuestions] = useState<any[]>([]);
  const [aptitudeIdx, setAptitudeIdx] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, string>>({});
  const [isAptitudeEvaluating, setIsAptitudeEvaluating] = useState(false);
  const [aptitudeReport, setAptitudeReport] = useState<any>(null);
  const [aptitudeStartTime, setAptitudeStartTime] = useState<number | null>(null);
  const [aptitudeRemainingTime, setAptitudeRemainingTime] = useState<number | null>(null);
  const [hasWarnedTime, setHasWarnedTime] = useState(false);

  const [isGeneratingCoding, setIsGeneratingCoding] = useState(false);
  const [codingProblem, setCodingProblem] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isCodingEvaluating, setIsCodingEvaluating] = useState(false);
  const [codingReport, setCodingReport] = useState<any>(null);

  const [showRecovery, setShowRecovery] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  useEffect(() => {
    async function loadActiveSession() {
      if (!user || !db) return;
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.step < 11) {
          setShowRecovery(true);
        }
      }
      setIsInitializing(false);
    }
    loadActiveSession();
  }, [user, db]);

  const resumeSession = async () => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'journey', 'active');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setCurrentStep(data.step || 1);
      setSelectedRole(data.role || "");
      setSelectedExp(data.experience || "");
      setSelectedCompany(data.company || "");
      setResumeAnalysis(data.resumeAnalysis || null);
      setAptitudeReport(data.aptitudeReport || null);
      setCodingReport(data.codingReport || null);
      setAptitudeRemainingTime(data.aptitudeRemainingTime ?? null);
      setAptitudeAnswers(data.aptitudeAnswers || {});
      setAptitudeIdx(data.aptitudeIdx || 0);
      setAiAptitudeQuestions(data.aiAptitudeQuestions || []);
      setCodingProblem(data.codingProblem || null);
      setCode(data.code || "");
    }
    setShowRecovery(false);
  };

  const handleGlobalReset = async () => {
    if (!user || !db) return;
    setIsCleaningUp(true);
    
    try {
      // Clear Firestore Active Session
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      await deleteDoc(docRef);
      
      // Clear only interview-related local storage
      localStorage.removeItem("resumeAnalysis");
      sessionStorage.removeItem("activeInterviewId");
      
      // Reset UI state
      setCurrentStep(1);
      setSelectedRole("");
      setSelectedExp("");
      setSelectedCompany("");
      setResumeAnalysis(null);
      setAptitudeReport(null);
      setCodingReport(null);
      setAptitudeAnswers({});
      setAiAptitudeQuestions([]);
      setCodingProblem(null);
      setCode("");
      setFile(null);
      
      setShowRecovery(false);
      toast({ title: "Neural Link Reset", description: "All active journey nodes have been purged. Account remains active." });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleGoHome = async () => {
    await handleGlobalReset();
    router.push('/dashboard');
  };

  const handleBackNavigation = async () => {
    if (currentStep <= 1) {
      handleGoHome();
      return;
    }
    
    const prevStep = currentStep - 1;
    
    // Cloud Pruning Logic: Delete all temporary data associated with steps AFTER the target step
    const updates: any = {
      step: prevStep,
      updatedAt: serverTimestamp()
    };

    // If going back to Role/Exp/Company selection (Steps 1-3)
    if (prevStep < 4) {
      updates.resumeAnalysis = null;
    }
    
    // If going back before Aptitude (Steps 1-5)
    if (prevStep < 6) {
      updates.aiAptitudeQuestions = null;
      updates.aptitudeReport = null;
      updates.aptitudeAnswers = null;
      updates.aptitudeRemainingTime = null;
      updates.aptitudeIdx = null;
    }

    // If going back before Coding (Steps 1-7)
    if (prevStep < 8) {
      updates.codingProblem = null;
      updates.codingReport = null;
      updates.code = null;
    }

    // If going back before HR Interview (Steps 1-9)
    if (prevStep < 10) {
      updates.sessionId = null;
    }

    if (user && db) {
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      await updateDoc(docRef, updates);
    }

    // Local State Sync
    if (prevStep < 8) { setCodingProblem(null); setCodingReport(null); setCode(""); }
    if (prevStep < 6) { setAiAptitudeQuestions([]); setAptitudeReport(null); setAptitudeAnswers({}); setAptitudeRemainingTime(null); setAptitudeIdx(0); }
    if (prevStep < 4) { setResumeAnalysis(null); setFile(null); }
    
    setCurrentStep(prevStep);
    toast({ 
      title: "Neural Vector Reversed", 
      description: `Reverting to ${INTERVIEW_STEPS[prevStep-1].title}. Future nodes cleared.` 
    });
  };

  // Aptitude Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 6 && aptitudeRemainingTime !== null && aptitudeRemainingTime > 0) {
      interval = setInterval(() => {
        setAptitudeRemainingTime((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            handleAptitudeSubmit();
            return 0;
          }
          const next = prev - 1;
          if (next === 120 && !hasWarnedTime) {
            toast({ variant: "destructive", title: "2-Minute Warning", description: "Aptitude time is nearly exhausted." });
            setHasWarnedTime(true);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, aptitudeRemainingTime, hasWarnedTime]);

  const saveProgress = async (step: number, extra = {}) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'journey', 'active');
    await setDoc(docRef, {
      step,
      role: selectedRole,
      experience: selectedExp,
      company: selectedCompany,
      resumeAnalysis,
      aptitudeReport,
      codingReport,
      updatedAt: serverTimestamp(),
      ...extra
    }, { merge: true });
  };

  const nextStep = (step?: number) => {
    const nextS = step || currentStep + 1;
    setCurrentStep(nextS);
    saveProgress(nextS);
  };

  const handleResumeSync = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });
      const result = await analyzeResume({ 
        resumeDataUri: base64, 
        targetRole: selectedRole,
        experienceLevel: selectedExp,
        targetCompany: selectedCompany
      });
      setResumeAnalysis(result);
      saveProgress(5, { resumeAnalysis: result });
      setCurrentStep(5);
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartAptitude = async () => {
    setIsGeneratingAptitude(true);
    try {
      const result = await generateAptitudeTest({
        role: selectedRole,
        company: selectedCompany,
        experienceLevel: selectedExp,
        resumeSummary: resumeAnalysis?.summary || ""
      });
      const initialTime = 900;
      setAiAptitudeQuestions(result.questions);
      setAptitudeStartTime(Date.now());
      setAptitudeRemainingTime(initialTime);
      saveProgress(6, { 
        aiAptitudeQuestions: result.questions,
        aptitudeRemainingTime: initialTime,
        aptitudeIdx: 0,
        aptitudeAnswers: {}
      });
      setCurrentStep(6);
    } catch (e) {
      toast({ variant: "destructive", title: "Synthesis Error" });
    } finally {
      setIsGeneratingAptitude(false);
    }
  };

  const handleAptitudeAnswerSelection = (idx: number, opt: string) => {
    const newAnswers = { ...aptitudeAnswers, [idx]: opt };
    setAptitudeAnswers(newAnswers);
    saveProgress(6, { aptitudeAnswers: newAnswers });
  };

  const handleAptitudeSubmit = async () => {
    setIsAptitudeEvaluating(true);
    try {
      const timeTaken = aptitudeStartTime ? Math.round((Date.now() - aptitudeStartTime) / 1000) : 900;
      const results = aiAptitudeQuestions.map((q, idx) => ({
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        userAnswer: aptitudeAnswers[idx] || "Skipped",
        correctAnswer: q.answer,
        isCorrect: aptitudeAnswers[idx] === q.answer
      }));

      const evaluation = await evaluateAptitude({
        role: selectedRole,
        company: selectedCompany,
        experienceLevel: selectedExp,
        timeTakenSeconds: timeTaken,
        totalQuestions: aiAptitudeQuestions.length,
        results
      });

      setAptitudeReport(evaluation);
      saveProgress(7, { aptitudeReport: evaluation });
      setCurrentStep(7);
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Error" });
    } finally {
      setIsAptitudeEvaluating(false);
    }
  };

  const handleStartCoding = async () => {
    setIsGeneratingCoding(true);
    try {
      const result = await generateCodingChallenge({
        role: selectedRole,
        company: selectedCompany,
        experienceLevel: selectedExp,
        resumeSummary: resumeAnalysis?.summary || "",
        aptitudePerformance: aptitudeReport?.recommendation || ""
      });
      setCodingProblem(result);
      setCode(result.starterCode.javascript);
      saveProgress(8, { codingProblem: result, code: result.starterCode.javascript });
      setCurrentStep(8);
    } catch (e) {
      toast({ variant: "destructive", title: "Synthesis Error" });
    } finally {
      setIsGeneratingCoding(false);
    }
  };

  const handleCodingSubmit = async () => {
    setIsCodingEvaluating(true);
    try {
      const execResult = await executeCode(selectedLanguage, code);
      const audit = await evaluateCodingSubmission({
        problem: codingProblem,
        code,
        language: selectedLanguage,
        executionOutput: execResult.output,
        executionError: execResult.stderr
      });
      setCodingReport(audit);
      saveProgress(9, { codingReport: audit });
      setCurrentStep(9);
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Error" });
    } finally {
      setIsCodingEvaluating(false);
    }
  };

  const startArena = async () => {
    const sessId = Math.random().toString(36).substring(7);
    await saveProgress(10, { sessionId: sessId });
    router.push(`/interview/${sessId}?role=${encodeURIComponent(selectedRole)}&company=${encodeURIComponent(selectedCompany)}&exp=${encodeURIComponent(selectedExp)}&round=Virtual%20Interview`);
  };

  if (isInitializing || isCleaningUp) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={handleGoHome} onBack={handleBackNavigation} />
      
      <div className="container mx-auto px-6 py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          
          <aside className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Simulation Journey</Badge>
              <h1 className="text-3xl font-bold tracking-tighter text-premium">Mission <br /><span className="text-gradient-purple">Progress.</span></h1>
            </div>

            <nav className="space-y-2">
              {INTERVIEW_STEPS.map((step) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                return (
                  <div key={step.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isActive ? 'bg-accent/10 border-accent/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : isCompleted ? 'bg-green-500/10 border-green-500/20' : 'opacity-20 grayscale'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-500/20 text-green-400' : isActive ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/40'}`}>
                      {isCompleted ? <CircleCheck className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/40'}`}>{step.title}</p>
                  </div>
                );
              })}
            </nav>

            <div className="pt-8 border-t border-white/5 space-y-4">
               {currentStep > 1 && (
                 <Button onClick={handleBackNavigation} variant="ghost" className="w-full h-14 rounded-2xl glass border-white/5 text-white/60 hover:text-white gap-3 text-[10px] font-bold uppercase tracking-widest">
                   <ArrowLeft className="w-4 h-4" /> Go Back
                 </Button>
               )}

               <AlertDialog>
                 <AlertDialogTrigger asChild>
                   <Button variant="ghost" className="w-full h-14 rounded-2xl glass border-white/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-3 text-[10px] font-bold uppercase tracking-widest">
                     <RotateCcw className="w-4 h-4" /> Restart Session
                   </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                   <AlertDialogHeader>
                     <AlertDialogTitle>Restart Simulation Journey?</AlertDialogTitle>
                     <AlertDialogDescription className="text-muted-foreground">
                       This will terminate your active progress and purge current draft data. Historical interview archives will remain intact. Account stays logged in. Confirm?
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel className="bg-transparent text-white border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                     <AlertDialogAction onClick={handleGlobalReset} className="bg-red-500 text-white hover:bg-red-600">Execute Reset</AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>

               <Button onClick={handleGoHome} variant="ghost" className="w-full h-14 rounded-2xl glass border-white/5 text-accent hover:bg-accent/10 gap-3 text-[10px] font-bold uppercase tracking-widest">
                  <Home className="w-4 h-4" /> Command Hub
               </Button>
            </div>
          </aside>

          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {showRecovery ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center py-20">
                  <Card className="premium-card bg-white/[0.02] border-accent/20 p-12 text-center max-w-xl space-y-10">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/30 shadow-2xl">
                       <History className="w-10 h-10 text-accent animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-3xl font-bold tracking-tighter">Neural Handshake Recovery</h2>
                       <p className="text-muted-foreground font-light leading-relaxed">
                         We detected an abandoned simulation protocol. Would you like to resume your active mission or initialize a fresh protocol?
                       </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <Button onClick={resumeSession} className="flex-1 h-16 btn-premium text-[10px] font-bold uppercase tracking-[0.2em]">
                         Resume Session <ChevronRight className="ml-2 w-4 h-4" />
                       </Button>
                       <Button onClick={handleGlobalReset} variant="outline" className="flex-1 h-16 rounded-2xl glass border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em]">
                         Initialize New
                       </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  {currentStep === 1 && (
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-10">
                      <h2 className="text-4xl font-bold tracking-tighter text-center">Deployment Target</h2>
                      <div className="relative group max-w-xl mx-auto w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input placeholder="Search global IT roles..." value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)} className="h-16 pl-16 rounded-2xl glass border-white/10" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ALL_ROLES.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase())).slice(0, 10).map(role => (
                          <button key={role.id} onClick={() => { setSelectedRole(role.name); nextStep(); }} className="p-6 rounded-2xl border transition-all text-left flex items-center gap-6 glass border-white/5 hover:bg-white/5 group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent transition-transform group-hover:scale-110"><role.icon className="w-5 h-5" /></div>
                            <span className="font-bold text-sm">{role.name}</span>
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}

                  {currentStep === 2 && (
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                      <h2 className="text-4xl font-bold tracking-tighter text-center">Seniority Calibration</h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EXPERIENCE_OPTIONS.map(opt => (
                          <button key={opt.id} onClick={() => { setSelectedExp(opt.label); nextStep(); }} className={`p-8 rounded-3xl border transition-all text-left group ${selectedExp === opt.label ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:bg-white/5'}`}>
                            <opt.icon className="w-8 h-8 text-accent mb-4 transition-transform group-hover:scale-110" />
                            <p className="text-xl font-bold">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}

                  {currentStep === 3 && (
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12 text-center">
                      <h2 className="text-4xl font-bold tracking-tighter">Target Agency</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {COMPANIES.map(c => (
                          <button key={c} onClick={() => { setSelectedCompany(c); nextStep(); }} className={`p-6 rounded-2xl border transition-all text-center group ${selectedCompany === c ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:bg-white/5'}`}>
                            <Building2 className="w-6 h-6 text-accent mx-auto mb-3 transition-transform group-hover:scale-110" />
                            <p className="text-xs font-bold uppercase tracking-widest">{c}</p>
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}

                  {currentStep === 4 && (
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12 text-center">
                      <div className="space-y-4">
                        <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Identity Protocol</Badge>
                        <h2 className="text-4xl font-bold tracking-tighter">AI Resume Audit</h2>
                        <p className="text-muted-foreground font-light max-w-xl mx-auto">Provide your career blueprint for ATS screening and skill node extraction.</p>
                      </div>
                      <div onClick={() => !isAnalyzing && document.getElementById('resume-journey-upload')?.click()} className={`border-2 border-dashed rounded-[2.5rem] p-16 transition-all cursor-pointer group relative overflow-hidden ${file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'}`}>
                        <input type="file" id="resume-journey-upload" className="hidden" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                        {isAnalyzing ? (
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-accent animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Extracting Knowledge Nodes...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                             <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-accent group-hover:scale-110 transition-transform"><Upload className="w-8 h-8" /></div>
                             <div className="space-y-1">
                               <p className="font-bold text-lg">{file ? file.name : "📄 Drop Blueprint Here"}</p>
                               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF Only • 5MB Operational Limit</p>
                             </div>
                          </div>
                        )}
                      </div>
                      <Button onClick={handleResumeSync} disabled={!file || isAnalyzing} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs font-bold">
                        {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Analyzing...</> : "Initialize Audit Sequence"}
                      </Button>
                    </Card>
                  )}

                  {currentStep === 5 && (
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                      <div className="flex justify-between items-end border-b border-white/5 pb-10">
                        <div className="space-y-2">
                          <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[8px] uppercase font-bold tracking-widest">Audit Result v4.0</Badge>
                          <h2 className="text-4xl font-bold tracking-tighter text-premium">Performance Matrix</h2>
                        </div>
                        <div className="flex gap-12 text-right">
                           <div className="space-y-1">
                             <div className="text-4xl font-bold text-accent tabular-nums">{resumeAnalysis?.atsScore}%</div>
                             <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">ATS Rating</p>
                           </div>
                        </div>
                      </div>
                      <div className="grid lg:grid-cols-2 gap-8">
                         <div className="space-y-6">
                           <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-accent" /> Verified Skills</h3>
                           <div className="flex flex-wrap gap-2">
                             {resumeAnalysis?.skillAnalysis?.map((s: any, i: number) => (
                               <Badge key={i} variant="outline" className="bg-white/5 border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/70">{s.skill}</Badge>
                             ))}
                           </div>
                         </div>
                         <div className="space-y-6">
                           <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><CircleAlert className="w-4 h-4 text-red-400" /> Critical Gaps</h3>
                           <div className="flex flex-wrap gap-2">
                             {resumeAnalysis?.missingSkills?.map((s: string, i: number) => (
                               <Badge key={i} variant="outline" className="bg-red-500/5 border-red-500/20 text-red-400 px-3 py-1.5 text-[10px] font-bold">{s}</Badge>
                             ))}
                           </div>
                         </div>
                      </div>
                      <Button onClick={handleStartAptitude} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs font-bold">
                        Continue to Aptitude Phase →
                      </Button>
                    </Card>
                  )}

                  {currentStep === 6 && (
                    <div className="space-y-8 relative">
                      <div className="sticky top-24 z-[40] space-y-4">
                        <Card className="flex items-center gap-6 px-8 py-4 glass border-white/10 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <TimerIcon className={`w-5 h-5 ${aptitudeRemainingTime && aptitudeRemainingTime > 120 ? 'text-accent' : 'text-red-400 animate-pulse'}`} />
                            <div className="flex flex-col">
                              <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Time Remaining</span>
                              <span className="text-xl font-bold tabular-nums">
                                {Math.floor((aptitudeRemainingTime || 0)/60)}:{(aptitudeRemainingTime || 0)%60 < 10 ? '0' : ''}{(aptitudeRemainingTime || 0)%60}
                              </span>
                            </div>
                          </div>
                          <div className="w-px h-10 bg-white/5" />
                          <div className="flex items-center gap-3">
                            <ClipboardCheck className="w-5 h-5 text-accent" />
                            <div className="flex flex-col">
                              <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Logic Node</span>
                              <span className="text-xl font-bold text-white tabular-nums">{aptitudeIdx + 1} / 15</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                      <Card className="premium-card bg-white/[0.01] border-white/5 p-12 min-h-[500px] flex flex-col">
                          <div className="flex justify-between items-center mb-10">
                             <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[8px] uppercase font-bold tracking-widest">{aiAptitudeQuestions[aptitudeIdx]?.category}</Badge>
                             <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] uppercase font-bold px-3 py-1">Level: {aiAptitudeQuestions[aptitudeIdx]?.difficulty}</Badge>
                          </div>
                          <h3 className="text-3xl font-bold leading-tight tracking-tight text-white/90 mb-12">{aiAptitudeQuestions[aptitudeIdx]?.question}</h3>
                          <div className="grid md:grid-cols-2 gap-4 mb-12">
                            {aiAptitudeQuestions[aptitudeIdx]?.options.map((opt: any, i: number) => (
                              <button key={i} onClick={() => handleAptitudeAnswerSelection(aptitudeIdx, opt)} className={`p-8 rounded-[2rem] border text-left transition-all duration-300 ${aptitudeAnswers[aptitudeIdx] === opt ? 'bg-accent/10 border-accent' : 'glass border-white/5 hover:bg-white/5'}`}>
                                <div className="flex items-center gap-6">
                                   <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${aptitudeAnswers[aptitudeIdx] === opt ? 'bg-accent border-accent text-black' : 'border-white/20 text-white/40'}`}>
                                      {String.fromCharCode(65 + i)}
                                   </div>
                                   <span className="text-lg font-light">{opt}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="mt-auto pt-10 border-t border-white/5 flex justify-between">
                            <Button onClick={() => setAptitudeIdx(Math.max(0, aptitudeIdx - 1))} disabled={aptitudeIdx === 0} variant="ghost" className="h-14 px-8 rounded-xl glass border-white/5 flex gap-3 text-xs font-bold uppercase tracking-widest">
                              <ChevronLeft className="w-4 h-4" /> Previous
                            </Button>
                            <Button onClick={() => aptitudeIdx < 14 ? setAptitudeIdx(aptitudeIdx + 1) : handleAptitudeSubmit()} className="h-14 px-10 btn-premium text-xs font-bold uppercase tracking-[0.2em]">
                              {aptitudeIdx < 14 ? "Next Node" : isAptitudeEvaluating ? <Loader2 className="animate-spin" /> : "Finalize Protocol"}
                            </Button>
                          </div>
                      </Card>
                    </div>
                  )}

                  {currentStep === 7 && aptitudeReport && (
                    <div className="space-y-12">
                      <header className="text-center space-y-4">
                        <Badge className="bg-accent/20 text-accent px-4 py-1 text-[10px] font-bold uppercase tracking-widest border-none">Intelligence Audit Complete</Badge>
                        <h2 className="text-5xl font-bold tracking-tighter text-premium">Aptitude Results</h2>
                      </header>
                      <div className="grid lg:grid-cols-12 gap-8">
                        <Card className="lg:col-span-4 premium-card bg-white/[0.01] border-white/5 flex flex-col items-center justify-center p-12 text-center">
                          <div className="text-7xl font-bold mb-6 tabular-nums">{aptitudeReport.overallScore}%</div>
                          <Badge className={`${aptitudeReport.status === 'Pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-none px-10 py-2 text-xs font-black tracking-[0.4em]`}>
                            {aptitudeReport.status.toUpperCase()}
                          </Badge>
                        </Card>
                        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { label: "Correct Nodes", val: aptitudeReport.correctCount, icon: CheckCircle2, color: "text-green-400" },
                            { label: "Accuracy", val: `${aptitudeReport.accuracy}%`, icon: Target, color: "text-accent" },
                            { label: "Percentile", val: aptitudeReport.percentile, icon: Award, color: "text-yellow-400" }
                          ].map((stat, i) => (
                            <Card key={i} className="glass p-6 rounded-2xl border-white/5 text-center flex flex-col items-center gap-2">
                               <stat.icon className={`w-5 h-5 ${stat.color}`} />
                               <div className="text-xl font-bold">{stat.val}</div>
                               <div className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {aptitudeReport.status === 'Pass' ? (
                        <div className="p-12 glass rounded-[3rem] border-green-500/20 bg-green-500/[0.02] text-center space-y-8">
                          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto shadow-2xl">
                             <CheckCircle2 className="w-10 h-10 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold">Protocol Passed.</h3>
                            <p className="text-muted-foreground font-light mt-2">You have cleared the cognitive screening phase. Proceed to Syntax Matrix.</p>
                          </div>
                          <Button onClick={handleStartCoding} className="h-18 px-12 btn-premium text-xs font-bold uppercase tracking-[0.3em]">
                            Enter Coding Round →
                          </Button>
                        </div>
                      ) : (
                        <div className="p-12 glass rounded-[3rem] border-red-500/20 bg-red-500/[0.02] text-center space-y-8">
                          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                             <XCircle className="w-10 h-10 text-red-400" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-3xl font-bold">Protocol Insufficient.</h3>
                            <p className="text-muted-foreground font-light">Minimum qualification score (70%) not met for this track.</p>
                          </div>
                          <div className="flex justify-center gap-4">
                            <Button onClick={handleGlobalReset} className="h-14 px-10 btn-premium text-[10px] font-bold uppercase tracking-widest gap-2">
                              <RefreshCcw className="w-4 h-4" /> Restart Simulation
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 8 && (
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-8 min-h-[600px] flex flex-col">
                       <Badge className="bg-orange-500/20 text-orange-400 border-none w-fit px-4 py-1 text-[8px] uppercase font-bold tracking-widest">{codingProblem?.difficulty} NODE</Badge>
                       <div>
                         <h3 className="text-3xl font-bold tracking-tighter mb-4">{codingProblem?.title}</h3>
                         <p className="text-sm text-muted-foreground leading-relaxed font-light">{codingProblem?.description}</p>
                       </div>
                       <textarea value={code} onChange={(e) => { setCode(e.target.value); saveProgress(8, { code: e.target.value }); }} className="w-full flex-1 glass border-white/10 bg-black/40 p-8 font-mono text-sm resize-none rounded-3xl focus:outline-none focus:border-accent transition-all" />
                       <Button onClick={handleCodingSubmit} disabled={isCodingEvaluating} className="w-full h-20 btn-premium uppercase tracking-[0.3em] text-xs font-bold">
                         {isCodingEvaluating ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : "Finalize Syntax Protocol"}
                       </Button>
                    </Card>
                  )}

                  {currentStep === 9 && codingReport && (
                    <div className="space-y-12">
                       <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                          <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold">Syntax Audit Results</h2>
                            <div className="text-6xl font-bold text-accent tabular-nums">{codingReport?.score}%</div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="p-8 glass rounded-3xl bg-white/[0.01]">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Complexity Node</p>
                                <p className="text-2xl font-bold text-accent">{codingReport?.timeComplexity}</p>
                             </div>
                             <div className="p-8 glass rounded-3xl bg-white/[0.01]">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Readability Index</p>
                                <p className="text-2xl font-bold text-purple-400 tabular-nums">{codingReport?.readabilityScore}%</p>
                             </div>
                          </div>

                          {codingReport.score >= 60 ? (
                            <Button onClick={startArena} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs font-bold">Enter Virtual Arena</Button>
                          ) : (
                            <div className="p-8 glass border-red-500/20 bg-red-500/[0.02] rounded-3xl text-center space-y-6">
                               <p className="text-red-400 font-bold">Syntax Matrix deficiency detected.</p>
                               <Button onClick={handleGlobalReset} variant="outline" className="h-14 px-10 rounded-2xl glass border-white/10 text-red-400">Restart Session</Button>
                            </div>
                          )}
                       </Card>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
