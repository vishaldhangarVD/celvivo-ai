
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BrainCircuit, 
  Zap,
  Map,
  Download,
  Award,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Code2,
  Trophy,
  History,
  Target,
  Activity,
  MessageSquare,
  CircleAlert,
  CircleCheck,
  Lightbulb,
  Cpu,
  RefreshCcw,
  LayoutDashboard,
  Loader2,
  Plus,
  Layers,
  XCircle
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { generateCertificatePDF } from '@/lib/certificate-generator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { canStartInterviewJourney } from '@/lib/subscription';

export default function FinalReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const docId = params.id as string;
  const [hasConsumed, setHasConsumed] = useState(false);

  const interviewRef = useMemo(() => {
    if (!db || !user?.uid || !docId) return null;
    return doc(db, 'users', user.uid, 'interviews', docId);
  }, [db, user?.uid, docId]);
  
  const { data: interviewDoc, loading: docLoading } = useDoc(interviewRef);

  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  const feedback = (interviewDoc as any)?.feedback;

  // Subscription Consumption Intelligence
  useEffect(() => {
    const consumeFreeJourney = async () => {
      // Guard: Ensure user, profile, and the completed interview dossier are loaded
      if (!user || !db || !profile || !interviewDoc || hasConsumed) return;

      // Protocol: If the operator is on a Free Plan and the journey has not been marked as used
      if (profile.plan === 'free' && !profile.freeJourneyUsed) {
        setHasConsumed(true); // Prevent concurrent update cycles

        const userRef = doc(db, 'users', user.uid);
        
        console.log("FREE JOURNEY CONSUMPTION UPDATE", {
          uid: user.uid,
          plan: profile.plan,
          freeJourneyUsed: true
        });

        try {
          // 1. Persist the usage flag to the user's primary profile
          await updateDoc(userRef, { 
            freeJourneyUsed: true,
            updatedAt: serverTimestamp() 
          });

          // 2. Post-Update Verification
          const verifySnap = await getDoc(userRef);
          const verifiedData = verifySnap.data();
          console.log("VERIFIED SUBSCRIPTION:", verifiedData);
          
          toast({
            title: "Journey Logged",
            description: "Your free interview session has been archived."
          });
        } catch (error: any) {
          console.error("CRITICAL: FAILED TO PERSIST JOURNEY CONSUMPTION:", error);
          setHasConsumed(false); // Allow retry if the network node failed
        }
      }
    };

    consumeFreeJourney();

    // Step Sync for Journey active state
    if (user && db && docId) {
      setDoc(doc(db, 'users', user.uid, 'journey', 'active'), {
        step: 12,
        lastReportId: docId
      }, { merge: true }).catch(e => console.warn("Journey step sync fault:", e));
    }
  }, [user, db, profile, interviewDoc, hasConsumed, docId, toast]);

  const handleStartNew = async () => {
    if (!user || !db || !profile) return;
    
    // Subscription Protocol Guard
    if (!canStartInterviewJourney(profile)) {
      toast({
        title: "Protocol Complete",
        description: "Your free interview journey has concluded. Upgrade to continue.",
      });
      router.push('/pricing');
      return;
    }

    await deleteDoc(doc(db, 'users', user.uid, 'journey', 'active'));
    router.push('/interview');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-accent";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  if (docLoading) return <div className="h-screen flex items-center justify-center bg-[#050816]"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  if (!interviewDoc || !feedback) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050816]">
        <CircleAlert className="w-16 h-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-white">Master Dossier Not Found</h2>
        <Link href="/dashboard" className="mt-8">
          <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Return to command</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-7xl auto space-y-12">
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="premium-card p-12 border-glow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12">
              <Badge className={`${getScoreColor(feedback.overallScore)} border-none bg-white/5 font-black tracking-[0.4em] uppercase text-xs px-8 py-3 rounded-2xl`}>
                STATUS: {feedback.hiringRecommendation.toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-4 text-center lg:text-left space-y-6">
                <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Final Performance Audit</Badge>
                <h1 className="text-6xl font-bold tracking-tighter text-premium leading-tight">{(interviewDoc as any).role}<br /><span className="text-gradient-purple">Dossier.</span></h1>
              </div>

              <div className="lg:col-span-8 flex flex-col md:flex-row items-center gap-12 lg:justify-end">
                <div className="text-center">
                  <div className={`text-8xl font-bold tracking-tighter tabular-nums ${getScoreColor(feedback.overallScore)}`}>{feedback.overallScore}%</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold mt-2">Overall Index</div>
                </div>
                <div className="hidden md:block w-px h-24 bg-white/10" />
                <div className="text-center">
                  <div className="text-6xl font-bold text-white tabular-nums">{feedback.interviewReadiness}%</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mt-2">Readiness</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              
              <Card className="premium-card bg-accent/5 border-accent/20 p-8 text-center space-y-6">
                <Award className="w-10 h-10 text-accent mx-auto" />
                <Button 
                  onClick={() => generateCertificatePDF({ userName: user?.displayName || 'Elite Candidate', role: (interviewDoc as any).role, score: feedback.overallScore, date: new Date().toLocaleDateString() })}
                  className="w-full h-16 rounded-2xl bg-white text-[#050816] font-bold hover:bg-white/90"
                >
                  <Download className="w-5 h-5 mr-3" /> Export PDF Report
                </Button>
              </Card>

              {/* Aptitude Performance Card */}
              {feedback.aptitudeContext && (
                <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                     <BrainCircuit className="w-4 h-4 text-accent" /> Cognitive Node Audit
                   </h3>
                   <div className="flex items-center justify-between">
                      <div className="text-4xl font-black text-accent tabular-nums">{feedback.aptitudeContext.overallScore || 0}%</div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-white/40">Verified Audit</Badge>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[9px] font-bold uppercase text-white/30">
                         <span>Logic Precision</span>
                         <span className="text-white/60">{feedback.aptitudeContext.overallScore || 0}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${feedback.aptitudeContext.overallScore || 0}%` }} className="h-full bg-accent" />
                      </div>
                   </div>
                </Card>
              )}

              {/* Coding Performance Card */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-6">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                   <Code2 className="w-4 h-4 text-accent" /> Syntax Matrix Audit
                 </h3>
                 <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-accent tabular-nums">{(interviewDoc as any).codingScore || 0}%</div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-white/40">Verified Audit</Badge>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-white/30">
                       <span>Implementation Accuracy</span>
                       <span className="text-white/60">{(interviewDoc as any).codingScore || 0}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${(interviewDoc as any).codingScore || 0}%` }} className="h-full bg-accent" />
                    </div>
                 </div>
              </Card>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 ml-2">Session Directives</h3>
                <div className="grid gap-3">
                  <Button onClick={handleStartNew} className="h-16 rounded-2xl btn-premium flex gap-4 uppercase tracking-[0.3em] text-[10px] font-bold">
                    <Plus className="w-5 h-5" /> Start New Simulation
                  </Button>
                  <Button onClick={() => router.push('/dashboard')} className="h-16 rounded-2xl glass border-white/10 hover:bg-white/5 justify-start px-8 gap-4">
                    <LayoutDashboard className="w-5 h-5 text-white/40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Return to Command</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-12">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
                  {[
                    { label: "Technical Knowledge", score: feedback.virtualInterviewResult.technicalKnowledge, icon: Cpu, color: "text-blue-400" },
                    { label: "Communication", score: feedback.virtualInterviewResult.communication, icon: MessageSquare, color: "text-green-400" },
                    { label: "Confidence", score: feedback.virtualInterviewResult.confidence, icon: Zap, color: "text-yellow-400" },
                    { label: "Problem Solving", score: feedback.virtualInterviewResult.problemSolving, icon: Target, color: "text-purple-400" }
                  ].map((m, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
                          <m.icon className={`w-4 h-4 ${m.color}`} /> {m.label}
                        </span>
                        <span className="text-xl font-bold">{m.score}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.score}%` }} className={`h-full bg-current ${m.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass p-8 rounded-[2.5rem] border-accent/10 space-y-6">
                  <h3 className="text-accent text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                    <CircleCheck className="w-6 h-6" /> Strategic Strengths
                  </h3>
                  <div className="space-y-4">
                    {(feedback.aiFeedback.strongSkills || []).length > 0 ? (
                      feedback.aiFeedback.strongSkills.map((s: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm font-light text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /> {s}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/40 italic">No specific strengths extracted.</p>
                    )}
                  </div>
                </Card>
                <Card className="glass p-8 rounded-[2.5rem] border-red-500/10 space-y-6">
                  <h3 className="text-red-400 text-lg font-bold flex items-center gap-3 uppercase tracking-tighter">
                    <CircleAlert className="w-6 h-6" /> Delta Gaps
                  </h3>
                  <div className="space-y-4">
                    {(feedback.aiFeedback.weakSkills || []).length > 0 ? (
                      feedback.aiFeedback.weakSkills.map((w: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm font-light text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /> {w}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/40 italic">No specific gaps identified.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Career Learning Roadmap Block */}
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
                    <div className="p-6 glass rounded-2xl border-white/5 space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-400" /> Topics to Study
                       </h4>
                       <div className="flex flex-wrap gap-2">
                          {(feedback.learningPlan.topicsToStudy || []).slice(0, 4).map((topic: string, i: number) => (
                             <Badge key={i} variant="outline" className="text-[8px] border-white/10 uppercase py-1">{topic}</Badge>
                          ))}
                       </div>
                    </div>
                    <div className="p-6 glass rounded-2xl border-white/5 space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-accent" /> Skill Gaps
                       </h4>
                       <div className="flex flex-wrap gap-2">
                          {(feedback.skillGap.criticalGaps || []).slice(0, 4).map((gap: string, i: number) => (
                             <Badge key={i} variant="outline" className="text-[8px] border-red-500/20 text-red-400 uppercase py-1">{gap}</Badge>
                          ))}
                       </div>
                    </div>
                 </div>
              </Card>

              {/* AI Performance Summary */}
              <Card className="glass p-10 rounded-[30px] border-white/5 bg-white/[0.01]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">AI Auditor Executive Summary</h3>
                <p className="text-lg font-light leading-relaxed text-white/80 italic">
                  "{feedback.aiFeedback.performanceSummary || "The interview analysis could not be completed."}"
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
