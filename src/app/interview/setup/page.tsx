
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  Upload, 
  Trash2, 
  FileText, 
  Zap, 
  Loader2, 
  ShieldCheck,
  Command,
  Activity,
  Award
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { canStartFeature, FeatureType } from '@/lib/subscription';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Fresher");
  const [loadingTarget, setLoadingTarget] = useState<'aptitude' | 'interview' | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Fetch user profile for credit/subscription check
  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const handleProceed = async (targetPath: 'aptitude' | 'interview') => {
    if (!db || !user?.uid || !resumeBase64) {
      toast({ variant: "destructive", title: "Setup Incomplete", description: "Please upload your resume to begin." });
      return;
    }

    // ACCESS GATE CHECK
    const feature: FeatureType = targetPath === 'aptitude' ? 'aptitude' : 'interview';
    if (!canStartFeature(profile as any, feature)) {
      toast({ 
        title: "Insufficient Balance", 
        description: "You don't have enough credits or an active subscription for this feature." 
      });
      router.push('/pricing');
      return;
    }

    setLoadingTarget(targetPath);
    const sessionId = Math.random().toString(36).substring(7);

    try {
      const analysisResult = await analyzeResume({
        resumeDataUri: resumeBase64,
        targetRole: role
      });

      const finalStage = targetPath === 'aptitude' ? INTERVIEW_STAGES.APTITUDE : INTERVIEW_STAGES.HR_INTERVIEW;
      const step = targetPath === 'aptitude' ? 4 : 8;

      await setDoc(journeyRef!, {
        sessionId,
        role,
        experience,
        company,
        resumeName: file?.name || "resume.pdf",
        resumeBase64: resumeBase64,
        resumeAnalysis: analysisResult,
        currentStage: finalStage,
        step,
        aptitudeStatus: "not_started",
        aptitudeReport: null,
        aptitudeQuestions: null,
        aptitudeAnswers: null,
        codingReport: null,
        codingUnlocked: false,
        codingQuestions: null,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });

      if (targetPath === 'aptitude') {
        router.push(STAGE_ROUTES.APTITUDE);
      } else {
        router.push(`${STAGE_ROUTES.HR_INTERVIEW}${sessionId}`);
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "System Error", description: "Failed to persist identity node." });
      setLoadingTarget(null);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col p-10 pt-24">
      <div className="particles-bg" />
      <NavigationControls />
      
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <header className="space-y-2">
          <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">
            Simulation Calibration
          </Badge>
          <h1 className="text-5xl font-bold tracking-tighter text-premium">
            Enter the Arena.
          </h1>
          <p className="text-sm text-muted-foreground font-light max-w-lg">
            Configure your target deployment and upload your blueprint to initialize the neural simulation.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">Target Company</Label>
              <input 
                value={company} 
                onChange={e => setCompany(e.target.value)}
                className="w-full h-12 glass rounded-xl px-5 text-sm font-bold text-white transition-all border border-white/5 focus:border-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">Job Role</Label>
              <input 
                value={role} 
                onChange={e => setRole(e.target.value)}
                className="w-full h-12 glass rounded-xl px-5 text-sm font-bold text-white transition-all border border-white/5 focus:border-accent outline-none"
              />
            </div>
          </div>

          <Card 
            onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
            className="premium-card bg-white/[0.01] border-white/5 p-8 flex flex-col items-center justify-center text-center cursor-pointer group transition-all h-[240px] relative overflow-hidden"
          >
            <input 
              type="file" 
              id="resume-input" 
              className="hidden" 
              accept=".pdf" 
              onChange={async e => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  const reader = new FileReader();
                  reader.onload = () => setResumeBase64(reader.result as string);
                  reader.readAsDataURL(f);
                }
              }} 
            />
            {file ? (
              <div className="space-y-4">
                <FileText className="w-12 h-12 mx-auto text-accent" />
                <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setResumeBase64(null); }} className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-red-400">Remove</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <p className="text-xs uppercase font-bold tracking-widest">Upload Resume PDF</p>
              </div>
            )}
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-12">
          <Card className="glass border-white/10 bg-white/[0.01] p-8 rounded-[2rem] flex flex-col justify-between hover:border-accent/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Command className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest">Aptitude Round</h4>
                <p className="text-[10px] text-white/30 leading-tight font-medium mt-1">Logical intelligence audit node.</p>
              </div>
            </div>
            <Button 
              onClick={() => handleProceed('aptitude')}
              disabled={loadingTarget !== null || !resumeBase64}
              className="w-full h-12 mt-8 btn-premium text-[10px] font-black uppercase tracking-widest"
            >
              {loadingTarget === 'aptitude' ? <Loader2 className="w-4 h-4 animate-spin" /> : "START APTITUDE"}
            </Button>
          </Card>

          <Card className="glass border-white/10 bg-white/[0.01] p-8 rounded-[2rem] flex flex-col justify-between hover:border-purple-500/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest">Interview Round</h4>
                <p className="text-[10px] text-white/30 leading-tight font-medium mt-1">AI Executive simulation protocol.</p>
              </div>
            </div>
            <Button 
              onClick={() => handleProceed('interview')}
              disabled={loadingTarget !== null || !resumeBase64}
              className="w-full h-12 mt-8 btn-premium bg-gradient-to-r from-purple-600 to-blue-600 text-[10px] font-black uppercase tracking-widest"
            >
              {loadingTarget === 'interview' ? <Loader2 className="w-4 h-4 animate-spin" /> : "START INTERVIEW"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

const isVerifying = false;
