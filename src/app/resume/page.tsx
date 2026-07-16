
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  TrendingUp, 
  BrainCircuit, 
  Target, 
  Award, 
  Download, 
  Share2, 
  Mic, 
  ChevronRight, 
  ChevronDown,
  FileText,
  ShieldCheck,
  Rocket,
  MousePointer2,
  FileSearch,
  Cpu,
  BarChart3,
  Languages,
  LayoutGrid,
  Briefcase,
  History,
  Lightbulb,
  Lock,
  Star,
  Sparkles,
  Command,
  Flag,
  PenTool,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { deepAuditResume, type ResumeDeepAuditOutput } from '@/ai/flows/ai-resume-deep-audit';
import { useToast } from '@/hooks/use-toast';

const POPULAR_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Java Developer", "Python Developer", "Data Analyst", "Data Scientist",
  "Machine Learning Engineer", "DevOps Engineer", "Cloud Engineer", "Cyber Security",
  "Business Analyst", "QA Engineer", "Power BI Developer", "AI Engineer"
];

const LOADING_MESSAGES = [
  "Reading Resume...",
  "Extracting Knowledge Nodes...",
  "Matching Job Requirements...",
  "Calculating ATS Index...",
  "Analyzing Experience Quality...",
  "Auditing Project Impact...",
  "Generating Neural Report...",
  "Almost Done..."
];

