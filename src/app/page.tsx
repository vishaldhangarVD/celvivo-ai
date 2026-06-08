'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Target, 
  LayoutDashboard, 
  Sparkles, 
  Zap, 
  Cpu, 
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  Award,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Upload,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", 
  "Data Scientist", "AI Engineer", "DevOps Engineer", "Cloud Engineer", 
  "Cyber Security Analyst", "QA Engineer", "UI/UX Designer"
];

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setStep(2);
    }, 1500);
  };

  const handleStartInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&exp=Senior`);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-32">
        <div className="container mx-auto px-6 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Side: Exactly as it was */}
            <div className="lg:w-1/2 text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass mb-12"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/70">The Future of Technical Recruitment</span>
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
                <Link href="/interview">
                  <Button size="lg" className="h-16 px-10 text-lg btn-premium group">
                    Start Interview
                    <Zap className="ml-3 w-5 h-5 group-hover:animate-pulse" />
                  </Button>
                </Link>
                <Link href="/resume">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full glass border-white/10 hover:bg-white/10">
                    Analyze Resume
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="ghost" className="h-16 px-8 text-lg font-bold tracking-widest uppercase text-white/50 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Side: New Premium Interactive Wizard Card */}
            <div className="lg:w-1/2 w-full">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="premium-card p-0 overflow-hidden border-white/5 bg-white/[0.02] shadow-[0_0_100px_rgba(147,51,234,0.1)]"
              >
                <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Protocol Setup</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-bold">Neural Session Configuration</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`w-2 h-2 rounded-full ${step >= s ? 'bg-accent shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-10 min-h-[450px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                            <FileText className="w-10 h-10 text-accent" />
                          </div>
                          <h4 className="text-xl font-bold">Upload Your Career Blueprint</h4>
                          <p className="text-muted-foreground text-sm font-light max-w-sm mx-auto">
                            The Neural engine needs your resume to tailor the technical simulation to your expertise.
                          </p>
                        </div>
                        <div 
                          onClick={handleFileUpload}
                          className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-accent/30 hover:bg-white/[0.02] transition-all cursor-pointer group"
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-4">
                              <Cpu className="w-8 h-8 text-accent animate-spin" />
                              <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Parsing Neural Logic...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-4">
                              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                              <span className="text-sm font-bold text-muted-foreground">Select PDF or DOCX</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <div className="text-center mb-8">
                          <h4 className="text-xl font-bold">Select Deployment Role</h4>
                          <p className="text-muted-foreground text-sm font-light">Target specialized technical tracks.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                          {ROLES.map((role) => (
                            <Button
                              key={role}
                              variant="outline"
                              onClick={() => setSelectedRole(role)}
                              className={`h-14 rounded-2xl border-white/5 justify-start px-6 text-xs font-bold transition-all ${selectedRole === role ? 'bg-accent/20 border-accent text-accent' : 'glass hover:bg-white/5'}`}
                            >
                              <Briefcase className="w-4 h-4 mr-3" />
                              {role}
                            </Button>
                          ))}
                        </div>
                        {selectedRole && (
                          <Button 
                            onClick={() => setStep(3)}
                            className="w-full h-16 btn-premium text-xs font-bold uppercase tracking-widest mt-4"
                          >
                            Proceed to Calibration
                            <ChevronRight className="ml-2 w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center space-y-10"
                      >
                        <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
                          <div className="relative w-full h-full rounded-full bg-accent flex items-center justify-center text-[#050816]">
                            <CheckCircle2 className="w-12 h-12" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-3xl font-bold tracking-tight">Simulation Ready</h4>
                          <p className="text-muted-foreground text-sm font-light uppercase tracking-widest">
                            {selectedRole} • Senior Track
                          </p>
                        </div>
                        <Button 
                          onClick={handleStartInterview}
                          className="w-full h-20 btn-premium text-lg font-bold uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(147,51,234,0.3)]"
                        >
                          Initialize AI Interview
                          <Zap className="ml-3 w-6 h-6" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hero Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/20 blur-[180px] rounded-full animate-float"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[180px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Standard Sections */}
      <section className="py-40 bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-32">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="premium-card relative group overflow-hidden p-0 border-white/5">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816] to-transparent z-10"></div>
                <Image 
                  src={PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || ''}
                  alt="AI HR Interviewer"
                  width={800}
                  height={1000}
                  className="w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                  data-ai-hint="professional businessman suit"
                />
                <div className="absolute bottom-12 left-12 right-12 z-20">
                  <Badge className="bg-accent/20 text-accent mb-4 border-none px-4 py-1 text-[10px] tracking-widest font-bold">NEURAL AGENT v4.2</Badge>
                  <h3 className="text-4xl font-bold mb-2">Meet Your Executive Coach</h3>
                  <p className="text-muted-foreground text-lg font-light leading-relaxed">
                    Trained on thousands of senior-level interviews at Google, Meta, and OpenAI.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <div className="lg:w-1/2 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-6xl md:text-7xl font-bold mb-8 text-premium">Elite Recruitment <br /> Framework.</h2>
                <p className="text-2xl text-muted-foreground font-light leading-relaxed mb-12">
                  Nexvoro AI doesn't just ask questions. It analyzes tone, logic, and architectural precision in real-time.
                </p>
              </motion.div>

              <div className="grid gap-12">
                {[
                  { icon: BrainCircuit, title: "Mock Simulation", desc: "Full-length mock sessions tailored to specific senior tracks." },
                  { icon: Award, title: "Job Readiness Score", desc: "Calculated benchmark against current industry standards." },
                  { icon: FileText, title: "AI Feedback Report", desc: "Detailed breakdown of strengths, gaps, and neural logic." },
                  { icon: Smartphone, title: "Learning Roadmap", desc: "Personalized skill path to bridge identified knowledge gaps." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 items-start group"
                  >
                    <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                      <item.icon className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-24">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center">
                <Sparkles className="text-accent w-8 h-8" />
              </div>
              <span className="font-headline font-bold text-3xl tracking-tighter">NEXVORO</span>
            </div>
            <div className="flex gap-16 text-xs font-bold tracking-[0.4em] uppercase text-white/40">
              <Link href="/features" className="hover:text-white transition-colors">Protocols</Link>
              <Link href="#" className="hover:text-white transition-colors">Neural</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Enterprise</Link>
              <Link href="#" className="hover:text-white transition-colors">Network</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase">
            <p>© 2025 NEXVORO SYSTEMS. WORLDWIDE OPERATIONAL CLEARANCE.</p>
            <div className="flex gap-8">
              <Link href="#">Terms</Link>
              <Link href="#">Privacy</Link>
              <Link href="#">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
