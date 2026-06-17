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
  CheckCircle2,
  BrainCircuit,
  Award,
  Upload,
  ChevronRight,
  Briefcase,
  Search,
  X,
  FileSearch,
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
  HandMetal,
  Users,
  AlertTriangle,
  FlaskConical
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore } from '@/firebase';
import { runGeminiTest } from '@/ai/flows/test-gemini';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer",
  "Web Developer", "Mobile App Developer", "Android Developer", "iOS Developer",
  "React Developer", "Angular Developer", "Vue Developer", "Node.js Developer",
  "Java Developer", "Python Developer", ".NET Developer", "PHP Developer",
  "C++ Developer", "Data Analyst", "Business Analyst", "Data Scientist",
  "Machine Learning Engineer", "AI Engineer", "Prompt Engineer", "Generative AI Engineer",
  "Deep Learning Engineer", "Computer Vision Engineer", "NLP Engineer", "Cloud Engineer",
  "AWS Engineer", "Azure Engineer", "Google Cloud Engineer", "DevOps Engineer",
  "Site Reliability Engineer", "Cyber Security Analyst", "Ethical Hacker", "Security Engineer",
  "Network Engineer", "System Administrator", "Database Administrator", "QA Engineer",
  "Automation Tester", "Manual Tester", "Performance Tester", "UI Designer",
  "UX Designer", "UI/UX Designer", "Product Designer", "Product Manager",
  "Project Manager", "Scrum Master", "Technical Support Engineer", "IT Support Engineer",
  "Blockchain Developer", "AR/VR Developer", "Game Developer", "Embedded Engineer", "IoT Engineer"
].sort();

