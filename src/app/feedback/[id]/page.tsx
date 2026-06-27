"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, 
  MessageSquare, 
  Zap,
  Map,
  Download,
  Award,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  SearchCheck,
  Code2
} from 'lucide-react';
import { generateInterviewFeedback, type InterviewFeedbackOutput } from '@/ai/flows/ai-interview-feedback';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function FeedbackReport() {
  const params = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const docId = params.id as string;
  const interviewRef = useMemo(() => {
    if (!db || !user?.uid || !docId) return null;
    return doc(db, 'users', user.uid, 'interviews', docId);
  }, [db, user?.uid, docId]);
  
  const { data: interviewDoc, loading: docLoading } = useDoc(interviewRef);

  const resumesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'resumes'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestResumes } = useCollection(resumesQuery);
  
  const [feedback, setFeedback] = useState<InterviewFeedbackOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    const processAudit = async () => {
      if (!interviewDoc || isProcessing || hasAttempted) return;
      
      if (interviewDoc.feedback && interviewDoc.overallScore > 0) {
        setFeedback(interviewDoc.feedback);
        setHasAttempted(true);
        return;
      }

      setIsProcessing(true);
      setHasAttempted(true);
      try {
        const transcript = (interviewDoc.history || []).map((h: any) => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
        
        const resume = latestResumes?.[0];
        const resumeContext = resume ? {
          skills: resume.analysis?.skillAnalysis?.map((s: any) => s.skill) || [],
          projects: resume.analysis?.sections?.projects || [],
          experienceSummary: resume.analysis?.sections?.experience?.[0] || "",
          atsScore: resume.atsScore || 0
        } : undefined;

        const result = await generateInterviewFeedback({
          interviewTranscript: transcript,
          role: interviewDoc.role || 'Software Engineer',
          experienceLevel: interviewDoc.experienceLevel || 'Senior',
          round: interviewDoc.round || 'Technical Round',
          resumeContext
        });
        
        setFeedback(result);

        if (interviewRef) {
          await updateDoc(interviewRef, {
            feedback: result,
            overallScore: result.overallInterviewScore,
            technicalScore: result.technicalKnowledgeScore,
            communicationScore: result.communicationScore,
            confidenceScore: result.confidenceScore,
            hiringRecommendation: result.hiringRecommendation,
          });

          if (user?.uid && db) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              jobReadinessScore: Math.round(result.jobReadinessScore)
            });
          }
        }
      } catch (e) {
        console.error("Audit Synthesis Failure", e);
        toast({ variant: "destructive", title: "Audit Failed", description: "System could not synthesize the final report." });
      } finally {
        setIsProcessing(false);
      }
    };

    if (!docLoading && interviewDoc) processAudit();
  }, [interviewDoc, docLoading, user?.uid, db, interviewRef, toast, isProcessing, hasAttempted, latestResumes]);

  if (docLoading || isProcessing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-8">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="w-32 h-32 rounded-full border-b-2 border-accent shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          <BrainCircuit className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter text-premium">Synthesizing Neural Audit...</h2>
          <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px]">Processing Contextual Intelligence Nodes</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816]">
        <h2 className="text-2xl font-bold text-red-400">Audit Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested simulation vectors could not be retrieved.</p>
        <Link href="/dashboard" className="mt-8">
          <Button variant="outline">Return to Command</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="premium-card p-12 border-glow-premium relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="z-10 text-center md:text-left">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 mb-6 text-[10px] tracking-widest font-bold">EXECUTIVE PERFORMANCE REPORT</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium mb-2">{interviewDoc?.role}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
                <span className="text-accent font-bold uppercase tracking-widest text-xs">{interviewDoc?.experienceLevel} Grade</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <Badge variant="outline" className="border-purple-500/40 text-purple-400 font-bold">{feedback.hiringRecommendation}</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-12 z-10">
              <div className="text-center">
                <div className="text-6xl font-bold text-gradient-purple mb-1">{feedback.overallInterviewScore}%</div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Overall Rating</div>
              </div>
              <div className="w-px h-16 bg-white/10" />
              <div className="text-center">
                <div className="text-6xl font-bold text-accent mb-1">{Math.round(feedback.jobReadinessScore)}%</div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Market Ready</div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <Card className="premium-card bg-white/[0.01]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-accent" /> Node Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-10">
                  {[
                    { label: "Technical Logic", score: feedback.technicalKnowledgeScore, icon: BrainCircuit, color: "text-blue-400" },
                    { label: "Strategic Communication", score: feedback.communicationScore, icon: MessageSquare, color: "text-green-400" },
                    { label: "Operational Presence", score: feedback.confidenceScore, icon: Zap, color: "text-yellow-400" },
                    { label: "Resume Skill Match", score: feedback.resumeSkillMatchScore, icon: FileText, color: "text-purple-400" },
                    { label: "Claim Validation", score: feedback.resumeClaimValidationScore, icon: SearchCheck, color: "text-orange-400" },
                    { label: "Project Knowledge", score: feedback.projectKnowledgeScore, icon: Code2, color: "text-cyan-400" }
                  ].map((m, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                          <m.icon className={`w-4 h-4 ${m.color}`} /> {m.label}
                        </span>
                        <span className="text-xl font-bold">{m.score}%</span>
                      </div>
                      <Progress value={m.score} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass p-8 rounded-[2rem] border-green-500/10 bg-green-500/[0.01]">
                  <h3 className="text-green-400 text-lg font-bold flex items-center gap-2 mb-6">
                    <ChevronUp className="w-5 h-5" /> Core Assets
                  </h3>
                  <div className="space-y-4">
                    {feedback.strengths.map((s, i) => (
                      <div key={i} className="flex gap-3 text-sm font-light text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" /> {s}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="glass p-8 rounded-[2rem] border-red-500/10 bg-red-500/[0.01]">
                  <h3 className="text-red-400 text-lg font-bold flex items-center gap-2 mb-6">
                    <ChevronDown className="w-5 h-5" /> Delta Gaps
                  </h3>
                  <div className="space-y-4">
                    {feedback.weaknesses.map((w, i) => (
                      <div key={i} className="flex gap-3 text-sm font-light text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" /> {w}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="premium-card bg-white/[0.01]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Map className="w-6 h-6 text-accent" /> 30-Day Evolution Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {feedback.improvementPlan.map((plan, i) => (
                    <div key={i} className="p-6 glass rounded-2xl border-white/5 group hover:bg-white/[0.03] transition-all">
                      <div className="flex gap-6">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 font-bold">0{i+1}</div>
                        <div>
                          <h4 className="font-bold mb-1">{plan.title}</h4>
                          <p className="text-sm font-light text-white/50">{plan.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card bg-accent/5 border-accent/20 p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto border border-accent/20">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Credential Vault</h3>
                  <p className="text-xs text-muted-foreground mt-2">Achievement recognized for elite performance (&gt;70%).</p>
                </div>
                <Button 
                  onClick={() => generateCertificatePDF({ 
                    userName: user?.displayName || 'Candidate', 
                    role: interviewDoc?.role || 'Engineer', 
                    score: feedback.overallInterviewScore, 
                    date: new Date().toLocaleDateString() 
                  })}
                  className="w-full h-14 rounded-2xl bg-white text-black font-bold hover:bg-white/90"
                >
                  <Download className="w-4 h-4 mr-2" /> PDF Export
                </Button>
                <Link href="/certificates" className="block text-[10px] uppercase font-bold tracking-widest text-accent hover:opacity-80">View All Credentials</Link>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent" /> Auditor Notes
                </h3>
                <div className="space-y-4">
                  {feedback.improvementSuggestions.map((tip, i) => (
                    <div key={i} className="p-4 glass rounded-xl text-xs font-light text-white/60 border-white/5 italic">
                      &quot;{tip}&quot;
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}