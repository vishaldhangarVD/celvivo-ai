
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Search, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  BrainCircuit, 
  Target, 
  Award, 
  FileText,
  ShieldCheck,
  ChevronRight,
  Cpu,
  BarChart3,
  Briefcase,
  History,
  Lightbulb,
  Check,
  XCircle,
  AlertTriangle,
  Sparkles,
  Command,
  ArrowRight,
  User,
  Clock
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { deepAuditResume, type ResumeDeepAuditOutput } from '@/ai/flows/ai-resume-deep-audit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const IT_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Java Developer", "Python Developer", "React Developer", "Angular Developer",
  "Node.js Developer", "AI Engineer", "Machine Learning Engineer", "Data Analyst",
  "Business Analyst", "Data Scientist", "DevOps Engineer", "Cloud Engineer",
  "AWS Engineer", "Azure Engineer", "Cyber Security Analyst", "QA Engineer",
  "Automation Tester", "Manual Tester", "UI UX Designer", "Product Manager",
  "Project Manager", "Android Developer", "iOS Developer", "Flutter Developer",
  "PHP Developer", ".NET Developer", "Salesforce Developer", "SAP Consultant",
  "Oracle DBA", "Database Administrator", "System Administrator", "Network Engineer",
  "Embedded Engineer", "Blockchain Developer", "Game Developer"
];

const LOADING_STEPS = [
  "Reading Resume",
  "Extracting Skills",
  "ATS Evaluation",
  "Comparing With Job Role",
  "Missing Skills Detection",
  "Building Final Report"
];

