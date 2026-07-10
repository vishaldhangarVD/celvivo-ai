
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
  Timer,
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
  LayoutDashboard
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
  { id: 'fullstack', name: "Full Stack Developer", category: "Full Stack", icon: Layers },
  { id: 'java', name: "Java Developer", category: "Software Development", icon: Code2 },
  { id: 'python', name: "Python Developer", category: "Software Development", icon: Code2 },
  { id: 'react', name: "React Developer", category: "Frontend", icon: Monitor },
  { id: 'nodejs', name: "Node.js Developer", category: "Backend", icon: Database },
  { id: 'data-analyst', name: "Data Analyst", category: "Data", icon: TrendingUp },
  { id: 'devops', name: "DevOps Engineer", category: "Cloud & DevOps", icon: Cloud },
  { id: 'ai', name: "AI Engineer", category: "AI & ML", icon: Zap },
  { id: 'gen-ai', name: "Generative AI Engineer", category: "AI & ML", icon: Sparkles },
  { id: 'prompt', name: "Prompt Engineer", category: "AI & ML", icon: MessageSquare },
  { id: 'sys-admin', name: "System Administrator", category: "Infrastructure", icon: MonitorCog },
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
        }
      }
    }
    loadActiveSession();
  }, [user, db]);

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
      setAiAptitudeQuestions(result.questions);
      setAptitudeStartTime(Date.now());
      nextStep(6);
    } catch (e) {
      toast({ variant: "destructive", title: "Synthesis Error" });
    } finally {
      setIsGeneratingAptitude(false);
    }
  };

  const handleAptitudeSubmit = async () => {
    setIsAptitudeEvaluating(true);
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
                const isLocked = step.id > currentStep;
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
                      <Input placeholder="Search IT protocols..." value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)} className="h-16 pl-16 rounded-2xl glass border-white/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredRoles.map(role => (
                        <button key={role.id} onClick={() => { setSelectedRole(role.name); nextStep(); }} className={`p-6 rounded-2xl border transition-all text-left flex items-center gap-6 ${selectedRole === role.name ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:bg-white/5'}`}>
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent"><role.icon className="w-5 h-5" /></div>
                          <span className="font-bold text-sm">{role.name}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {currentStep === 2 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <h2 className="text-4xl font-bold tracking-tighter text-center">Seniority Grade</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {EXPERIENCE_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => { setSelectedExp(opt.label); nextStep(); }} className={`p-8 rounded-3xl border transition-all text-left group ${selectedExp === opt.label ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:bg-white/5'}`}>
                          <opt.icon className="w-8 h-8 text-accent mb-4" />
                          <p className="text-xl font-bold">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {currentStep === 3 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <h2 className="text-4xl font-bold tracking-tighter text-center">Target Company</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {COMPANIES.map(c => (
                        <button key={c} onClick={() => { setSelectedCompany(c); nextStep(); }} className={`p-6 rounded-2xl border transition-all text-center ${selectedCompany === c ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:bg-white/5'}`}>
                          <Building2 className="w-6 h-6 text-accent mx-auto mb-3" />
                          <p className="text-xs font-bold">{c}</p>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {currentStep === 4 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-8"><Upload className="w-10 h-10 text-accent" /></div>
                    <h2 className="text-4xl font-bold tracking-tighter">Career Blueprint</h2>
                    <div onClick={() => document.getElementById('resume-flow-upload')?.click()} className="border-2 border-dashed border-white/10 rounded-3xl p-20 cursor-pointer hover:border-accent/30 transition-all">
                      <input type="file" id="resume-flow-upload" className="hidden" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                      {file ? <div className="text-xl font-bold">{file.name}</div> : <span className="text-muted-foreground">Choose PDF Blueprint</span>}
                    </div>
                    <Button onClick={handleResumeSync} disabled={!file || isAnalyzing} className="w-full h-18 btn-premium uppercase tracking-widest text-xs">
                      {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : null} Execute Handshake
                    </Button>
                  </Card>
                )}

                {currentStep === 5 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold">Screening Report</h2>
                      <div className="text-5xl font-bold text-accent">{resumeAnalysis?.atsScore}%</div>
                    </div>
                    <div className="p-8 glass rounded-[2rem] bg-accent/5">
                      <p className="text-sm font-light leading-relaxed">{resumeAnalysis?.summary}</p>
                    </div>
                    <Button onClick={handleStartAptitude} className="w-full h-18 btn-premium uppercase tracking-widest text-xs">Initialize Aptitude Round</Button>
                  </Card>
                )}

                {currentStep === 6 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 text-center space-y-8">
                    {isGeneratingAptitude ? (
                      <div className="py-20 space-y-6">
                        <Cpu className="w-12 h-12 text-accent animate-pulse mx-auto" />
                        <p className="text-xl font-bold">Synthesizing Logic Matrix...</p>
                      </div>
                    ) : (
                      <div className="space-y-6 text-left">
                        <div className="flex justify-between items-center">
                           <Badge className="bg-accent/20 text-accent">{aiAptitudeQuestions[aptitudeIdx]?.category}</Badge>
                           <span className="text-sm font-bold">{aptitudeIdx + 1}/15</span>
                        </div>
                        <h3 className="text-2xl font-bold">{aiAptitudeQuestions[aptitudeIdx]?.question}</h3>
                        <div className="grid gap-4">
                          {aiAptitudeQuestions[aptitudeIdx]?.options.map((opt: any, i: number) => (
                            <button key={i} onClick={() => setAptitudeAnswers({...aptitudeAnswers, [aptitudeIdx]: opt})} className={`p-6 rounded-2xl border text-left transition-all ${aptitudeAnswers[aptitudeIdx] === opt ? 'bg-accent/20 border-accent' : 'glass border-white/5 hover:bg-white/5'}`}>{opt}</button>
                          ))}
                        </div>
                        <Button onClick={() => aptitudeIdx < 14 ? setAptitudeIdx(aptitudeIdx + 1) : handleAptitudeSubmit()} className="w-full h-16 btn-premium">{aptitudeIdx < 14 ? "Next Protocol" : "Submit Assessment"}</Button>
                      </div>
                    )}
                  </Card>
                )}

                {currentStep === 7 && (
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                    <h2 className="text-3xl font-bold">Aptitude Result: {aptitudeReport?.overallScore}%</h2>
                    <p className="p-6 glass rounded-2xl italic text-white/70">"{aptitudeReport?.recommendation}"</p>
                    <Button onClick={handleStartCoding} className="w-full h-18 btn-premium uppercase tracking-widest text-xs">Unlock Coding Round</Button>
                  </Card>
                )}

                {currentStep === 8 && (
                   <Card className="premium-card bg-white/[0.01] border-white/5 p-0 overflow-hidden min-h-[600px] flex flex-col">
                      {isGeneratingCoding ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                           <Terminal className="w-12 h-12 text-accent animate-pulse" />
                           <p className="text-xl font-bold">Architecting Syntax Matrix...</p>
                        </div>
                      ) : (
                        <div className="p-12 space-y-8">
                           <Badge className="bg-orange-500/20 text-orange-400">{codingProblem?.difficulty} NODE</Badge>
                           <h3 className="text-3xl font-bold">{codingProblem?.title}</h3>
                           <p className="text-sm text-muted-foreground">{codingProblem?.description}</p>
                           <textarea value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-64 glass border-white/10 bg-transparent p-6 font-mono text-sm resize-none rounded-2xl focus:outline-none focus:border-accent" />
                           <Button onClick={handleCodingSubmit} disabled={isCodingEvaluating} className="w-full h-16 btn-premium">
                             {isCodingEvaluating ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : null} Finalize Submission
                           </Button>
                        </div>
                      )}
                   </Card>
                )}

                {currentStep === 9 && (
                   <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                      <h2 className="text-3xl font-bold">Coding Efficiency: {codingReport?.score}%</h2>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-6 glass rounded-2xl">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Time Complexity</p>
                            <p className="text-xl font-bold text-accent">{codingReport?.timeComplexity}</p>
                         </div>
                         <div className="p-6 glass rounded-2xl">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Readability</p>
                            <p className="text-xl font-bold text-purple-400">{codingReport?.readabilityScore}%</p>
                         </div>
                      </div>
                      <Button onClick={startArena} className="w-full h-18 btn-premium uppercase tracking-widest text-xs">Enter Virtual Arena</Button>
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

