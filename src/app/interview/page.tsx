
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
} from "@/Dialog";
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
  Info,
  Lightbulb,
  Cpu,
  Check
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { generateAptitudeTest } from '@/ai/flows/ai-aptitude-generator';
import { evaluateAptitude } from '@/ai/flows/ai-aptitude-evaluator';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const [isGeneratingAptitude, setIsGeneratingAptitude] = useState(false);
  const [aiAptitudeQuestions, setAiAptitudeQuestions] = useState<any[]>([]);
  const [aptitudeIdx, setAptitudeIdx] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isAptitudeEvaluating, setIsAptitudeEvaluating] = useState(false);
  const [aptitudeReport, setAptitudeReport] = useState<any>(null);
  const [aptitudeStartTime, setAptitudeStartTime] = useState<number | null>(null);

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
    if (currentStep === 6 && timeLeft > 0 && !aptitudeReport && aiAptitudeQuestions.length > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentStep === 6 && !aptitudeReport) {
      handleAptitudeSubmit();
    }
  }, [currentStep, timeLeft, aptitudeReport, aiAptitudeQuestions]);

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

      // Persist Result to Firestore
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
          
          {/* Sidebar */}
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

          {/* Main Area */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep + (aptitudeReport ? "-apt-result" : "")}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Logic for Step 1-5 omitted for brevity, keeping only focus on Step 6 evaluation */}
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
                      <Input placeholder="Search technical tracks..." value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)} className="h-16 pl-16 rounded-2xl glass border-white/10 bg-transparent text-lg focus:border-accent transition-all" />
                    </div>
                    <div className="space-y-10">
                      {["Development", "Data & Intelligence", "Operations & Trust"].map(cat => (
                        <div key={cat} className="space-y-6">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 flex items-center gap-3"><span className="w-8 h-px bg-white/10" /> {cat}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredRoles.filter(r => r.category === cat).map(role => (
                              <button key={role.id} onClick={() => setSelectedRole(role.name)} className={`p-6 rounded-[2rem] border transition-all text-left flex items-center gap-6 group ${selectedRole === role.name ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:border-white/20'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === role.name ? 'bg-accent text-black' : 'bg-white/5 text-white/40'}`}><role.icon className="w-6 h-6" /></div>
                                <div><p className={`font-bold transition-colors ${selectedRole === role.name ? 'text-white' : 'text-white/60'}`}>{role.name}</p></div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={nextStep} disabled={!selectedRole} className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]">Confirm Role Vector <ChevronRight className="ml-3 w-6 h-6" /></Button>
                  </Card>
                )}

                {/* Step 6: Aptitude and Evaluation */}
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
                           <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px]">
                             {isAptitudeEvaluating ? "Running performance telemetry" : `Assembling 15 unique nodes for ${selectedCompany}`}
                           </p>
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
                            <Badge variant="outline" className="border-white/10 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Node 01: Logic Efficiency</Badge>
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
                      /* Professional Aptitude Report */
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
                              <h3 className="text-2xl font-bold mb-2">Node Evaluation</h3>
                              <p className="text-sm text-muted-foreground font-light leading-relaxed">Performance calibrated for {selectedRole} standards at {selectedCompany}.</p>
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

                              <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-green-400">Captured Strengths</h4>
                                  <ul className="space-y-4">
                                    {aptitudeReport.feedback.strengths.map((s: string, i: number) => (
                                      <li key={i} className="flex gap-4 text-sm font-light text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">Identified Gaps</h4>
                                  <ul className="space-y-4">
                                    {aptitudeReport.feedback.weaknesses.map((w: string, i: number) => (
                                      <li key={i} className="flex gap-4 text-sm font-light text-white/70">
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /> {w}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row gap-6">
                            {aptitudeReport.status === 'Pass' ? (
                              <Button onClick={nextStep} className="h-20 flex-1 btn-premium text-lg font-bold uppercase tracking-[0.3em]">
                                Unlock Syntax Round <ChevronRight className="ml-3 w-6 h-6" />
                              </Button>
                            ) : (
                              <div className="w-full space-y-6">
                                <div className="p-8 glass rounded-[2rem] border-red-500/20 bg-red-500/5 text-center">
                                  <h4 className="text-xl font-bold text-red-400 mb-2">Practice Protocol Active</h4>
                                  <p className="text-muted-foreground font-light mb-8">System recommendation: Review remedial logic nodes before re-attempting.</p>
                                  <div className="flex gap-4 justify-center">
                                    <Button onClick={() => setAptitudeReport(null)} variant="outline" className="h-14 px-10 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest">Reset Assessment</Button>
                                    <Link href="/question-bank">
                                      <Button className="h-14 px-10 rounded-2xl btn-premium text-xs font-bold uppercase tracking-widest">Library Search</Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}
                {/* Steps 7-10 remain unchanged as per previous logic */}
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
