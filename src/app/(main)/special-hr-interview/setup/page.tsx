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
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

export default function SpecialHRSetup() {
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

  const { data: journey } = useDoc(journeyRef);

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
    }
  };

  const handleProceed = async () => {
    if (!file || !user || !db || !journeyRef) return;
    
    setIsVerifying(true);
    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      // BACKGROUND ANALYSIS PROTOCOL
      const analysisResult = await analyzeResume({
        resumeDataUri: base64,
        targetRole: journey?.role || "Software Engineer"
      });

      await updateDoc(journeyRef, {
        resumeName: file.name,
        resumeBase64: base64,
        resumeAnalysis: analysisResult,
        updatedAt: serverTimestamp(),
      });
      
      router.push('/special-hr-interview');
    } catch (e) {
      console.error(e);
      toast({ 
        variant: "destructive", 
        title: "Analysis Failed", 
        description: "Neural engine could not parse dossier. Please try again with a cleaner PDF." 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <NavigationControls />

      <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center pt-16">
        <div className="max-w-4xl w-full">
          <header className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass border-purple-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-[9px] font-black tracking-[0.5em] uppercase text-purple-300">Expert HR Calibration</span>
            </div>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Special HR <span className="text-gradient-purple">Setup.</span></h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
              Upload your career blueprint. Our neural engine will architect a personalized, resume-aware interview session.
            </p>
          </header>

          <Card 
            onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
            className={cn(
              "premium-card bg-white/[0.01] border-white/5 p-16 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 min-h-[400px] relative overflow-hidden",
              isUploaded ? "border-purple-500/20 bg-purple-500/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
            )}
          >
            <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
            
            <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-2 border-purple-500/10 rounded-full animate-ping" />
                    <div className="absolute inset-0 border-b-2 border-purple-500 rounded-full animate-spin duration-[3000ms]" />
                    <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">Analyzing Identity Node</p>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest animate-pulse">Personalizing interview protocol...</p>
                  </div>
                </motion.div>
              ) : !isUploaded ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Upload className="w-12 h-12 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold">Select PDF Blueprint</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop Resume area</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 w-full">
                  <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Dossier Loaded</p>
                    <p className="text-2xl font-bold text-white truncate max-w-[400px] mx-auto">{file?.name}</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} className="h-12 px-6 rounded-xl glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent">
                      <RotateCcw className="w-4 h-4 mr-2" /> Replace
                    </Button>
                    <Button onClick={handleProceed} className="h-12 px-10 btn-premium rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl group">
                      Initialize Arena <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </main>
    </div>
  );
}
