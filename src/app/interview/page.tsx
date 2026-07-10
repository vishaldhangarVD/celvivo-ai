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
  Play, 
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
  CircleX,
  Activity,
  Terminal,
  CirclePlay,
  MonitorCog,
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
  ChevronUp
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { generateAptitudeTest } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { generateCodingChallenge } from '@/ai/flows/ai-coding-generator';
import { evaluateCodingSubmission } from '@/ai/flows/ai-coding-evaluator';
import { executeCode } from '@/lib/piston';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_ROLES = [
  // Software Development
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

  // Frontend
  { id: 'react', name: "React Developer", category: "Frontend", icon: Monitor },
  { id: 'angular', name: "Angular Developer", category: "Frontend", icon: Monitor },
  { id: 'vue', name: "Vue.js Developer", category: "Frontend", icon: Monitor },
  { id: 'frontend', name: "Frontend Developer", category: "Frontend", icon: Monitor },

  // Backend
  { id: 'nodejs', name: "Node.js Developer", category: "Backend", icon: Database },
  { id: 'springboot', name: "Spring Boot Developer", category: "Backend", icon: Database },
  { id: 'django', name: "Django Developer", category: "Backend", icon: Database },
  { id: 'laravel', name: "Laravel Developer", category: "Backend", icon: Database },
  { id: 'backend', name: "Backend Developer", category: "Backend", icon: Database },

  // Data
  { id: 'data-analyst', name: "Data Analyst", category: "Data", icon: TrendingUp },
  { id: 'data-scientist', name: "Data Scientist", category: "Data", icon: Database },
  { id: 'data-engineer', name: "Data Engineer", category: "Data", icon: Layers },
  { id: 'bi-dev', name: "BI Developer", category: "Data", icon: TrendingUp },
  { id: 'db-dev', name: "Database Developer", category: "Data", icon: Database },

  // Cloud & DevOps
  { id: 'devops', name: "DevOps Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'aws', name: "AWS Cloud Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'azure', name: "Azure Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'gcp', name: "Google Cloud Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'sre', name: "Site Reliability Engineer (SRE)", category: "Cloud & DevOps", icon: ShieldCheck },

  // AI & ML
  { id: 'ai', name: "AI Engineer", category: "AI & ML", icon: Zap },
  { id: 'ml', name: "Machine Learning Engineer", category: "AI & ML", icon: Cpu },
  { id: 'dl', name: "Deep Learning Engineer", category: "AI & ML", icon: Cpu },
  { id: 'nlp', name: "NLP Engineer", category: "AI & ML", icon: MessageSquare },
  { id: 'cv', name: "Computer Vision Engineer", category: "AI & ML", icon: Zap },
  { id: 'gen-ai', name: "Generative AI Engineer", category: "AI & ML", icon: Sparkles },
  { id: 'prompt', name: "Prompt Engineer", category: "AI & ML", icon: MessageSquare },

  // Infrastructure
  { id: 'sys-admin', name: "System Administrator", category: "Infrastructure", icon: MonitorCog },
  { id: 'network', name: "Network Engineer", category: "Infrastructure", icon: Globe },
  { id: 'linux', name: "Linux Administrator", category: "Infrastructure", icon: Terminal },

  // Other
  { id: 'uiux', name: "UI/UX Designer", category: "Design", icon: Monitor },
  { id: 'support', name: "Technical Support Engineer", category: "Service", icon: Mic },
  { id: 'blockchain', name: "Blockchain Developer", category: "Web3", icon: Layers },
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
  { id: 10, title: 'Virtual Interview', icon: Mic },
  { id: 11, title: 'AI Report', icon: TrendingUp },
  { id: 12, title: 'Roadmap', icon: Globe },
  { id: 13, title: 'History', icon: History },
  { id: 14, title: 'Dashboard', icon: LayoutDashboard },
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
  const [showReview, setShowReview] = useState(false);

  const [isGeneratingCoding, setIsGeneratingCoding] = useState(false);
  const [codingProblem, setCodingProblem] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isCodingEvaluating, setIsCodingEvaluating] = useState(false);
  const [codingReport, setCodingReport] = useState<any>(null);

  useEffect(() => {
    async function loadActiveSession() {
      if (!user || !db) return;
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.step < 10) {
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
        }
      }
    }
    loadActiveSession();
  }, [user, db]);

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
          
          // Time warnings
          if (next === 120 && !hasWarnedTime) {
            toast({
              variant: "destructive",
              title: "2-Minute Warning",
              description: "Finalize your responses immediately. Time is running out."
            });
            setHasWarnedTime(true);
          }

          // Periodic save every 10 seconds to Firestore
          if (next % 10 === 0) {
            saveProgress(6, { aptitudeRemainingTime: next });
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
      const initialTime = 900; // 15 minutes
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
      nextStep(8);
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

  const filteredRoles = useMemo(() => {
    return ALL_ROLES.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));
  }, [roleSearch]);

  const popularRoles = useMemo(() => {
    const popular = ["Full Stack Developer", "Java Developer", "Python Developer", "React Developer", "Node.js Developer", "Data Analyst", "DevOps Engineer", "AI Engineer"];
    return ALL_ROLES.filter(r => popular.includes(r.name));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  const getTimerColor = (seconds: number) => {
    if (seconds > 300) return "text-accent";
    if (seconds > 120) return "text-yellow-400";
    return "text-red-400";
  };

  const navigateAptitude = (idx: number) => {
    setAptitudeIdx(idx);
    saveProgress(6, { aptitudeIdx: idx });
  };

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
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
          </aside>

          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                
                {currentStep === 1 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-10">
                    <h2 className="text-4xl font-bold tracking-tighter text-center">Choose Job Role</h2>
                    <div className="relative group max-w-xl mx-auto w-full">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <Input placeholder="Search global IT protocols..." value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)} className="h-16 pl-16 rounded-2xl glass border-white/10" />
                    </div>

                    {!roleSearch ? (
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 ml-2">Popular Protocols</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {popularRoles.map(role => (
                            <button key={role.id} onClick={() => { setSelectedRole(role.name); nextStep(); }} className="p-6 rounded-2xl border transition-all text-left flex items-center gap-6 glass border-white/5 hover:bg-white/5 group">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent transition-transform group-hover:scale-110"><role.icon className="w-5 h-5" /></div>
                              <span className="font-bold text-sm">{role.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent ml-2">Filtered Intelligence</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {filteredRoles.length > 0 ? filteredRoles.map(role => (
                            <button key={role.id} onClick={() => { setSelectedRole(role.name); nextStep(); }} className="p-6 rounded-2xl border transition-all text-left flex items-center gap-6 glass border-white/5 hover:bg-white/5">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent"><role.icon className="w-5 h-5" /></div>
                              <span className="font-bold text-sm">{role.name}</span>
                            </button>
                          )) : (
                            <div className="col-span-2 py-12 text-center glass border-dashed rounded-3xl border-white/10">
                              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                              <p className="text-muted-foreground font-light">No matching job role found.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {currentStep === 2 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <h2 className="text-4xl font-bold tracking-tighter text-center">Seniority Grade</h2>
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
                    <h2 className="text-4xl font-bold tracking-tighter">Target Company</h2>
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
                      <h2 className="text-4xl font-bold tracking-tighter">AI Resume Screening</h2>
                      <p className="text-muted-foreground font-light max-w-xl mx-auto">Upload your latest resume to receive ATS analysis, skill gap detection, resume score, and personalized AI feedback before starting your interview.</p>
                    </div>
                    
                    <div 
                      onClick={() => !isAnalyzing && document.getElementById('resume-journey-upload')?.click()} 
                      className={`border-2 border-dashed rounded-[2.5rem] p-16 transition-all cursor-pointer group relative overflow-hidden ${file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'}`}
                    >
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
                             <p className="font-bold text-lg">{file ? file.name : "📄 Drag & Drop your Resume Here"}</p>
                             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Click to Upload PDF (Maximum 5 MB)</p>
                           </div>
                        </div>
                      )}
                    </div>

                    <Button onClick={handleResumeSync} disabled={!file || isAnalyzing} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs font-bold shadow-[0_0_50px_rgba(147,51,234,0.2)]">
                      {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Processing...</> : "Start AI Resume Analysis"}
                    </Button>
                  </Card>
                )}

                {currentStep === 5 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <div className="flex justify-between items-end border-b border-white/5 pb-10">
                      <div className="space-y-2">
                        <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[8px] uppercase font-bold tracking-widest">Neural Audit Result</Badge>
                        <h2 className="text-4xl font-bold tracking-tighter text-premium">Blueprint Intelligence</h2>
                      </div>
                      <div className="flex gap-12 text-right">
                         <div className="space-y-1">
                           <div className="text-4xl font-bold text-accent tabular-nums">{resumeAnalysis?.atsScore}%</div>
                           <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">ATS Index</p>
                         </div>
                         <div className="space-y-1">
                           <div className="text-4xl font-bold text-purple-400 tabular-nums">{resumeAnalysis?.resumeQualityScore || 0}%</div>
                           <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Resume Score</p>
                         </div>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                       <Card className="p-8 glass border-white/5 bg-white/[0.01] space-y-6">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                            <FileSearch2 className="w-4 h-4" /> Resume Preview
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm font-light text-white/60">
                              <User className="w-4 h-4 text-accent/50" />
                              <div className="flex flex-col">
                                <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Candidate Name</span>
                                <span className="text-white/80 font-medium">{resumeAnalysis?.personalInfo?.fullName || "Detected Identity"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-light text-white/60">
                              <FileText className="w-4 h-4 text-accent/50" />
                              <div className="flex flex-col">
                                <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">File Name</span>
                                <span className="text-white/80 font-medium truncate max-w-[150px]">{file?.name || "unnamed_blueprint.pdf"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-light text-white/60">
                              <FileStack className="w-4 h-4 text-accent/50" />
                              <div className="flex flex-col">
                                <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Total Pages</span>
                                <span className="text-white/80 font-medium">1 Page (Verified)</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-light text-white/60">
                              <Calendar className="w-4 h-4 text-accent/50" />
                              <div className="flex flex-col">
                                <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Last Updated</span>
                                <span className="text-white/80 font-medium">{new Date().toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                       </Card>

                       <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-accent" /> Intelligence Nodes Found</h3>
                            <div className="flex flex-wrap gap-2">
                              {resumeAnalysis?.skillAnalysis?.map((s: any, i: number) => (
                                <Badge key={i} variant="outline" className="bg-white/5 border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/70">{s.skill}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><CircleAlert className="w-4 h-4 text-red-400" /> Delta Gaps Identified</h3>
                            <div className="flex flex-wrap gap-2">
                              {resumeAnalysis?.missingSkills?.map((s: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-red-500/5 border-red-500/20 text-red-400 px-3 py-1.5 text-[10px] font-bold">{s}</Badge>
                              ))}
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 glass rounded-[2rem] bg-accent/[0.02] border-accent/10 space-y-4">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2"><Lightbulb className="w-4 h-4" /> AI Strategic Feedback</h3>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Interview Readiness:</span>
                            <span className="text-sm font-bold text-accent">{resumeAnalysis?.interviewReadinessScore || 0}%</span>
                         </div>
                       </div>
                       <p className="text-sm font-light leading-relaxed text-white/80 italic">"{resumeAnalysis?.summary}"</p>
                    </div>

                    <Button onClick={handleStartAptitude} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs font-bold">
                      Continue to Aptitude Round <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Card>
                )}

                {currentStep === 6 && (
                  <div className="space-y-8 relative">
                    <div className="sticky top-24 z-[40] space-y-4">
                      <div className="flex flex-wrap gap-4 items-center justify-between">
                        <Card className="flex items-center gap-6 px-8 py-4 glass border-white/10 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <TimerIcon className={`w-5 h-5 ${getTimerColor(aptitudeRemainingTime || 0)}`} />
                            <div className="flex flex-col">
                              <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Time Left</span>
                              <span className={`text-xl font-bold tabular-nums ${getTimerColor(aptitudeRemainingTime || 0)}`}>
                                {Math.floor((aptitudeRemainingTime || 0)/60)}:{(aptitudeRemainingTime || 0)%60 < 10 ? '0' : ''}{(aptitudeRemainingTime || 0)%60}
                              </span>
                            </div>
                          </div>
                          <div className="w-px h-10 bg-white/5" />
                          <div className="flex items-center gap-3">
                            <ClipboardCheck className="w-5 h-5 text-accent" />
                            <div className="flex flex-col">
                              <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest">Question</span>
                              <span className="text-xl font-bold text-white tabular-nums">{aptitudeIdx + 1} / 15</span>
                            </div>
                          </div>
                        </Card>
                        
                        <div className="flex-1 max-w-md hidden md:block">
                           <div className="flex justify-between items-end mb-2">
                              <span className="text-[8px] uppercase font-bold text-white/40 tracking-widest">Assessment Progress</span>
                              <span className="text-[10px] font-bold text-accent">{(Object.keys(aptitudeAnswers).length / 15 * 100).toFixed(0)}% Completed</span>
                           </div>
                           <Progress value={(Object.keys(aptitudeAnswers).length / 15 * 100)} className="h-1.5" />
                        </div>
                      </div>
                    </div>

                    <Card className="premium-card bg-white/[0.01] border-white/5 p-0 overflow-hidden min-h-[500px] flex flex-col">
                      {isGeneratingAptitude ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-6">
                          <Cpu className="w-12 h-12 text-accent animate-pulse mx-auto" />
                          <p className="text-xl font-bold uppercase tracking-widest">Synthesizing Logic Matrix...</p>
                        </div>
                      ) : aiAptitudeQuestions.length > 0 ? (
                        <div className="flex flex-col h-full">
                          <div className="p-12 space-y-10 flex-1">
                            <div className="flex justify-between items-center">
                               <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[8px] uppercase font-bold tracking-widest">{aiAptitudeQuestions[aptitudeIdx]?.category}</Badge>
                               <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] uppercase font-bold px-3 py-1">Difficulty: {aiAptitudeQuestions[aptitudeIdx]?.difficulty}</Badge>
                            </div>
                            <h3 className="text-3xl font-bold leading-tight tracking-tight text-white/90">{aiAptitudeQuestions[aptitudeIdx]?.question}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {aiAptitudeQuestions[aptitudeIdx]?.options.map((opt: any, i: number) => (
                                <button 
                                  key={i} 
                                  onClick={() => handleAptitudeAnswerSelection(aptitudeIdx, opt)} 
                                  className={`p-8 rounded-[2rem] border text-left transition-all duration-300 relative group overflow-hidden ${aptitudeAnswers[aptitudeIdx] === opt ? 'bg-accent/10 border-accent shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'glass border-white/5 hover:bg-white/5'}`}
                                >
                                  <div className="flex items-center gap-6 relative z-10">
                                     <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${aptitudeAnswers[aptitudeIdx] === opt ? 'bg-accent border-accent text-black' : 'border-white/20 text-white/40'}`}>
                                        {String.fromCharCode(65 + i)}
                                     </div>
                                     <span className="text-lg font-light">{opt}</span>
                                  </div>
                                  {aptitudeAnswers[aptitudeIdx] === opt && (
                                     <motion.div layoutId="apt-opt" className="absolute inset-0 bg-accent/5 z-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-8 bg-black/20 border-t border-white/5 space-y-8">
                            <div className="flex justify-between items-center px-4">
                              <Button 
                                onClick={() => aptitudeIdx > 0 && navigateAptitude(aptitudeIdx - 1)}
                                disabled={aptitudeIdx === 0}
                                variant="ghost" 
                                className="h-14 px-8 rounded-xl glass border-white/5 flex gap-3 text-xs font-bold uppercase tracking-widest disabled:opacity-20"
                              >
                                <ChevronLeft className="w-4 h-4" /> Previous
                              </Button>
                              
                              <Button 
                                onClick={() => {
                                  if (aptitudeIdx < 14) {
                                    navigateAptitude(aptitudeIdx + 1);
                                  } else {
                                    handleAptitudeSubmit();
                                  }
                                }} 
                                className="h-14 px-10 btn-premium text-xs font-bold uppercase tracking-[0.2em] shadow-xl"
                              >
                                {aptitudeIdx < 14 ? (
                                  <>Next Protocol <ChevronRight className="ml-2 w-4 h-4" /></>
                                ) : (
                                  isAptitudeEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Assessment"
                                )}
                              </Button>
                            </div>

                            <div className="space-y-4">
                               <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/20 text-center">Logic Matrix Navigator</p>
                               <div className="flex flex-wrap justify-center gap-3">
                                 {Array.from({length: 15}).map((_, i) => {
                                   const isCurrent = i === aptitudeIdx;
                                   const isAnswered = aptitudeAnswers[i] !== undefined;
                                   return (
                                     <button
                                       key={i}
                                       onClick={() => navigateAptitude(i)}
                                       className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                         isCurrent ? 'bg-accent border-accent text-black scale-110 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 
                                         isAnswered ? 'bg-green-500/20 border-green-500/40 text-green-400' : 
                                         'glass border-white/5 text-white/20 hover:bg-white/10'
                                       }`}
                                     >
                                       {i + 1}
                                     </button>
                                   );
                                 })}
                               </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 flex flex-col items-center">
                           <CircleAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
                           <p className="text-muted-foreground italic">Logic matrix initialization failed. Attempting recovery...</p>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {currentStep === 7 && aptitudeReport && (
                  <div className="space-y-12 max-w-5xl mx-auto">
                    <header className="text-center space-y-4">
                      <Badge className="bg-accent/20 text-accent px-4 py-1 text-[10px] font-bold uppercase tracking-widest border-none">Assessment Intelligence Node</Badge>
                      <h2 className="text-5xl font-bold tracking-tighter text-premium">Aptitude Assessment Result</h2>
                      <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-2"><Building2 className="w-3 h-3" /> {selectedCompany}</span>
                        <span className="flex items-center gap-2"><Briefcase className="w-3 h-3" /> {selectedRole}</span>
                        <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date().toLocaleString()}</span>
                      </div>
                    </header>

                    <div className="grid lg:grid-cols-12 gap-8">
                      {/* Overall Score Circle */}
                      <Card className="lg:col-span-4 premium-card bg-white/[0.01] border-white/5 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                            <motion.circle 
                              initial={{ strokeDashoffset: 553 }}
                              animate={{ strokeDashoffset: 553 - (553 * aptitudeReport.overallScore) / 100 }}
                              transition={{ duration: 2, ease: "easeOut" }}
                              className={aptitudeReport.status === 'Pass' ? "text-accent" : "text-red-400"} 
                              strokeWidth="8" 
                              strokeDasharray={553} 
                              strokeLinecap="round" 
                              stroke="currentColor" 
                              fill="transparent" 
                              r="88" 
                              cx="96" 
                              cy="96" 
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-bold tracking-tighter">{aptitudeReport.overallScore}%</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overall Index</span>
                          </div>
                        </div>
                        <Badge className={`${aptitudeReport.status === 'Pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-none px-10 py-2 text-xs font-black tracking-[0.4em]`}>
                          {aptitudeReport.status.toUpperCase()}
                        </Badge>
                      </Card>

                      {/* Statistics Matrix */}
                      <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { label: "Correct Answers", val: `${aptitudeReport.correctCount} / 15`, icon: CheckCircle2, color: "text-green-400" },
                          { label: "Wrong Answers", val: `${aptitudeReport.wrongCount} / 15`, icon: XCircle, color: "text-red-400" },
                          { label: "Skipped", val: aptitudeReport.skippedCount, icon: RotateCcw, color: "text-white/20" },
                          { label: "Accuracy", val: `${aptitudeReport.accuracy}%`, icon: Target, color: "text-accent" },
                          { label: "Time Taken", val: formatTime(900 - (aptitudeRemainingTime || 0)), icon: TimerIcon, color: "text-purple-400" },
                          { label: "Percentile", val: aptitudeReport.percentile, icon: Award, color: "text-yellow-400" }
                        ].map((stat, i) => (
                          <Card key={i} className="glass p-6 rounded-2xl border-white/5 flex flex-col items-center text-center group hover:bg-white/5 transition-all">
                            <stat.icon className={`w-6 h-6 ${stat.color} mb-3 transition-transform group-hover:scale-110`} />
                            <div className="text-xl font-bold tabular-nums">{stat.val}</div>
                            <div className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Performance Breakdown */}
                      <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-10">
                        <h3 className="text-xl font-bold flex items-center gap-3"><BarChart3 className="w-6 h-6 text-accent" /> Performance Breakdown</h3>
                        <div className="space-y-8">
                          {[
                            { label: "Quantitative Aptitude", score: aptitudeReport.categoryScores.quantitative, color: "bg-blue-400" },
                            { label: "Logical Reasoning", score: aptitudeReport.categoryScores.logical, color: "bg-purple-400" },
                            { label: "Verbal Ability", score: aptitudeReport.categoryScores.english, color: "bg-accent" }
                          ].map((cat, i) => (
                            <div key={i} className="space-y-3">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span>{cat.label}</span>
                                <span className="text-white">{cat.score}%</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} className={`h-full ${cat.color}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* AI Strategic Feedback */}
                      <Card className="premium-card bg-accent/5 border-accent/10 p-10 space-y-10">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-accent"><Sparkles className="w-6 h-6" /> AI Strategic Audit</h3>
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400" /> Neural Strengths</p>
                            <div className="space-y-2">
                              {aptitudeReport.feedback.strengths.map((s: string, i: number) => (
                                <div key={i} className="flex gap-3 text-sm font-light text-white/70 italic">
                                  <div className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" /> {s}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2"><CircleAlert className="w-3 h-3 text-red-400" /> Delta Gaps</p>
                            <div className="space-y-2">
                              {aptitudeReport.feedback.improvementTips.map((tip: string, i: number) => (
                                <div key={i} className="flex gap-3 text-sm font-light text-white/70 italic">
                                  <div className="w-1 h-1 rounded-full bg-red-400 mt-2 shrink-0" /> {tip}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Question Review Section */}
                    <div className="space-y-6">
                      <Button 
                        onClick={() => setShowReview(!showReview)}
                        variant="outline" 
                        className="w-full h-16 rounded-2xl glass border-white/10 flex gap-3 text-[10px] font-bold uppercase tracking-[0.3em]"
                      >
                        <BookOpen className="w-4 h-4" /> 
                        {showReview ? "Close Intelligence Review" : "Review Intelligence Nodes"}
                        {showReview ? <ChevronUp className="ml-auto w-4 h-4" /> : <ChevronDown className="ml-auto w-4 h-4" />}
                      </Button>

                      <AnimatePresence>
                        {showReview && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            {aiAptitudeQuestions.map((q, idx) => {
                              const review = aptitudeReport.questionReviews[idx];
                              const isCorrect = aptitudeAnswers[idx] === q.answer;
                              return (
                                <Card key={idx} className="glass p-8 rounded-3xl border-white/5 bg-white/[0.01]">
                                  <div className="flex justify-between items-start mb-6">
                                    <Badge variant="outline" className="border-white/10 text-[8px] uppercase tracking-widest font-bold text-white/40">Node {idx + 1}</Badge>
                                    <Badge className={`${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-none uppercase text-[8px] font-bold`}>
                                      {isCorrect ? "✅ Correct" : "❌ Wrong"}
                                    </Badge>
                                  </div>
                                  <h4 className="text-xl font-bold mb-6">{q.question}</h4>
                                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    <div className="p-4 glass rounded-xl border-white/5">
                                      <p className="text-[8px] uppercase font-bold text-white/30 tracking-widest mb-2">Candidate Input</p>
                                      <p className={isCorrect ? "text-green-400" : "text-red-400"}>{aptitudeAnswers[idx] || "Skipped"}</p>
                                    </div>
                                    <div className="p-4 glass rounded-xl border-accent/10 bg-accent/[0.02]">
                                      <p className="text-[8px] uppercase font-bold text-accent/50 tracking-widest mb-2">Neural Answer</p>
                                      <p className="text-accent font-bold">{q.answer}</p>
                                    </div>
                                  </div>
                                  <div className="p-6 glass rounded-2xl bg-white/[0.02] border-white/5">
                                    <div className="flex items-center gap-3 text-white/40 mb-3">
                                      <Lightbulb className="w-4 h-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">Neural Logic Explanation</span>
                                    </div>
                                    <p className="text-sm font-light text-white/60 leading-relaxed italic">"{review?.explanation || "Logic explanation node offline."}"</p>
                                  </div>
                                </Card>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Final CTA Flow */}
                    <AnimatePresence mode="wait">
                      {aptitudeReport.status === 'Pass' ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 glass rounded-[3rem] border-green-500/20 bg-green-500/[0.02] text-center space-y-8">
                          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                             <CheckCircle2 className="w-10 h-10 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold tracking-tighter">🎉 Congratulations!</h3>
                            <p className="text-muted-foreground font-light mt-2">Your logic matrix matches the firm's requirements. You have cleared the Aptitude Round.</p>
                          </div>
                          <Button onClick={handleStartCoding} disabled={isGeneratingCoding} className="h-18 px-12 btn-premium text-xs font-bold uppercase tracking-[0.3em]">
                            {isGeneratingCoding ? <><Loader2 className="w-4 h-4 animate-spin mr-3" /> Architecting Challenges...</> : <>Continue to Coding Round <ArrowRight className="ml-3 w-4 h-4" /></>}
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 glass rounded-[3rem] border-red-500/20 bg-red-500/[0.02] text-center space-y-8">
                          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                             <XCircle className="w-10 h-10 text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold tracking-tighter">Qualification Not Met</h3>
                            <p className="text-muted-foreground font-light mt-2">You did not meet the qualifying score (70%). The Coding Round remains locked until the logic matrix is satisfied.</p>
                          </div>
                          <div className="flex flex-wrap justify-center gap-4">
                             <Button onClick={() => router.push('/question-bank')} variant="outline" className="h-14 px-8 rounded-2xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest">Practice Aptitude</Button>
                             <Button onClick={() => nextStep(6)} className="h-14 px-10 btn-premium text-[10px] font-bold uppercase tracking-widest"><RotateCcw className="w-4 h-4 mr-2" /> Retake Aptitude Test</Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {currentStep === 8 && (
                   <Card className="premium-card bg-white/[0.01] border-white/5 p-0 overflow-hidden min-h-[600px] flex flex-col">
                      {isGeneratingCoding ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                           <Terminal className="w-12 h-12 text-accent animate-pulse" />
                           <p className="text-xl font-bold uppercase tracking-widest">Architecting Syntax Matrix...</p>
                        </div>
                      ) : (
                        <div className="p-12 space-y-8 flex-1 flex flex-col">
                           <Badge className="bg-orange-500/20 text-orange-400 border-none w-fit px-4 py-1 text-[8px] uppercase font-bold tracking-widest">{codingProblem?.difficulty} NODE</Badge>
                           <div>
                             <h3 className="text-3xl font-bold tracking-tighter mb-4">{codingProblem?.title}</h3>
                             <p className="text-sm text-muted-foreground leading-relaxed font-light">{codingProblem?.description}</p>
                           </div>
                           <textarea value={code} onChange={(e) => setCode(e.target.value)} className="w-full flex-1 glass border-white/10 bg-black/40 p-8 font-mono text-sm resize-none rounded-3xl focus:outline-none focus:border-accent transition-all custom-scrollbar" />
                           <Button onClick={handleCodingSubmit} disabled={isCodingEvaluating} className="w-full h-20 btn-premium uppercase tracking-[0.3em] text-xs font-bold shadow-[0_0_60px_rgba(147,51,234,0.2)]">
                             {isCodingEvaluating ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Code2 className="w-5 h-5 mr-3" />} Finalize Submission
                           </Button>
                        </div>
                      )}
                   </Card>
                )}

                {currentStep === 9 && (
                   <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                      <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold">Coding Efficiency</h2>
                        <div className="text-6xl font-bold text-accent tabular-nums">{codingReport?.score}%</div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-8 glass rounded-3xl bg-white/[0.01]">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Time Complexity</p>
                            <p className="text-2xl font-bold text-accent">{codingReport?.timeComplexity}</p>
                         </div>
                         <div className="p-8 glass rounded-3xl bg-white/[0.01]">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Readability</p>
                            <p className="text-2xl font-bold text-purple-400 tabular-nums">{codingReport?.readabilityScore}%</p>
                         </div>
                      </div>
                      <Button onClick={startArena} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs font-bold">Enter Virtual Arena</Button>
                   </Card>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
