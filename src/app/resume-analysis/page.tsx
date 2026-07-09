
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Target, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BarChart3,
  Search,
  Download,
  Share2,
  ChevronRight,
  Loader2,
  Trash2,
  Building2,
  Cpu,
  History,
  Star,
  FileSearch,
  ArrowRight,
  ClipboardCheck,
  Globe
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { deepAuditResume, type ResumeDeepAuditOutput } from '@/ai/flows/ai-resume-deep-audit';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<ResumeDeepAuditOutput | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

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

  const handleRunAnalysis = async () => {
    if (!file || !user || !db) return;
    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await deepAuditResume({ resumeDataUri: base64, targetRole });
      setAuditResult(result);

      // Save to Firestore
      const resumesRef = collection(db, 'users', user.uid, 'resumes');
      await addDoc(resumesRef, {
        userId: user.uid,
        filename: file.name,
        targetRole,
        atsScore: result.atsScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        resumeScore: result.atsScore
      });

      toast({ title: "Analysis Complete", description: "Your neural audit is ready for review." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Audit Failed", description: "Neural synthesis encountered an error." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadImprovedPDF = () => {
    if (!auditResult) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(user?.displayName || "Improved Resume", 20, 20);
    doc.setFontSize(14);
    doc.text("Professional Summary", 20, 35);
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(auditResult.improvedResume.summary, 170);
    doc.text(splitSummary, 20, 45);

    let y = 45 + (splitSummary.length * 5) + 10;
    doc.setFontSize(14);
    doc.text("Experience", 20, y);
    y += 10;
    doc.setFontSize(10);
    auditResult.improvedResume.experience.forEach(exp => {
      const splitExp = doc.splitTextToSize("• " + exp, 170);
      doc.text(splitExp, 20, y);
      y += (splitExp.length * 5) + 2;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save("Improved_Resume.pdf");
    toast({ title: "PDF Exported", description: "Your optimized blueprint has been downloaded." });
  };

  const startInterviewWithImproved = () => {
    if (!auditResult) return;
    // Store improved context in localStorage
    const improvedContext = {
      analysis: {
        skillAnalysis: auditResult.improvedResume.skills.map(s => ({ skill: s, proficiency: 'Expert' })),
        sections: {
          experience: auditResult.improvedResume.experience,
          projects: auditResult.improvedResume.projects
        },
        atsScore: auditResult.atsScore
      }
    };
    localStorage.setItem("resumeAnalysis", JSON.stringify(improvedContext));
    
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(targetRole)}&exp=Senior&round=Technical%20Round&company=Standard`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Poor";
  };

  if (isAnalyzing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-8">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter text-premium">Synthesizing Neural Audit...</h2>
          <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px]">Deconstructing career nodes • Rebuilding professional vectors</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-32">
        {!auditResult ? (
          <div className="max-w-4xl mx-auto space-y-16">
            <header className="text-center space-y-6">
              <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Blueprint Auditor</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">Resume <span className="text-gradient-purple">Intelligence.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                Deploy an enterprise-grade AI audit to reveal ATS bottlenecks and architect a high-fidelity professional identity.
              </p>
            </header>

            <Card className="premium-card bg-white/[0.01] border-white/5 p-12 shadow-[0_0_100px_rgba(34,211,238,0.05)]">
              <div className="space-y-12">
                <div 
                  onClick={() => document.getElementById('resume-deep-upload')?.click()}
                  className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer group relative overflow-hidden ${file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'}`}
                >
                  <input type="file" id="resume-deep-upload" className="hidden" accept=".pdf,.docx,.doc" onChange={handleFileChange} />
                  {!file ? (
                    <div className="space-y-6">
                      <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto transition-all group-hover:scale-110"><Upload className="w-12 h-12 text-accent" /></div>
                      <div>
                        <p className="text-2xl font-bold mb-2">Initialize Career Scan</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">PDF, DOCX • 10MB Limit</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-8">
                      <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center"><FileText className="w-10 h-10 text-accent" /></div>
                      <div className="text-left">
                        <p className="font-bold text-xl">{file.name}</p>
                        <p className="text-[10px] text-accent uppercase tracking-widest font-bold">READY FOR DEEP AUDIT</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="rounded-xl h-12 w-12 hover:bg-red-500/10 text-red-400"><Trash2 className="w-6 h-6" /></Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground ml-2">Target Career Vector</label>
                  <Input 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="h-18 rounded-2xl glass border-white/10 bg-[#0b0e1a] px-8 text-white font-medium text-lg focus:border-accent transition-all"
                  />
                </div>

                <Button 
                  onClick={handleRunAnalysis}
                  disabled={!file}
                  className="w-full h-20 text-lg btn-premium shadow-[0_0_60px_rgba(147,51,234,0.3)]"
                >
                  <Zap className="w-6 h-6 mr-4 group-hover:animate-pulse" />
                  <span className="tracking-[0.3em] uppercase text-sm font-bold">Launch Neural Audit</span>
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div>
                <Badge className="bg-accent/20 text-accent mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Audit Result v4.0</Badge>
                <h1 className="text-5xl font-bold tracking-tighter text-premium">Performance Intelligence</h1>
                <p className="text-muted-foreground font-light mt-2 uppercase tracking-widest text-[10px]">Validated for: {targetRole}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => setAuditResult(null)} variant="outline" className="h-14 px-8 glass border-white/10 text-[10px] font-bold uppercase tracking-widest">New Scan</Button>
                <Button onClick={startInterviewWithImproved} className="h-14 px-8 btn-premium text-[10px] font-bold uppercase tracking-widest">Start Improved Interview</Button>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                <Card className="premium-card bg-white/[0.02] border-white/5 p-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50" />
                  <div className="relative z-10">
                    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                        <motion.circle 
                          initial={{ strokeDashoffset: 553 }}
                          animate={{ strokeDashoffset: 553 - (553 * auditResult.atsScore) / 100 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className={getScoreColor(auditResult.atsScore)} 
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
                        <span className="text-6xl font-bold tracking-tighter">{auditResult.atsScore}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ATS Index</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`border-none text-lg font-bold uppercase tracking-widest ${getScoreColor(auditResult.atsScore)}`}>
                      {getScoreLabel(auditResult.atsScore)}
                    </Badge>
                    <p className="text-muted-foreground text-sm font-light mt-6 leading-relaxed">
                      Your career blueprint is currently optimized for {auditResult.atsScore}% of industry benchmarks.
                    </p>
                  </div>
                </Card>

                <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><Globe className="w-5 h-5 text-accent" /> Company Readiness</h3>
                  <div className="space-y-6">
                    {Object.entries(auditResult.companyPrediction).map(([company, percent], i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{company}</span>
                          <span className="text-sm font-bold text-accent">{percent}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="h-full bg-accent" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="glass border-white/5 p-2 rounded-2xl h-auto bg-white/[0.01] mb-8">
                    {["overview", "rewrites", "skills", "formatting"].map(tab => (
                      <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="premium-card bg-green-500/[0.02] border-green-500/10 p-8">
                        <h3 className="text-green-400 font-bold mb-6 flex items-center gap-3"><CheckCircle2 className="w-5 h-5" /> Intelligence Strengths</h3>
                        <div className="space-y-4">
                          {auditResult.strengths.map((s, i) => (
                            <div key={i} className="flex gap-3 text-sm font-light text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" /> {s}
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Card className="premium-card bg-red-500/[0.02] border-red-500/10 p-8">
                        <h3 className="text-red-400 font-bold mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5" /> Critical Weaknesses</h3>
                        <div className="space-y-4">
                          {auditResult.weaknesses.map((w, i) => (
                            <div key={i} className="flex gap-3 text-sm font-light text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /> {w}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>

                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                      <h3 className="text-xl font-bold mb-8">Vector Calibration</h3>
                      <div className="grid md:grid-cols-2 gap-10">
                        {Object.entries(auditResult.skillsScore).map(([label, score], i) => (
                          <div key={i} className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              <span>{label} Node</span>
                              <span className="text-white">{score}%</span>
                            </div>
                            <Progress value={score} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="premium-card bg-purple-500/[0.02] border-purple-500/10 p-10">
                      <h3 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-3"><Target className="w-6 h-6" /> Missing Intelligence Keywords</h3>
                      <div className="flex flex-wrap gap-3">
                        {auditResult.missingKeywords.map((k, i) => (
                          <Badge key={i} variant="outline" className="border-purple-500/20 text-purple-400 bg-purple-500/5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rewrites" className="space-y-8">
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                      <header className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-bold">Neural Narrative Optimizer</h3>
                        <div className="flex gap-4">
                          <Button onClick={downloadImprovedPDF} className="btn-premium h-12 px-6 text-[10px] uppercase font-bold tracking-widest"><Download className="w-4 h-4 mr-2" /> Export Optimized</Button>
                        </div>
                      </header>

                      <div className="space-y-12">
                        <section className="space-y-6">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Professional Summary Audit</h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 glass rounded-2xl text-xs font-light text-white/40 italic">
                              <span className="block mb-2 font-bold uppercase tracking-widest">Current</span>
                              "{auditResult.summaryImprovement.current}"
                            </div>
                            <div className="p-6 glass rounded-2xl border-accent/20 bg-accent/5 text-sm font-light text-white">
                              <span className="block mb-2 font-bold uppercase tracking-widest text-accent flex items-center gap-2"><Zap className="w-3 h-3" /> Improved</span>
                              "{auditResult.summaryImprovement.improved}"
                            </div>
                          </div>
                        </section>

                        <section className="space-y-6">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Experience Node Refinements</h4>
                          <div className="space-y-6">
                            {auditResult.experienceSuggestions.map((s, i) => (
                              <div key={i} className="p-8 glass rounded-3xl space-y-4">
                                <p className="text-xs font-light text-white/30 line-through">"{s.original}"</p>
                                <p className="text-lg font-bold text-white leading-tight">"{s.improved}"</p>
                                <div className="flex items-center gap-3 text-accent text-[9px] font-bold uppercase tracking-widest">
                                  <TrendingUp className="w-3 h-3" /> {s.reasons}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-8">
                    <div className="grid md:grid-cols-3 gap-8">
                      {Object.entries(auditResult.skillsSuggestions).map(([category, skills], i) => (
                        <Card key={i} className="premium-card bg-white/[0.01] border-white/5 p-8">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-6">{category} Path</h3>
                          <div className="space-y-3">
                            {skills.map((s, j) => (
                              <div key={j} className="flex items-center gap-3 text-sm font-light text-white/70">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" /> {s}
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="formatting" className="space-y-8">
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                      <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-accent" /> ATS Formatting Scan</h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        {auditResult.formattingIssues.map((issue, i) => (
                          <div key={i} className="flex gap-4 p-6 glass rounded-2xl border-red-500/10 bg-red-500/[0.02]">
                            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                            <div>
                              <p className="font-bold text-sm mb-1">{issue}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Detected during neural parse</p>
                            </div>
                          </div>
                        ))}
                        {auditResult.formattingIssues.length === 0 && (
                          <div className="col-span-2 py-12 text-center">
                            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <p className="text-lg font-bold">Protocol Structure Optimal</p>
                            <p className="text-sm text-muted-foreground">No formatting bottlenecks detected by the ATS parser.</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
