"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Briefcase, 
  Building2, 
  Upload, 
  SearchCheck, 
  Zap, 
  Code2, 
  Mic, 
  Users, 
  FileText, 
  ChevronRight, 
  Loader2, 
  CircleCheck, 
  Lock, 
  Play, 
  ShieldCheck, 
  Search, 
  Layers, 
  Database, 
  ShieldAlert, 
  GraduationCap, 
  Clock, 
  Award, 
  Globe,
  Trash2,
  FileUp,
  CircleAlert,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Sparkles,
  FileEdit,
  Timer,
  ChevronLeft,
  CircleX,
  RefreshCcw,
  Activity,
  Terminal,
  CirclePlay,
  Save,
  MonitorCog,
  AlertTriangle,
  Info,
  Lightbulb,
  Cpu,
  Check,
  Hand,
  Smartphone,
  Cloud,
  Monitor,
  Shield,
  SearchX
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { generateAptitudeTest } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { generateCodingChallenge } from '@/ai/flows/ai-coding-generator';
import { evaluateCodingSubmission } from '@/ai/flows/ai-coding-evaluator';
import { executeCode } from '@/lib/piston';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const ALL_ROLES = [
  // Software Development
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

  // Full Stack
  { id: 'mern', name: "MERN Stack Developer", category: "Full Stack", icon: Layers },
  { id: 'mean', name: "MEAN Stack Developer", category: "Full Stack", icon: Layers },
  { id: 'fullstack-java', name: "Full Stack Java Developer", category: "Full Stack", icon: Layers },
  { id: 'fullstack', name: "Full Stack Developer", category: "Full Stack", icon: Layers },

  // Mobile
  { id: 'android', name: "Android Developer", category: "Mobile", icon: Smartphone },
  { id: 'ios', name: "iOS Developer", category: "Mobile", icon: Smartphone },
  { id: 'flutter', name: "Flutter Developer", category: "Mobile", icon: Smartphone },
  { id: 'react-native', name: "React Native Developer", category: "Mobile", icon: Smartphone },

  // Data
  { id: 'data-analyst', name: "Data Analyst", category: "Data", icon: TrendingUp },
  { id: 'data-scientist', name: "Data Scientist", category: "Data", icon: Activity },
  { id: 'data-engineer', name: "Data Engineer", category: "Data", icon: Database },
  { id: 'bi', name: "BI Developer", category: "Data", icon: TrendingUp },
  { id: 'db-dev', name: "Database Developer", category: "Data", icon: Database },

  // Cloud & DevOps
  { id: 'devops', name: "DevOps Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'aws', name: "AWS Cloud Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'azure', name: "Azure Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'gcp', name: "Google Cloud Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'sre', name: "Site Reliability Engineer (SRE)", category: "Cloud & DevOps", icon: ShieldCheck },

  // Testing
  { id: 'qa', name: "QA Engineer", category: "Testing", icon: SearchCheck },
  { id: 'automation', name: "Automation Test Engineer", category: "Testing", icon: SearchCheck },
  { id: 'manual', name: "Manual Tester", category: "Testing", icon: SearchCheck },
  { id: 'perf-test', name: "Performance Test Engineer", category: "Testing", icon: SearchCheck },

  // Cyber Security
  { id: 'cyber', name: "Cyber Security Analyst", category: "Cyber Security", icon: Shield },
  { id: 'sec-eng', name: "Security Engineer", category: "Cyber Security", icon: Shield },
  { id: 'soc', name: "SOC Analyst", category: "Cyber Security", icon: Shield },
  { id: 'pentest', name: "Penetration Tester", category: "Cyber Security", icon: Shield },

  // AI & ML
  { id: 'ai', name: "AI Engineer", category: "AI & ML", icon: Zap },
  { id: 'ml', name: "Machine Learning Engineer", category: "AI & ML", icon: Zap },
  { id: 'dl', name: "Deep Learning Engineer", category: "AI & ML", icon: Zap },
  { id: 'nlp', name: "NLP Engineer", category: "AI & ML", icon: Zap },
  { id: 'cv', name: "Computer Vision Engineer", category: "AI & ML", icon: Zap },
  { id: 'gen-ai', name: "Generative AI Engineer", category: "AI & ML", icon: Sparkles },
  { id: 'prompt', name: "Prompt Engineer", category: "AI & ML", icon: MessageSquare },

  // Infrastructure
  { id: 'sys-admin', name: "System Administrator", category: "Infrastructure", icon: MonitorCog },
  { id: 'net-eng', name: "Network Engineer", category: "Infrastructure", icon: Globe },
  { id: 'linux', name: "Linux Administrator", category: "Infrastructure", icon: Terminal },

  // ERP
  { id: 'sap', name: "SAP Consultant", category: "ERP & Enterprise", icon: Building2 },
  { id: 'salesforce', name: "Salesforce Developer", category: "ERP & Enterprise", icon: Building2 },
  { id: 'servicenow', name: "ServiceNow Developer", category: "ERP & Enterprise", icon: Building2 },

  // Other
  { id: 'uiux', name: "UI/UX Designer", category: "Other IT Roles", icon: FileEdit },
  { id: 'support', name: "Technical Support Engineer", category: "Other IT Roles", icon: Info },
  { id: 'blockchain', name: "Blockchain Developer", category: "Other IT Roles", icon: Shield },
  { id: 'embedded', name: "Embedded Systems Engineer", category: "Other IT Roles", icon: MonitorCog },
  { id: 'iot', name: "IoT Developer", category: "Other IT Roles", icon: Zap },
  { id: 'game', name: "Game Developer", category: "Other IT Roles", icon: Smartphone },
  { id: 'arvr', name: "AR/VR Developer", category: "Other IT Roles", icon: Monitor },
];

