'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Loader2
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';

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

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

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
  };

  const handleAnalyzeResumeDirect = () => {
    if (!user) {
      router.push('/login?redirectTo=/resume');
      return;
    }
    router.push('/resume');
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadedFile("RESUME_SIMULATED_2025.pdf");
      setStep(2);
    }, 2000);
  };

  const handleStartInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&exp=Senior`);
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
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-32">
        <div className="container mx-auto px-6 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Side */}
            <div className="lg:w-1/2 text-left">
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
                className="text-6xl md:text-[7rem] font-bold mb-10 tracking-tighter leading-[0.85] text-premium"
              >
                Neural <br />
                <span className="text-gradient-purple">Intelligence.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-xl text-xl text-muted-foreground mb-16 font-light leading-relaxed"
              >
                Deploy elite AI simulations to audit your technical performance, analyze your resume, and generate verified career roadmaps.
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

            {/* Right Side */}
            <div className="lg:w-1/2 w-full">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="premium-card p-0 overflow-hidden border-white/5 bg-white/[0.02] shadow-[0_0_100px_rgba(147,51,234,0.1)] relative"
              >
                <div className="absolute top-8 left-8 z-20">
                  <Badge className="bg-accent/20 text-accent mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold">NEURAL AGENT v4.2</Badge>
                </div>
                
                <div className="relative aspect-[4/5] w-full group">
                  <Image 
                    src={PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || ''}
                    alt="AI HR Interviewer"
                    fill
                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                    data-ai-hint="professional businessman suit"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-12 left-12 right-12 z-20 space-y-6">
                    <div className="flex gap-4">
                      <div className="glass px-6 py-4 rounded-2xl flex-1 text-center backdrop-blur-xl border-white/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Precision</p>
                        <p className="text-2xl font-bold text-accent">98.4%</p>
                      </div>
                      <div className="glass px-6 py-4 rounded-2xl flex-1 text-center backdrop-blur-xl border-white/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Success</p>
                        <p className="text-2xl font-bold text-purple-400">12k+</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleStartVirtualInterview}
                      className="w-full h-16 btn-premium text-sm font-bold tracking-[0.2em] uppercase"
                    >
                      Initialize Simulation
                    </Button>
                  </div>
                </div>
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
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Neural Session Calibration</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full hover:bg-white/10">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-10 min-h-[450px]">
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
                        onClick={handleFileUpload}
                        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group ${isUploading ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'}`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-4">
                            <Cpu className="w-10 h-10 text-accent animate-spin" />
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Extracting Knowledge Nodes...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors" />
                            <div className="space-y-1">
                              <span className="text-lg font-bold">Select Career Blueprint</span>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">PDF or DOCX • Enterprise Grade Parsing</p>
                            </div>
                          </div>
                        )}
                      </div>
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
                            onClick={() => setSelectedRole(role)}
                            className={`h-14 rounded-2xl border transition-all flex items-center justify-between px-6 text-xs font-bold ${selectedRole === role ? 'bg-accent/20 border-accent text-accent' : 'glass border-white/5 hover:bg-white/5 text-white/70'}`}
                          >
                            <span className="truncate">{role}</span>
                            {selectedRole === role && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        ))}
                      </div>

                      {selectedRole && (
                        <Button 
                          onClick={() => setStep(3)}
                          className="w-full h-16 btn-premium text-xs font-bold uppercase tracking-[0.2em] mt-4"
                        >
                          Calibrate Simulation
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
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
                        <div className="flex flex-col items-center gap-2">
                          <Badge variant="outline" className="border-accent/30 text-accent px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
                            {selectedRole}
                          </Badge>
                          <p className="text-muted-foreground text-sm font-light tracking-widest uppercase">Senior Neural Track Verified</p>
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

      <footer className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 text-center">
           <div className="flex items-center justify-center gap-4 mb-12">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center">
                <Sparkles className="text-accent w-8 h-8" />
              </div>
              <span className="font-headline font-bold text-3xl tracking-tighter uppercase">NEXVORO</span>
            </div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">
            © 2025 NEXVORO SYSTEMS. WORLDWIDE OPERATIONAL CLEARANCE.
          </p>
        </div>
      </footer>
    </div>
  );
}