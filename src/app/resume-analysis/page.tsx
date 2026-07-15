'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
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
  Globe,
  AlertTriangle,
  User,
  ShieldAlert,
  Map,
  Code2,
  MessageSquare,
  LayoutGrid,
  Info
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { deepAuditResume, type ResumeDeepAuditOutput } from '@/ai/flows/ai-resume-deep-audit';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<ResumeDeepAuditOutput | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirectTo=/resume-analysis`);
    }
  }, [user, authLoading, router]);

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
    setAuditResult(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await deepAuditResume({ resumeDataUri: base64, targetRole });
      setAuditResult(result);

      // Persistence
      const resumesRef = collection(db, 'users', user.uid, 'resumes');
      await addDoc(resumesRef, {
        userId: user.uid,
        filename: file.name,
        targetRole,
        atsScore: result.atsAnalysis.overallScore,
        analysis: result,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        resumeScore: result.atsAnalysis.overallScore
      });

      toast({ 
        title: result.isOffline ? "Audit Synchronized (Offline)" : "Intelligence Synthesis Complete", 
        description: "Your comprehensive career audit is ready for review." 
      });

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Audit Failed", description: "System encountered a neural synchronization error." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-accent";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  if (isAnalyzing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-8">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter text-premium">Synthesizing Career Intelligence...</h2>
          <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px]">Deconstructing projects • Auditing skill vectors • Building roadmap</p>
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
              <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Identity Auditor</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">Resume <span className="text-gradient-purple">Intelligence.</span></h1>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                Deploy an enterprise-grade AI audit to reveal ATS bottlenecks and architect a high-fidelity professional identity.
              </p>
            </header>

            <Card className="premium-card bg-white/[0.01] border-white/5 p-12">
              <div className="space-y-12">
                <div 
                  onClick={() => document.getElementById('resume-master-upload')?.click()}
                  className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer group relative overflow-hidden ${file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'}`}
                >
                  <input type="file" id="resume-master-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  {!file ? (
                    <div className="space-y-6">
                      <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto transition-all group-hover:scale-110"><Upload className="w-12 h-12 text-accent" /></div>
                      <div>
                        <p className="text-2xl font-bold mb-2">Initialize Identity Scan</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">PDF Only • 10MB Limit</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-8">
                      <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center"><FileText className="w-10 h-10 text-accent" /></div>
                      <div className="text-left">
                        <p className="font-bold text-xl">{file.name}</p>
                        <p className="text-[10px] text-accent uppercase tracking-widest font-bold">READY FOR MASTER AUDIT</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="rounded-xl h-12 w-12 hover:bg-red-500/10 text-red-400"><Trash2 className="w-6 h-6" /></Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground ml-2">Target Career Node</label>
                  <Input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Software Architect"
                    className="h-16 px-8 rounded-2xl glass border-white/10 bg-transparent text-white text-lg font-light"
                  />
                </div>

                <Button onClick={handleRunAnalysis} disabled={!file} className="w-full h-20 text-lg btn-premium shadow-[0_0_60px_rgba(147,51,234,0.3)]">
                  <Zap className="w-6 h-6 mr-4 group-hover:animate-pulse" /> <span className="tracking-[0.3em] uppercase text-sm font-bold">Launch Neural Audit</span>
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                <Badge className="bg-accent/20 text-accent px-4 py-1 text-[10px] tracking-widest font-bold uppercase border-none">Master Dossier v5.0</Badge>
                <h1 className="text-5xl font-bold tracking-tighter text-premium">{auditResult.candidateIdentity.name}</h1>
                <p className="text-muted-foreground font-light uppercase tracking-widest text-[10px]">{auditResult.candidateIdentity.yearsOfExperience} Years Experience • {targetRole}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => setAuditResult(null)} variant="outline" className="h-14 px-8 glass border-white/10 text-[10px] font-bold uppercase tracking-widest">New Session</Button>
                <Button onClick={() => router.push('/interview')} className="h-14 px-8 btn-premium text-[10px] font-bold uppercase tracking-widest">Start Arena Simulation</Button>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                <Card className="premium-card bg-white/[0.02] border-white/5 p-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50" />
                  <div className="relative z-10 space-y-8">
                    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                        <motion.circle 
                          initial={{ strokeDashoffset: 553 }}
                          animate={{ strokeDashoffset: 553 - (553 * auditResult.atsAnalysis.overallScore) / 100 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className={getScoreColor(auditResult.atsAnalysis.overallScore)} 
                          strokeWidth="8" 
                          strokeDasharray={553} 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                          r="88" cx="96" cy="96" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold tracking-tighter">{auditResult.atsAnalysis.overallScore}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ATS Composite</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 glass rounded-2xl border-white/5">
                        <p className="text-[8px] uppercase font-bold text-white/30 tracking-widest mb-1">Match Index</p>
                        <p className="text-xl font-bold text-accent">{auditResult.roleMatch.matchPercentage}%</p>
                      </div>
                      <div className="p-4 glass rounded-2xl border-white/5">
                        <p className="text-[8px] uppercase font-bold text-white/30 tracking-widest mb-1">Hiring Risk</p>
                        <p className={`text-xl font-bold ${auditResult.hiringRisk.missingNumbers ? 'text-red-400' : 'text-green-400'}`}>{auditResult.hiringRisk.missingNumbers ? 'High' : 'Low'}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="premium-card bg-red-500/[0.02] border-red-500/10 p-8">
                  <h3 className="text-red-400 font-bold mb-6 flex items-center gap-3"><ShieldAlert className="w-5 h-5" /> Risk Audit Log</h3>
                  <div className="space-y-4">
                    {auditResult.hiringRisk.weakSections.map((s, i) => (
                      <div key={i} className="flex gap-3 text-xs font-light text-white/60">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" /> {s}
                      </div>
                    ))}
                    <p className="text-[10px] italic text-muted-foreground mt-4 border-t border-white/5 pt-4">"{auditResult.hiringRisk.riskSummary}"</p>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="glass border-white/5 p-2 rounded-2xl h-auto bg-white/[0.01] mb-8">
                    {["overview", "projects", "skills", "roadmap", "prep"].map(tab => (
                      <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-8">
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                      <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><BarChart3 className="w-6 h-6 text-accent" /> ATS Deduction Matrix</h3>
                      <div className="space-y-6">
                        {auditResult.atsAnalysis.deductions.map((d, i) => (
                          <div key={i} className="p-6 glass rounded-2xl border-white/5 flex justify-between items-center gap-8">
                            <div className="space-y-1">
                              <p className="text-sm font-bold uppercase tracking-widest">{d.category}</p>
                              <p className="text-xs text-muted-foreground font-light">{d.explanation}</p>
                            </div>
                            <div className="text-red-400 font-bold tabular-nums">-{d.deduction}</div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="premium-card bg-green-500/[0.02] border-green-500/10 p-8">
                        <h3 className="text-green-400 font-bold mb-6 flex items-center gap-3"><CheckCircle2 className="w-5 h-5" /> Strong Vectors</h3>
                        <div className="flex flex-wrap gap-2">
                          {auditResult.skillAudit.strong.map((s, i) => <Badge key={i} className="bg-green-400/10 text-green-400 border-green-400/20">{s}</Badge>)}
                        </div>
                      </Card>
                      <Card className="premium-card bg-purple-500/[0.02] border-purple-500/10 p-8">
                        <h3 className="text-purple-400 font-bold mb-6 flex items-center gap-3"><Target className="w-5 h-5" /> Recommended Nodes</h3>
                        <div className="flex flex-wrap gap-2">
                          {auditResult.roleMatch.recommendedTechnologies.map((s, i) => <Badge key={i} className="bg-purple-400/10 text-purple-400 border-purple-400/20">{s}</Badge>)}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-8">
                    {auditResult.projectAnalysis.map((p, i) => (
                      <Card key={i} className="premium-card bg-white/[0.01] border-white/5 p-10 space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-3xl font-bold tracking-tight text-white">{p.name}</h3>
                            <div className="flex gap-2">
                              {p.technologiesUsed.map((t, j) => <Badge key={j} variant="outline" className="text-[8px] border-white/10 uppercase tracking-widest">{t}</Badge>)}
                            </div>
                          </div>
                          <Badge className="bg-accent/20 text-accent border-none font-bold text-[10px] tracking-widest px-4 py-1">{p.complexity} Complexity</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Architectural Purpose</p>
                            <p className="text-sm font-light text-white/80 leading-relaxed">{p.purpose}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-6">Real-World Impact</p>
                            <p className="text-sm font-light text-accent/80 leading-relaxed italic">"{p.realWorldImpact}"</p>
                          </div>
                          <div className="space-y-6">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Simulation Probes</p>
                            <div className="space-y-3">
                              {p.possibleInterviewQuestions.map((q, j) => (
                                <div key={j} className="flex gap-3 text-xs font-light text-white/60 leading-relaxed">
                                  <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" /> {q}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {["Strong", "Intermediate", "Beginner", "Missing", "Outdated", "Most Valuable"].map(cat => {
                        const key = cat.toLowerCase().replace(' ', '') as keyof typeof auditResult.skillAudit;
                        const skills = (auditResult.skillAudit as any)[key] as string[];
                        if (!skills) return null;
                        return (
                          <Card key={cat} className="premium-card bg-white/[0.01] border-white/5 p-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-6">{cat} Vectors</h3>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((s, i) => (
                                <Badge key={i} variant="outline" className="bg-white/5 border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/70">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="roadmap" className="space-y-8">
                    <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                      <h3 className="text-xl font-bold mb-10 flex items-center gap-3"><Map className="w-6 h-6 text-accent" /> 90-Day Evolution Pathway</h3>
                      <div className="space-y-6">
                        {auditResult.careerEvolution.map((node, i) => (
                          <div key={i} className="p-8 glass rounded-[2.5rem] border-white/5 relative overflow-hidden group hover:bg-white/[0.03] transition-all">
                            <div className="absolute top-0 right-0 p-8">
                              <Badge className={`${node.priority === 'P0' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'} border-none font-black`}>
                                {node.priority}
                              </Badge>
                            </div>
                            <div className="flex gap-8">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent shrink-0">
                                <Code2 className="w-6 h-6" />
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xl font-bold text-white">{node.topic}</h4>
                                <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {node.estimatedTime}</span>
                                  <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3" /> {node.expectedImpact}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="prep" className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-6">Technical Nodes (10)</h3>
                        <div className="space-y-4">
                          {auditResult.interviewPreparation.technicalQuestions.map((q, i) => (
                            <div key={i} className="p-4 glass rounded-xl border-white/5 text-xs font-light text-white/70 leading-relaxed flex gap-3">
                              <span className="text-accent font-bold">{i+1}.</span> {q}
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-400 mb-6">Simulation Scenarios (5)</h3>
                        <div className="space-y-4">
                          {auditResult.interviewPreparation.scenarioQuestions.map((q, i) => (
                            <div key={i} className="p-4 glass rounded-xl border-white/5 text-xs font-light text-white/70 leading-relaxed flex gap-3">
                              <span className="text-purple-400 font-bold">{i+1}.</span> {q}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
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

