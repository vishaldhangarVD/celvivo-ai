"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  Download,
  Award,
  ChevronRight,
  Target,
  MessageSquare,
  CircleAlert,
  CircleCheck,
  Cpu,
  LayoutDashboard,
  Loader2,
  Home,
  Layers,
  BrainCircuit,
  Star
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function FinalReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const docId = params.id as string;
  const [isExporting, setIsExporting] = useState(false);

  const interviewRef = useMemo(() => {
    if (!db || !user?.uid || !docId) return null;
    return doc(db, 'users', user.uid, 'interviews', docId);
  }, [db, user?.uid, docId]);
  
  const { data: interviewDoc, loading: docLoading } = useDoc(interviewRef);

  const feedback = (interviewDoc as any)?.feedback;

  const handleExport = async () => {
    if (isExporting || !interviewDoc || !feedback) return;
    setIsExporting(true);
    try {
      await generateCertificatePDF({ 
        userName: user?.displayName || 'Elite Candidate', 
        role: (interviewDoc as any).role, 
        score: feedback.overallScore, 
        date: new Date().toLocaleDateString(),
        certId: interviewDoc.id?.substring(0, 20).toUpperCase()
      });
      toast({ title: "Report Exported", description: "Your PDF dossier is ready." });
    } catch (e) {
      toast({ variant: "destructive", title: "Synthesis Error" });
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-accent";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const formatScore = (score: any) => {
    if (score === undefined || score === null) return "N/A";
    return `${score}%`;
  };

  if (docLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  if (!interviewDoc || !feedback) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816]">
        <CircleAlert className="w-16 h-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-white">Result Data Not Found</h2>
        <Link href="/dashboard" className="mt-8">
          <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const interviewMetrics = feedback.virtualInterviewResult || {};
  const aiFeedback = feedback.aiFeedback || {};
  const learningPlan = feedback.learningPlan || {};
  const skillGap = feedback.skillGap || {};

  const filteredMetrics = [
    { label: "Technical Knowledge", score: interviewMetrics.technicalKnowledge, icon: Cpu, color: "text-blue-400" },
    { label: "Communication", score: interviewMetrics.communication, icon: MessageSquare, color: "text-green-400" },
    { label: "Confidence", score: interviewMetrics.confidence, icon: Zap, color: "text-yellow-400" },
    { label: "Problem Solving", score: interviewMetrics.problemSolving, icon: Target, color: "text-purple-400" }
  ].filter(m => typeof m.score === 'number' && m.score > 0);

  const topicsToStudy = learningPlan.topicsToStudy || [];
  const criticalGaps = skillGap.criticalGaps || [];
  const hasGrowthData = topicsToStudy.length > 0 || criticalGaps.length > 0;

  const validSummary = aiFeedback.performanceSummary && 
                      aiFeedback.performanceSummary.trim().length > 0 && 
                      !aiFeedback.performanceSummary.includes("The interview analysis could not be completed");

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-7xl auto space-y-12">
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="premium-card p-12 border-glow-premium relative overflow-hidden">
            {feedback.hiringRecommendation && (
              <div className="absolute top-0 right-0 p-12">
                <Badge className={`${getScoreColor(feedback.overallScore)} border-none bg-white/5 font-black tracking-[0.4em] uppercase text-xs px-8 py-3 rounded-2xl`}>
                  RECOMMENDATION: {feedback.hiringRecommendation.toUpperCase()}
                </Badge>
              </div>
            )}
            
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-4 text-center lg:text-left space-y-6">
                <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Performance Audit</Badge>
                <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">{(interviewDoc as any).role}<br /><span className="text-gradient-purple">Report.</span></h1>
              </div>

              <div className="lg:col-span-8 flex flex-col md:flex-row items-center gap-12 lg:justify-end">
                <div className="text-center">
                  <div className={`text-8xl font-bold tracking-tighter tabular-nums ${getScoreColor(feedback.overallScore)}`}>{formatScore(feedback.overallScore)}</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold mt-2">Overall Index</div>
                </div>
                {feedback.interviewReadiness > 0 && (
                  <>
                    <div className="hidden md:block w-px h-24 bg-white/10" />
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white tabular-nums">{feedback.interviewReadiness}%</div>
                      <div className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mt-2">Readiness</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/20 p-8 text-center space-y-6">
                <Award className="w-10 h-10 text-accent mx-auto" />
                <Button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full h-16 rounded-2xl bg-white text-[#050816] font-bold hover:bg-white/90"
                >
                  {isExporting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Download className="w-5 h-5 mr-3" />} Export PDF Report
                </Button>
              </Card>

              <div className="space-y-4">
                <div className="grid gap-3">
                  <Button onClick={() => router.push('/dashboard')} className="h-16 rounded-2xl btn-premium flex gap-4 uppercase tracking-[0.3em] text-[10px] font-bold">
                    <LayoutDashboard className="w-5 h-5" /> GO TO DASHBOARD
                  </Button>
                  <Button onClick={() => router.push('/')} className="h-16 rounded-2xl glass border-white/10 hover:bg-white/5 justify-start px-8 gap-4">
                    <Home className="w-5 h-5 text-white/40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">HOME</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-12">
              {filteredMetrics.length > 0 && (
                <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-10 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-accent" /> Neural Capability Matrix
                  </h3>
                  <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
                    {filteredMetrics.map((m, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
                            <m.icon className={`w-4 h-4 ${m.color}`} /> {m.label}
                          </span>
                          <span className="text-xl font-bold">{m.score}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${m.score || 0}%` }} 
                            className={`h-full bg-current ${m.color}`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {aiFeedback.strongSkills && aiFeedback.strongSkills.length > 0 && (
                  <Card className="glass p-8 rounded-[2.5rem] border-accent/10 space-y-6">
                    <h3 className="text-accent text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                      <CircleCheck className="w-6 h-6" /> Strategic Strengths
                    </h3>
                    <div className="space-y-4">
                      {aiFeedback.strongSkills.map((s: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm font-light text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /> {s}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {aiFeedback.weakSkills && aiFeedback.weakSkills.length > 0 && (
                  <Card className="glass p-8 rounded-[2.5rem] border-red-500/10 space-y-6">
                    <h3 className="text-red-400 text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                      <CircleAlert className="w-6 h-6" /> Delta Gaps
                    </h3>
                    <div className="space-y-4">
                      {aiFeedback.weakSkills.map((w: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm font-light text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /> {w}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {hasGrowthData && (
                <Card className="premium-card bg-accent/[0.02] border-accent/20 p-10 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="text-2xl font-bold tracking-tight">Growth Architecture</h3>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">AI-Generated Remediation Strategy</p>
                      </div>
                      <Link href={`/roadmap/personalized/${docId}`}>
                         <Button className="h-14 px-8 btn-premium text-[10px] font-bold uppercase tracking-widest gap-3">
                            Launch Roadmap <ChevronRight className="w-4 h-4" />
                         </Button>
                      </Link>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      {topicsToStudy.length > 0 && (
                        <div className="p-6 glass rounded-2xl border-white/5 space-y-4">
                           <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                              <Layers className="w-4 h-4 text-purple-400" /> Topics to Study
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {topicsToStudy.map((topic: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-[8px] border-white/10 uppercase py-1">{topic}</Badge>
                              ))}
                           </div>
                        </div>
                      )}
                      {criticalGaps.length > 0 && (
                        <div className="p-6 glass rounded-2xl border-white/5 space-y-4">
                           <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                              <BrainCircuit className="w-4 h-4 text-accent" /> Skill Gaps
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {criticalGaps.map((gap: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-[8px] border-red-500/20 text-red-400 uppercase py-1">{gap}</Badge>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                </Card>
              )}

              {validSummary && (
                <Card className="glass p-10 rounded-[30px] border-white/5 bg-white/[0.01]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-6 flex items-center gap-2">
                    <Star className="w-4 h-4" /> AI Auditor Executive Summary
                  </h3>
                  <p className="text-lg font-light leading-relaxed text-white/80 italic">
                    "{aiFeedback.performanceSummary}"
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}