export default function ResumeIntelligencePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeDeepAuditOutput | null>(null);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  const filteredRoles = useMemo(() => 
    IT_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())),
  [roleSearch]);

  // Loading Sequence Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing && loadingStepIdx < LOADING_STEPS.length) {
      interval = setInterval(() => {
        setLoadingStepIdx(prev => prev + 1);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, loadingStepIdx]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
        return;
      }
      setFile(selected);
      toast({ title: "✔ Blueprint Detected", description: "Resume uploaded successfully." });
    }
  };

  const executeAnalysis = async () => {
    if (!file || !targetRole || !user || !db) {
      toast({ variant: "destructive", title: "Protocols Incomplete", description: "Upload blueprint and select target role." });
      return;
    }

    setIsAnalyzing(true);
    setLoadingStepIdx(0);
    setAnalysis(null);

    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await deepAuditResume({ resumeDataUri: base64, targetRole });

      // Artificial delay to show the beautiful loading steps
      await new Promise(r => setTimeout(r, 4500));

      setAnalysis(result);
      setIsAnalyzing(false);

      // Save to Firestore
      await addDoc(collection(db, 'users', user.uid, 'resumes'), {
        userId: user.uid,
        filename: file.name,
        targetRole,
        atsScore: result.atsAnalysis.overallScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Neural Fault", description: "Analysis synthesis failed." });
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBorder = (score: number) => {
    if (score >= 80) return "border-green-500/50";
    if (score >= 60) return "border-orange-500/50";
    return "border-red-500/50";
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="flex-1 container mx-auto px-6 pt-32 pb-6 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {!analysis && !isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col gap-8 max-w-6xl mx-auto w-full justify-center"
            >
              <div className="text-center space-y-4">
                <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Identity Protocol</Badge>
                <h1 className="text-6xl font-bold tracking-tighter text-premium">AI Resume <span className="text-gradient-purple">Intelligence.</span></h1>
                <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
                  Upload your resume and let Nexvoro AI perform a complete ATS analysis, skill evaluation and job matching.
                </p>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Upload */}
                <Card 
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="lg:col-span-4 glass rounded-[30px] border-white/5 p-8 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-accent/30 transition-all h-[240px] relative overflow-hidden bg-white/[0.01]"
                >
                  <input type="file" id="resume-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {!file ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">Upload Resume</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF / DOCX • MAX 10MB</p>
                    </>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                        <Check className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">✔ Upload Successful</p>
                        <p className="text-sm font-light text-white/70 truncate max-w-[200px]">{file.name}</p>
                      </div>
                      <Button variant="ghost" className="h-8 px-4 text-[9px] uppercase font-bold tracking-widest text-accent hover:bg-accent/10">Replace Resume</Button>
                    </div>
                  )}
                </Card>

                {/* Right Side: Role */}
                <Card className="lg:col-span-8 glass rounded-[30px] border-white/5 p-8 h-[240px] flex flex-col justify-between bg-white/[0.01]">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-3">
                      <Target className="w-5 h-5 text-accent" /> Target Job Role
                    </h3>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        type="text"
                        placeholder="Search global IT roles (e.g. Data Analyst)..."
                        value={targetRole || roleSearch}
                        onChange={(e) => { setRoleSearch(e.target.value); setTargetRole(""); }}
                        onFocus={() => setIsSearching(true)}
                        className={cn(
                          "w-full h-14 pl-12 pr-6 rounded-2xl glass border-white/10 bg-transparent text-white focus:outline-none focus:border-accent transition-all text-sm font-light",
                          targetRole && "border-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        )}
                      />
                      
                      <AnimatePresence>
                        {isSearching && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 p-2 glass border-white/10 rounded-2xl z-[100] max-h-[180px] overflow-y-auto custom-scrollbar shadow-2xl"
                          >
                            {filteredRoles.length > 0 ? (
                              filteredRoles.map(role => (
                                <button 
                                  key={role}
                                  onClick={() => { setTargetRole(role); setIsSearching(false); setRoleSearch(""); }}
                                  className="w-full text-left p-3 hover:bg-accent/10 hover:text-accent rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-between group"
                                >
                                  {role}
                                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                              ))
                            ) : (
                              <button 
                                onClick={() => { setTargetRole(roleSearch); setIsSearching(false); }}
                                className="w-full text-left p-3 hover:bg-accent/10 text-accent rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                              >
                                Use Custom Role: "{roleSearch}"
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {IT_ROLES.slice(0, 5).map(role => (
                      <Badge 
                        key={role} 
                        variant="outline" 
                        onClick={() => setTargetRole(role)}
                        className={cn(
                          "glass border-white/5 text-[9px] px-3 py-1 cursor-pointer transition-all hover:bg-white/5",
                          targetRole === role && "border-accent text-accent bg-accent/5"
                        )}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="flex justify-center pt-8">
                <Button 
                  onClick={executeAnalysis}
                  disabled={!file || !targetRole || isAnalyzing}
                  className="h-20 px-20 btn-premium rounded-[2rem] text-xl font-bold uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(34,211,238,0.2)] group"
                >
                  Analyze Resume <BrainCircuit className="ml-4 w-7 h-7 transition-transform group-hover:scale-110" />
                </Button>
              </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#050816]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12"
            >
              <div className="relative max-w-xl w-full text-center space-y-12">
                <div className="relative w-48 h-48 mx-auto">
                  <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin duration-[3s]" />
                  <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
                    <Cpu className="w-16 h-16 text-accent animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h2 className="text-4xl font-bold tracking-tighter text-premium">Nexvoro AI Intelligence Engine</h2>
                  <div className="grid gap-3">
                    {LOADING_STEPS.map((step, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center gap-4 transition-all duration-500 px-8 py-2 rounded-xl",
                        loadingStepIdx > idx ? "opacity-100 scale-100" : loadingStepIdx === idx ? "opacity-100 scale-105 bg-accent/5" : "opacity-20 scale-95"
                      )}>
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center border",
                          loadingStepIdx > idx ? "bg-green-500 border-green-500 text-black" : "border-white/20"
                        )}>
                          {loadingStepIdx > idx ? <Check className="w-3 h-3 font-black" /> : idx + 1}
                        </div>
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-widest",
                          loadingStepIdx > idx ? "text-green-400" : "text-white"
                        )}>{step}</span>
                        {loadingStepIdx === idx && <Loader2 className="w-3 h-3 animate-spin ml-auto text-accent" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : analysis ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 grid lg:grid-cols-12 gap-6 overflow-hidden max-h-screen"
            >
              {/* Dashboard Grid - Optimized for no scroll */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                
                {/* 1. ATS Score & Match (Merged for height) */}
                <Card className="glass rounded-[30px] border-white/5 p-8 flex flex-col items-center justify-center bg-white/[0.01] h-[220px]">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <motion.circle 
                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray="364.4"
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * analysis.atsAnalysis.overallScore) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className={getScoreColor(analysis.atsAnalysis.overallScore)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn("text-3xl font-black tabular-nums", getScoreColor(analysis.atsAnalysis.overallScore))}>
                        {analysis.atsAnalysis.overallScore}%
                      </span>
                      <span className="text-[7px] font-bold uppercase tracking-widest text-white/30">ATS Score</span>
                    </div>
                  </div>
                </Card>

                <Card className="glass rounded-[30px] border-white/5 p-8 flex flex-col items-center justify-center bg-white/[0.01] h-[220px]">
                  <div className="text-center space-y-2">
                    <Target className="w-10 h-10 text-accent mx-auto mb-2" />
                    <h3 className="text-4xl font-black text-white tabular-nums">{analysis.roleMatch.matchPercentage}%</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Resume Compatibility</p>
                    <Badge variant="outline" className="border-accent/20 text-white/50 text-[8px] uppercase tracking-tighter">{targetRole}</Badge>
                  </div>
                </Card>

                {/* 3. Strengths */}
                <Card className="glass rounded-[30px] border-white/5 p-6 bg-white/[0.01] space-y-4 h-[220px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Core Strengths
                  </h3>
                  <div className="grid gap-2">
                    {analysis.skillAudit.strong.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl border-white/5 text-[10px] font-bold text-white/70 uppercase">
                        <div className="w-1 h-1 rounded-full bg-green-500" /> {s}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 4. Missing Skills */}
                <Card className="glass rounded-[30px] border-red-500/10 p-6 bg-red-500/[0.02] space-y-4 h-[220px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <XCircle className="w-3 h-3" /> Critical Gaps
                  </h3>
                  <div className="grid gap-2">
                    {analysis.skillAudit.missing.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl border-red-500/10 text-[10px] font-bold text-red-400 uppercase">
                         <div className="w-1 h-1 rounded-full bg-red-400" /> {s}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 5. Resume Problems */}
                <Card className="glass rounded-[30px] border-orange-500/10 p-6 bg-orange-500/[0.02] space-y-4 h-[220px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> ATS Deterrents
                  </h3>
                  <div className="grid gap-2">
                    {analysis.atsAnalysis.deductions.slice(0, 3).map((d, i) => (
                      <div key={i} className="flex flex-col gap-1 p-3 glass rounded-xl border-orange-500/10">
                        <span className="text-[9px] font-bold uppercase text-orange-300">{d.category}</span>
                        <p className="text-[9px] font-light text-white/50 leading-tight">{d.explanation}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 6. AI Suggestions */}
                <Card className="glass rounded-[30px] border-blue-500/20 p-6 bg-blue-500/[0.02] space-y-4 h-[220px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Lightbulb className="w-3 h-3" /> Improvement Roadmap
                  </h3>
                  <div className="grid gap-2">
                    {analysis.improvementRoadmap.resume.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex gap-3 p-3 glass rounded-xl border-blue-500/10 items-start">
                         <div className="w-4 h-4 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-[8px] font-black shrink-0">{i+1}</div>
                         <p className="text-[9px] font-bold text-white/60 uppercase tracking-tighter leading-tight">{s}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar Protocol */}
              <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                
                {/* 9. Final Recommendation */}
                <Card className={cn(
                  "glass rounded-[30px] border-white/5 p-8 flex flex-col items-center justify-center text-center space-y-4 h-[220px] bg-white/[0.01]",
                  getScoreBorder(analysis.atsAnalysis.overallScore)
                )}>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent"><ShieldCheck className="w-7 h-7" /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Final Verdict</h4>
                    <p className={cn("text-2xl font-black uppercase tracking-tighter", getScoreColor(analysis.atsAnalysis.overallScore))}>
                      {analysis.atsAnalysis.overallScore >= 80 ? "Excellent Protocol" : analysis.atsAnalysis.overallScore >= 60 ? "Good Performance" : "Needs Refinement"}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-[9px] uppercase font-bold text-white/30 tracking-widest">
                    {analysis.atsAnalysis.overallScore >= 70 ? "Arena Qualified" : "Gating Active"}
                  </Badge>
                </Card>

                {/* 8. Section Scores */}
                <Card className="glass rounded-[30px] border-white/5 p-8 flex-1 bg-white/[0.01] space-y-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Neural Node Scores</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Education", val: 85 },
                      { label: "Skills", val: analysis.atsAnalysis.keywordScore },
                      { label: "Projects", val: analysis.atsAnalysis.achievementScore },
                      { label: "Experience", val: analysis.atsAnalysis.actionVerbScore }
                    ].map((s, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end"><span className="text-[9px] font-bold uppercase text-white/30">{s.label}</span><span className="text-[10px] font-bold text-accent tabular-nums">{s.val}%</span></div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.val}%` }} className="h-full bg-accent" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 space-y-3">
                    <Button onClick={() => router.push('/interview')} disabled={analysis.atsAnalysis.overallScore < 70} className="w-full h-14 btn-premium rounded-2xl flex flex-col items-center justify-center gap-0 group">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Enter Neural Arena</span>
                      </div>
                      <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white">Requires 70%+ ATS Index</span>
                    </Button>
                    <Button onClick={() => { setAnalysis(null); setFile(null); }} variant="ghost" className="w-full h-12 text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white">
                      <History className="w-3 h-3 mr-2" /> Reset Protocol
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
