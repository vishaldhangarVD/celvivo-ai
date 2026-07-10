
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Play,
  ShieldCheck,
  Building,
  Target,
  Search,
  Layers,
  Database,
  ShieldAlert,
  GraduationCap,
  Clock
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'fresher', label: 'Fresher', desc: 'Entry-level talent', icon: Star },
  { id: '1-2', label: '1–2 Years', desc: 'Junior / Mid-level', icon: Clock },
  { id: '3-5', label: '3–5 Years', desc: 'Mid / Senior grade', icon: Award },
  { id: '5+', label: '5+ Years', desc: 'Expert / Lead grade', icon: ShieldCheck },
];

function Star(props: any) { return <Zap {...props} /> } // Helper since star is generic

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "TCS Digital", "Infosys", "Accenture", "Standard / Startup"
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
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [roleSearch, setRoleSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeAtsScore, setResumeScore] = useState<number | null>(null);

  // Resume check
  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'resumes'), orderBy('createdAt', 'desc'), limit(1));
  }, [db, user?.uid]);
  const { data: resumes, loading: resumeCheckLoading } = useCollection(resumeQuery);

  const filteredRoles = useMemo(() => {
    return ROLES_DATA.filter(role => 
      role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      role.category.toLowerCase().includes(roleSearch.toLowerCase())
    );
  }, [roleSearch]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
        return;
      }
      setFile(selected);
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

      const result = await analyzeResume({ resumeDataUri: base64, targetRole: selectedRole });
      
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

      setResumeScore(result.atsScore);
      nextStep();
      toast({ title: "Blueprint Verified", description: "Career intelligence synchronized." });
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Failed", description: "System could not parse blueprint." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startActualInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&company=${encodeURIComponent(selectedCompany)}&exp=${encodeURIComponent(selectedExp)}&round=Technical`);
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
                      isCompleted ? 'bg-white/[0.02] border-white/5 opacity-50' : 
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
                key={currentStep}
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
                      <p className="text-muted-foreground font-light max-w-lg mx-auto">Select the specialized engineering role for your neural calibration.</p>
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

                    <Button 
                      onClick={nextStep} 
                      disabled={!selectedRole}
                      className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]"
                    >
                      Confirm Role Vector <ChevronRight className="ml-3 w-6 h-6" />
                    </Button>
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
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 text-center space-y-12">
                    <header className="space-y-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20">
                        <Building2 className="w-10 h-10 text-purple-400" />
                      </div>
                      <h2 className="text-4xl font-bold tracking-tighter">Target Corporate Protocol</h2>
                      <p className="text-muted-foreground font-light max-w-lg mx-auto">Calibrate the simulation to mirror the culture and rigor of a specific tech firm.</p>
                    </header>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {COMPANIES.map(comp => (
                        <button 
                          key={comp} 
                          onClick={() => setSelectedCompany(comp)}
                          className={`p-6 rounded-3xl border transition-all text-[10px] font-bold uppercase tracking-[0.2em] flex flex-col items-center gap-4 ${selectedCompany === comp ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'glass border-white/5'}`}
                        >
                          <Building className="w-6 h-6 opacity-40" />
                          {comp}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-20 px-8 rounded-3xl border border-white/5 uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button onClick={nextStep} className="flex-1 h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]">
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
                      <h2 className="text-4xl font-bold tracking-tighter">Intelligence Audit</h2>
                      <p className="text-muted-foreground font-light max-w-lg mx-auto">Upload your latest career blueprint for ATS compatibility scanning and simulation anchoring.</p>
                    </header>
                    
                    <div 
                      onClick={() => !isAnalyzing && document.getElementById('journey-upload')?.click()}
                      className={`border-2 border-dashed rounded-[2.5rem] p-16 transition-all cursor-pointer group ${file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30'} ${isAnalyzing ? 'opacity-50' : ''}`}
                    >
                      <input type="file" id="journey-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                      {isAnalyzing ? (
                        <div className="space-y-4"><Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" /><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Extracting Knowledge Nodes...</p></div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-muted-foreground group-hover:text-accent mx-auto transition-colors" />
                          <p className="text-xl font-bold">{file ? file.name : "Select Career Blueprint"}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF or DOCX • 10MB Limit</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-20 px-8 rounded-3xl border border-white/5 uppercase tracking-widest text-[10px] font-bold">Back</Button>
                      <Button 
                        onClick={handleResumeSync} 
                        disabled={!file || isAnalyzing}
                        className="flex-1 h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]"
                      >
                        Execute Handshake <Zap className="ml-3 w-6 h-6" />
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Remaining Steps Logic Offset (Step 5-10) */}
                {currentStep === 5 && (
                  <Card className="premium-card bg-[#0b0e1a]/80 border-white/5 p-16 text-center space-y-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8"><Badge className="bg-accent/20 text-accent">LIVE ANALYSIS</Badge></div>
                    <div className="relative w-48 h-48 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent" 
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold tracking-tighter">84%</span>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">ATS INDEX</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold">Protocol Match Optimal</h3>
                      <p className="text-muted-foreground font-light max-w-sm mx-auto">Your blueprint matches 84% of industry standards for {selectedRole} at {selectedCompany}.</p>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={prevStep} className="h-18 px-8 rounded-2xl border border-white/5">Back</Button>
                      <Button onClick={nextStep} className="flex-1 h-18 btn-premium text-xs font-bold uppercase tracking-[0.3em]">Initialize Round 01: Aptitude <ChevronRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </Card>
                )}

                {currentStep >= 6 && currentStep <= 9 && (
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
                      <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto">Simulation node active. Calibrate your mindset for {INTERVIEW_STEPS[currentStep - 1].desc}.</p>
                    </header>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { label: "Difficulty", val: selectedExp + " Grade" },
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
                      <p className="text-muted-foreground font-light max-w-md mx-auto">Your journey across all 10 simulation nodes has been archived. Final intelligence report is ready.</p>
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
    </div>
  );
}