const POPULAR_ROLE_IDS = ['fullstack', 'java', 'python', 'react', 'nodejs', 'data-analyst', 'devops', 'ai'];

const EXPERIENCE_OPTIONS = [
  { id: 'fresher', label: 'Fresher', desc: 'Entry-level talent', icon: Zap },
  { id: '1-2', label: '1–2 Years', desc: 'Junior / Mid-level', icon: Clock },
  { id: '3-5', label: '3–5 Years', desc: 'Mid / Senior grade', icon: Award },
  { id: '5+', label: '5+ Years', desc: 'Expert / Lead grade', icon: ShieldCheck },
];

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "TCS", "Infosys", "Wipro", 
  "Accenture", "Capgemini", "Cognizant", "Deloitte", "EY", "PwC"
];

const INTERVIEW_STEPS = [
  { id: 1, title: 'Job Role', icon: Briefcase, desc: 'Target deployment' },
  { id: 2, title: 'Experience', icon: GraduationCap, desc: 'Seniority grade' },
  { id: 3, title: 'Company', icon: Building2, desc: 'Culture sync' },
  { id: 4, title: 'Resume', icon: Upload, desc: 'Intelligence sync' },
  { id: 5, title: 'Screening', icon: SearchCheck, desc: 'ATS audit' },
  { id: 6, title: 'Aptitude', icon: Zap, desc: 'Logic nodes' },
  { id: 7, title: 'Coding', icon: Code2, desc: 'Syntax mastery' },
  { id: 8, title: 'Technical', icon: Mic, desc: 'Deep dive' },
  { id: 9, title: 'HR Round', icon: Users, desc: 'Culture fit' },
  { id: 10, title: 'Report', icon: FileText, desc: 'Final audit' },
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
  const [companySearch, setCompanySearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Aptitude Round State
  const [isGeneratingAptitude, setIsGeneratingAptitude] = useState(false);
  const [aiAptitudeQuestions, setAiAptitudeQuestions] = useState<any[]>([]);
  const [aptitudeIdx, setAptitudeIdx] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); 
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isAptitudeEvaluating, setIsAptitudeEvaluating] = useState(false);
  const [aptitudeReport, setAptitudeReport] = useState<any>(null);
  const [aptitudeStartTime, setAptitudeStartTime] = useState<number | null>(null);

  // Coding Round State
  const [isGeneratingCoding, setIsGeneratingCoding] = useState(false);
  const [codingProblem, setCodingProblem] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [codingTimeLeft, setCodingTimeLeft] = useState(45 * 60); 
  const [isCodingComplete, setIsCodingComplete] = useState(false);
  const [isCodingEvaluating, setIsCodingEvaluating] = useState(false);
  const [codingReport, setCodingReport] = useState<any>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(["[SYSTEM] Neural terminal initialized..."]);
  const [isRunning, setIsRunning] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (currentStep === 6 && timeLeft > 0 && !aptitudeReport && aiAptitudeQuestions.length > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentStep === 6 && !aptitudeReport) {
      handleAptitudeSubmit();
    }
  }, [currentStep, timeLeft, aptitudeReport, aiAptitudeQuestions]);

  // Coding Timer Effect
  useEffect(() => {
    if (currentStep === 7 && codingTimeLeft > 0 && !codingReport && codingProblem) {
      const timer = setInterval(() => setCodingTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, codingTimeLeft, codingReport, codingProblem]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredRoles = useMemo(() => {
    return ALL_ROLES.filter(role => 
      role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      role.category.toLowerCase().includes(roleSearch.toLowerCase())
    );
  }, [roleSearch]);

  const popularRoles = useMemo(() => {
    return ALL_ROLES.filter(role => POPULAR_ROLE_IDS.includes(role.id));
  }, []);

  const filteredCompanies = useMemo(() => {
    return COMPANIES.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()));
  }, [companySearch]);

  const nextStep = () => {
    if (currentStep < INTERVIEW_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartAptitude = async () => {
    setIsGeneratingAptitude(true);
    setCurrentStep(6);
    try {
      const result = await generateAptitudeTest({
        role: selectedRole,
        company: selectedCompany,
        experienceLevel: selectedExp,
        resumeSummary: resumeAnalysis?.summary || ""
      });
      setAiAptitudeQuestions(result.questions);
      setAptitudeStartTime(Date.now());
      toast({ title: "Neural Synthesis Success", description: "15 logical nodes calibrated for your profile." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Synthesis Error", description: "Failed to generate dynamic logic." });
    } finally {
      setIsGeneratingAptitude(false);
    }
  };

  const handleStartCoding = async () => {
    setIsGeneratingCoding(true);
    setCurrentStep(7);
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
      toast({ title: "Syntax Matrix Assembled", description: "Unique challenge synthesized for this session." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Synthesis Error", description: "Failed to generate algorithmic node." });
    } finally {
      setIsGeneratingCoding(false);
    }
  };

  const handleRunCode = async () => {
    if (isRunning || !code) return;
    setIsRunning(true);
    setConsoleOutput(prev => [...prev, `[SYSTEM] Executing ${selectedLanguage} protocol...`]);
    
    try {
      const result = await executeCode(selectedLanguage, code);
      if (result.stderr) {
        setConsoleOutput(prev => [...prev, `[ERROR] ${result.stderr}`]);
      } else {
        setConsoleOutput(prev => [...prev, `[STDOUT] ${result.stdout || '(No output)'}`]);
      }
    } catch (e) {
      setConsoleOutput(prev => [...prev, `[FATAL] Neural execution link lost.`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCodingSubmit = async () => {
    if (!user || !db || isCodingEvaluating) return;
    setIsCodingEvaluating(true);
    setConsoleOutput(prev => [...prev, `[SYSTEM] Initializing Syntax Audit...`]);

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

      // Persist to Firestore
      const assessmentData = {
        userId: user.uid,
        type: 'Coding',
        role: selectedRole,
        company: selectedCompany,
        problem: codingProblem,
        code,
        language: selectedLanguage,
        score: audit.score,
        status: audit.status,
        audit,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users', user.uid, 'coding_results'), assessmentData);

      toast({
        title: audit.status === 'Pass' ? "Syntax Validated" : "Audit Deviation",
        description: audit.status === 'Pass' ? "Access to Technical Arena granted." : "Architectural gaps detected.",
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Audit Failed", description: "System failed to analyze syntax matrix." });
    } finally {
      setIsCodingEvaluating(false);
    }
  };

  const validateFile = (selected: File) => {
    if (selected.type !== 'application/pdf') {
      toast({ variant: "destructive", title: "Invalid Protocol", description: "Only PDF blueprints are accepted." });
      return false;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Max file size: 5MB" });
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleAptitudeSubmit = async () => {
    if (!user || !db || isAptitudeEvaluating) return;
    setIsAptitudeEvaluating(true);
    setIsSubmitDialogOpen(false);

    try {
      const timeTaken = aptitudeStartTime ? Math.round((Date.now() - aptitudeStartTime) / 1000) : 0;
      const results = aiAptitudeQuestions.map((q, idx) => ({
        category: q.category,
        difficulty: q.difficulty,
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

      const assessmentData = {
        userId: user.uid,
        type: 'Aptitude',
        overallScore: evaluation.overallScore,
        status: evaluation.status,
        categoryScores: evaluation.categoryScores,
        feedback: evaluation.feedback,
        timeTakenSeconds: timeTaken,
        questions: aiAptitudeQuestions,
        userAnswers: aptitudeAnswers,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users', user.uid, 'aptitude_results'), assessmentData);

      toast({
        title: evaluation.status === 'Pass' ? "Node Validated" : "Recalibration Required",
        description: evaluation.status === 'Pass' ? "Access to Syntax Round granted." : "Remedial logic paths identified.",
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Evaluation Failed", description: "System failed to audit performance nodes." });
    } finally {
      setIsAptitudeEvaluating(false);
    }
  };

  const handleResumeSync = async () => {
    if (!file || !user || !db) return;
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
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("resumeAnalysis", JSON.stringify(result));
      }

      const resumesRef = collection(db, 'users', user.uid, 'resumes');
      await addDoc(resumesRef, {
        userId: user.uid,
        filename: file.name,
        targetRole: selectedRole,
        atsScore: result.atsScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), { resumeScore: result.atsScore });

      setResumeAnalysis(result);
      nextStep();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Sync Failed", description: "Blueprint extraction interrupted." });
    } finally {
      setIsAnalyzing(false);
    }
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
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Simulation Pipeline</Badge>
              <h1 className="text-3xl font-bold tracking-tighter text-premium">Interview <br /><span className="text-gradient-purple">Journey.</span></h1>
            </div>

            <nav className="space-y-2">
              {INTERVIEW_STEPS.map((step) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                const isLocked = step.id > currentStep;

                return (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                      isActive ? 'bg-accent/10 border-accent/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 
                      isCompleted ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                      'border-transparent opacity-20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-green-500/20 text-green-400' :
                      isActive ? 'bg-accent/20 text-accent' :
                      'bg-white/5 text-white/40'
                    }`}>
                      {isCompleted ? <CircleCheck className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-widest truncate ${isActive ? 'text-white' : 'text-white/40'}`}>{step.title}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em]">{step.desc}</p>
                    </div>
                    {isLocked && <Lock className="ml-auto w-3 h-3 text-white/10" />}
                  </div>
                );
              })}
            </nav>
          </aside>

          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep + (aptitudeReport ? "-apt-result" : "") + (codingReport ? "-cod-result" : "")}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {currentStep === 1 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-10">
                    <header className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                        <Briefcase className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Choose Your Deployment Track</h2>
                      <p className="text-muted-foreground font-light max-w-lg mx-auto">Select a popular role or search our comprehensive IT library.</p>
                    </header>

                    <div className="relative group max-w-2xl mx-auto w-full">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent transition-colors" />
                      <Input 
                        placeholder="Search all 60+ technical tracks..." 
                        value={roleSearch} 
                        onChange={(e) => setRoleSearch(e.target.value)} 
                        className="h-16 pl-16 rounded-2xl glass border-white/10 bg-transparent text-lg focus:border-accent transition-all placeholder:text-white/10" 
                      />
                    </div>

                    <div className="space-y-10">
                      {roleSearch === "" ? (
                        <div className="space-y-6">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                            <span className="w-8 h-px bg-white/10" /> Popular Tracks
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {popularRoles.map(role => (
                              <button 
                                key={role.id} 
                                onClick={() => { setSelectedRole(role.name); nextStep(); }} 
                                className={`p-6 rounded-[2rem] border transition-all text-left flex items-center gap-6 group ${selectedRole === role.name ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:border-white/20'}`}
                              >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === role.name ? 'bg-accent text-black' : 'bg-white/5 text-white/40 group-hover:bg-accent/10 group-hover:text-accent'}`}>
                                  <role.icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className={`font-bold transition-colors ${selectedRole === role.name ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{role.name}</p>
                                  <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">{role.category}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent flex items-center gap-3">
                            <span className="w-8 h-px bg-accent/20" /> Search Results
                          </h3>
                          {filteredRoles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {filteredRoles.map(role => (
                                <button 
                                  key={role.id} 
                                  onClick={() => { setSelectedRole(role.name); nextStep(); }} 
                                  className={`p-6 rounded-[2rem] border transition-all text-left flex items-center gap-6 group ${selectedRole === role.name ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:border-white/20'}`}
                                >
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === role.name ? 'bg-accent text-black' : 'bg-white/5 text-white/40 group-hover:bg-accent/10 group-hover:text-accent'}`}>
                                    <role.icon className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <p className={`font-bold transition-colors ${selectedRole === role.name ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{role.name}</p>
                                    <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">{role.category}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="py-20 text-center space-y-6 glass rounded-[3rem] border-white/5 border-dashed">
                              <SearchX className="w-16 h-16 text-white/5 mx-auto" />
                              <div className="space-y-2">
                                <h3 className="text-xl font-bold">No matching job role found.</h3>
                                <p className="text-muted-foreground text-sm font-light">Recalibrate your search parameters or select a popular track.</p>
                              </div>
                              <Button variant="ghost" onClick={() => setRoleSearch("")} className="text-[10px] font-bold uppercase tracking-widest text-accent">Clear Neural Buffer</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {currentStep === 2 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <header className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                        <GraduationCap className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Calibrate Seniority</h2>
                      <p className="text-muted-foreground font-light">Determine the complexity level for your technical simulation.</p>
                    </header>
                    <div className="grid md:grid-cols-2 gap-6">
                      {EXPERIENCE_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setSelectedExp(opt.label)} className={`p-8 rounded-[2.5rem] border transition-all text-left group ${selectedExp === opt.label ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:border-white/20'}`}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedExp === opt.label ? 'bg-accent text-black' : 'bg-white/5 text-white/40'}`}><opt.icon className="w-7 h-7" /></div>
                          <p className={`text-xl font-bold mb-2 transition-colors ${selectedExp === opt.label ? 'text-white' : 'text-white/60'}`}>{opt.label}</p>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-16 px-10 rounded-2xl uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button onClick={nextStep} disabled={!selectedExp} className="flex-1 h-16 btn-premium text-xs font-bold uppercase tracking-[0.3em]">Synchronize Grade <ChevronRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </Card>
                )}

                {currentStep === 3 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <header className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                        <Building2 className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Target Firm Selection</h2>
                      <p className="text-muted-foreground font-light">Sync simulation protocol with specific hiring standards.</p>
                    </header>
                    <div className="relative group max-w-xl mx-auto w-full">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent transition-colors" />
                      <Input placeholder="Search global partners..." value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} className="h-16 pl-16 rounded-2xl glass border-white/10 bg-transparent focus:border-accent" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {filteredCompanies.map(c => (
                        <button key={c} onClick={() => setSelectedCompany(c)} className={`p-6 rounded-2xl border transition-all text-center group ${selectedCompany === c ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:border-white/20'}`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${selectedCompany === c ? 'bg-accent text-black' : 'bg-white/5 text-white/40'}`}><Building2 className="w-6 h-6" /></div>
                          <p className={`font-bold text-xs transition-colors ${selectedCompany === c ? 'text-white' : 'text-white/60'}`}>{c}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-16 px-10 rounded-2xl uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button onClick={nextStep} disabled={!selectedCompany} className="flex-1 h-16 btn-premium text-xs font-bold uppercase tracking-[0.3em]">Initialize Handshake <ChevronRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </Card>
                )}

                {currentStep === 4 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <header className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                        <Upload className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Career Blueprint Sync</h2>
                      <p className="text-muted-foreground font-light">Upload your latest career vectors to architect a personalized arena.</p>
                    </header>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileChange({ target: { files: e.dataTransfer.files } } as any); }}
                      onClick={() => !isAnalyzing && document.getElementById('resume-journey-upload')?.click()}
                      className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer group relative ${file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30'} ${isDragging ? 'scale-105 border-accent bg-accent/10 shadow-[0_0_50px_rgba(34,211,238,0.2)]' : ''}`}
                    >
                      <input type="file" id="resume-journey-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                      {!file ? (
                        <div className="space-y-6">
                          <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><Upload className="w-12 h-12 text-accent" /></div>
                          <div>
                            <p className="text-2xl font-bold mb-2">Drop PDF Blueprint</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Max 5MB • Validated for ATS v4.2</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-8 glass rounded-3xl border-accent/30">
                          <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-accent"><FileText className="w-10 h-10" /></div>
                            <div className="text-left">
                              <p className="font-bold text-xl">{file.name}</p>
                              <p className="text-[10px] text-accent uppercase font-bold tracking-widest">PROTOCOL LOADED • READY FOR SCAN</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="h-14 w-14 rounded-2xl hover:bg-red-500/10 text-red-400"><Trash2 className="w-6 h-6" /></Button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-16 px-10 rounded-2xl uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button onClick={handleResumeSync} disabled={!file || isAnalyzing} className="flex-1 h-16 btn-premium text-xs font-bold uppercase tracking-[0.3em]">
                        {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin mr-3" /> Auditing Blueprint...</> : <><Zap className="w-4 h-4 mr-3" /> Execute Handshake</>}
                      </Button>
                    </div>
                  </Card>
                )}

                {currentStep === 5 && (
                  <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-12 space-y-12">
                    <header className="flex flex-col md:flex-row justify-between items-center gap-8">
                      <div>
                        <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase mb-4">Initial Intelligence Audit</Badge>
                        <h2 className="text-4xl font-bold tracking-tighter">Resume Screening <span className="text-gradient-purple">Report.</span></h2>
                        <p className="text-muted-foreground font-light mt-2 uppercase tracking-widest text-[10px]">Validated for: {selectedRole} at {selectedCompany}</p>
                      </div>
                      <div className="text-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90">
                             <circle className="text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                             <motion.circle initial={{ strokeDashoffset: 352 }} animate={{ strokeDashoffset: 352 - (352 * (resumeAnalysis?.atsScore || 0)) / 100 }} transition={{ duration: 1.5 }} className="text-accent" strokeWidth="6" strokeDasharray={352} strokeLinecap="round" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                           </svg>
                           <span className="absolute text-3xl font-bold tabular-nums">{resumeAnalysis?.atsScore || 0}%</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground mt-4">ATS Compatibility</p>
                      </div>
                    </header>

                    {(resumeAnalysis?.atsScore || 0) < 60 && (
                      <div className="p-8 glass rounded-[2.5rem] border-red-500/20 bg-red-500/5 flex items-start gap-6">
                        <CircleAlert className="w-8 h-8 text-red-400 shrink-0 mt-1" />
                        <div>
                          <h4 className="text-lg font-bold text-red-400 mb-2">Protocol Warning: Low Blueprint Match</h4>
                          <p className="text-sm font-light text-white/60">Your career blueprint returned an ATS score below the elite threshold (60%). We highly recommend optimizing your resume using our Deep Audit engine before entering the live simulation.</p>
                          <Link href="/resume" className="inline-block mt-6"><Button variant="outline" className="h-10 px-6 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] uppercase font-bold tracking-widest">Launch Blueprint Optimizer</Button></Link>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="p-8 glass border-white/5 space-y-6">
                         <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent flex items-center gap-3"><Target className="w-4 h-4" /> Detected Vectors</h3>
                         <div className="flex flex-wrap gap-2">
                           {(resumeAnalysis?.skillAnalysis || []).map((s: any, i: number) => (
                             <Badge key={i} className="bg-accent/10 text-accent border-accent/20 text-[9px] uppercase font-bold px-3 py-1">{s.skill}</Badge>
                           ))}
                         </div>
                      </Card>
                      <Card className="p-8 glass border-white/5 space-y-6">
                         <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-400 flex items-center gap-3"><CircleAlert className="w-4 h-4" /> Intelligence Gaps</h3>
                         <div className="flex flex-wrap gap-2">
                           {(resumeAnalysis?.missingSkills || []).map((s: string, i: number) => (
                             <Badge key={i} variant="outline" className="border-red-500/20 text-red-400 bg-red-500/5 text-[9px] uppercase font-bold px-3 py-1">{s}</Badge>
                           ))}
                         </div>
                      </Card>
                    </div>

                    <Button onClick={handleStartAptitude} className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]">Initialize Round 01: Aptitude <ChevronRight className="ml-3 w-6 h-6" /></Button>
                  </Card>
                )}

                {currentStep === 6 && (
                  <div className="space-y-8">
                    {isGeneratingAptitude || isAptitudeEvaluating ? (
                      <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-20 text-center space-y-8">
                        <div className="relative w-32 h-32 mx-auto">
                           <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-accent" />
                           <div className="absolute inset-0 flex items-center justify-center">
                             <Cpu className="w-12 h-12 text-accent animate-pulse" />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h2 className="text-3xl font-bold tracking-tighter text-premium">
                             {isAptitudeEvaluating ? "Auditing Cognitive Nodes..." : "Synthesizing Logic Matrix..."}
                           </h2>
                        </div>
                      </Card>
                    ) : !aptitudeReport ? (
                      <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-0 overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
                              <Timer className="w-4 h-4 text-accent" />
                              <span className="font-mono text-xl font-bold text-accent">{formatTime(timeLeft)}</span>
                            </div>
                          </div>
                          <Button onClick={() => setIsSubmitDialogOpen(true)} className="glass border-accent/20 text-accent hover:bg-accent/10 h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest">Submit Assessment</Button>
                        </div>

                        <div className="flex-1 grid lg:grid-cols-12">
                          <div className="lg:col-span-8 p-12 space-y-10 border-r border-white/5">
                            <Badge className="bg-purple-500/20 text-purple-400 border-none uppercase text-[8px] tracking-[0.3em] font-bold px-3 py-1">{aiAptitudeQuestions[aptitudeIdx]?.category}</Badge>
                            <h3 className="text-3xl font-bold leading-tight">{aptitudeIdx + 1}. {aiAptitudeQuestions[aptitudeIdx]?.question}</h3>
                            <RadioGroup value={aptitudeAnswers[aptitudeIdx] || ""} onValueChange={(val) => setAptitudeAnswers({ ...aptitudeAnswers, [aptitudeIdx]: val })} className="space-y-4">
                              {aiAptitudeQuestions[aptitudeIdx]?.options.map((opt: string, i: number) => (
                                <div key={i} onClick={() => setAptitudeAnswers({ ...aptitudeAnswers, [aptitudeIdx]: opt })} className={`flex items-center gap-6 p-6 rounded-2xl border transition-all cursor-pointer ${aptitudeAnswers[aptitudeIdx] === opt ? 'bg-accent/10 border-accent' : 'glass border-white/5'}`}>
                                  <RadioGroupItem value={opt} id={`opt-${i}`} />
                                  <Label htmlFor={`opt-${i}`} className="flex-1 text-lg font-light cursor-pointer">{opt}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <div className="flex items-center justify-between pt-10 border-t border-white/5">
                              <Button variant="ghost" disabled={aptitudeIdx === 0} onClick={() => setAptitudeIdx(aptitudeIdx - 1)} className="h-14 px-8 uppercase tracking-widest text-[10px] font-bold">Previous</Button>
                              <Button onClick={() => aptitudeIdx < aiAptitudeQuestions.length - 1 ? setAptitudeIdx(aptitudeIdx + 1) : setIsSubmitDialogOpen(true)} className="h-14 px-10 btn-premium text-[10px] font-bold uppercase tracking-widest">{aptitudeIdx === aiAptitudeQuestions.length - 1 ? "Finish Round" : "Next Question"}</Button>
                            </div>
                          </div>
                          <div className="lg:col-span-4 bg-white/[0.01] p-8 space-y-8">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Neural Map</h4>
                            <div className="grid grid-cols-5 gap-3">
                              {aiAptitudeQuestions.map((q, i) => (
                                <button key={i} onClick={() => setAptitudeIdx(i)} className={`w-10 h-10 rounded-lg border text-[10px] font-bold ${aptitudeIdx === i ? 'bg-accent text-black border-accent' : aptitudeAnswers[i] ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-white/5 text-white/30'}`}>{i + 1}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <Card className="premium-card bg-[#0b0e1a]/80 border-glow-premium p-12 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-12">
                             <Badge className={`${aptitudeReport.status === 'Pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-none font-bold tracking-[0.3em] uppercase text-xs px-6 py-2`}>
                               SIMULATION STATUS: {aptitudeReport.status.toUpperCase()}
                             </Badge>
                          </div>
                          
                          <div className="grid lg:grid-cols-12 gap-16">
                            <div className="lg:col-span-4 text-center border-r border-white/5 pr-16">
                              <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle className="text-white/5" strokeWidth="10" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                  <motion.circle initial={{ strokeDashoffset: 553 }} animate={{ strokeDashoffset: 553 - (553 * aptitudeReport.overallScore) / 100 }} transition={{ duration: 2 }} className={aptitudeReport.status === 'Pass' ? 'text-accent' : 'text-red-400'} strokeWidth="10" strokeDasharray={553} strokeLinecap="round" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-6xl font-bold tracking-tighter">{aptitudeReport.overallScore}%</span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Efficiency Index</span>
                                </div>
                              </div>
                            </div>

                            <div className="lg:col-span-8 space-y-12">
                              <div className="grid md:grid-cols-3 gap-8">
                                {[
                                  { label: "Quantitative", score: aptitudeReport.categoryScores.quantitative, icon: Activity },
                                  { label: "Logical", score: aptitudeReport.categoryScores.logical, icon: BrainCircuit },
                                  { label: "English", score: aptitudeReport.categoryScores.english, icon: MessageSquare }
                                ].map((cat, i) => (
                                  <div key={i} className="p-6 glass rounded-2xl border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                      <cat.icon className="w-5 h-5 text-accent" />
                                      <span className="text-xl font-bold">{cat.score}%</span>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{cat.label}</p>
                                    <Progress value={cat.score} className="h-1" />
                                  </div>
                                ))}
                              </div>

                              <div className="p-8 glass rounded-[2.5rem] bg-accent/[0.02] border-accent/10">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-6 flex items-center gap-3"><Info className="w-4 h-4" /> Performance Insight</h4>
                                <p className="text-lg font-light leading-relaxed text-white/80 italic">"{aptitudeReport.recommendation}"</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-16 pt-12 border-t border-white/5">
                            {aptitudeReport.status === 'Pass' ? (
                              <Button onClick={handleStartCoding} className="h-20 w-full btn-premium text-lg font-bold uppercase tracking-[0.3em]">
                                Unlock Round 02: Syntax Matrix <ChevronRight className="ml-3 w-6 h-6" />
                              </Button>
                            ) : (
                              <Button onClick={() => setAptitudeReport(null)} variant="outline" className="h-20 w-full rounded-2xl glass border-red-500/20 text-red-400 font-bold uppercase tracking-widest">
                                Protocol Deviation Detected: Reset Round
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-8">
                    {isGeneratingCoding || isCodingEvaluating ? (
                      <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-20 text-center space-y-8">
                        <div className="relative w-32 h-32 mx-auto">
                           <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-accent" />
                           <div className="absolute inset-0 flex items-center justify-center">
                             <Terminal className="w-12 h-12 text-accent animate-pulse" />
                           </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter text-premium">
                          {isCodingEvaluating ? "Auditing Syntax Matrix..." : "Synthesizing Algorithmic Node..."}
                        </h2>
                      </Card>
                    ) : !codingReport ? (
                      <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-0 overflow-hidden flex flex-col min-h-[800px]">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
                              <Timer className="w-4 h-4 text-accent" />
                              <span className="font-mono text-xl font-bold text-accent">{formatTime(codingTimeLeft)}</span>
                            </div>
                            <Select value={selectedLanguage} onValueChange={(val) => { setSelectedLanguage(val); setCode(codingProblem?.starterCode[val] || ""); }}>
                              <SelectTrigger className="w-40 glass border-white/10 bg-transparent h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                <SelectValue placeholder="Language" />
                              </SelectTrigger>
                              <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="c">C</SelectItem>
                                <SelectItem value="csharp">C#</SelectItem>
                                <SelectItem value="go">Go</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={handleRunCode} disabled={isRunning} variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/10">
                              {isRunning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CirclePlay className="w-4 h-4 mr-2" />} Run logic
                            </Button>
                            <Button onClick={handleCodingSubmit} className="btn-premium h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.3)]">Archive Submission</Button>
                          </div>
                        </div>

                        <div className="flex-1 grid lg:grid-cols-2 overflow-hidden">
                          <div className="p-10 border-r border-white/5 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-orange-500/20 text-orange-400 border-none uppercase text-[8px] tracking-[0.3em] font-bold px-3 py-1">{codingProblem?.difficulty} Node</Badge>
                              <span className="text-[10px] font-bold uppercase text-white/20 tracking-widest">100 Points</span>
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight">{codingProblem?.title}</h3>
                            <div className="prose prose-invert prose-sm">
                              <p className="text-lg font-light leading-relaxed text-white/70">{codingProblem?.description}</p>
                              
                              <div className="grid gap-6 mt-8">
                                <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.01]">
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Input Format</p>
                                   <p className="text-xs text-white/50">{codingProblem?.inputFormat}</p>
                                </div>
                                <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.01]">
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Output Format</p>
                                   <p className="text-xs text-white/50">{codingProblem?.outputFormat}</p>
                                </div>
                              </div>

                              <div className="mt-8 space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Sample I/O</h4>
                                <div className="p-6 glass rounded-2xl border-white/5 bg-black/40 font-mono text-xs space-y-3">
                                  <p><span className="text-accent">Input:</span> {codingProblem?.sampleInput}</p>
                                  <p><span className="text-purple-400">Output:</span> {codingProblem?.sampleOutput}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col bg-black/40">
                             <div className="flex-1 relative">
                               <textarea 
                                 value={code} 
                                 onChange={(e) => setCode(e.target.value)} 
                                 spellCheck={false}
                                 className="w-full h-full bg-transparent outline-none border-none p-8 font-mono text-sm leading-6 resize-none text-white/80 selection:bg-accent/20"
                               />
                             </div>
                             <div className="h-72 border-t border-white/5 flex flex-col">
                                <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3 bg-white/[0.01]">
                                   <Terminal className="w-3.5 h-3.5 text-white/30" />
                                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Neural Console</span>
                                </div>
                                <div className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2 bg-[#050816]/50">
                                   {consoleOutput.map((log, i) => (
                                     <div key={i} className={log.startsWith('[ERROR]') ? 'text-red-400' : log.startsWith('[STDOUT]') ? 'text-green-400' : 'text-white/40'}>
                                       {log}
                                     </div>
                                   ))}
                                   {isRunning && <div className="text-accent animate-pulse">Running execution loop...</div>}
                                </div>
                             </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                         <Card className="premium-card bg-[#0b0e1a]/80 border-glow-premium p-12">
                            <div className="flex justify-between items-start mb-12">
                              <div>
                                <Badge className={`${codingReport.status === 'Pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-none font-bold tracking-[0.3em] uppercase text-xs px-6 py-2`}>
                                  SYNTAX STATUS: {codingReport.status.toUpperCase()}
                                </Badge>
                                <h2 className="text-5xl font-bold tracking-tighter text-premium mt-4">Syntax Audit Complete</h2>
                              </div>
                              <div className="text-right">
                                <div className="text-7xl font-bold text-gradient-purple">{codingReport.score}%</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-2">Precision Index</div>
                              </div>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                               <div className="p-8 glass rounded-[2rem] border-white/5 space-y-4">
                                  <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Readability</span>
                                    <span className="text-xl font-bold text-accent">{codingReport.readabilityScore}%</span>
                                  </div>
                                  <Progress value={codingReport.readabilityScore} className="h-1" />
                               </div>
                               <div className="p-8 glass rounded-[2rem] border-white/5">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Time Complexity</p>
                                  <p className="text-2xl font-bold text-purple-400">{codingReport.timeComplexity}</p>
                               </div>
                               <div className="p-8 glass rounded-[2rem] border-white/5">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Space Complexity</p>
                                  <p className="text-2xl font-bold text-blue-400">{codingReport.spaceComplexity}</p>
                               </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                               <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Optimization Directives</h4>
                                  <div className="space-y-4">
                                    {codingReport.optimizationTips.map((tip: string, i: number) => (
                                      <div key={i} className="flex gap-4 p-5 glass rounded-2xl border-white/5 text-sm font-light text-white/70">
                                        <Zap className="w-4 h-4 text-accent shrink-0" /> {tip}
                                      </div>
                                    ))}
                                  </div>
                               </div>
                               <div className="p-10 glass rounded-[2.5rem] bg-accent/[0.02] border-accent/10">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-6">Staff Auditor Recommendation</h4>
                                  <p className="text-lg font-light leading-relaxed text-white/80 italic">"{codingReport.finalRecommendation}"</p>
                               </div>
                            </div>

                            <div className="mt-16 pt-12 border-t border-white/5">
                              {codingReport.status === 'Pass' ? (
                                <Button onClick={nextStep} className="h-20 w-full btn-premium text-lg font-bold uppercase tracking-[0.3em]">
                                  Enter Live Technical Arena <Mic className="ml-3 w-6 h-6" />
                                </Button>
                              ) : (
                                <Button onClick={() => setCodingReport(null)} variant="outline" className="h-20 w-full rounded-2xl glass border-red-500/20 text-red-400 font-bold uppercase tracking-widest">
                                  Recalibrate Syntax Matrix
                                </Button>
                              )}
                            </div>
                         </Card>
                      </motion.div>
                    )}
                  </div>
                )}

                {currentStep === 8 && (
                   <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-20 text-center space-y-12">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-accent/20 flex items-center justify-center mx-auto border border-accent/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                        <Mic className="w-16 h-16 text-accent animate-pulse" />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-4xl font-bold tracking-tighter text-premium">Arena Simulation Prime</h2>
                        <p className="text-muted-foreground font-light text-lg max-w-sm mx-auto">Neural host is calibrated for {selectedCompany}. Enter the arena to finalize your performance audit.</p>
                      </div>
                      <Button 
                        onClick={() => {
                          const sessionId = Math.random().toString(36).substring(7);
                          router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&company=${encodeURIComponent(selectedCompany)}&exp=${encodeURIComponent(selectedExp)}&round=Technical%20Round`);
                        }}
                        className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]"
                      >
                        Enter Neural Arena <Zap className="ml-3 w-6 h-6" />
                      </Button>
                   </Card>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="glass border-white/10 bg-[#0b0e1a] text-white rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-bold tracking-tighter">Execute Submission?</DialogTitle></DialogHeader>
          <div className="py-6 text-muted-foreground">Neural audit will evaluate your logic nodes. This action is final for the current calibration round.</div>
          <DialogFooter className="gap-4"><Button variant="ghost" onClick={() => setIsSubmitDialogOpen(false)} className="rounded-xl font-bold text-[10px] uppercase tracking-widest">Continue Solving</Button><Button onClick={handleAptitudeSubmit} className="btn-premium h-12 px-10 rounded-xl font-bold text-[10px] uppercase tracking-widest">Finalize Round</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
