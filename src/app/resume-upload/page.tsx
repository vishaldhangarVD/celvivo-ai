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
  BrainCircuit, 
  Briefcase, 
  Building2, 
  GraduationCap,
  Zap,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ResumeUploadPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  // Fetch active journey context
  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey, loading: journeyLoading } = useDoc(journeyRef);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      if (selected.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Format Error", description: "Only PDF blueprints are supported for neural registration." });
        return;
      }

      if (selected.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 10MB" });
        return;
      }

      setFile(selected);
      setIsVerifying(true);
      
      // Simulate fast neural verification
      await new Promise(r => setTimeout(r, 1500));
      
      setIsVerifying(false);
      setIsUploaded(true);
      toast({ title: "Blueprint Verified", description: "Neural registration complete." });
    }
  };

  const handleEnterAptitude = async () => {
    if (!file || !user || !db || !journey) return;
    
    try {
      // Save basic resume info to session
      await updateDoc(journeyRef!, {
        currentStage: "Aptitude Assessment",
        resumeName: file.name,
        updatedAt: serverTimestamp(),
        step: 3
      });

      router.push('/interview/aptitude');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Protocol Fault", description: "Failed to initialize assessment node." });
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
                Upload your professional blueprint to register for the AI Assessment arena.
              </p>
            </div>

            <Card 
              onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
              className={cn(
                "premium-card bg-white/[0.01] border-white/5 p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 min-h-[340px] relative overflow-hidden",
                isUploaded ? "border-green-500/20 bg-green-500/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
              )}
            >
              <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
              
              {isVerifying ? (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                    <ShieldCheck className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Verifying Blueprint...</p>
                </div>
              ) : !isUploaded ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Select PDF Blueprint</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop • PDF Only • Max 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Protocol Verified</p>
                      <p className="text-xl font-bold text-white max-w-[300px] truncate mx-auto">{file?.name}</p>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center justify-center gap-2 text-green-400/60">
                         <Check className="w-3 h-3" /> <span className="text-[9px] font-bold uppercase tracking-widest">Resume Uploaded Successfully</span>
                       </div>
                       <div className="flex items-center justify-center gap-2 text-green-400/60">
                         <Check className="w-3 h-3" /> <span className="text-[9px] font-bold uppercase tracking-widest">Resume Verified</span>
                       </div>
                       <div className="flex items-center justify-center gap-2 text-green-400/60">
                         <Check className="w-3 h-3" /> <span className="text-[9px] font-bold uppercase tracking-widest">Candidate Registered</span>
                       </div>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} className="h-10 px-6 rounded-xl glass border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent">
                    <RotateCcw className="w-4 h-4 mr-2" /> Replace
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
                 <p className="text-sm font-light text-white/60">Finalize registration to enter the aptitude arena.</p>
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
                        <span className="text-sm font-bold text-white">{item.val || "---"}</span>
                      </div>
                   </div>
                 ))}
               </div>

               <Button 
                onClick={handleEnterAptitude}
                disabled={!isUploaded || isVerifying}
                className="w-full h-20 btn-premium rounded-2xl text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group"
               >
                 ENTER APTITUDE TEST <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" />
               </Button>
            </Card>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
