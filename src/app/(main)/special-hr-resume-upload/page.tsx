"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRight,
  RotateCcw,
  Sparkles,
  Cpu,
  Trash2
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

export default function SpecialHRResumeUpload() {
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
      setIsUploaded(true);
      toast({ title: "Blueprint Detected", description: "Identity file loaded successfully." });

      // Auto-proceed to analysis shortly after upload
      setTimeout(() => {
        handleProceedWithFile(selected);
      }, 900);
    }
  };

  const handleProceedWithFile = async (fileToProcess: File) => {
    if (!fileToProcess || !user || !db || !journeyRef) return;
    
    setIsVerifying(true);
    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(fileToProcess);
      });

      // Background Analysis specifically for HR context
      const analysisResult = await analyzeResume({
        resumeDataUri: base64,
        targetRole: "Senior Executive"
      });

      // SAVE TO SEPARATE FIELDS TO PRESERVE ROUND-1 DATA
      await updateDoc(journeyRef, {
        specialHRResumeName: fileToProcess.name,
        specialHRResumeBase64: base64,
        specialHRResumeAnalysis: analysisResult,
        updatedAt: serverTimestamp(),
      });
      
      router.push('/special-hr-interview');
    } catch (e) {
      console.error(e);
      toast({ 
        variant: "destructive", 
        title: "Calibration Failed", 
        description: "Neural engine could not parse dossier. Please ensure the PDF is readable." 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      
      <NavigationControls onHome={() => router.push('/')} />

      <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center pt-16 relative z-10">
        <div className="max-w-4xl w-full">
          <header className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-purple-500/30 mb-4 relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse relative z-10" />
              <span className="text-[9px] font-black tracking-[0.5em] uppercase text-purple-300 relative z-10">Phase 02 Calibration</span>
            </div>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Special HR <span className="text-gradient-purple">Setup.</span></h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
              Upload your career blueprint. Our neural engine will architect a personalized, resume-aware interview session.
            </p>
          </header>

          <Card 
            onClick={() => !isVerifying && !isUploaded && document.getElementById('resume-input')?.click()}
            className={cn(
              "premium-card bg-white/[0.015] border-white/5 p-16 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 min-h-[400px] relative overflow-hidden rounded-[2.5rem]",
              isUploaded 
                ? "border-purple-500/30 bg-purple-500/[0.03] shadow-[0_0_60px_rgba(168,85,247,0.08)]" 
                : "hover:border-accent/30 hover:bg-white/[0.03] hover:shadow-[0_0_60px_rgba(34,211,238,0.06)]"
            )}
          >
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-accent/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-accent/30 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-accent/30 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-accent/30 rounded-br-2xl pointer-events-none" />
            
            <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
            
            <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 border-2 border-purple-500/10 rounded-full animate-ping" />
                    <div className="absolute inset-0 border-b-2 border-r-2 border-purple-500 rounded-full animate-spin duration-[2.5s]" />
                    <div className="absolute inset-2 border-t-2 border-accent/40 rounded-full animate-spin duration-[1.8s] [animation-direction:reverse]" />
                    <div className="absolute inset-6 glass rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                      <Cpu className="w-9 h-9 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">Analyzing Identity Node</p>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest animate-pulse">Personalizing interview protocol...</p>
                  </div>
                </motion.div>
              ) : !isUploaded ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-purple-500/20 to-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-28 h-28 rounded-[2.5rem] bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 group-hover:border-purple-400/40 transition-all duration-500">
                      <Upload className="w-12 h-12 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold tracking-tight">Select PDF Blueprint</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop Resume Area</p>
                    <p className="text-xs text-white/30 font-light">PDF only &middot; Max 10MB</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 w-full">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl opacity-60" />
                    <div className="relative w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Dossier Loaded</p>
                    <div className="flex items-center justify-center gap-2 max-w-[420px] mx-auto">
                      <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <p className="text-xl font-bold text-white truncate">{file?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} className="h-12 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent transition-colors">
                      <RotateCcw className="w-4 h-4 mr-2" /> Replace
                    </Button>
                    <Button onClick={() => handleProceedWithFile(file!)} className="h-12 px-10 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl group">
                      Start HR Interview <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
          
          <div className="flex items-center justify-center gap-2 mt-8 text-white/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-widest font-bold">End-to-end encrypted &middot; Processed by neural engine only</span>
          </div>
        </div>
      </main>
    </div>
  );
}
