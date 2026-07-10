'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Target, 
  Sparkles, 
  Zap, 
  Cpu, 
  CircleCheck,
  BrainCircuit,
  Award,
  Upload,
  ChevronRight,
  Briefcase,
  Search,
  X,
  FileSearch2,
  Check,
  Loader2,
  Layers,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Globe,
  Lock,
  Code2,
  Star,
  Quote,
  ShieldCheck,
  Activity,
  Command,
  Heart,
  Trophy,
  Map,
  Microscope,
  Users,
  CircleAlert,
  FlaskConical,
  Building2,
  Hand,
  Rocket,
  Mic,
  BarChart3
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore } from '@/firebase';
import { runGeminiTest } from '@/ai/flows/test-gemini';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer",
  "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst", "UI/UX Designer"
].sort();

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "TCS Digital", "Infosys", "Accenture", "Standard / Startup"
];

const ROUNDS = [
  { id: 'HR Round', label: 'HR Round', icon: Users, desc: 'Screening, soft skills, and cultural fit.' },
  { id: 'Technical Round', label: 'Technical Round', icon: Code2, desc: 'Technical logic and stack-specific depth.' },
  { id: 'Managerial Round', label: 'Managerial Round', icon: Hand, desc: 'Leadership, goals, and professional maturity.' }
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRound, setSelectedRound] = useState("Technical Round");
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const hrImg = PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || "https://picsum.photos/seed/nexvoro_hr/800/1000";

  const filteredRoles = ROLES.filter(role => 
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartVirtualInterview = () => {
    if (!user) {
      router.push('/login?redirectTo=/interview');
      return;
    }
    setIsWizardOpen(true);
    setStep(1);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Limit: 5MB" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleResumeStep = async () => {
    if (!selectedFile || !user || !db) return;
    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      const audit = await analyzeResume({ resumeDataUri: base64, targetRole: selectedRole || "Software Engineer" });
      
      await addDoc(collection(db, 'users', user.uid, 'resumes'), {
        userId: user.uid,
        filename: selectedFile.name,
        targetRole: selectedRole || "Software Engineer",
        atsScore: audit.atsScore,
        analysis: audit,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        resumeScore: audit.atsScore
      });

      setStep(2);
      toast({ title: "Blueprint Verified", description: "Your intelligence is synced." });
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Could not parse document." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole || "Software Engineer")}&exp=Senior&round=${encodeURIComponent(selectedRound)}&company=${encodeURIComponent(selectedCompany)}`);
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <section className="relative min-h-screen flex items-center pt-64 pb-32">
        <div className="container mx-auto px-6 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-5/12 text-left">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass mb-12">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/70">Neural Recruitment v5.0</span>
              </motion.div>
              <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-6xl md:text-[5.5rem] font-bold mb-10 tracking-tighter leading-[0.95] text-premium">Master Every <br /><span className="text-gradient-purple">Interview.</span></motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-xl text-xl text-muted-foreground mb-16 font-light leading-relaxed">Experience hyper-realistic simulations calibrated for Big Tech hiring standards.</motion.p>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-wrap gap-6">
                <Button onClick={handleStartVirtualInterview} size="lg" className="h-16 px-10 text-lg btn-premium">Start Virtual Interview <Zap className="ml-3 w-5 h-5" /></Button>
                <Link href="/resume-analysis">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg glass border-white/10 hover:bg-white/5 flex gap-2 group">
                    ✨ Resume Analysis
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-7/12 w-full">
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="relative group">
                <Card className="premium-card border-glow-premium p-0 overflow-hidden border-white/10 bg-[#0b0e1a]/80 shadow-[0_0_100px_rgba(147,51,234,0.15)] flex flex-col md:flex-row min-h-[550px]">
                  <div className="md:w-[65%] p-10 md:p-12 flex flex-col justify-between relative z-10">
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold tracking-tighter text-premium">Virtual HR Arena</h2>
                      
                      <div className="space-y-4 py-2">
                        <div className="flex items-center gap-2 text-accent font-bold text-[10px] uppercase tracking-[0.4em]">
                          <Rocket className="w-3 h-3" /> Interview Journey
                        </div>
                        <div className="space-y-1 pl-2">
                          {[
                            { label: "Resume Analysis", emoji: "📄" },
                            { label: "Aptitude Test", emoji: "🧠" },
                            { label: "Coding Challenge", emoji: "💻" },
                            { label: "Virtual Interview", emoji: "🎤" },
                            { label: "AI Performance Report", emoji: "📊" }
                          ].map((step, idx, arr) => (
                            <div key={idx} className="flex flex-col items-start">
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/5">
                                  {step.emoji}
                                </div>
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{step.label}</span>
                              </motion.div>
                              {idx < arr.length - 1 && (
                                <div className="pl-3.5 py-0.5 text-white/10 text-[10px]">
                                  ↓
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleStartVirtualInterview} className="w-full h-18 btn-orange-premium text-sm font-bold tracking-[0.3em] uppercase mt-8">Start Virtual Interview <ChevronRight className="ml-3 w-5 h-5" /></Button>
                  </div>
                  <div className="md:w-[35%] relative min-h-[550px] flex items-center justify-center p-6 bg-black/20 border-l border-white/5">
                    <div className="relative w-full h-full rounded-3xl overflow-hidden glass border border-white/20">
                      <Image src={hrImg} alt="HR Manager" fill className="object-cover opacity-80" priority />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWizardOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl premium-card bg-[#0b0e1a] border-white/10 p-0 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center"><BrainCircuit className="w-5 h-5 text-accent" /></div>
                  <div><h3 className="text-xl font-bold">Simulation Prep</h3><p className="text-[10px] text-muted-foreground uppercase font-bold">Step {step} of 4</p></div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full"><X className="w-6 h-6" /></Button>
              </div>

              <div className="p-10 min-h-[500px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto"><FileSearch2 className="w-10 h-10 text-accent" /></div>
                        <h4 className="text-2xl font-bold">Intelligence Audit</h4>
                        <p className="text-muted-foreground font-light">Upload your resume to calibrate company-specific questions.</p>
                      </div>
                      <div onClick={() => document.getElementById('wizard-resume-upload')?.click()} className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${isUploading ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30'}`}>
                        <input type="file" id="wizard-resume-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                        {isUploading ? <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" /> : <><Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" /><span className="font-bold">{selectedFile ? selectedFile.name : "Choose Blueprint"}</span></>}
                      </div>
                      {selectedFile && !isUploading && <Button onClick={handleResumeStep} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs">Sync Intelligence</Button>}
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                      <div className="text-center mb-8"><h4 className="text-2xl font-bold">Role & Company Sync</h4></div>
                      <div className="space-y-4">
                        <div className="relative group">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input placeholder="Search job role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-16 pl-16 rounded-2xl glass border-white/10 bg-transparent" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                          {filteredRoles.map((role) => (
                            <button key={role} onClick={() => setSelectedRole(role)} className={`h-12 rounded-xl border transition-all text-xs font-bold ${selectedRole === role ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5'}`}>{role}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4">
                           {COMPANIES.map(c => (
                             <button key={c} onClick={() => setSelectedCompany(c)} className={`h-12 rounded-xl border transition-all text-xs font-bold flex items-center justify-center gap-2 ${selectedCompany === c ? 'bg-accent/10 border-accent text-accent' : 'glass border-white/5'}`}><Building2 className="w-4 h-4 opacity-50" /> {c}</button>
                           ))}
                        </div>
                      </div>
                      <Button onClick={() => setStep(3)} disabled={!selectedRole} className="w-full h-18 btn-premium uppercase tracking-[0.3em] text-xs">Confirm Calibration</Button>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                      <div className="text-center mb-8"><h4 className="text-2xl font-bold">Simulation Round</h4></div>
                      <div className="grid grid-cols-1 gap-4">
                        {ROUNDS.map((round) => (
                          <button key={round.id} onClick={() => { setSelectedRound(round.id); setStep(4); }} className={`p-6 rounded-[2rem] border transition-all flex items-center gap-6 text-left ${selectedRound === round.id ? 'bg-accent/10 border-accent' : 'glass border-white/5'}`}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-accent"><round.icon className="w-6 h-6" /></div>
                            <div><span className="font-bold text-lg block">{round.label}</span><p className="text-xs text-muted-foreground">{round.desc}</p></div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-8">
                      <div className="w-32 h-32 mx-auto rounded-full bg-accent flex items-center justify-center text-[#050816] shadow-[0_0_50px_rgba(34,211,238,0.5)]"><CircleCheck className="w-16 h-16" /></div>
                      <div className="space-y-4">
                        <h4 className="text-4xl font-bold">Simulation Prime</h4>
                        <div className="flex gap-2 justify-center">
                          <Badge variant="outline" className="border-accent text-accent uppercase">{selectedCompany}</Badge>
                          <Badge variant="outline" className="border-purple-500 text-purple-400 uppercase">{selectedRole}</Badge>
                        </div>
                      </div>
                      <Button onClick={handleStartInterview} className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em]">Enter Neural Arena <Zap className="ml-3 w-6 h-6" /></Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