export default function ResumeIntelligencePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [analysis, setAnalysis] = useState<ResumeDeepAuditOutput | null>(null);

  // Loading message rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

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

  const executeAnalysis = async () => {
    if (!file || !targetRole || !user || !db) {
      toast({ variant: "destructive", title: "Protocols Missing", description: "Select role and upload blueprint." });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await deepAuditResume({ 
        resumeDataUri: base64, 
        targetRole 
      });

      setAnalysis(result);

      // Persist Audit to Firestore
      await addDoc(collection(db, 'users', user.uid, 'resumes'), {
        userId: user.uid,
        filename: file.name,
        targetRole,
        atsScore: result.atsAnalysis.overallScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Analysis Complete", description: "Neural intelligence report is now live." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Synthesis Failed", description: "The engine encountered a neural fault." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-green-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <AnimatePresence mode="wait">
          {!analysis && !isAnalyzing ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-20">
              {/* Hero Section */}
              <div className="text-center space-y-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-pulse" />
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="relative z-10 w-32 h-32 mx-auto">
                    <BrainCircuit className="w-full h-full text-accent opacity-50" />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Identity Protocol</Badge>
                  <h1 className="text-7xl font-bold tracking-tighter text-premium">AI Resume <span className="text-gradient-purple">Intelligence.</span></h1>
                  <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                    Upload your career blueprint for a complete AI recruiter audit, ATS optimization report, and interview readiness evaluation.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {["Enterprise AI", "ATS Optimized", "Recruiter Intelligence", "Career Accelerator"].map((b, i) => (
                    <Badge key={i} variant="outline" className="glass border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40">✔ {b}</Badge>
                  ))}
                </div>
              </div>

              {/* Upload & Role Config */}
              <div className="grid lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-7 premium-card bg-white/[0.01] border-white/5 p-12 text-center group cursor-pointer hover:border-accent/30 transition-all" onClick={() => document.getElementById('resume-deep-upload')?.click()}>
                  <input type="file" id="resume-deep-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                  <div className="space-y-8">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                      <Upload className="w-12 h-12 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold">{file ? file.name : "Initialize Blueprint"}</h3>
                      <p className="text-muted-foreground font-light">Drag & Drop your resume or click to browse</p>
                    </div>
                    <div className="flex items-center justify-center gap-8 opacity-40">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><FileText className="w-3 h-3" /> PDF / DOCX</div>
                      <div className="w-px h-4 bg-white/20" />
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> 5MB LIMIT</div>
                    </div>
                  </div>
                </Card>

                <div className="lg:col-span-5 space-y-8">
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Strategic Deployment Role</label>
                      <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <Input 
                          placeholder="e.g. Senior Software Engineer" 
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="h-14 pl-12 rounded-2xl glass border-white/10 bg-transparent text-white focus:border-accent transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 ml-2">Trending Tracks</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_ROLES.slice(0, 8).map(role => (
                          <button 
                            key={role} 
                            onClick={() => setTargetRole(role)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${targetRole === role ? 'bg-accent text-[#050816]' : 'glass border-white/5 text-white/40 hover:bg-white/5'}`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Button 
                    onClick={executeAnalysis}
                    disabled={!file || !targetRole || isAnalyzing}
                    className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(34,211,238,0.2)] group"
                  >
                    Execute Neural Audit <Rocket className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#050816] flex flex-col items-center justify-center p-12">
              <div className="relative max-w-xl w-full text-center space-y-12">
                <div className="relative w-48 h-48 mx-auto">
                  <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin" />
                  <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
                    <Cpu className="w-16 h-16 text-accent animate-pulse" />
                  </div>
                  {/* Scanning Line */}
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-[-20%] right-[-20%] h-0.5 bg-accent/50 blur-[2px] z-20"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold tracking-tighter text-premium">Analyzing Intelligence.</h2>
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <p className="text-xl font-light text-accent/80 italic">{LOADING_MESSAGES[loadingMsgIdx]}</p>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 20, ease: "linear" }}
                    className="h-full bg-accent shadow-[0_0_20px_#22d3ee]"
                  />
                </div>
              </div>
            </motion.div>
          ) : analysis ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-12 pb-40">
              {/* Header Analysis Summary */}
              <div className="flex flex-col lg:flex-row justify-between items-end gap-8 pb-12 border-b border-white/5">
                <div className="space-y-4">
                  <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Master Audit v8.0</Badge>
                  <h1 className="text-6xl font-bold tracking-tighter text-premium">{targetRole}<br /><span className="text-gradient-purple">Dossier.</span></h1>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-white/40"><User className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">{analysis.candidateIdentity.name}</span></div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-2 text-white/40"><Clock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">{analysis.candidateIdentity.yearsOfExperience}y Experience</span></div>
                  </div>
                </div>
                <div className="flex gap-12">
                   <div className="text-center">
                      <div className={`text-7xl font-bold tracking-tighter tabular-nums ${getScoreColor(analysis.atsAnalysis.overallScore)}`}>{analysis.atsAnalysis.overallScore}%</div>
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground mt-2">ATS PRECISION INDEX</p>
                   </div>
                   <div className="w-px h-16 bg-white/10 hidden md:block" />
                   <div className="text-center">
                      <div className="text-5xl font-bold text-white tabular-nums">{analysis.roleMatch.matchPercentage}%</div>
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mt-2">ROLE COMPATIBILITY</p>
                   </div>
                </div>
              </div>

              {/* Main Matrix Grid */}
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Score Matrix */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                      <h3 className="text-xl font-bold flex items-center gap-3"><BarChart3 className="w-6 h-6 text-accent" /> Intelligence Metrics</h3>
                      <div className="space-y-6">
                        {[
                          { label: "Formatting Score", val: analysis.atsAnalysis.formattingScore },
                          { label: "Keyword Density", val: analysis.atsAnalysis.keywordScore },
                          { label: "Impact Quantification", val: analysis.atsAnalysis.achievementScore },
                          { label: "Linguistic Precision", val: analysis.atsAnalysis.actionVerbScore }
                        ].map((m, i) => (
                          <div key={i} className="space-y-2">
                             <div className="flex justify-between items-end"><span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{m.label}</span><span className="text-sm font-bold text-white">{m.val}%</span></div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${m.val}%` }} className="h-full bg-accent" />
                             </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                      <h3 className="text-xl font-bold flex items-center gap-3"><Target className="w-6 h-6 text-purple-400" /> Probability Matrix</h3>
                      <div className="grid grid-cols-2 gap-6">
                         {[
                           { label: "Hiring Demand", val: "High", color: "text-accent" },
                           { label: "ATS Clearance", val: analysis.atsAnalysis.overallScore > 70 ? "Optimal" : "Risk", color: analysis.atsAnalysis.overallScore > 70 ? "text-green-400" : "text-red-400" },
                           { label: "Interview Prob.", val: `${analysis.roleMatch.matchPercentage}%`, color: "text-purple-400" },
                           { label: "Recruiter Rating", val: "Elite", color: "text-blue-400" }
                         ].map((p, i) => (
                           <div key={i} className="p-4 glass rounded-2xl border-white/5 space-y-1">
                              <p className="text-[8px] font-bold uppercase text-white/20 tracking-widest">{p.label}</p>
                              <p className={`text-xl font-bold ${p.color}`}>{p.val}</p>
                           </div>
                         ))}
                      </div>
                      <div className="p-6 glass rounded-2xl bg-accent/5 border-accent/20">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Estimated Salary Track</p>
                         <div className="text-3xl font-bold text-white">₹18L - ₹32L<span className="text-xs text-muted-foreground ml-2 font-normal">Per Annum</span></div>
                      </div>
                    </Card>
                  </div>

                  {/* Summary & Skills */}
                  <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                      <PenTool className="w-8 h-8 text-accent" />
                      <div>
                        <h3 className="text-2xl font-bold">Neural Summary Audit</h3>
                        <p className="text-xs text-muted-foreground font-light">Synthesized narrative based on career blueprint</p>
                      </div>
                    </div>
                    <p className="text-lg font-light leading-relaxed text-white/80 italic">"{analysis.improvementRoadmap.resume[0] || 'Strategic trajectory aligned with modern engineering standards.'}"</p>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                       <h3 className="text-xl font-bold flex items-center gap-3"><Cpu className="w-6 h-6 text-accent" /> Skill Vector Audit</h3>
                       <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Elite Mastery</p>
                            <div className="flex flex-wrap gap-2">
                               {analysis.skillAudit.strong.map((s, i) => (
                                 <Badge key={i} className="bg-accent/20 text-accent border-none font-bold text-[9px] uppercase tracking-widest">{s}</Badge>
                               ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Functional Nodes</p>
                            <div className="flex flex-wrap gap-2">
                               {analysis.skillAudit.intermediate.map((s, i) => (
                                 <Badge key={i} variant="outline" className="glass border-white/10 text-white/60 font-bold text-[9px] uppercase tracking-widest">{s}</Badge>
                               ))}
                            </div>
                          </div>
                       </div>
                    </Card>

                    <Card className="premium-card bg-red-500/5 border-red-500/20 p-10 space-y-8">
                       <h3 className="text-xl font-bold flex items-center gap-3 text-red-400"><Flag className="w-6 h-6" /> Deficiency Report</h3>
                       <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-bold text-red-400/40 uppercase tracking-widest mb-4">Critical Missing Nodes</p>
                            <div className="flex flex-wrap gap-2">
                               {analysis.skillAudit.missing.map((s, i) => (
                                 <Badge key={i} className="bg-red-500/20 text-red-400 border-none font-bold text-[9px] uppercase tracking-widest">{s}</Badge>
                               ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-red-400/40 uppercase tracking-widest mb-4">High Risk Deductions</p>
                            <div className="space-y-3">
                               {analysis.atsAnalysis.deductions.map((d, i) => (
                                 <div key={i} className="flex gap-4 text-xs font-light text-white/60 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                    <span>{d.explanation}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                       </div>
                    </Card>
                  </div>
                </div>

                {/* Sidebar Protocol */}
                <div className="lg:col-span-4 space-y-8">
                   <Card className="premium-card bg-accent/5 border-accent/20 p-8 space-y-8">
                      <div className="text-center space-y-2">
                         <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto text-accent mb-4"><Award className="w-10 h-10" /></div>
                         <h3 className="text-xl font-bold">Final Verdict</h3>
                         <Badge className={`${getScoreColor(analysis.atsAnalysis.overallScore)} bg-white/5 border-none font-black tracking-[0.4em] uppercase text-xs`}>
                            {analysis.atsAnalysis.overallScore >= 85 ? "EXCELLENT" : analysis.atsAnalysis.overallScore >= 70 ? "GOOD" : "NEEDS REFINEMENT"}
                         </Badge>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <Button className="w-full h-16 btn-premium flex gap-3 text-xs font-bold uppercase tracking-widest group/btn">
                           <Download className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> Export Master PDF
                        </Button>
                        <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 hover:bg-white/5 flex gap-3 text-xs font-bold uppercase tracking-widest">
                           <Share2 className="w-5 h-5" /> Share Intelligence
                        </Button>
                      </div>
                   </Card>

                   <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 ml-2">Mission Directives</p>
                      {analysis.atsAnalysis.overallScore >= 70 ? (
                        <Button onClick={() => router.push('/interview')} className="w-full h-20 bg-gradient-to-r from-orange-600 to-red-600 rounded-[2rem] flex flex-col items-center justify-center gap-1 group shadow-[0_0_50px_rgba(234,88,12,0.2)]">
                           <div className="flex items-center gap-3">
                              <Mic className="w-6 h-6 text-white" />
                              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Enter Neural Arena</span>
                           </div>
                           <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Candidate Qualified for Mock Interview</span>
                        </Button>
                      ) : (
                        <div className="p-8 glass rounded-[2rem] border-red-500/20 bg-red-500/[0.02] text-center space-y-4">
                           <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto text-red-400"><ShieldCheck className="w-6 h-6" /></div>
                           <p className="text-xs font-bold uppercase tracking-widest text-red-400">Gating Active</p>
                           <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider font-bold">Minimum Index of 70% required to launch virtual simulation.</p>
                        </div>
                      )}
                   </div>

                   <Card className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                      <h3 className="text-xl font-bold flex items-center gap-3"><Clock className="w-6 h-6 text-accent" /> 30-Day Recovery</h3>
                      <div className="space-y-6">
                        {["Week 1: Structural Repair", "Week 2: Impact Optimization", "Week 3: Keyword Expansion", "Week 4: Final Gating"].map((week, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                             <div className="w-10 h-10 rounded-xl glass border-white/5 flex items-center justify-center text-[10px] font-black text-white/40">{idx + 1}</div>
                             <span className="text-xs font-bold uppercase tracking-widest text-white/80">{week}</span>
                          </div>
                        ))}
                      </div>
                   </Card>
                </div>
              </div>

              {/* Deep Project Review */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                   <LayoutGrid className="w-8 h-8 text-accent" />
                   <h3 className="text-3xl font-bold tracking-tighter">Implementation Architecture</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                   {analysis.projectAnalysis.map((p, i) => (
                     <Card key={i} className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8 group hover:border-accent/20 transition-all">
                        <div className="flex justify-between items-start">
                           <div>
                              <h4 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">{p.name}</h4>
                              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{p.complexity} Complexity Node</p>
                           </div>
                           <div className="text-right">
                              <div className="text-xl font-black text-accent tabular-nums">{p.confidenceLevel}%</div>
                              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Confidence</p>
                           </div>
                        </div>
                        <div className="p-6 glass rounded-2xl border-white/5 space-y-4">
                           <p className="text-sm font-light text-white/60 leading-relaxed italic">"{p.realWorldImpact}"</p>
                           <div className="flex flex-wrap gap-2 pt-2">
                              {p.technologiesUsed.map((t, j) => (
                                <Badge key={j} variant="outline" className="border-white/10 text-[8px] uppercase tracking-widest">{t}</Badge>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Potential Arena Probes</p>
                           <div className="grid gap-3">
                              {p.possibleInterviewQuestions.slice(0, 2).map((q, j) => (
                                <div key={j} className="p-4 glass rounded-xl border-white/5 text-[10px] font-bold text-white/70 uppercase tracking-wider flex gap-3">
                                   <Zap className="w-3.5 h-3.5 text-accent shrink-0" /> {q}
                                </div>
                              ))}
                           </div>
                        </div>
                     </Card>
                   ))}
                </div>
              </div>

              {/* Role Evolution Matrix */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                 <div className="flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-accent" />
                    <h3 className="text-3xl font-bold tracking-tighter">Career Evolution Matrix</h3>
                 </div>
                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {analysis.careerEvolution.map((node, i) => (
                      <div key={i} className="space-y-4 group">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black tracking-widest uppercase text-white/40">{node.topic}</span>
                            <Badge className="bg-accent/10 text-accent border-none text-[8px] font-bold">{node.priority}</Badge>
                         </div>
                         <div className="p-6 glass rounded-2xl border-white/5 space-y-3 group-hover:bg-white/5 transition-all">
                            <p className="text-xl font-bold text-white">{node.estimatedTime}</p>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground leading-relaxed">{node.expectedImpact}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </Card>

              {/* Master Prep Node */}
              <div className="grid lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 premium-card bg-white/[0.01] border-white/5 p-12 space-y-12">
                   <div className="flex items-center gap-4">
                      <Command className="w-8 h-8 text-accent" />
                      <h3 className="text-3xl font-bold tracking-tighter">Target Prep Directives</h3>
                   </div>
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 border-l-2 border-accent pl-4">Technical Core Nodes</h4>
                         <div className="space-y-4">
                            {analysis.interviewPreparation.technicalQuestions.slice(0, 5).map((q, i) => (
                              <div key={i} className="flex gap-4 text-sm font-light text-white/80 leading-relaxed">
                                 <div className="w-1 h-1 rounded-full bg-accent mt-2.5 shrink-0" /> {q}
                              </div>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-8">
                         <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 border-l-2 border-purple-500 pl-4">Behavioral Protocols</h4>
                         <div className="space-y-4">
                            {analysis.interviewPreparation.hrQuestions.map((q, i) => (
                              <div key={i} className="flex gap-4 text-sm font-light text-white/80 leading-relaxed">
                                 <div className="w-1 h-1 rounded-full bg-purple-500 mt-2.5 shrink-0" /> {q}
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </Card>

                <Card className="lg:col-span-4 premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                   <h3 className="text-xl font-bold flex items-center gap-3"><Sparkles className="w-6 h-6 text-yellow-400" /> Optimization Map</h3>
                   <div className="space-y-6">
                      {analysis.improvementRoadmap.resume.map((step, i) => (
                        <div key={i} className="p-4 glass rounded-2xl border-white/5 flex gap-4 items-start group hover:bg-white/5 transition-all">
                           <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold shrink-0">{i+1}</div>
                           <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider leading-relaxed">{step}</p>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>

              {/* Reset Control */}
              <div className="pt-20 text-center">
                 <Button onClick={() => { setAnalysis(null); setFile(null); }} variant="ghost" className="text-[10px] font-black tracking-[0.4em] uppercase text-white/20 hover:text-white transition-colors">
                    <History className="w-4 h-4 mr-3" /> Initialize Fresh Audit Protocol
                 </Button>
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}

