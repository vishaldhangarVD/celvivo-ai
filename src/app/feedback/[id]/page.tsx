"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  BrainCircuit, 
  MessageSquare, 
  Zap,
  TrendingUp,
  Map,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Activity,
  Award,
  Loader2,
  FileCheck,
  Cpu,
  BarChart3
} from 'lucide-react';
import { generateInterviewFeedback, type InterviewFeedbackOutput } from '@/ai/flows/ai-interview-feedback';
import { generateLearningRoadmap, type LearningRoadmapOutput } from '@/ai/flows/ai-learning-roadmap';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function FeedbackReport() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const docId = params.id as string;
  
  const interviewRef = useMemo(() => {
    if (!db || !user?.uid || !docId || docId === 'last') return null;
    return doc(db, 'users', user.uid, 'interviews', docId);
  }, [db, user?.uid, docId]);
  
  const { data: interviewDoc, loading: docLoading } = useDoc(interviewRef);
  
  const [feedback, setFeedback] = useState<InterviewFeedbackOutput | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmapOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Analyzing Responses...",
    "Calculating Scores...",
    "Generating Report..."
  ];

  const loadingIcons = [
    BrainCircuit,
    BarChart3,
    Activity
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (docLoading || isProcessing) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [docLoading, isProcessing]);

  useEffect(() => {
    const processData = async () => {
      let historyData = [];
      let role = searchParams.get('role') || 'Elite Engineer';
      let exp = searchParams.get('exp') || 'Senior';

      if (docId !== 'last' && interviewDoc) {
        historyData = interviewDoc.history || [];
        role = interviewDoc.role;
        exp = interviewDoc.experienceLevel;
        
        if (interviewDoc.feedback && interviewDoc.overallScore > 0) {
          setFeedback(interviewDoc.feedback);
          setRoadmap(interviewDoc.roadmap || null);
          return;
        }
      } else if (docId === 'last') {
        const rawData = searchParams.get('data');
        if (rawData) historyData = JSON.parse(decodeURIComponent(rawData));
      } else {
        return; 
      }

      if (historyData.length === 0 || isProcessing) return;

      setIsProcessing(true);
      try {
        const transcript = historyData.map((h: any) => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
        
        const feedbackResult = await generateInterviewFeedback({
          interviewTranscript: transcript,
          role,
          experienceLevel: exp
        });
        setFeedback(feedbackResult);

        const roadmapResult = await generateLearningRoadmap({
          ...feedbackResult,
          role,
          experienceLevel: exp
        });
        setRoadmap(roadmapResult);

        if (docId !== 'last' && interviewRef) {
          const updateData = {
            feedback: {
              technicalKnowledgeScore: feedbackResult.technicalKnowledgeScore ?? 0,
              communicationScore: feedbackResult.communicationScore ?? 0,
              problemSolvingScore: feedbackResult.problemSolvingScore ?? 0,
              confidenceScore: feedbackResult.confidenceScore ?? 0,
              overallInterviewScore: feedbackResult.overallInterviewScore ?? 0,
              strengths: feedbackResult.strengths ?? [],
              weaknesses: feedbackResult.weaknesses ?? [],
              improvementSuggestions: feedbackResult.improvementSuggestions ?? [],
              jobReadinessScore: feedbackResult.jobReadinessScore ?? 0,
            },
            roadmap: roadmapResult ?? { plans: { thirtyDay: [], sixtyDay: [], ninetyDay: [] }, recommendedProjects: [], interviewPrepTasks: [] },
            overallScore: feedbackResult.overallInterviewScore ?? 0,
            technicalScore: feedbackResult.technicalKnowledgeScore ?? 0,
            communicationScore: feedbackResult.communicationScore ?? 0,
            confidenceScore: feedbackResult.confidenceScore ?? 0,
            strengths: feedbackResult.strengths ?? [],
            weaknesses: feedbackResult.weaknesses ?? [],
          };

          updateDoc(interviewRef, updateData).catch(async (err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: interviewRef.path,
              operation: 'update',
              requestResourceData: { overallScore: feedbackResult.overallInterviewScore }
            }));
          });

          if (user?.uid && db) {
            const userRef = doc(db, 'users', user.uid);
            updateDoc(userRef, {
              jobReadinessScore: Math.round(feedbackResult.jobReadinessScore ?? 0)
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    };

    if (!docLoading) {
      processData();
    }
  }, [docId, interviewDoc, docLoading, searchParams, user?.uid, db, interviewRef]);

  const handleDownloadCert = () => {
    if (!user || !feedback) return;
    try {
      generateCertificatePDF({
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        role: interviewDoc?.role || 'Engineer',
        score: feedback.overallInterviewScore,
        date: new Date().toLocaleDateString()
      });
      toast({ title: "Credential Exported", description: "Certificate downloaded successfully." });
    } catch (e) {
      console.error(e);
    }
  };

  if (docLoading || isProcessing) {
    const CurrentIcon = loadingIcons[loadingStep];
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-12">
        <div className="particles-bg" />
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 rounded-full border-2 border-accent/10 border-t-accent shadow-[0_0_100px_rgba(34,211,238,0.15)] flex items-center justify-center"
          >
            <div className="w-40 h-48 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingStep}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.5 }}
                >
                  <CurrentIcon className="w-16 h-16 text-accent" />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          <div className="absolute -inset-4 border border-white/5 rounded-full animate-pulse"></div>
        </div>

        <div className="text-center space-y-6">
          <div className="h-10">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={loadingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-4xl font-bold tracking-tighter text-premium"
              >
                {loadingMessages[loadingStep]}
              </motion.h2>
            </AnimatePresence>
          </div>
          <p className="text-muted-foreground font-light uppercase tracking-[0.4em] text-[10px] animate-pulse">
            Neural Core Processing Simulation Data
          </p>
        </div>

        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[8px] uppercase font-bold tracking-widest text-white/30 px-1">
            <span>Calibrating</span>
            <span>{Math.round(((loadingStep + 1) / 3) * 100)}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  const currentRole = interviewDoc?.role || searchParams.get('role') || 'Elite Engineer';
  const currentExp = interviewDoc?.experienceLevel || searchParams.get('exp') || 'Senior';
  const showCertificate = (feedback?.overallInterviewScore || 0) >= 70;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="premium-card p-16 mb-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
            <div className="text-center lg:text-left z-10">
              <Badge className="bg-accent/20 text-accent mb-6 border-none px-4 py-1 font-bold tracking-widest text-[10px]">VERIFIED PERFORMANCE AUDIT</Badge>
              <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tighter text-premium">{currentRole}</h1>
              <div className="flex items-center gap-6 text-muted-foreground font-light text-xl">
                <span>Simulation Complete</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="text-accent">{currentExp} Grade</span>
                {showCertificate && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                    <Badge className="bg-green-500/20 text-green-400 border-none px-3 py-1 font-bold flex items-center gap-2">
                      <FileCheck className="w-4 h-4" /> Certificate Unlocked
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-12 z-10">
              <div className="text-center">
                <div className="text-7xl font-bold text-gradient-purple mb-2">{feedback?.overallInterviewScore || 0}%</div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold">Efficiency Rating</div>
              </div>
              <div className="w-px h-24 bg-white/10 hidden md:block"></div>
              <div className="text-center">
                <div className="text-7xl font-bold text-accent mb-2">{feedback?.jobReadinessScore || 0}%</div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold">Deployment Ready</div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <Card className="premium-card bg-white/[0.02]">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <Award className="w-8 h-8 text-accent" />
                    Neural Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
                    {[
                      { label: "Technical Logic", score: feedback?.technicalKnowledgeScore, icon: BrainCircuit, color: "text-blue-400" },
                      { label: "Execution Precision", score: feedback?.problemSolvingScore, icon: Target, color: "text-orange-400" },
                      { label: "Strategic Communication", score: feedback?.communicationScore, icon: MessageSquare, color: "text-green-400" },
                      { label: "Operational Presence", score: feedback?.confidenceScore, icon: Zap, color: "text-yellow-400" }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white/70">
                            <metric.icon className={`w-5 h-5 ${metric.color}`} />
                            {metric.label}
                          </span>
                          <span className="text-2xl font-bold tabular-nums">{metric.score || 0}%</span>
                        </div>
                        <Progress value={metric.score || 0} className="h-2 bg-white/5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-12">
                <Card className="glass p-10 rounded-[3rem] border-green-500/10 bg-green-500/[0.02]">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-green-400 text-xl font-bold flex items-center gap-3">
                      <ChevronUp className="w-6 h-6" /> Primary Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    {feedback?.strengths?.map((s, i) => (
                      <div key={i} className="flex gap-4 text-base font-light text-white/80 leading-relaxed">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 shrink-0"></div>
                        <span>{s}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass p-10 rounded-[3rem] border-red-500/10 bg-red-500/[0.02]">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="text-red-400 text-xl font-bold flex items-center gap-3">
                      <ChevronDown className="w-6 h-6" /> Delta Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    {feedback?.weaknesses?.map((w, i) => (
                      <div key={i} className="flex gap-4 text-base font-light text-white/80 leading-relaxed">
                        <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0"></div>
                        <span>{w}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="premium-card bg-white/[0.01]">
                <CardHeader className="p-10 border-b border-white/5">
                  <CardTitle className="text-3xl font-bold flex items-center gap-4">
                    <Map className="w-10 h-10 text-accent" />
                    Growth Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-12 space-y-16">
                  <div>
                    <h4 className="text-xs uppercase tracking-[0.4em] font-bold text-muted-foreground mb-8">Critical Milestones</h4>
                    <div className="space-y-6">
                      {roadmap?.plans?.thirtyDay?.map((module, i) => (
                        <div key={i} className="flex gap-8 items-start p-8 glass rounded-[2.5rem] border-white/5 hover:border-accent/20 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center font-bold text-accent shrink-0">0{i + 1}</div>
                          <div className="space-y-2">
                            <h5 className="text-xl font-bold">{module.title}</h5>
                            <p className="text-lg leading-relaxed font-light">{module.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-24">
              {showCertificate && (
                <Card className="premium-card bg-accent/5 border-accent/20 p-8 shadow-[0_0_50px_rgba(34,211,238,0.15)]">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                      <Trophy className="w-10 h-10 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Elite Performance</h3>
                      <p className="text-sm text-muted-foreground font-light mt-2">You've unlocked a verified Nexvoro AI Mastery Certificate.</p>
                    </div>
                    <Button 
                      onClick={handleDownloadCert}
                      className="w-full h-14 rounded-2xl bg-white text-black font-bold hover:bg-white/90 shadow-xl"
                    >
                      <Download className="w-5 h-5 mr-2" /> Download Credential
                    </Button>
                    <Link href="/certificates" className="block">
                      <Button variant="ghost" className="w-full h-12 text-[10px] uppercase font-bold tracking-widest text-accent hover:bg-accent/10">
                        View All Credentials
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}

              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Zap className="w-6 h-6 text-accent" />
                    Expert Directives
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {feedback?.improvementSuggestions?.map((tip, i) => (
                    <div key={i} className="p-6 glass rounded-[2rem] border-white/5 text-base font-light leading-relaxed">
                      {tip}
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleDownloadCert}
                      disabled={!showCertificate}
                      className="h-14 rounded-2xl bg-white text-black font-bold hover:bg-white/90"
                    >
                      <Download className="w-5 h-5 mr-2" /> PDF
                    </Button>
                    <Button variant="outline" className="h-14 rounded-2xl glass border-white/10 font-bold">
                      <Share2 className="w-5 h-5 mr-2" /> Share
                    </Button>
                  </div>
                  <Link href="/certificates">
                    <Button variant="ghost" className="w-full h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
                      Access Credential Vault
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
