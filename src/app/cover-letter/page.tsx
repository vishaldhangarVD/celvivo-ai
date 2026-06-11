
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Zap,
  Building2,
  Briefcase,
  History,
  ShieldCheck,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { generateCoverLetter } from '@/ai/flows/ai-cover-letter';
import { useToast } from '@/hooks/use-toast';

export default function CoverLetterPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    description: ''
  });

  // Fetch latest resume for context
  const resumeQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'resumes'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);
  const { data: latestResumes } = useCollection(resumeQuery);

  const handleGenerate = async () => {
    if (!formData.companyName || !formData.role || !user) return;
    
    setIsGenerating(true);
    setGeneratedLetter(null);

    try {
      const resume = latestResumes?.[0];
      const skills = resume?.analysis?.skillAnalysis?.map((s: any) => s.skill) || [];
      const exp = resume?.analysis?.sections?.experience || [];

      const result = await generateCoverLetter({
        companyName: formData.companyName,
        jobRole: formData.role,
        jobDescription: formData.description,
        userSkills: skills,
        experienceHighlights: exp
      });

      setGeneratedLetter(result.generatedLetter);

      // Persist to Firestore
      const letterData = {
        userId: user.uid ?? "",
        companyName: formData.companyName ?? "",
        role: formData.role ?? "",
        content: result.generatedLetter ?? "",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users', user.uid, 'cover_letters'), letterData);

      toast({
        title: "Blueprint Architected",
        description: `Cover letter for ${formData.companyName} synthesized and archived.`,
      });

    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Synthesis Error",
        description: "Failed to generate neural cover letter protocol.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Protocol Copied", description: "Letter contents synced to clipboard." });
  };

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-7xl mx-auto">
          <header className="max-w-4xl mb-16">
            <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase mb-4">Neural Narrative Synthesis</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium mb-4">AI Cover Letter <span className="text-gradient-purple">Architect.</span></h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl">
              Synthesize high-fidelity cover letters by cross-referencing your neural career blueprint with target deployment roles.
            </p>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Input Side */}
            <div className="lg:col-span-5 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Target Company</Label>
                    <div className="relative group">
                      <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-all" />
                      <Input 
                        placeholder="e.g. Google, OpenAI, Meta"
                        className="h-14 pl-12 glass border-white/10 bg-transparent rounded-2xl"
                        value={formData.companyName}
                        onChange={e => setFormData({...formData, companyName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Deployment Role</Label>
                    <div className="relative group">
                      <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-all" />
                      <Input 
                        placeholder="e.g. Senior Backend Engineer"
                        className="h-14 pl-12 glass border-white/10 bg-transparent rounded-2xl"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Contextual Intelligence (Optional)</Label>
                    <Textarea 
                      placeholder="Paste job description snippets for deep alignment..."
                      className="min-h-[150px] rounded-3xl glass border-white/10 bg-transparent p-6 text-sm font-light resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.companyName || !formData.role}
                    className="w-full h-18 btn-premium text-xs font-bold tracking-[0.3em] uppercase group shadow-[0_0_50px_rgba(147,51,234,0.2)]"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Architecting...</>
                    ) : (
                      <><Zap className="w-5 h-5 mr-3 group-hover:animate-pulse" /> Initialize Synthesis</>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="premium-card bg-accent/5 border-accent/10 p-8">
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">Neural Sync Verified</h4>
                    <p className="text-[10px] text-muted-foreground font-light mt-1">
                      Content is automatically calibrated with your latest resume audit ({latestResumes?.[0]?.atsScore || 0}% ATS Index).
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Output Side */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {generatedLetter ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <Card className="premium-card bg-white/[0.02] border-white/10 p-12 min-h-[700px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8">
                        <Badge variant="outline" className="border-accent/30 text-accent text-[8px] uppercase tracking-widest font-bold">Verified Narrative v4.2</Badge>
                      </div>
                      <div className="whitespace-pre-wrap font-light text-lg leading-relaxed text-white/90">
                        {generatedLetter}
                      </div>
                    </Card>

                    <div className="flex flex-wrap gap-4">
                      <Button 
                        onClick={copyToClipboard}
                        className="h-14 px-10 rounded-2xl glass border-white/10 hover:bg-white/10 flex gap-3 text-[10px] font-bold uppercase tracking-widest"
                      >
                        {copied ? <ClipboardCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy Protocol"}
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-14 px-10 rounded-2xl glass border-white/10 hover:bg-white/10 flex gap-3 text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Download className="w-4 h-4" />
                        Export PDF
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[700px] rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-12 bg-white/[0.01]">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
                      <Sparkles className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Awaiting Signal</h3>
                    <p className="text-muted-foreground font-light max-w-sm">
                      Input company and role parameters to synthesize your professional narrative.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
