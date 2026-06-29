"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  GraduationCap, 
  Play, 
  Layers,
  Code2,
  Users,
  HandMetal,
  Upload,
  FileSearch,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Search,
  Check,
  Loader2,
  X
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer",
  "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst", "UI/UX Designer",
  ".NET Developer", "Python Developer", "Java Developer"
];

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"];

const ROUNDS = [
  { id: 'Technical Round', label: 'Technical Round', icon: Code2 },
  { id: 'HR Round', label: 'HR Round', icon: Users },
  { id: 'Managerial Round', label: 'Managerial Round', icon: HandMetal }
];

export default function InterviewSetup() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_LEVELS[2]);
  const [selectedRound, setSelectedRound] = useState(ROUNDS[0].id);

  // Check for existing resume
  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'resumes'), orderBy('createdAt', 'desc'), limit(1));
  }, [db, user?.uid]);
  const { data: resumes, loading: resumeCheckLoading } = useCollection(resumeQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 5MB" });
        return;
      }
      setFile(selected);
    }
  };

  const handleResumeStep = async () => {
    if (!file || !user || !db) return;
    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await analyzeResume({ resumeDataUri: base64, targetRole: selectedRole });
      console.log("STEP 1: analyzeResume success");
      console.log(result);
      console.log("Resume Result:", result);
      // Store in localStorage for fast session synchronization
      if (typeof window !== 'undefined') {
        localStorage.setItem("resumeAnalysis", JSON.stringify(result));
      }

      // Save to Firestore
      const resumesRef = collection(db, 'users', user.uid, 'resumes');
      console.log("STEP 2: Before addDoc");
      await addDoc(resumesRef, {
        userId: user.uid,
        filename: file.name,
        targetRole: selectedRole,
        atsScore: result.atsScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

      console.log("STEP 3: After addDoc");

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeScore: result.atsScore
      });
      console.log("STEP 4: After updateDoc");

      setStep(2);
      toast({ title: "Blueprint Verified", description: "Your career intelligence has been synchronized." });
    } catch (e) {
      console.error("HANDLE RESUME ERROR:", e);
    
      toast({
        variant: "destructive",
        title: "Audit Failed",
        description: e instanceof Error ? e.message : String(e),
      });
    }finally {
      setIsAnalyzing(false);
    }
  };

  const startInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&exp=${selectedExp}&round=${encodeURIComponent(selectedRound)}`);
  };

  if (resumeCheckLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          
          <header className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Calibration v4.0</Badge>
            <h1 className="text-5xl font-bold tracking-tighter text-premium">Arena <span className="text-gradient-purple">Onboarding.</span></h1>
            <div className="flex items-center justify-center gap-4 mt-6">
              {[1, 2].map(i => (
                <div key={i} className={`h-1.5 w-24 rounded-full transition-all duration-500 ${step >= i ? 'bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`} />
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="step1">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-12 text-center space-y-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                    <ShieldCheck className="w-12 h-12 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Resume Intelligence Required</h2>
                    <p className="text-muted-foreground font-light max-w-sm mx-auto">The engine requires your latest career blueprint to architect a resume-aware simulation.</p>
                  </div>

                  {resumes && resumes.length > 0 ? (
                    <div className="p-6 glass rounded-2xl border-accent/20 bg-accent/5 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent"><CheckCircle2 className="w-6 h-6" /></div>
                        <div>
                          <p className="font-bold text-sm">Verified Blueprint Detected</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">ATS Score: {resumes[0].atsScore}% • Last Used: {new Date(resumes[0].createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button onClick={() => setStep(2)} className="h-10 px-6 rounded-xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Use Existing</Button>
                    </div>
                  ) : null}

                  <div 
                    onClick={() => !isAnalyzing && document.getElementById('resume-upload-calibration')?.click()}
                    className={`border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer group ${file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'} ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input 
                      type="file" 
                      id="resume-upload-calibration" 
                      className="hidden" 
                      accept=".pdf,.docx"
                      onChange={handleFileChange} 
                    />
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Extracting Knowledge Nodes...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-10 h-10 text-muted-foreground group-hover:text-accent mx-auto transition-colors" />
                        <p className="font-bold text-lg">{file ? file.name : "Select New Career Blueprint"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF or DOCX • 5MB Limit</p>
                      </div>
                    )}
                  </div>

                  {file && !isAnalyzing && (
                    <Button onClick={handleResumeStep} className="w-full h-18 btn-premium text-xs font-bold uppercase tracking-[0.3em]">
                      Initialize Neural Handshake <Zap className="ml-3 w-4 h-4 fill-current" />
                    </Button>
                  )}
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="step2" className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                    <CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-bold flex items-center gap-3"><Briefcase className="w-6 h-6 text-accent" /> Deployment Track</CardTitle></CardHeader>
                    <div className="grid grid-cols-2 gap-4">
                      {ROLES.map(r => (
                        <button key={r} onClick={() => setSelectedRole(r)} className={`text-left p-5 rounded-2xl border transition-all text-xs font-bold ${selectedRole === r ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 hover:bg-white/5 text-muted-foreground'}`}>{r}</button>
                      ))}
                    </div>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                      <CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-bold flex items-center gap-3"><GraduationCap className="w-6 h-6 text-accent" /> Seniority</CardTitle></CardHeader>
                      <div className="flex flex-col gap-4">
                        {EXPERIENCE_LEVELS.map(l => (
                          <button key={l} onClick={() => setSelectedExp(l)} className={`py-5 rounded-2xl border transition-all font-bold uppercase text-[10px] tracking-widest ${selectedExp === l ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 text-muted-foreground'}`}>{l} Grade</button>
                        ))}
                      </div>
                    </Card>
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                      <CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-bold flex items-center gap-3"><Layers className="w-6 h-6 text-accent" /> Logic Round</CardTitle></CardHeader>
                      <div className="flex flex-col gap-4">
                        {ROUNDS.map(r => (
                          <button key={r.id} onClick={() => setSelectedRound(r.id)} className={`py-5 px-6 rounded-2xl border transition-all font-bold flex items-center gap-4 text-xs ${selectedRound === r.id ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 text-muted-foreground'}`}><r.icon className="w-5 h-5" /> {r.label}</button>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <Card className="premium-card bg-accent/5 border-accent/10 sticky top-32">
                    <CardHeader><CardTitle className="text-xl font-bold">Mission Config</CardTitle></CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        {[
                          { icon: ShieldCheck, label: "Status", val: "RESUME-AWARE", color: "text-accent" },
                          { icon: Zap, label: "Adaptivity", val: "ACTIVE" },
                          { icon: Play, label: "Question Pool", val: "10 Nodes" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                            <div className="flex items-center gap-3"><item.icon className={`w-4 h-4 ${item.color || 'text-white/20'}`} /><span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{item.label}</span></div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-accent">{item.val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-8 border-t border-white/10 space-y-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Active Protocol</p>
                          <p className="text-lg font-bold text-white leading-tight">{selectedRole}</p>
                          <p className="text-[10px] text-accent uppercase font-bold mt-1">{selectedExp} • {selectedRound}</p>
                        </div>
                        <Button onClick={startInterview} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs">Enter Neural Arena</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}