const ROUNDS = [
  { id: 'HR Round', label: 'HR Round', icon: Users, desc: 'Screening, soft skills, and cultural fit.' },
  { id: 'Technical Round', label: 'Technical Round', icon: Code2, desc: 'Technical logic and stack-specific depth.' },
  { id: 'Managerial Round', label: 'Managerial Round', icon: HandMetal, desc: 'Leadership, goals, and professional maturity.' },
  { id: 'Full Interview Process', label: 'Full Interview Process', icon: Layers, desc: 'Comprehensive session covering all modules.' }
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Test State
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

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

  const handleAnalyzeResumeDirect = () => {
    if (!user) {
      router.push('/login?redirectTo=/resume');
      return;
    }
    router.push('/resume');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
        });
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
      
      const resumesRef = collection(db, 'users', user.uid, 'resumes');
      await addDoc(resumesRef, {
        userId: user.uid,
        filename: selectedFile.name,
        targetRole: selectedRole || "Software Engineer",
        atsScore: audit.atsScore,
        analysis: audit,
        createdAt: serverTimestamp(),
      });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeScore: audit.atsScore
      });

      setStep(2);
      toast({ title: "Blueprint Verified", description: "Your career intelligence has been synchronized." });
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Could not parse document. Ensure Gemini is reachable." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole || "Software Engineer")}&exp=Senior&round=${encodeURIComponent(selectedRound)}`);
  };

  const handleGeminiTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await runGeminiTest();
      setTestResult(result);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message || 'Fatal Execution Error', details: 'GENKIT_CLIENT_CRASH' });
    } finally {
      setIsTesting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <div className="fixed top-24 left-0 right-0 z-[110] flex justify-center pointer-events-none px-6">
        <div className="pointer-events-auto flex flex-col items-center gap-4 w-full max-w-xl">
          <Button 
            onClick={handleGeminiTest}
            disabled={isTesting}
            className="w-full h-20 bg-red-600 hover:bg-red-700 text-white font-black text-2xl tracking-[0.2em] rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] border-4 border-white/20 animate-pulse-glow"
          >
            {isTesting ? (
              <><Loader2 className="w-8 h-8 animate-spin mr-4" /> TESTING...</>
            ) : (
              <><FlaskConical className="w-8 h-8 mr-4" /> TEST GEMINI NOW</>
            )}
          </Button>
          
          <AnimatePresence>
            {testResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`w-full p-8 rounded-3xl border-2 backdrop-blur-3xl shadow-2xl ${testResult.success ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  {testResult.success ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <AlertTriangle className="w-10 h-10" />
                  )}
                  <h3 className="text-3xl font-black tracking-tighter uppercase">
                    {testResult.success ? "Status: Online" : "Status: Failed"}
                  </h3>
                </div>
                
                <div className="bg-black/60 p-6 rounded-2xl border border-white/5 font-mono text-lg break-all text-center">
                  {testResult.success ? (
                    <p className="font-bold py-4 text-green-400">{testResult.data}</p>
                  ) : (
                    <div className="space-y-4 text-left">
                      <p className="font-bold text-xl">Error Signature:</p>
                      <p className="text-white/80">{testResult.error}</p>
                      <div className="h-px bg-white/10" />
                      <p className="text-xs uppercase opacity-50 tracking-widest">Detail: {testResult.details}</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setTestResult(null)}
                  className="mt-6 w-full text-white/50 hover:text-white"
                >
                  Clear Diagnostic Output
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-64 pb-32">
        <div className="container mx-auto px-6 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="lg:w-5/12 text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass mb-12"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/70">World-Class Neural Recruitment</span>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl md:text-[5.5rem] font-bold mb-10 tracking-tighter leading-[0.95] text-premium"
              >
                Master Every IT <br />
                <span className="text-gradient-purple">Interview with AI</span>
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-xl text-xl text-muted-foreground mb-16 font-light leading-relaxed"
              >
                Analyze your resume, practice real-world interviews, identify skill gaps, and get personalized feedback to become job-ready faster.
              </motion.p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-wrap gap-6"
              >
                <Button 
                  onClick={handleStartVirtualInterview}
                  size="lg" 
                  className="h-16 px-10 text-lg btn-premium group"
                >
                  Start Virtual Interview
                  <Zap className="ml-3 w-5 h-5 group-hover:animate-pulse" />
                </Button>
                <Button 
                  onClick={handleAnalyzeResumeDirect}
                  size="lg" 
                  variant="outline" 
                  className="h-16 px-10 text-lg rounded-full glass border-white/10 hover:bg-white/10"
                >
                  Analyze Resume
                </Button>
              </motion.div>
            </div>

            <div className="lg:w-7/12 w-full">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative group"
              >
                <Card className="premium-card border-glow-premium p-0 overflow-hidden border-white/10 bg-[#0b0e1a]/80 shadow-[0_0_100px_rgba(147,51,234,0.15)] flex flex-col md:flex-row min-h-[550px]">
                  <div className="flex-1 p-10 md:p-12 flex flex-col justify-between relative z-10">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-bold tracking-tighter text-premium">Virtual HR Manager</h2>
                          <Badge className="bg-accent/20 text-accent border-none px-3 py-1 text-[8px] tracking-[0.2em] font-bold uppercase flex items-center gap-2 w-fit">
                            <Star className="w-3 h-3 fill-accent" /> Premium Feature
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Live</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">
                        Your AI-powered HR Manager is ready to conduct your strategic interview session.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-6 pt-2">
                        {[
                          { val: "10 Nodes", label: "Per Session", icon: MessageSquare, color: "text-blue-400" },
                          { val: "75+", label: "IT Job Roles", icon: Layers, color: "text-purple-400" },
                          { val: "Instant", label: "AI Feedback", icon: Zap, color: "text-accent" }
                        ].map((stat, i) => (
                          <div key={i} className="flex items-center gap-4 group/stat">
                            <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center ${stat.color} group-hover/stat:scale-110 transition-transform`}>
                              <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xl font-bold block">{stat.val}</span>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleStartVirtualInterview}
                      className="w-full h-18 btn-orange-premium text-sm font-bold tracking-[0.3em] uppercase mt-12"
                    >
                      Start Virtual Interview
                      <ChevronRight className="ml-3 w-5 h-5" />
                    </Button>
                  </div>

                  <div className="md:w-[48%] relative min-h-[550px] flex items-center justify-center p-6 md:p-8 bg-black/20">
                    <div className="relative w-full h-full min-h-[450px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl glass bg-white/[0.02]">
                      <Image 
                        src={hrImg}
                        alt="Virtual HR Manager"
                        fill
                        className="object-cover rounded-3xl opacity-100 brightness-110 z-10 transition-all duration-700 group-hover:scale-105"
                        priority
                        data-ai-hint="professional businessman suit"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-20"></div>
                      <div className="absolute top-6 left-6 z-30">
                        <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 px-4 py-1.5 text-[10px] tracking-widest font-bold uppercase rounded-xl">
                          AI HR Manager
                        </Badge>
                      </div>
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-30 px-6">
                        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Neural Sync Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWizardOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl premium-card bg-[#0b0e1a] border-white/10 p-0 overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Onboarding Sequence</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step {step} of 4</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full hover:bg-white/10">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-10 min-h-[500px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                          <FileSearch className="w-10 h-10 text-accent" />
                        </div>
                        <h4 className="text-2xl font-bold tracking-tight">Resume Intelligence Audit</h4>
                        <p className="text-muted-foreground font-light max-w-md mx-auto">
                          Our Neural engine parses your career history to calibrate technical questions.
                        </p>
                      </div>

                      <div 
                        onClick={() => document.getElementById('wizard-resume-upload')?.click()}
                        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group ${isUploading ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'}`}
                      >
                        <input 
                          type="file" 
                          id="wizard-resume-upload" 
                          className="hidden" 
                          accept=".pdf,.docx"
                          onChange={handleFileChange} 
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-4">
                            <Cpu className="w-10 h-10 text-accent animate-spin" />
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Extracting Knowledge Nodes...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors" />
                            <div className="space-y-1">
                              <span className="text-lg font-bold">{selectedFile ? selectedFile.name : "Select Career Blueprint"}</span>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">PDF or DOCX • Enterprise Grade Parsing</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedFile && !isUploading && (
                        <Button 
                          onClick={handleResumeStep}
                          className="w-full h-18 btn-premium text-xs font-bold uppercase tracking-[0.3em]"
                        >
                          Initialize Neural Handshake <Zap className="ml-3 w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h4 className="text-2xl font-bold tracking-tight">Define Deployment Role</h4>
                        <p className="text-muted-foreground font-light">Search from 60+ specialized technical tracks.</p>
                      </div>

                      <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <Input 
                          placeholder="Search job roles (e.g. Prompt Engineer, DevOps...)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-16 pl-16 rounded-2xl glass border-white/10 bg-transparent focus:border-accent transition-all text-lg font-light"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredRoles.map((role) => (
                          <button
                            key={role}
                            onClick={() => { setSelectedRole(role); setStep(3); }}
                            className={`h-14 rounded-2xl border transition-all flex items-center justify-between px-6 text-xs font-bold ${selectedRole === role ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 hover:bg-white/5 text-white/70'}`}
                          >
                            <span className="truncate">{role}</span>
                            {selectedRole === role && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h4 className="text-2xl font-bold tracking-tight">Select Interview Round</h4>
                        <p className="text-muted-foreground font-light">Calibrate the simulation type for this session.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {ROUNDS.map((round) => (
                          <button
                            key={round.id}
                            onClick={() => { setSelectedRound(round.id); setStep(4); }}
                            className={`p-6 rounded-[2rem] border transition-all flex items-center gap-6 text-left ${selectedRound === round.id ? 'bg-accent/10 border-accent shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'glass border-white/5 hover:bg-white/5'}`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedRound === round.id ? 'bg-accent text-black' : 'bg-white/5 text-accent'}`}>
                              <round.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-bold text-lg block">{round.label}</span>
                              <p className="text-xs text-muted-foreground font-light">{round.desc}</p>
                            </div>
                            <ChevronRight className="ml-auto w-5 h-5 text-white/10" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center space-y-10 py-8"
                    >
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
                        <div className="relative w-full h-full rounded-full bg-accent flex items-center justify-center text-[#050816] shadow-[0_0_50px_rgba(34,211,238,0.5)]">
                          <CheckCircle2 className="w-16 h-16" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-4xl font-bold tracking-tight text-premium">Simulation Prime</h4>
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="border-accent/30 text-accent px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
                              {selectedRole}
                            </Badge>
                            <Badge variant="outline" className="border-purple-500/30 text-purple-400 px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
                              {selectedRound}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm font-light tracking-widest uppercase">Ready for Neural Deployment</p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleStartInterview}
                        className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.3em] shadow-[0_0_60px_rgba(147,51,234,0.3)]"
                      >
                        Enter Neural Arena
                        <Zap className="ml-3 w-6 h-6" />
                      </Button>
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
