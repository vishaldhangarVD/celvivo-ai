
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Building2, Briefcase, GraduationCap, Upload, Trash2, 
  FileText, Zap, Loader2, ShieldCheck, Command
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { canStartFeature, FeatureType } from '@/lib/subscription';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Fresher");
  const [loadingTarget, setLoadingTarget] = useState<'aptitude' | 'interview' | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { data: profile } = useDoc(useMemo(() => db && user ? doc(db, 'users', user.uid) : null, [db, user]));
  const journeyRef = useMemo(() => db && user ? doc(db, 'users', user.uid, 'journey', 'active') : null, [db, user]);

  const handleProceed = async (targetPath: 'aptitude' | 'interview') => {
    if (!db || !user?.uid || !resumeBase64) {
      return toast({ variant: "destructive", title: "Setup Incomplete", description: "Upload resume to begin." });
    }

    const feature = targetPath === 'aptitude' ? 'aptitude' : 'interview';
    if (!canStartFeature(profile as any, feature)) {
      toast({ title: "Insufficient Balance", description: "Redirecting to pricing..." });
      return router.push('/pricing');
    }

    setLoadingTarget(targetPath);
    const sessionId = Math.random().toString(36).substring(7);

    try {
      const analysisResult = await analyzeResume({ resumeDataUri: resumeBase64, targetRole: role });
      await setDoc(journeyRef!, {
        sessionId, role, experience, company, resumeBase64, resumeAnalysis: analysisResult,
        currentStage: targetPath === 'aptitude' ? INTERVIEW_STAGES.APTITUDE : INTERVIEW_STAGES.HR_INTERVIEW,
        updatedAt: serverTimestamp()
      }, { merge: true });

      router.push(targetPath === 'aptitude' ? STAGE_ROUTES.APTITUDE : `${STAGE_ROUTES.HR_INTERVIEW}${sessionId}`);
    } catch (e) {
      toast({ variant: "destructive", title: "System Error" });
      setLoadingTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col p-10 pt-24">
      <div className="particles-bg" />
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <header className="space-y-2">
          <Badge className="bg-accent/20 text-accent uppercase tracking-widest text-[10px]">Interview Calibration</Badge>
          <h1 className="text-5xl font-bold tracking-tighter">Enter the Arena.</h1>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-white/40 ml-2">Target Company</Label>
              <input value={company} onChange={e => setCompany(e.target.value)} className="w-full h-12 glass rounded-xl px-5 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-white/40 ml-2">Target Role</Label>
              <input value={role} onChange={e => setRole(e.target.value)} className="w-full h-12 glass rounded-xl px-5 text-sm" />
            </div>
          </div>

          <Card onClick={() => document.getElementById('resume')?.click()} className="p-8 border-dashed border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all h-[240px]">
             <input type="file" id="resume" hidden accept=".pdf" onChange={async e => {
               const f = e.target.files?.[0];
               if (f) {
                 setFile(f);
                 const reader = new FileReader();
                 reader.onload = () => setResumeBase64(reader.result as string);
                 reader.readAsDataURL(f);
               }
             }} />
             {file ? <div className="text-center"><FileText className="w-12 h-12 mx-auto text-accent mb-4" /><p className="font-bold">{file.name}</p></div> : <><Upload className="w-10 h-10 text-white/20 mb-4" /><p className="text-xs uppercase font-bold">Upload Resume PDF</p></>}
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-12">
          <Card className="p-8 glass border-white/10 flex flex-col justify-between group hover:border-accent/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Command /></div>
              <div><h4 className="font-bold">Aptitude Round</h4><p className="text-[10px] text-white/30">Logic audit node.</p></div>
            </div>
            <Button onClick={() => handleProceed('aptitude')} disabled={loadingTarget !== null || !resumeBase64} className="mt-8 h-12 btn-premium text-[10px]">
              {loadingTarget === 'aptitude' ? <Loader2 className="animate-spin" /> : "START APTITUDE"}
            </Button>
          </Card>
          <Card className="p-8 glass border-white/10 flex flex-col justify-between group hover:border-purple-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Zap /></div>
              <div><h4 className="font-bold">Interview Round</h4><p className="text-[10px] text-white/30">AI Executive simulation.</p></div>
            </div>
            <Button onClick={() => handleProceed('interview')} disabled={loadingTarget !== null || !resumeBase64} className="mt-8 h-12 btn-premium text-[10px]">
              {loadingTarget === 'interview' ? <Loader2 className="animate-spin" /> : "START INTERVIEW"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
