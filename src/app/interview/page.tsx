
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  ArrowLeft,
  Terminal as DevIcon,
  Rocket,
  ShieldAlert,
  Command
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
import { cn } from '@/lib/utils';

const ALL_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "MERN Stack Developer", "MEAN Stack Developer", "Java Developer", "Python Developer",
  "React Developer", "Angular Developer", "Node.js Developer", ".NET Developer",
  "C# Developer", "C++ Developer", "Android Developer", "iOS Developer",
  "Flutter Developer", "React Native Developer", "DevOps Engineer", "Cloud Engineer",
  "AWS Engineer", "Azure Engineer", "GCP Engineer", "Data Analyst", "Business Analyst",
  "Data Scientist", "Machine Learning Engineer", "AI Engineer", "Prompt Engineer",
  "Gen AI Engineer", "Cyber Security Analyst", "SOC Analyst", "Network Engineer",
  "Database Administrator", "SQL Developer", "QA Engineer", "Automation Tester",
  "Manual Tester", "SDET", "Salesforce Developer", "SAP Consultant", "ServiceNow Developer",
  "UI UX Designer", "Product Manager", "Technical Support Engineer", "System Engineer",
  "Site Reliability Engineer", "Embedded Engineer", "Blockchain Developer", "Game Developer",
  "AR VR Developer", "Big Data Engineer", "Power BI Developer", "Tableau Developer"
];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Adobe", "Oracle",
  "IBM", "Intel", "Cisco", "Salesforce", "NVIDIA", "Uber", "Airbnb", "Tesla",
  "Spotify", "PayPal", "Accenture", "Capgemini", "Infosys", "TCS", "Wipro", "HCL",
  "Tech Mahindra", "Cognizant", "Deloitte", "EY", "PwC", "KPMG", "JP Morgan",
  "Goldman Sachs", "Morgan Stanley", "Zoho", "Flipkart", "PhonePe", "Swiggy",
  "Zomato", "Meesho", "Razorpay", "Freshworks", "BrowserStack", "Postman",
  "Dream11", "Groww", "CRED", "Upstox", "Juspay", "Myntra", "LinkedIn", "OpenAI",
  "Anthropic", "Perplexity"
];

const EXPERIENCE_LEVELS = ["Fresher", "0-1 Years", "1-3 Years", "3-5 Years", "5-8 Years", "8+ Years"];

const INTERVIEW_STEPS = [
  { id: 1, title: 'Job Setup', icon: Command },
  { id: 2, title: 'Resume Node', icon: Upload },
  { id: 3, title: 'Aptitude Audit', icon: Zap },
  { id: 4, title: 'Aptitude Result', icon: FileText },
  { id: 5, title: 'Syntax Matrix', icon: Code2 },
  { id: 6, title: 'Coding Result', icon: Award },
  { id: 7, title: 'Virtual Arena', icon: Mic },
  { id: 8, title: 'Final Dossier', icon: FileSearch2 },
];

