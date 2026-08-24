"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  Check,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';

export default function ResumeUploadPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      if (selected.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Format Error", description: "Only PDF blueprints are supported." });
        return;
      }

      if (selected.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
        return;
      }

      setFile(selected);
      setIsVerifying(true);
      
      // Simulate validation / local processing
      await new Promise(r => setTimeout(r, 1500));
      
      setIsUploaded(true);
      setIsVerifying(false);
      toast({ title: "Blueprint Detected", description: "Identity file loaded successfully." });
    }
  };

  const handleProceed = async () => {
    if (!file || !user || !db || !journeyRef) return;
    
    try {
      // We convert file to base64 only if we need it here, 
      // but the original flow likely stores it or processes it in the next step.
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      await updateDoc(journeyRef, {
        currentStage: INTERVIEW_STAGES.RESUME_ANALYSIS,
        step: 2,
        resumeName: file.name,
        resumeBase64: base64, // Temporary storage for analysis
        updatedAt: serverTimestamp(),
      });

      router.push(STAGE_ROUTES.RESUME_ANALYSIS);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Protocol Fault", description: "Failed to persist identity node." });
    }
  };

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="flex-1 container mx-auto px-6 flex items-center justify-center pt-16">
        <div className="max-w-3xl w-full">
          <header className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">Stage 01: Registration</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Identity <span className="text-gradient-purple">Upload.</span></h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              Upload your professional blueprint to calibrate the simulation.
            </p>
          </header>

          <Card 
            onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
            className={cn(
              "premium-card bg-white/[0.01] border-white/5 p-16 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 min-h-[400px] relative overflow-hidden",
              isUploaded ? "border-green-500/20 bg-green-500/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
            )}
          >
            <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
            
            {isVerifying ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                  <ShieldCheck className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Verifying Integrity...</p>
              </div>
            ) : !isUploaded ? (
              <div className="space-y-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                  <Upload className="w-12 h-12 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">Select PDF Archive</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop • Max 10MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Blueprint Received</p>
                  <p className="text-2xl font-bold text-white truncate max-w-[400px] mx-auto">{file?.name}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} className="h-12 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent">
                    <RotateCcw className="w-4 h-4 mr-2" /> Replace
                  </Button>
                  <Button onClick={handleProceed} className="h-12 px-10 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl group">
                    Continue <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
