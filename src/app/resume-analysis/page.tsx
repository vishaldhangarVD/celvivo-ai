"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  BrainCircuit, 
  Zap, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  BarChart3, 
  TrendingUp, 
  ChevronRight,
  Download,
  RotateCcw,
  ShieldCheck,
  Target
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);
  const analysis = journey?.resumeAnalysis;

  const handleDownloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Nexvoro AI Resume Audit: ${analysis.candidateIdentity.name}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Role Match: ${analysis.roleMatch.percentage}% for ${journey.role}`, 20, 30);
    doc.text(`ATS Index: ${analysis.atsScore}%`, 20, 40);
    doc.text("Recruiter Verdict:", 20, 60);
    doc.text(analysis.finalVerdict, 20, 70, { maxWidth: 170 });
    doc.save(`Nexvoro_Audit_${analysis.candidateIdentity.name.replace(/\s+/g, '_')}.pdf`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  if (journeyLoading) return <div className="h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  if (!analysis) {
    return (
      <div className="h-screen bg-[#050816] flex flex-col items-center justify-center gap-6">
        <Navbar />
        <AlertTriangle className="w-16 h-16 text-white/20" />
        <h2 className="text-2xl font-bold">Analysis Data Missing</h2>
        <Button onClick={() => router.push('/resume-upload')} className="btn-premium px-8">Return to Upload</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-x-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="flex-1 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Simulation Node 02: Audit</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">{journey.role}<br /><span className="text-gradient-purple">Intelligence.</span></h1>
            </div>
            <div className="flex gap-4">
               <Button onClick={handleDownloadPDF} variant="outline" className="h-14 px-8 glass border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                 <Download className="w-4 h-4 mr-2" /> PDF Report
               </Button>
               <Button onClick={() => router.push('/aptitude-test')} className="h-14 px-10 btn-premium rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl">
                 Continue to Aptitude <ChevronRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass rounded-[30px] border-white/5 p-10 flex flex-col items-center justify-center bg-white/[0.01] h-[340px]">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <motion.circle 
                    cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray="502.4"
                    initial={{ strokeDashoffset: 502.4 }}
                    animate={{ strokeDashoffset: 502.4 - (502.4 * analysis.overallScore) / 100 }}
                    transition={{ duration: 2 }}
                    className={getScoreColor(analysis.overallScore)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-6xl font-black", getScoreColor(analysis.overallScore))}>{analysis.overallScore}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Quality Index</span>
                </div>
              </div>
            </Card>

            <Card className="glass rounded-[30px] border-white/5 p-10 flex flex-col items-center justify-center bg-white/[0.01] h-[340px]">
               <div className="text-center space-y-6">
                  <div className="text-7xl font-black text-accent tabular-nums">{analysis.atsScore}%</div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">ATS Compatibility</p>
                    <p className="text-xs text-muted-foreground font-light">Industry standard parsing match.</p>
                  </div>
                  <Badge className="bg-accent/10 text-accent border-accent/20 px-6 py-2 rounded-full text-[10px] font-black uppercase">
                    {analysis.atsScore >= 70 ? "OPTIMIZED" : "CALIBRATION REQUIRED"}
                  </Badge>
               </div>
            </Card>

            <Card className="glass rounded-[30px] border-white/5 p-10 flex flex-col justify-between bg-white/[0.01] h-[340px]">
               <div className="space-y-2">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2"><Target className="w-3 h-3" /> Role Match</h3>
                 <p className="text-2xl font-bold text-white">{journey.role}</p>
               </div>
               <div className="text-center py-6">
                 <div className="text-6xl font-black text-gradient-purple">{analysis.roleMatch.percentage}%</div>
               </div>
               <div className={cn("p-4 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest", analysis.roleMatch.percentage >= 80 ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400")}>
                 {analysis.roleMatch.recommendation}
               </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <Card className="glass rounded-[30px] border-white/5 p-10 bg-white/[0.01] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="w-32 h-32 text-accent" /></div>
                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-6 flex items-center gap-3">
                  <Cpu className="w-5 h-5" /> Executive Summary
                </h3>
                <p className="text-xl font-light leading-relaxed text-white/90 italic">"{analysis.summary}"</p>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                 <Card className="glass rounded-[30px] border-white/5 p-8 bg-white/[0.01] space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400 flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> Strategic Strengths</h3>
                   <div className="space-y-4">
                     {analysis.strengths.map((s, i) => (
                       <div key={i} className="flex gap-4 p-4 glass rounded-2xl border-white/5">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                         <p className="text-xs font-light text-white/70">{s}</p>
                       </div>
                     ))}
                   </div>
                 </Card>

                 <Card className="glass rounded-[30px] border-white/5 p-8 bg-white/[0.01] space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-3"><XCircle className="w-4 h-4" /> Missing Nodes</h3>
                   <div className="flex flex-wrap gap-2">
                     {analysis.missingSkills.map((s, i) => (
                       <Badge key={i} variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase">{s}</Badge>
                     ))}
                   </div>
                 </Card>
              </div>

              <Card className="glass rounded-[30px] border-white/5 p-10 bg-white/[0.01] space-y-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-3"><TrendingUp className="w-4 h-4 text-accent" /> Sectional Performance Audit</h3>
                <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                  {Object.entries(analysis.sectionScores).map(([name, score], i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">{name}</span>
                        <span className={cn("text-xs font-bold", getScoreColor(score as number))}>{score}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className={cn("h-full bg-current", getScoreColor(score as number))} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <Card className="premium-card bg-accent/[0.02] border-accent/20 p-8 space-y-8 h-full">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-accent" /> Final Verdict
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Hiring Manager Decision Node</p>
                  </div>
                  <div className="glass bg-white/[0.02] border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <p className="text-sm font-light leading-relaxed text-white/80 relative z-10 italic">"{analysis.finalVerdict}"</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Improvement Directives</p>
                    <div className="space-y-3">
                      {analysis.improvementSuggestions.slice(0, 3).map((s, i) => (
                        <div key={i} className="p-4 glass rounded-2xl border-white/5 flex gap-4">
                          <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-1" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-tight">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/5">
                    <Button onClick={() => router.push('/aptitude-test')} className="w-full h-16 btn-premium rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                      Enter Arena <ChevronRight className="ml-3 w-4 h-4" />
                    </Button>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}