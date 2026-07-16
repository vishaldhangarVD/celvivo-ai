"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  User,
  Clock,
  Download,
  RotateCcw,
  TrendingUp,
  Activity,
  ArrowRight,
  FileSearch,
  PieChart,
  Target as TargetIcon
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { deepAuditResume, type ResumeDeepAuditOutput } from '@/ai/flows/ai-resume-deep-audit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

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
      if (selected.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 5MB" });
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
      await new Promise(r => setTimeout(r, 4500));

      setAnalysis(result);
      setIsAnalyzing(false);

      await addDoc(collection(db, 'users', user.uid, 'resumes'), {
        userId: user.uid,
        filename: file.name,
        targetRole,
        atsScore: result.atsScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Neural Fault", description: "Analysis synthesis failed." });
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Nexvoro AI Resume Audit: ${analysis.candidateIdentity.name}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Role Match: ${analysis.roleMatch.percentage}% for ${targetRole}`, 20, 30);
    doc.text(`Overall Score: ${analysis.overallScore}%`, 20, 40);
    doc.text(`ATS Index: ${analysis.atsScore}%`, 20, 50);
    doc.text("Recruiter Verdict:", 20, 70);
    doc.text(analysis.finalVerdict, 20, 80, { maxWidth: 170 });
    doc.save(`Nexvoro_AI_Audit_${analysis.candidateIdentity.name.replace(/\s+/g, '_')}.pdf`);
    toast({ title: "Report Exported", description: "Your neural audit PDF is ready." });
  };

  const getStatusLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Needs Improvement";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
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
                <Card 
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="lg:col-span-4 glass rounded-[30px] border-white/5 p-8 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-accent/30 transition-all h-[240px] relative overflow-hidden bg-white/[0.01]"
                >
                  <input type="file" id="resume-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                  {!file ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">Upload Resume</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF / DOCX • MAX 5MB</p>
                    </>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                        <Check className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">✔ Blueprint Uploaded</p>
                        <p className="text-sm font-light text-white/70 truncate max-w-[200px]">{file.name}</p>
                      </div>
                      <Button variant="ghost" className="h-8 px-4 text-[9px] uppercase font-bold tracking-widest text-accent hover:bg-accent/10">Replace</Button>
                    </div>
                  )}
                </Card>

                <Card className="lg:col-span-8 glass rounded-[30px] border-white/5 p-8 h-[240px] flex flex-col justify-between bg-white/[0.01]">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-3">
                      <Target className="w-5 h-5 text-accent" /> Target Job Role
                    </h3>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        type="text"
                        placeholder="Search global IT roles..."
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
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-2 p-2 glass border-white/10 rounded-2xl z-[100] max-h-[180px] overflow-y-auto custom-scrollbar shadow-2xl">
                            {filteredRoles.map(role => (
                              <button key={role} onClick={() => { setTargetRole(role); setIsSearching(false); setRoleSearch(""); }} className="w-full text-left p-3 hover:bg-accent/10 hover:text-accent rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-between group">{role} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {IT_ROLES.slice(0, 5).map(role => (
                      <Badge key={role} variant="outline" onClick={() => setTargetRole(role)} className={cn("glass border-white/5 text-[9px] px-3 py-1 cursor-pointer transition-all", targetRole === role && "border-accent text-accent bg-accent/5")}>{role}</Badge>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="flex justify-center pt-8">
                <Button onClick={executeAnalysis} disabled={!file || !targetRole || isAnalyzing} className="h-20 px-20 btn-premium rounded-[2rem] text-xl font-bold uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(34,211,238,0.2)] group">
                  Analyze Resume <BrainCircuit className="ml-4 w-7 h-7 transition-transform group-hover:scale-110" />
                </Button>
              </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#050816]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12">
              <div className="relative max-w-xl w-full text-center space-y-12">
                <div className="relative w-48 h-48 mx-auto">
                  <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin duration-[3s]" />
                  <div className="absolute inset-4 glass rounded-full flex items-center justify-center"><Cpu className="w-16 h-16 text-accent animate-pulse" /></div>
                </div>
                <div className="space-y-8">
                  <h2 className="text-4xl font-bold tracking-tighter text-premium">Nexvoro AI Intelligence Engine</h2>
                  <div className="grid gap-3">
                    {LOADING_STEPS.map((step, idx) => (
                      <div key={idx} className={cn("flex items-center gap-4 transition-all duration-500 px-8 py-2 rounded-xl", loadingStepIdx > idx ? "opacity-100 scale-100" : loadingStepIdx === idx ? "opacity-100 scale-105 bg-accent/5" : "opacity-20 scale-95")}>
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", loadingStepIdx > idx ? "bg-green-500 border-green-500 text-black" : "border-white/20")}>{loadingStepIdx > idx ? <Check className="w-3 h-3 font-black" /> : idx + 1}</div>
                        <span className={cn("text-xs font-bold uppercase tracking-widest", loadingStepIdx > idx ? "text-green-400" : "text-white")}>{step}</span>
                        {loadingStepIdx === idx && <Loader2 className="w-3 h-3 animate-spin ml-auto text-accent" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : analysis ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
              
              <div className="grid lg:grid-cols-3 gap-6">
                {/* 1. Overall Score */}
                <Card className="glass rounded-[30px] border-white/5 p-10 flex flex-col items-center justify-center bg-white/[0.01] h-[300px]">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                      <motion.circle 
                        cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray="502.4"
                        initial={{ strokeDashoffset: 502.4 }}
                        animate={{ strokeDashoffset: 502.4 - (502.4 * analysis.overallScore) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className={getScoreColor(analysis.overallScore)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn("text-6xl font-black tabular-nums", getScoreColor(analysis.overallScore))}>{analysis.overallScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Master Index</span>
                    </div>
                  </div>
                  <Badge className={cn("mt-6 border-none px-6 py-1.5 text-[10px] font-black uppercase tracking-widest", analysis.overallScore >= 80 ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400")}>
                    Status: {getStatusLabel(analysis.overallScore)}
                  </Badge>
                </Card>

                {/* 2. ATS Score */}
                <Card className="glass rounded-[30px] border-white/5 p-10 flex flex-col items-center justify-center bg-white/[0.01] h-[300px]">
                   <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <motion.circle 
                        cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray="439.6"
                        initial={{ strokeDashoffset: 439.6 }}
                        animate={{ strokeDashoffset: 439.6 - (439.6 * analysis.atsScore) / 100 }}
                        className="text-accent"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black tabular-nums text-accent">{analysis.atsScore}%</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">ATS Compatibility</span>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-3 px-4 py-2 glass rounded-xl border-accent/20">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{analysis.atsScore >= 70 ? "ATS FRIENDLY" : "MODIFICATION RECOMMENDED"}</span>
                  </div>
                </Card>

                {/* 3. Job Match */}
                <Card className="glass rounded-[30px] border-white/5 p-10 flex flex-col justify-between bg-white/[0.01] h-[300px]">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Calibration Profile</h3>
                    <p className="text-2xl font-bold tracking-tight text-premium">{targetRole}</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-7xl font-black text-gradient-purple tabular-nums">{analysis.roleMatch.percentage}%</div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Role Match Vector</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest", analysis.roleMatch.percentage >= 80 ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400")}>
                    {analysis.roleMatch.recommendation}
                  </div>
                </Card>
              </div>

              {/* 4. AI Summary */}
              <Card className="glass rounded-[30px] border-white/5 p-10 bg-white/[0.01] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles className="w-32 h-32 text-accent" /></div>
                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-6 flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5" /> Neural Professional Summary
                </h3>
                <p className="text-xl font-light leading-relaxed text-white/90 italic">"{analysis.summary}"</p>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* 5. Technical Skills */}
                <Card className="glass rounded-[30px] border-white/5 p-8 bg-white/[0.01] space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><Cpu className="w-4 h-4 text-accent" /> Detected Tech Nodes</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.technicalSkills.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2 glass rounded-xl border-white/5 group hover:border-accent/30 transition-all">
                        <span className="text-[10px] font-bold text-white/80 uppercase">{s.skill}</span>
                        <Badge variant="outline" className="text-[8px] font-black border-accent/20 text-accent px-1.5 py-0">{s.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 6. Strengths */}
                <Card className="glass rounded-[30px] border-green-500/10 p-8 bg-green-500/[0.02] space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400 flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> Strategic Strengths</h3>
                   <div className="grid gap-3">
                     {analysis.strengths.map((s, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 glass rounded-2xl border-green-500/10 text-xs font-light text-white/70">
                         <div className="w-2 h-2 rounded-full bg-green-500" /> {s}
                       </div>
                     ))}
                   </div>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* 7. Missing Skills */}
                <Card className="glass rounded-[30px] border-red-500/10 p-8 bg-red-500/[0.02] space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-3"><XCircle className="w-4 h-4" /> Critical Gap Alerts</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((s, i) => (
                      <Badge key={i} variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">{s}</Badge>
                    ))}
                  </div>
                </Card>

                {/* 8. Resume Problems */}
                <Card className="glass rounded-[30px] border-orange-500/10 p-8 bg-orange-500/[0.02] space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-3"><AlertTriangle className="w-4 h-4" /> Structural Deterrents</h3>
                   <div className="grid gap-3">
                     {analysis.resumeProblems.map((p, i) => (
                       <div key={i} className="flex items-start gap-4 p-4 glass rounded-2xl border-orange-500/10">
                         <div className="w-5 h-5 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-[8px] font-black shrink-0">!</div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-tight">{p}</p>
                       </div>
                     ))}
                   </div>
                </Card>
              </div>

              {/* 10. Keyword Heatmap */}
              <Card className="glass rounded-[30px] border-white/5 p-10 bg-white/[0.01] space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><TrendingUp className="w-4 h-4 text-accent" /> Keyword Heatmap Analysis</h3>
                  <Badge variant="outline" className="border-white/10 text-white/30 text-[8px] uppercase">{analysis.keywordAnalysis.matched.length} Matched</Badge>
                </div>
                <div className="grid lg:grid-cols-2 gap-12">
                   <div className="space-y-4">
                     <p className="text-[8px] font-bold text-green-400 uppercase tracking-widest ml-1">High Relevance Detected</p>
                     <div className="flex flex-wrap gap-2">
                       {analysis.keywordAnalysis.matched.map((k, i) => (
                         <Badge key={i} className="bg-green-500/10 text-green-400 border-none font-bold text-[8px] px-3 py-1.5 rounded-lg">{k}</Badge>
                       ))}
                     </div>
                   </div>
                   <div className="space-y-4">
                     <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest ml-1">Missing Strategic Nodes</p>
                     <div className="flex flex-wrap gap-2">
                       {analysis.keywordAnalysis.missing.map((k, i) => (
                         <Badge key={i} className="bg-red-500/10 text-red-400 border-none font-bold text-[8px] px-3 py-1.5 rounded-lg">{k}</Badge>
                       ))}
                     </div>
                   </div>
                </div>
              </Card>

              {/* 11. Section Scores */}
              <Card className="glass rounded-[30px] border-white/5 p-10 bg-white/[0.01] space-y-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><BarChart3 className="w-4 h-4 text-purple-400" /> Neural Node Performance Audit</h3>
                <div className="grid md:grid-cols-2 gap-x-20 gap-y-8">
                  {Object.entries(analysis.sectionScores).map(([name, score], i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase text-white/40 tracking-widest">{name} Index</span>
                        <span className={cn("text-xs font-bold tabular-nums", getScoreColor(score))}>{score}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={cn("h-full bg-current", getScoreColor(score))} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 13. Final Verdict */}
              <Card className="premium-card bg-accent/[0.02] border-accent/20 p-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Gavel className="w-48 h-48 text-accent" /></div>
                 <div className="space-y-6 relative z-10">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent"><ShieldCheck className="w-6 h-6" /></div>
                     <div>
                       <h3 className="text-2xl font-bold tracking-tighter">Final AI Recruiter Verdict</h3>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Executive Deployment Briefing</p>
                     </div>
                   </div>
                   <p className="text-lg font-light leading-relaxed text-white/80 border-l-2 border-accent/40 pl-8 italic">"{analysis.finalVerdict}"</p>
                 </div>
              </Card>

              {/* Recommended Roles */}
              <div className="p-8 glass rounded-[2rem] border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-4">
                   <TargetIcon className="w-6 h-6 text-accent" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Alternative Deployment Nodes</p>
                 </div>
                 <div className="flex flex-wrap justify-center gap-3">
                   {analysis.recommendedRoles.map((role, i) => (
                     <Badge key={i} variant="outline" className="glass border-white/10 text-white/60 text-[9px] uppercase font-bold px-4 py-1.5 rounded-full">{role}</Badge>
                   ))}
                 </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button onClick={handleDownloadPDF} className="h-16 px-12 btn-premium rounded-2xl flex items-center gap-4 group">
                   <Download className="w-5 h-5 group-hover:animate-bounce" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Download AI Report (PDF)</span>
                </Button>
                <Button onClick={() => { setAnalysis(null); setFile(null); }} variant="outline" className="h-16 px-10 glass border-white/10 rounded-2xl hover:bg-white/5 flex items-center gap-4 transition-all">
                   <RotateCcw className="w-5 h-5" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Analyze Another</span>
                </Button>
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Gavel({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m14.5 12.5-8 8a2.11 2.11 0 1 1-3-3l8-8" />
      <path d="m16 16 2 2" />
      <path d="m2 2 16 16" />
      <path d="m15 2 6 6" />
      <path d="m9 2 8 8" />
      <path d="m17 2 5 5" />
    </svg>
  );
}