export default function InterviewJourney() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  
  const [roleSearch, setRoleSearch] = useState("");
  const [isRoleSearchOpen, setIsRoleSearchOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [isCompanySearchOpen, setIsCompanySearchOpen] = useState(false);

  const [isInitializingProtocol, setIsInitializingProtocol] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

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

  const [isGeneratingCoding, setIsGeneratingCoding] = useState(false);
  const [codingProblem, setCodingProblem] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isCodingEvaluating, setIsCodingEvaluating] = useState(false);
  const [codingReport, setCodingReport] = useState<any>(null);

  const [showRecovery, setShowRecovery] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const LOADING_MESSAGES = [
    "Initializing AI Interview...",
    "Loading Company Pattern...",
    "Preparing Assessment...",
    "Building Interview Pipeline...",
    "AI Ready..."
  ];

  useEffect(() => {
    async function loadActiveSession() {
      if (!user || !db) return;
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.step < 10) {
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
    const docRef = doc(db, 'users', user.uid, 'journey', 'active');
    await deleteDoc(docRef);
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
  };

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

  const handleInitializeTerminal = async () => {
    if (!selectedRole || !selectedCompany || !selectedExp) {
      toast({ variant: "destructive", title: "Configuration Incomplete", description: "Select job role, company and seniority level." });
      return;
    }

    setIsInitializingProtocol(true);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < LOADING_MESSAGES.length) {
        setLoadingMsgIdx(idx);
      } else {
        clearInterval(interval);
        saveProgress(2);
        setCurrentStep(2);
        setIsInitializingProtocol(false);
      }
    }, 800);
  };

  const handleResumeStep = async () => {
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
      saveProgress(3, { resumeAnalysis: result });
      setCurrentStep(3);
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Failed" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredRoles = useMemo(() => 
    ALL_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())),
  [roleSearch]);

  const filteredCompanies = useMemo(() => 
    COMPANIES.filter(c => c.toLowerCase().includes(companySearch.toLowerCase())),
  [companySearch]);

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] pb-32 selection:bg-accent/30 selection:text-white">
      <div className="particles-bg" />
      
      {/* Animated Gradient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <Navbar />
      <NavigationControls onHome={() => router.push('/')} onBack={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : router.back()} />

      <main className="container mx-auto px-6 pt-40 relative z-10">
        <AnimatePresence mode="wait">
          {isInitializingProtocol && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-[#050816]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12"
            >
              <div className="max-w-md w-full text-center space-y-12">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin duration-[2s]" />
                  <div className="absolute inset-4 glass rounded-full flex items-center justify-center"><Command className="w-10 h-10 text-accent animate-pulse" /></div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter text-premium">{LOADING_MESSAGES[loadingMsgIdx]}</h2>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(loadingMsgIdx + 1) * 20}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showRecovery ? (
            <motion.div key="recovery" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center py-20">
              <Card className="premium-card bg-white/[0.02] border-white/10 p-16 text-center max-w-2xl space-y-12 shadow-[0_0_80px_rgba(147,51,234,0.1)]">
                <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/30 shadow-2xl">
                   <History className="w-12 h-12 text-accent animate-pulse" />
                </div>
                <div className="space-y-6">
                   <h2 className="text-4xl font-bold tracking-tighter">Neural Link Interrupted</h2>
                   <p className="text-xl text-muted-foreground font-light leading-relaxed">
                     We detected an unfinished interview protocol. Would you like to resume your active session or initialize a fresh simulation?
                   </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                   <Button onClick={resumeSession} className="flex-1 h-18 btn-premium text-xs font-bold uppercase tracking-[0.2em] shadow-xl">
                     Resume Active Mission <ChevronRight className="ml-2 w-5 h-5" />
                   </Button>
                   <Button onClick={handleGlobalReset} variant="outline" className="flex-1 h-18 rounded-2xl glass border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-[0.2em]">
                     Initialize New Protocol
                   </Button>
                </div>
              </Card>
            </motion.div>
          ) : currentStep === 1 ? (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-12">
              <header className="text-center space-y-4">
                <Badge className="bg-accent/20 text-accent border-none px-6 py-2 text-[10px] tracking-[0.4em] font-black uppercase">Neural Interview Engine</Badge>
                <h1 className="text-7xl font-bold tracking-tighter text-premium">Interview Setup</h1>
                <p className="text-xl text-muted-foreground font-light">Configure your interview journey before entering the AI Interview Room.</p>
              </header>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Configuration */}
                <Card className="lg:col-span-8 premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                  
                  {/* Job Role Picker */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Deployment Track</Label>
                      {selectedRole && <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black uppercase">{selectedRole}</Badge>}
                    </div>
                    <div className="relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        placeholder="Search Job Role..." 
                        value={roleSearch || selectedRole}
                        onChange={(e) => { setRoleSearch(e.target.value); setSelectedRole(""); setIsRoleSearchOpen(true); }}
                        onFocus={() => setIsRoleSearchOpen(true)}
                        className="w-full h-18 pl-16 pr-8 rounded-[1.5rem] glass border-white/10 bg-transparent text-lg font-light focus:outline-none focus:border-accent/50 focus:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all"
                      />
                      <AnimatePresence>
                        {isRoleSearchOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-3 p-3 glass border-white/10 bg-[#0b0e1a]/95 rounded-[1.5rem] z-[100] max-h-[300px] overflow-y-auto custom-scrollbar shadow-2xl border-glow-premium"
                          >
                            {filteredRoles.map(role => (
                              <button 
                                key={role} 
                                onClick={() => { setSelectedRole(role); setIsRoleSearchOpen(false); setRoleSearch(""); }}
                                className="w-full text-left p-4 hover:bg-accent/10 hover:text-accent rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-between group"
                              >
                                {role}
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Company Picker */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Target Agency</Label>
                      {selectedCompany && <Badge className="bg-purple-500/20 text-purple-400 border-none text-[8px] font-black uppercase">{selectedCompany}</Badge>}
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        placeholder="Search Company..." 
                        value={companySearch || selectedCompany}
                        onChange={(e) => { setCompanySearch(e.target.value); setSelectedCompany(""); setIsCompanySearchOpen(true); }}
                        onFocus={() => setIsCompanySearchOpen(true)}
                        className="w-full h-18 pl-16 pr-8 rounded-[1.5rem] glass border-white/10 bg-transparent text-lg font-light focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all"
                      />
                      <AnimatePresence>
                        {isCompanySearchOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-3 p-3 glass border-white/10 bg-[#0b0e1a]/95 rounded-[1.5rem] z-[100] max-h-[300px] overflow-y-auto custom-scrollbar shadow-2xl border-glow-premium"
                          >
                            {filteredCompanies.map(comp => (
                              <button 
                                key={comp} 
                                onClick={() => { setSelectedCompany(comp); setIsCompanySearchOpen(false); setCompanySearch(""); }}
                                className="w-full text-left p-4 hover:bg-purple-500/10 hover:text-purple-400 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-between group"
                              >
                                {comp}
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Experience Segmented Selector */}
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Seniority Grade</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {EXPERIENCE_LEVELS.map(level => (
                        <button
                          key={level}
                          onClick={() => setSelectedExp(level)}
                          className={cn(
                            "h-14 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all duration-300",
                            selectedExp === level 
                            ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                            : "glass border-white/10 text-white/40 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleInitializeTerminal} 
                    className="w-full h-20 btn-premium rounded-[2rem] text-xl font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(147,51,234,0.3)] group"
                  >
                    Initialize Simulation <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" />
                  </Button>
                </Card>

                {/* Right Side: Preview & Info */}
                <div className="lg:col-span-4 space-y-6">
                  <Card className="premium-card bg-accent/[0.02] border-accent/20 p-8 space-y-8 sticky top-32">
                    <h3 className="text-lg font-black uppercase tracking-tighter text-accent flex items-center gap-3">
                      <Sparkles className="w-5 h-5" /> Simulation Blueprint
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="p-5 glass rounded-2xl border-white/5 space-y-1">
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Active Protocol</p>
                        <p className="text-lg font-bold text-white leading-tight">{selectedRole || "Awaiting Selection"}</p>
                        <p className="text-[10px] text-accent font-bold mt-1 uppercase">{selectedCompany || "---"} • {selectedExp || "---"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 glass rounded-xl border-white/5">
                          <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Difficulty</p>
                          <p className="text-sm font-bold">{selectedExp ? (selectedExp.includes('5') || selectedExp.includes('8') ? 'Expert' : 'Standard') : '---'}</p>
                        </div>
                        <div className="p-4 glass rounded-xl border-white/5">
                          <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Duration</p>
                          <p className="text-sm font-bold">~45 Mins</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-widest ml-1">Logic Path Sequence</p>
                        {[
                          { label: "Resume Node", status: "Input" },
                          { label: "Aptitude Audit", status: "15 Nodes" },
                          { label: "Syntax Matrix", status: "Compiler" },
                          { label: "HR Interview", status: "Virtual" }
                        ].map((step, i, arr) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[8px] font-black text-white/40">
                                {i + 1}
                              </div>
                              {i < arr.length - 1 && <div className="absolute top-6 left-1/2 -translate-x-1/2 w-px h-3 bg-white/5" />}
                            </div>
                            <div className="flex-1 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/60">
                              <span>{step.label}</span>
                              <span className="text-[8px] text-white/20">{step.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                      {[
                        { icon: Rocket, label: "Rounds", val: "4" },
                        { icon: ShieldCheck, label: "Evaluation", val: "AI" },
                        { icon: Award, label: "Pass Index", val: "70%" },
                        { icon: FileText, label: "Certificate", val: "True" }
                      ].map((info, i) => (
                        <div key={i} className="flex flex-col items-center p-3 glass rounded-xl border-white/5">
                           <info.icon className="w-4 h-4 text-accent/50 mb-2" />
                           <span className="text-[8px] font-black text-white/20 uppercase mb-1">{info.label}</span>
                           <span className="text-[10px] font-bold text-white/80">{info.val}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : currentStep === 2 ? (
            <motion.div key="resume" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-12">
               <header className="text-center space-y-4">
                <Badge className="bg-accent/20 text-accent border-none px-6 py-2 text-[10px] tracking-[0.4em] font-black uppercase">Identity Verification</Badge>
                <h1 className="text-6xl font-bold tracking-tighter text-premium">Upload Resume</h1>
                <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto">Provide your career blueprint to calibrate the simulated environment.</p>
              </header>

              <Card 
                onClick={() => !isAnalyzing && document.getElementById('journey-resume-upload')?.click()}
                className={cn(
                  "premium-card bg-white/[0.01] border-white/5 p-20 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500",
                  file ? "border-accent/40 bg-accent/[0.02] shadow-[0_0_50px_rgba(34,211,238,0.1)]" : "hover:border-accent/30"
                )}
              >
                <input type="file" id="journey-resume-upload" className="hidden" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative w-24 h-24">
                       <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                       <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin" />
                       <Cpu className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.4em] text-accent">Extracting Knowledge Nodes...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                      {file ? <CheckCircle2 className="w-12 h-12 text-green-400" /> : <Upload className="w-12 h-12 text-accent" />}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold">{file ? "Blueprint Secured" : "Deploy Career History"}</h3>
                      <p className="text-sm text-muted-foreground font-light uppercase tracking-widest">{file ? file.name : "Drag & Drop PDF or DOCX (Max 10MB)"}</p>
                    </div>
                    {file && (
                      <Button variant="ghost" className="h-10 px-8 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/10">Replace Blueprint</Button>
                    )}
                  </div>
                )}
              </Card>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button variant="ghost" onClick={() => setCurrentStep(1)} className="flex-1 h-18 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest">Back to Calibration</Button>
                <Button onClick={handleResumeStep} disabled={!file || isAnalyzing} className="flex-[2] h-18 btn-premium text-xs font-black uppercase tracking-[0.3em] shadow-2xl">
                  {isAnalyzing ? "Processing Data..." : "Finalize Neural Scan"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="other" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 space-y-12">
               <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                 <Loader2 className="w-10 h-10 text-accent animate-spin" />
               </div>
               <h2 className="text-2xl font-bold tracking-tighter uppercase text-white/40">Synchronizing Assessment Environment...</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .border-glow-premium {
          position: relative;
          z-index: 1;
        }
        .border-glow-premium::before {
          content: '';
          position: absolute;
          inset: -1px;
          z-index: -1;
          background: linear-gradient(45deg, rgba(34, 211, 238, 0.3), rgba(147, 51, 234, 0.3));
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: destination-out;
          padding: 1px;
        }
      `}</style>
    </div>
  );
}

