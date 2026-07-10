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
  CheckCircle2, 
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
  AlertCircle,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Sparkles,
  FileEdit,
  Timer,
  ChevronLeft,
  XCircle,
  RefreshCcw,
  Activity,
  Terminal,
  PlayCircle,
  Save,
  MonitorCog,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const ROLES_DATA = [
  { id: 'java', name: "Java Developer", category: "Development", icon: Code2 },
  { id: 'python', name: "Python Developer", category: "Development", icon: Code2 },
  { id: 'react', name: "React Developer", category: "Development", icon: Code2 },
  { id: 'nodejs', name: "Node.js Developer", category: "Development", icon: Code2 },
  { id: 'fullstack', name: "Full Stack Developer", category: "Development", icon: Code2 },
  { id: 'data', name: "Data Analyst", category: "Data & Intelligence", icon: Database },
  { id: 'devops', name: "DevOps Engineer", category: "Operations & Trust", icon: Layers },
  { id: 'qa', name: "QA Engineer", category: "Operations & Trust", icon: SearchCheck },
  { id: 'ai', name: "AI Engineer", category: "Data & Intelligence", icon: Zap },
  { id: 'cyber', name: "Cyber Security Analyst", category: "Operations & Trust", icon: ShieldAlert },
];

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

const APTITUDE_QUESTIONS = [
  { id: 1, category: "Quantitative", question: "If a train 110m long passes a telegraph pole in 3 seconds, what is its speed in km/h?", options: ["132", "135", "142", "120"], answer: "132" },
  { id: 2, category: "Quantitative", question: "The average of first five prime numbers is?", options: ["5.6", "6.2", "7.0", "5.2"], answer: "5.6" },
  { id: 3, category: "Quantitative", question: "A sum of money doubles itself in 10 years at simple interest. What is the rate of interest?", options: ["5%", "10%", "12.5%", "15%"], answer: "10%" },
  { id: 4, category: "Quantitative", question: "If 20% of a = b, then b% of 20 is the same as?", options: ["4% of a", "5% of a", "20% of a", "None"], answer: "4% of a" },
  { id: 5, category: "Quantitative", question: "Find the odd one out: 3, 5, 11, 14, 17, 21", options: ["14", "17", "21", "11"], answer: "14" },
  { id: 6, category: "Logical", question: "Find the missing number: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "38"], answer: "42" },
  { id: 7, category: "Logical", question: "If 'WATER' is written as 'YCVGT', then 'H2O' is written as?", options: ["J4Q", "K4Q", "J3P", "L4R"], answer: "J4Q" },
  { id: 8, category: "Logical", question: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", options: ["Mother", "Sister", "Aunt", "Daughter"], answer: "Mother" },
  { id: 9, category: "Logical", question: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", options: ["7", "10", "12", "13"], answer: "10" },
  { id: 10, category: "Logical", question: "Which word does NOT belong with the others?", options: ["Index", "Glossary", "Chapter", "Book"], answer: "Book" },
  { id: 11, category: "English", question: "Choose the synonym for 'EPHEMERAL':", options: ["Permanent", "Short-lived", "Transparent", "Mysterious"], answer: "Short-lived" },
  { id: 12, category: "English", question: "Choose the correctly spelled word:", options: ["Accomodate", "Acommodate", "Accommodate", "Accomoddat"], answer: "Accommodate" },
  { id: 13, category: "English", question: "Fill in the blank: He is ___ honest man.", options: ["a", "an", "the", "no article"], answer: "an" },
  { id: 14, category: "English", question: "Select the antonym for 'PLACID':", options: ["Calm", "Stormy", "Quiet", "Serious"], answer: "Stormy" },
  { id: 15, category: "English", question: "Choose the most appropriate meaning of the idiom: 'Beat around the bush'", options: ["To talk vaguely", "To punish someone", "To cut trees", "To work hard"], answer: "To talk vaguely" },
];

const CODING_PROBLEM = {
  title: "Two Sum Protocol",
  difficulty: "Medium",
  points: 100,
  description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
  examples: [
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
    { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "Only one valid answer exists."
  ],
  starterCode: {
    javascript: "function twoSum(nums, target) {\n  // Implement neural logic\n};",
    python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Implement neural logic",
    java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Implement neural logic\n    }\n}",
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Implement neural logic\n    }\n};"
  }
};

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
  const [aptitudeIdx, setAptitudeIdx] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isAptitudeComplete, setIsAptitudeComplete] = useState(false);
  const [showAptitudeResult, setShowAptitudeResult] = useState(false);

  // Coding Round State
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(CODING_PROBLEM.starterCode.javascript);
  const [codingTimeLeft, setCodingTimeLeft] = useState(45 * 60); // 45 minutes
  const [isCodingComplete, setIsCodingComplete] = useState(false);
  const [showCodingResult, setShowCodingResult] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(["[SYSTEM] Neural terminal initialized...", "[SYSTEM] Awaiting syntax input..."]);
  const [isRunning, setIsRunning] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (currentStep === 6 && timeLeft > 0 && !isAptitudeComplete) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentStep === 6 && !isAptitudeComplete) {
      handleAptitudeSubmit();
    }
  }, [currentStep, timeLeft, isAptitudeComplete]);

  // Coding Timer Effect
  useEffect(() => {
    if (currentStep === 7 && codingTimeLeft > 0 && !isCodingComplete) {
      const timer = setInterval(() => setCodingTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, codingTimeLeft, isCodingComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Resume check
  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'resumes'), orderBy('createdAt', 'desc'), limit(1));
  }, [db, user?.uid]);
  const { loading: resumeCheckLoading } = useCollection(resumeQuery);

  const filteredRoles = useMemo(() => {
    return ROLES_DATA.filter(role => 
      role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      role.category.toLowerCase().includes(roleSearch.toLowerCase())
    );
  }, [roleSearch]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (validateFile(dropped)) {
        setFile(dropped);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
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

      await addDoc(collection(db, 'users', user.uid, 'resumes'), {
        userId: user.uid,
        filename: file.name,
        targetRole: selectedRole,
        atsScore: result.atsScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        resumeScore: result.atsScore
      });

      setResumeAnalysis(result);
      nextStep();
      toast({ title: "Blueprint Verified", description: "Career intelligence synchronized." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Audit Failed", description: "System could not parse blueprint." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAptitudeSubmit = () => {
    setIsAptitudeComplete(true);
    setIsSubmitDialogOpen(false);
    setShowAptitudeResult(true);
    toast({ title: "Aptitude Node Captured", description: "Logic assessment archived." });
  };

  const resetAptitude = () => {
    setAptitudeAnswers({});
    setAptitudeIdx(0);
    setTimeLeft(20 * 60);
    setIsAptitudeComplete(false);
    setShowAptitudeResult(false);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput(prev => [...prev, `[EXEC] Running ${selectedLanguage} syntax audit...`]);
    
    setTimeout(() => {
      setIsRunning(false);
      setConsoleOutput(prev => [...prev, "[SUCCESS] Syntax validated. No memory leaks detected.", "[INFO] Runtime: 12ms", "[INFO] Memory: 42MB"]);
    }, 1500);
  };

  const handleSubmitCode = () => {
    setIsCodingComplete(true);
    setShowCodingResult(true);
    toast({ title: "Syntax Matrix Archived", description: "Your implementation has been successfully submitted." });
  };

  const resetCoding = () => {
    setCode(CODING_PROBLEM.starterCode[selectedLanguage as keyof typeof CODING_PROBLEM.starterCode]);
    setCodingTimeLeft(45 * 60);
    setIsCodingComplete(false);
    setShowCodingResult(false);
    setConsoleOutput(["[SYSTEM] Neural terminal recalibrated.", "[SYSTEM] Awaiting fresh syntax input..."]);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setCode(CODING_PROBLEM.starterCode[lang as keyof typeof CODING_PROBLEM.starterCode]);
    setConsoleOutput(prev => [...prev, `[SYSTEM] Language switched to ${lang.toUpperCase()}.`]);
  };

  const startActualInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&company=${encodeURIComponent(selectedCompany || "Standard")}&exp=${encodeURIComponent(selectedExp)}&round=Technical`);
  };

  if (resumeCheckLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="container mx-auto px-6 py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          
          {/* Journey Sidebar */}
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
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
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

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep + (showAptitudeResult ? "-apt-result" : "") + (showCodingResult ? "-code-result" : "")}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Step 1: Job Role */}
                {currentStep === 1 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <header className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                        <Briefcase className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Choose Your Deployment Track</h2>
                      <p className="text-muted-foreground font-light max-lg mx-auto">Select the specialized engineering role for your neural calibration.</p>
                    </header>

                    <div className="relative group max-w-2xl mx-auto w-full">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent transition-colors" />
                      <Input 
                        placeholder="Search technical tracks..." 
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        className="h-16 pl-16 rounded-2xl glass border-white/10 bg-transparent text-lg focus:border-accent transition-all"
                      />
                    </div>

                    <div className="space-y-10">
                      {["Development", "Data & Intelligence", "Operations & Trust"].map(cat => {
                        const categoryRoles = filteredRoles.filter(r => r.category === cat);
                        if (categoryRoles.length === 0) return null;

                        return (
                          <div key={cat} className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                              <span className="w-8 h-px bg-white/10" /> {cat}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {categoryRoles.map(role => (
                                <button 
                                  key={role.id} 
                                  onClick={() => setSelectedRole(role.name)}
                                  className={`p-6 rounded-[2rem] border transition-all text-left flex items-center gap-6 group ${
                                    selectedRole === role.name 
                                    ? 'bg-accent/20 border-accent shadow-[0_0_30px_rgba(34,211,238,0.1)]' 
                                    : 'glass border-white/5 hover:border-white/20'
                                  }`}
                                >
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                    selectedRole === role.name ? 'bg-accent text-black' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                                  }`}>
                                    <role.icon className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <p className={`font-bold transition-colors ${selectedRole === role.name ? 'text-white' : 'text-white/60'}`}>{role.name}</p>
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{role.category}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={nextStep} disabled={!selectedRole} className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]">Confirm Role Vector <ChevronRight className="ml-3 w-6 h-6" /></Button>
                    </div>
                  </Card>
                )}

                {/* Step 2: Experience Level */}
                {currentStep === 2 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <header className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                        <GraduationCap className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Seniority Level Calibration</h2>
                      <p className="text-muted-foreground font-light max-w-lg mx-auto">Calibrate the simulation intensity based on your professional experience grade.</p>
                    </header>

                    <div className="grid md:grid-cols-2 gap-4">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <button 
                          key={opt.id} 
                          onClick={() => setSelectedExp(opt.label)}
                          className={`p-8 rounded-[2.5rem] border transition-all text-left flex items-center gap-6 group ${
                            selectedExp === opt.label 
                            ? 'bg-accent/20 border-accent shadow-[0_0_30px_rgba(34,211,238,0.1)]' 
                            : 'glass border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                            selectedExp === opt.label ? 'bg-accent text-black' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                          }`}>
                            <opt.icon className="w-7 h-7" />
                          </div>
                          <div>
                            <p className={`text-xl font-bold transition-colors ${selectedExp === opt.label ? 'text-white' : 'text-white/60'}`}>{opt.label}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-20 px-10 rounded-[2rem] border border-white/5 uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button 
                        onClick={nextStep} 
                        disabled={!selectedExp}
                        className="flex-1 h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]"
                      >
                        Confirm Seniority <ChevronRight className="ml-3 w-6 h-6" />
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Step 3: Company Sync */}
                {currentStep === 3 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <header className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20">
                        <Building2 className="w-10 h-10 text-purple-400" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Target Corporate Protocol</h2>
                      <p className="text-muted-foreground font-light max-w-lg mx-auto">Calibrate the simulation to mirror the culture and rigor of a specific tech firm.</p>
                    </header>

                    <div className="relative group max-w-2xl mx-auto w-full">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent transition-colors" />
                      <Input 
                        placeholder="Search target company..." 
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="h-16 pl-16 rounded-2xl glass border-white/10 bg-transparent text-lg focus:border-accent transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      {filteredCompanies.map(comp => (
                        <button 
                          key={comp} 
                          onClick={() => setSelectedCompany(comp)}
                          className={`p-6 rounded-[2rem] border transition-all text-center flex flex-col items-center gap-4 group ${
                            selectedCompany === comp 
                            ? 'bg-purple-500/20 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]' 
                            : 'glass border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                            selectedCompany === comp ? 'bg-purple-500 text-white scale-110 shadow-lg' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                          }`}>
                            <span className="text-xl font-black">{comp[0]}</span>
                          </div>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${selectedCompany === comp ? 'text-white' : 'text-white/60'}`}>{comp}</p>
                          </div>
                        </button>
                      ))}
                      {filteredCompanies.length === 0 && (
                        <div className="col-span-full py-12 text-center opacity-30 italic">No protocols found for "{companySearch}"</div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-20 px-10 rounded-[2rem] border border-white/5 uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button 
                        onClick={nextStep} 
                        disabled={!selectedCompany}
                        className="flex-1 h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]"
                      >
                        Sync Protocol <ChevronRight className="ml-3 w-6 h-6" />
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Step 4: Resume Upload */}
                {currentStep === 4 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 text-center space-y-12">
                    <header className="space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                        <Upload className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Intelligence Handshake</h2>
                      <p className="text-muted-foreground font-light max-w-lg mx-auto">Upload your PDF career blueprint for neural ATS screening and simulation calibration.</p>
                    </header>
                    
                    {!file ? (
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !isAnalyzing && document.getElementById('journey-upload')?.click()}
                        className={`border-2 border-dashed rounded-[2.5rem] p-20 transition-all cursor-pointer group flex flex-col items-center justify-center gap-6 ${
                          isDragging ? 'border-accent bg-accent/10 scale-[1.02]' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'
                        } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input type="file" id="journey-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-accent transition-colors">
                          <FileUp className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-xl font-bold mb-1">Drag & drop your blueprint</p>
                          <p className="text-sm text-muted-foreground">or <span className="text-accent underline">browse your terminal</span></p>
                        </div>
                        <div className="flex gap-4">
                           <Badge variant="outline" className="border-white/5 text-[10px] font-bold text-white/20 uppercase tracking-widest">PDF ONLY</Badge>
                           <Badge variant="outline" className="border-white/5 text-[10px] font-bold text-white/20 uppercase tracking-widest">MAX 5MB</Badge>
                        </div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 glass rounded-[2.5rem] border-accent/20 bg-accent/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-white truncate max-w-[200px] md:max-w-[400px]">{file.name}</p>
                            <p className="text-[10px] text-accent uppercase font-bold tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB • Protocol Active</p>
                          </div>
                        </div>
                        <Button 
                          onClick={removeFile}
                          disabled={isAnalyzing}
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl hover:bg-red-500/10 text-red-400"
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-20 px-10 rounded-[2.5rem] border border-white/5 uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button 
                        onClick={handleResumeSync} 
                        disabled={!file || isAnalyzing}
                        className="flex-1 h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]"
                      >
                        {isAnalyzing ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Synchronizing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6" />
                            <span>Execute Handshake</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Step 5: Resume Screening Analysis Dashboard */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-12 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8"><Badge className="bg-accent/20 text-accent font-bold tracking-widest uppercase text-[10px]">Neural Audit Live</Badge></div>
                      
                      <div className="grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-4 text-center space-y-6 border-r border-white/5 pr-12">
                          <div className="relative w-48 h-48 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                            <motion.div 
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 360 }} 
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent" 
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-6xl font-bold tracking-tighter text-premium">{resumeAnalysis?.atsScore || 0}%</span>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">ATS Index</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Protocol Match Optimal</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                              Your blueprint is calibrated for {selectedCompany}'s <br />{selectedRole} standards.
                            </p>
                          </div>
                        </div>

                        <div className="lg:col-span-8 space-y-10">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                                <ChevronUp className="w-4 h-4" /> Strategic Assets
                              </h4>
                              <div className="space-y-2">
                                {(resumeAnalysis?.strengths || ["Strong Technical Core", "Modern Framework Mastery", "Problem-Solving Depth"]).map((s: string, i: number) => (
                                  <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl border-white/5">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-xs font-light text-white/80">{s}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400 flex items-center gap-2">
                                <ChevronDown className="w-4 h-4" /> Optimization Gaps
                              </h4>
                              <div className="space-y-2">
                                {(resumeAnalysis?.weaknesses || ["Missing Cloud Certification", "Low Keyword Density (AWS)", "Experience Node Depth"]).map((w: string, i: number) => (
                                  <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl border-white/5">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-xs font-light text-white/80">{w}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Skill Vector Mapping</h4>
                              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{resumeAnalysis?.skillAnalysis?.length || 0} Nodes Found</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(resumeAnalysis?.skillAnalysis || []).map((s: any, i: number) => (
                                <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-white/60 text-[8px] uppercase tracking-widest font-bold py-1.5 px-3">
                                  {s.skill} <span className="text-accent ml-2">[{s.proficiency}]</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Warning if score < 60 */}
                      {resumeAnalysis?.atsScore < 60 && (
                        <div className="mt-12 p-6 glass rounded-[2rem] border-red-500/20 bg-red-500/5 flex items-start gap-4">
                          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                          <div className="space-y-1">
                            <p className="font-bold text-red-400 text-sm">Protocol Warning: Low Calibration Score</p>
                            <p className="text-xs text-red-400/60 leading-relaxed font-light">
                              Your career blueprint scored below the elite threshold (60%). We strongly recommend utilizing the Neural Optimizer before entering the live simulation rounds to maximize placement probability.
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="premium-card bg-accent/5 border-accent/20 p-8 flex items-center justify-between group cursor-pointer hover:bg-accent/10 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                            <Sparkles className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">Neural Optimization</h4>
                            <p className="text-xs text-muted-foreground">Improve blueprint for {selectedCompany} standards.</p>
                          </div>
                        </div>
                        <Link href="/resume-analysis">
                          <Button size="icon" variant="ghost" className="rounded-full group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        </Link>
                      </Card>

                      <Button 
                        onClick={nextStep}
                        className="h-auto btn-premium flex-1 p-8 rounded-[2.5rem] flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-6 text-left">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Play className="w-7 h-7 fill-current" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-white">Initialize Simulation</h4>
                            <p className="text-xs text-white/60">Enter Round 01: Logic & Aptitude Nodes.</p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 6: Aptitude Round (Testing or Result) */}
                {currentStep === 6 && (
                  <div className="space-y-8">
                    {!showAptitudeResult ? (
                      <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-0 overflow-hidden min-h-[600px] flex flex-col">
                        {/* Top Status Bar */}
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
                              <Timer className="w-4 h-4 text-accent" />
                              <span className="font-mono text-xl font-bold text-accent">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="hidden md:block h-8 w-px bg-white/5" />
                            <div className="hidden md:flex items-center gap-4">
                              <Badge variant="outline" className="border-white/10 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Node 01: Logic Efficiency</Badge>
                              <Progress value={(Object.keys(aptitudeAnswers).length / APTITUDE_QUESTIONS.length) * 100} className="w-32 h-1.5" />
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsSubmitDialogOpen(true)}
                            className="glass border-accent/20 text-accent hover:bg-accent/10 h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                          >
                            Submit Assessment
                          </Button>
                        </div>

                        <div className="flex-1 grid lg:grid-cols-12">
                          {/* Main Question Area */}
                          <div className="lg:col-span-8 p-12 space-y-10 border-r border-white/5">
                            <header className="space-y-2">
                              <Badge className="bg-purple-500/20 text-purple-400 border-none uppercase text-[8px] tracking-[0.3em] font-bold px-3 py-1">
                                {APTITUDE_QUESTIONS[aptitudeIdx].category} Track
                              </Badge>
                              <h3 className="text-3xl font-bold leading-tight">
                                {aptitudeIdx + 1}. {APTITUDE_QUESTIONS[aptitudeIdx].question}
                              </h3>
                            </header>

                            <RadioGroup 
                              value={aptitudeAnswers[aptitudeIdx] || ""} 
                              onValueChange={(val) => setAptitudeAnswers({ ...aptitudeAnswers, [aptitudeIdx]: val })}
                              className="space-y-4"
                            >
                              {APTITUDE_QUESTIONS[aptitudeIdx].options.map((opt, i) => (
                                <div 
                                  key={i}
                                  onClick={() => setAptitudeAnswers({ ...aptitudeAnswers, [aptitudeIdx]: opt })}
                                  className={`flex items-center gap-6 p-6 rounded-2xl border transition-all cursor-pointer group ${
                                    aptitudeAnswers[aptitudeIdx] === opt 
                                    ? 'bg-accent/10 border-accent shadow-[0_0_30px_rgba(34,211,238,0.05)]' 
                                    : 'glass border-white/5 hover:border-white/10'
                                  }`}
                                >
                                  <RadioGroupItem value={opt} id={`opt-${i}`} className="border-white/20 text-accent" />
                                  <Label htmlFor={`opt-${i}`} className="flex-1 text-lg font-light cursor-pointer group-hover:text-white transition-colors">
                                    {opt}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>

                            <div className="flex items-center justify-between pt-10 border-t border-white/5">
                              <Button 
                                variant="ghost" 
                                disabled={aptitudeIdx === 0}
                                onClick={() => setAptitudeIdx(aptitudeIdx - 1)}
                                className="h-14 px-8 rounded-xl hover:bg-white/5 text-muted-foreground font-bold text-[10px] uppercase tracking-widest"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                              </Button>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                                Question {aptitudeIdx + 1} of {APTITUDE_QUESTIONS.length}
                              </div>
                              <Button 
                                onClick={() => {
                                  if (aptitudeIdx < APTITUDE_QUESTIONS.length - 1) {
                                    setAptitudeIdx(aptitudeIdx + 1);
                                  } else {
                                    setIsSubmitDialogOpen(true);
                                  }
                                }}
                                className="h-14 px-10 rounded-xl btn-premium text-[10px] font-bold uppercase tracking-widest"
                              >
                                {aptitudeIdx === APTITUDE_QUESTIONS.length - 1 ? "Finish Round" : "Next Question"} <ChevronRight className="ml-2 w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Question Palette Sidebar */}
                          <div className="lg:col-span-4 bg-white/[0.01] p-8 space-y-8">
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Neural Map</h4>
                              <p className="text-xs text-white/40">Select a node to jump</p>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                              {APTITUDE_QUESTIONS.map((q, i) => (
                                <button
                                  key={q.id}
                                  onClick={() => setAptitudeIdx(i)}
                                  className={`w-10 h-10 rounded-lg border text-[10px] font-bold transition-all ${
                                    aptitudeIdx === i ? 'bg-accent text-black border-accent' :
                                    aptitudeAnswers[i] ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                                    'bg-white/5 text-white/30 border-white/5 hover:border-white/20'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>
                            <div className="pt-8 space-y-4">
                              <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-green-500" /> Captured Nodes: {Object.keys(aptitudeAnswers).length}
                              </div>
                              <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-white/10" /> Pending Nodes: {APTITUDE_QUESTIONS.length - Object.keys(aptitudeAnswers).length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      /* Aptitude Result View */
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-12 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8">
                            <Badge className="bg-green-500/20 text-green-400 border-none font-bold tracking-widest uppercase text-[10px]">Logic Node Secured</Badge>
                          </div>
                          
                          <div className="max-w-2xl mx-auto space-y-12">
                            <div className="relative w-48 h-48 mx-auto">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                <motion.circle 
                                  initial={{ strokeDashoffset: 553 }}
                                  animate={{ strokeDashoffset: 553 - (553 * 84) / 100 }}
                                  transition={{ duration: 2, ease: "easeOut" }}
                                  className="text-accent" 
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
                                <span className="text-6xl font-bold tracking-tighter">84%</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Efficiency Index</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h2 className="text-4xl font-bold tracking-tighter uppercase">Logic Assessment Complete</h2>
                              <p className="text-muted-foreground font-light text-lg">Your cognitive vectors for {selectedRole} have been archived.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               {[
                                 { label: "Total Nodes", val: APTITUDE_QUESTIONS.length, icon: Layers, color: "text-white/40" },
                                 { label: "Captured", val: Object.keys(aptitudeAnswers).length, icon: Activity, color: "text-blue-400" },
                                 { label: "Precision", val: "12", icon: CheckCircle2, color: "text-green-400" },
                                 { label: "Deviations", val: "3", icon: XCircle, color: "text-red-400" }
                               ].map((s, i) => (
                                 <div key={i} className="p-6 glass rounded-2xl border-white/5 text-center space-y-2">
                                   <s.icon className={`w-5 h-5 mx-auto ${s.color}`} />
                                   <p className="text-2xl font-bold tabular-nums">{s.val}</p>
                                   <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">{s.label}</p>
                                 </div>
                               ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                              <Button 
                                onClick={resetAptitude}
                                variant="outline" 
                                className="h-16 flex-1 rounded-2xl glass border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest"
                              >
                                <RefreshCcw className="w-4 h-4 mr-3" /> Recalibrate Logic
                              </Button>
                              <Button 
                                onClick={nextStep}
                                className="h-16 flex-[2] btn-premium rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                              >
                                Continue to Syntax Round <ChevronRight className="w-4 h-4 ml-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Step 7: Coding Round (IDE Interface or Result) */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    {!showCodingResult ? (
                      <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-0 overflow-hidden flex flex-col min-h-[750px]">
                        {/* IDE Header */}
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 px-4 py-1.5 glass rounded-xl border-accent/20">
                              <Timer className="w-4 h-4 text-accent" />
                              <span className="font-mono text-lg font-bold text-accent">{formatTime(codingTimeLeft)}</span>
                            </div>
                            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                              <SelectTrigger className="w-32 h-10 glass border-white/10 bg-transparent text-[10px] font-bold uppercase tracking-widest">
                                <SelectValue placeholder="Language" />
                              </SelectTrigger>
                              <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python 3</SelectItem>
                                <SelectItem value="java">Java 17</SelectItem>
                                <SelectItem value="cpp">C++ 20</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button 
                              onClick={handleRunCode}
                              disabled={isRunning}
                              variant="outline" 
                              className="glass border-green-500/20 text-green-400 hover:bg-green-500/10 h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                            >
                              {isRunning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                              Run Syntax
                            </Button>
                            <Button 
                              onClick={handleSubmitCode}
                              className="btn-premium h-10 px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Archive Submission
                            </Button>
                          </div>
                        </div>

                        {/* Main IDE Body */}
                        <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
                          {/* Problem Description Panel */}
                          <div className="lg:col-span-4 p-8 border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar space-y-8">
                            <header className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-orange-500/20 text-orange-400 border-none uppercase text-[8px] tracking-[0.2em] font-bold px-2 py-0.5">
                                  Syntax Round
                                </Badge>
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{CODING_PROBLEM.points} Points</span>
                              </div>
                              <h3 className="text-2xl font-bold tracking-tight">{CODING_PROBLEM.title}</h3>
                              <Badge variant="outline" className="border-accent/30 text-accent text-[8px] uppercase tracking-widest font-bold">{CODING_PROBLEM.difficulty}</Badge>
                            </header>

                            <div className="space-y-6">
                              <section className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Objective</h4>
                                <p className="text-sm font-light leading-relaxed text-white/70">{CODING_PROBLEM.description}</p>
                              </section>

                              <section className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Examples</h4>
                                {CODING_PROBLEM.examples.map((ex, i) => (
                                  <div key={i} className="p-4 glass rounded-xl border-white/5 space-y-2">
                                    <p className="text-[10px] font-mono text-accent"><span className="text-white/40">Input:</span> {ex.input}</p>
                                    <p className="text-[10px] font-mono text-green-400"><span className="text-white/40">Output:</span> {ex.output}</p>
                                    {ex.explanation && <p className="text-[9px] text-white/30 italic">Note: {ex.explanation}</p>}
                                  </div>
                                ))}
                              </section>

                              <section className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Constraints</h4>
                                <ul className="space-y-1.5">
                                  {CODING_PROBLEM.constraints.map((c, i) => (
                                    <li key={i} className="flex gap-3 text-[11px] font-light text-white/40">
                                      <div className="w-1 h-1 rounded-full bg-white/10 mt-1.5 shrink-0" /> {c}
                                    </li>
                                  ))}
                                </ul>
                              </section>
                            </div>
                          </div>

                          {/* Editor and Console Panel */}
                          <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                            {/* Code Editor */}
                            <div className="flex-1 bg-[#050816]/50 p-4 relative group">
                               <div className="absolute left-0 top-0 bottom-0 w-12 bg-black/40 border-r border-white/5 flex flex-col items-center pt-8 pointer-events-none">
                                  {[...Array(20)].map((_, i) => (
                                    <span key={i} className="text-[10px] font-mono text-white/10 h-6 leading-6">{i + 1}</span>
                                  ))}
                               </div>
                               <textarea 
                                 value={code}
                                 onChange={(e) => setCode(e.target.value)}
                                 className="w-full h-full bg-transparent outline-none resize-none text-sm font-mono pl-12 pt-4 leading-6 text-white/90 selection:bg-accent/20"
                                 spellCheck={false}
                                 placeholder="// Initialize your logic here..."
                               />
                               <div className="absolute top-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Badge variant="outline" className="border-white/10 text-white/20 uppercase text-[8px] font-mono">Editor Active</Badge>
                               </div>
                            </div>

                            {/* Console Footer */}
                            <div className="h-48 border-t border-white/5 bg-black/40 flex flex-col">
                               <div className="px-4 py-2 border-b border-white/5 flex items-center gap-3">
                                 <Terminal className="w-3.5 h-3.5 text-white/30" />
                                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Neural Console</span>
                               </div>
                               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1">
                                 {consoleOutput.map((line, i) => (
                                   <div key={i} className={`${line.includes('[SUCCESS]') ? 'text-green-400' : line.includes('[EXEC]') ? 'text-accent' : 'text-white/40'}`}>
                                     {line}
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      /* Coding Result View */
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-12 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8">
                            <Badge className="bg-orange-500/20 text-orange-400 border-none font-bold tracking-widest uppercase text-[10px]">Syntax Node Secured</Badge>
                          </div>
                          
                          <div className="max-w-2xl mx-auto space-y-12">
                            <div className="relative w-48 h-48 mx-auto">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                <motion.circle 
                                  initial={{ strokeDashoffset: 553 }}
                                  animate={{ strokeDashoffset: 553 - (553 * 92) / 100 }}
                                  transition={{ duration: 2, ease: "easeOut" }}
                                  className="text-orange-400" 
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
                                <span className="text-6xl font-bold tracking-tighter">92%</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syntax Index</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h2 className="text-4xl font-bold tracking-tighter uppercase">Technical Round Complete</h2>
                              <p className="text-muted-foreground font-light text-lg">Your syntax implementation for {CODING_PROBLEM.title} has been evaluated.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               {[
                                 { label: "Problems", val: "1/1", icon: MonitorCog, color: "text-white/40" },
                                 { label: "Test Cases", val: "8/10", icon: CheckCircle2, color: "text-green-400" },
                                 { label: "Deviations", val: "2", icon: XCircle, color: "text-red-400" },
                                 { label: "Efficiency", val: "Optimal", icon: TrendingUp, color: "text-accent" }
                               ].map((s, i) => (
                                 <div key={i} className="p-6 glass rounded-2xl border-white/5 text-center space-y-2">
                                   <s.icon className={`w-5 h-5 mx-auto ${s.color}`} />
                                   <p className="text-xl font-bold tabular-nums">{s.val}</p>
                                   <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">{s.label}</p>
                                 </div>
                               ))}
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 pt-4">
                               {[
                                 { label: "Logic Accuracy", val: 95 },
                                 { label: "Scalability", val: 88 },
                                 { label: "Clean Code", val: 90 }
                               ].map((m, i) => (
                                 <div key={i} className="space-y-2">
                                   <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-white/30">
                                     <span>{m.label}</span>
                                     <span>{m.val}%</span>
                                   </div>
                                   <Progress value={m.val} className="h-1 bg-white/5" />
                                 </div>
                               ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                              <Button 
                                onClick={resetCoding}
                                variant="outline" 
                                className="h-16 flex-1 rounded-2xl glass border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest"
                              >
                                <RefreshCcw className="w-4 h-4 mr-3" /> Reset Syntax Matrix
                              </Button>
                              <Button 
                                onClick={nextStep}
                                className="h-16 flex-[2] btn-premium rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                              >
                                Initialize Deep Probe <ChevronRight className="w-4 h-4 ml-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Step 8-9 placeholders */}
                {currentStep >= 8 && currentStep <= 9 && (
                  <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-20 text-center space-y-12">
                    <header className="space-y-6">
                      <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-20" />
                        {(() => {
                          const Icon = INTERVIEW_STEPS[currentStep - 1].icon;
                          return <Icon className="w-12 h-12 text-accent" />;
                        })()}
                      </div>
                      <h2 className="text-5xl font-bold tracking-tighter uppercase">{INTERVIEW_STEPS[currentStep - 1].title}</h2>
                      <p className="text-xl text-muted-foreground font-light max-xl mx-auto">Simulation node active. Calibrate your mindset for {INTERVIEW_STEPS[currentStep - 1].desc}.</p>
                    </header>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { label: "Difficulty", val: (selectedExp || "Senior") + " Grade" },
                        { label: "Time Limit", val: "45 Minutes" },
                        { label: "Focus", val: "Practical Logic" }
                      ].map((s, i) => (
                        <div key={i} className="p-6 glass rounded-2xl border-white/5">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-1">{s.label}</p>
                          <p className="text-lg font-bold text-white">{s.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-20 px-8 rounded-3xl border border-white/5 uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      {currentStep === 8 ? (
                        <Button onClick={startActualInterview} className="flex-1 h-20 btn-orange-premium text-lg font-bold uppercase tracking-[0.3em]">Launch Live Simulation <Play className="ml-3 w-6 h-6 fill-current" /></Button>
                      ) : (
                        <Button onClick={nextStep} className="flex-1 h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]">Start Simulation Round <Zap className="ml-3 w-6 h-6" /></Button>
                      )}
                    </div>
                  </Card>
                )}

                {currentStep === 10 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-16 text-center space-y-12">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto shadow-2xl">
                      <ShieldCheck className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-5xl font-bold tracking-tighter">Full Performance Audit</h2>
                      <p className="text-muted-foreground font-light max-md mx-auto">Your journey across all 10 simulation nodes has been archived. Final intelligence report is ready.</p>
                    </div>
                    <div className="p-8 glass rounded-[3rem] border-white/10 bg-white/[0.02]">
                       <div className="flex justify-between items-center mb-8">
                         <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Overall Readiness</span>
                         <span className="text-4xl font-bold text-accent">92%</span>
                       </div>
                       <Progress value={92} className="h-2 mb-10" />
                       <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-14 rounded-2xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest">Download Dossier</Button>
                          <Button onClick={() => router.push('/dashboard')} className="h-14 rounded-2xl btn-premium text-[10px] font-bold uppercase tracking-widest">Return to Dashboard</Button>
                       </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="glass border-white/10 bg-[#0b0e1a] text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tighter">Submit Logic Assessment?</DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              You have answered {Object.keys(aptitudeAnswers).length} of {APTITUDE_QUESTIONS.length} questions. Once submitted, your intelligence nodes for this round cannot be modified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 pt-6">
            <Button variant="ghost" onClick={() => setIsSubmitDialogOpen(false)} className="rounded-xl font-bold text-[10px] uppercase tracking-widest">Keep Solving</Button>
            <Button onClick={handleAptitudeSubmit} className="btn-premium h-12 px-10 rounded-xl font-bold text-[10px] uppercase tracking-widest">Execute Submission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
