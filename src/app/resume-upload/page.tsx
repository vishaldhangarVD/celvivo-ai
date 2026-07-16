"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Cpu, 
  BrainCircuit, 
  Briefcase, 
  Building2, 
  GraduationCap,
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { deepAuditResume } from '@/ai/flows/ai-resume-deep-audit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ANALYSIS_MESSAGES = [
  "Reading Resume...",
  "Extracting Skills...",
  "Analyzing ATS Score...",
  "Matching Company Requirements...",
  "Finding Missing Skills...",
  "Generating AI Suggestions...",
  "Preparing Final Report..."
];

export default function ResumeUploadPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Fetch active journey context
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing && loadingMsgIdx < ANALYSIS_MESSAGES.length - 1) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => prev + 1);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, loadingMsgIdx]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
        return;
      }
      setFile(selected);
      toast({ title: "Blueprint Detected", description: "Resume node successfully archived." });
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user || !db || !journey) return;
    
    setIsAnalyzing(true);
    setLoadingMsgIdx(0);

    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      // 1. Run Actual AI Analysis
      const analysisResult = await deepAuditResume({ 
        resumeDataUri: base64, 
        targetRole: journey.role 
      });

      // 2. Save Analysis and Update Journey
      const resumesRef = collection(db, 'users', user.uid, 'resumes');
      const resumeDoc = await addDoc(resumesRef, {
        userId: user.uid,
        filename: file.name,
        targetRole: journey.role,
        atsScore: analysisResult.atsScore,
        analysis: analysisResult,
        createdAt: serverTimestamp(),
      });

      await updateDoc(journeyRef!, {
        currentStage: "Resume Analysis",
        resumeId: resumeDoc.id,
        resumeAnalysis: analysisResult,
        updatedAt: serverTimestamp(),
        step: 2
      });

      // 3. Automated Navigation
      setTimeout(() => {
        router.push('/resume-analysis');
      }, 4000);

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Neural Synthesis Failed", description: "System could not parse career history." });
      setIsAnalyzing(false);
    }
  };

  if (journeyLoading) return (
    <div className="h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative selection:bg-accent/30">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="flex-1 container mx-auto px-6 flex items-center justify-center relative z-10 pt-16">
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl w-full">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 flex flex-col justify-center gap-8"
          >
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">Identity Verification</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">Resume Upload.</h1>
              <p className="text-xl text-muted-foreground font-light max-w-lg leading-relaxed">
                Upload your latest career blueprint to architect a resume-aware simulation.
              </p>
            </div>

            <Card 
              onClick={() => !isAnalyzing && document.getElementById('resume-input')?.click()}
              className={cn(
                "premium-card bg-white/[0.01] border-white/5 p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 min-h-[340px] relative overflow-hidden",
                file ? "border-accent/40 bg-accent/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
              )}
            >
              <input type="file" id="resume-input" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
              
              {!file ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Select Career Blueprint</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop • PDF or DOCX • Max 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-green-400 uppercase tracking-widest">Protocol Verified</p>
                    <p className="text-xl font-bold text-white max-w-[300px] truncate mx-auto">{file.name}</p>
                    <p className="text-[9px] text-white/30 uppercase font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" className="h-10 px-6 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent">
                    <RotateCcw className="w-4 h-4 mr-2" /> Replace Blueprint
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <Card className="premium-card bg-accent/[0.02] border-accent/20 p-10 space-y-10 relative overflow-hidden">
               <div className="space-y-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Active Protocol Context</h3>
                 <p className="text-sm font-light text-white/60">The simulation is calibrating based on your setup configuration.</p>
               </div>

               <div className="space-y-4">
                 {[
                   { label: "Target Role", val: journey?.role, icon: Briefcase },
                   { label: "Agency", val: journey?.company, icon: Building2 },
                   { label: "Seniority", val: journey?.experience, icon: GraduationCap }
                 ].map((item, i) => (
                   <div key={i} className="p-5 glass rounded-2xl border-white/5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{item.label}</span>
                        <span className="text-sm font-bold text-white">{item.val || "Awaiting Data..."}</span>
                      </div>
                   </div>
                 ))}
               </div>

               <Button 
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="w-full h-20 btn-premium rounded-2xl text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group"
               >
                 {isAnalyzing ? (
                   <Loader2 className="w-6 h-6 animate-spin" />
                 ) : (
                   <>Initialize Analysis <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" /></>
                 )}
               </Button>
            </Card>
          </motion.div>

        </div>
      </main>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050816]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-40 h-40 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
              <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
                <BrainCircuit className="w-16 h-16 text-accent animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-8 max-w-md">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tighter text-premium">Neural Scanning Node</h2>
                <p className="text-[9px] font-black text-accent uppercase tracking-[0.5em]">Nexvoro AI Intelligence v8.4</p>
              </div>
              
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-accent shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                />
              </div>

              <div className="h-6">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={loadingMsgIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50"
                  >
                    {ANALYSIS_MESSAGES[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}