
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
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
  Loader2
} from 'lucide-react';
import { generateInterviewFeedback, type InterviewFeedbackOutput } from '@/ai/flows/ai-interview-feedback';
import { generateLearningRoadmap, type LearningRoadmapOutput } from '@/ai/flows/ai-learning-roadmap';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function FeedbackReport() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  
  const docId = params.id as string;
  
  const interviewRef = useMemo(() => {
    if (!db || !user?.uid || !docId || docId === 'last') return null;
    return doc(db, 'users', user.uid, 'interviews', docId);
  }, [db, user?.uid, docId]);
  
  const { data: interviewDoc, loading: docLoading } = useDoc(interviewRef);
  
  const [feedback, setFeedback] = useState<InterviewFeedbackOutput | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmapOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processData = async () => {
      // Prioritize data from Firestore, fall back to URL params if it's the "last" simulated session
      let historyData = [];
      let role = searchParams.get('role') || 'Elite Engineer';
      let exp = searchParams.get('exp') || 'Senior';

      if (docId !== 'last' && interviewDoc) {
        historyData = interviewDoc.history || [];
        role = interviewDoc.role;
        exp = interviewDoc.experienceLevel;
        
        // If feedback is already in the doc, don't re-generate
        if (interviewDoc.feedback && interviewDoc.overallScore > 0) {
          setFeedback(interviewDoc.feedback);
          setRoadmap(interviewDoc.roadmap || null);
          return;
        }
      } else if (docId === 'last') {
        const rawData = searchParams.get('data');
        if (rawData) historyData = JSON.parse(decodeURIComponent(rawData));
      } else {
        return; // Wait for doc to load
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

        // PERSIST the feedback back to Firestore for the user's history
        if (docId !== 'last' && interviewRef) {
          updateDoc(interviewRef, {
            feedback: feedbackResult,
            roadmap: roadmapResult,
            overallScore: feedbackResult.overallInterviewScore,
            technicalScore: feedbackResult.technicalKnowledgeScore,
            communicationScore: feedbackResult.communicationScore,
            confidenceScore: feedbackResult.confidenceScore,
            strengths: feedbackResult.strengths,
            weaknesses: feedbackResult.weaknesses,
          }).catch(async (err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: interviewRef.path,
              operation: 'update',
              requestResourceData: { overallScore: feedbackResult.overallInterviewScore }
            }));
          });

          // Also update the global readiness in user profile
          if (user?.uid && db) {
            const userRef = doc(db, 'users', user.uid);
            updateDoc(userRef, {
              jobReadinessScore: Math.round(feedbackResult.jobReadinessScore)
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

  if (docLoading || isProcessing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816] space-y-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-accent/10 border-t-accent animate-spin shadow-[0_0_50px_rgba(34,211,238,0.2)]"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-accent animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-3 tracking-tighter">Synchronising Intelligence</h2>
          <p className="text-muted-foreground font-light uppercase tracking-[0.3em] text-xs">Generating Neural Performance Audit...</p>
        </div>
      </div>
    );
  }

  const currentRole = interviewDoc?.role || searchParams.get('role') || 'Elite Engineer';
  const currentExp = interviewDoc?.experienceLevel || searchParams.get('exp') || 'Senior';

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Executive Summary Header */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="premium-card p-16 mb-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
            <div className="text-center lg:text-left z-10">
              <Badge className="bg-accent/20 text-accent mb-6 border-none px-4 py-1 font-bold tracking-widest text-[10px]">VERIFIED PERFORMANCE AUDIT</Badge>
              <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tighter text-premium">{currentRole}</h1>
              <div className="flex items-center gap-4 text-muted-foreground font-light text-xl">
                <span>Simulation Complete</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="text-accent">{currentExp} Grade</span>
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
            {/* Left Column: Deep Metrics */}
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

              {/* Cognitive Analysis */}
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

              {/* Growth Architecture */}
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
                      {roadmap?.careerImprovementPlan?.map((step, i) => (
                        <div key={i} className="flex gap-8 items-start p-8 glass rounded-[2.5rem] border-white/5 hover:border-accent/20 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center font-bold text-accent shrink-0">0{i + 1}</div>
                          <p className="text-lg leading-relaxed font-light">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-[0.4em] font-bold text-muted-foreground mb-8">Selected Resources</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {roadmap?.learningResources?.map((res, i) => (
                        <div key={i} className="glass p-8 rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all flex flex-col justify-between h-full">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <Badge variant="outline" className="text-[10px] text-accent border-accent/30 tracking-widest uppercase font-bold">{res.type}</Badge>
                              <BookOpen className="w-6 h-6 text-accent/50" />
                            </div>
                            <h5 className="text-xl font-bold">{res.name}</h5>
                            <p className="text-sm text-muted-foreground font-light leading-relaxed">{res.description}</p>
                          </div>
                          <Button variant="link" className="p-0 h-auto text-accent text-sm mt-8 justify-start group">
                            Access Module <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Strategic Tools */}
            <div className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-24">
              <Card className="premium-card bg-accent/5 border-accent/10">
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
                    <Button className="h-14 rounded-2xl bg-white text-black font-bold hover:bg-white/90">
                      <Download className="w-5 h-5 mr-2" /> Export
                    </Button>
                    <Button variant="outline" className="h-14 rounded-2xl glass border-white/10 font-bold">
                      <Share2 className="w-5 h-5 mr-2" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass p-10 rounded-[3rem] border-white/5">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-xl font-bold">Missing Skill Delta</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-wrap gap-3">
                  {roadmap?.missingSkills?.map((skill, i) => (
                    <Badge key={i} className="bg-white/5 text-white border-white/10 px-5 py-2 rounded-xl text-sm font-medium">
                      {skill}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
