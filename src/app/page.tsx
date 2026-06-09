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
  Map
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

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Neural Scan",
    description: "Upload your resume for a deep-dive career blueprint audit using our neural parsing engine.",
    icon: FileSearch
  },
  {
    step: "02",
    title: "Track Calibration",
    description: "Select from 60+ specialized technical tracks to calibrate the simulation's difficulty and focus.",
    icon: Layers
  },
  {
    step: "03",
    title: "Arena Entry",
    description: "Step into the virtual arena for a high-fidelity, real-time interview with our AI HR agent.",
    icon: Zap
  },
  {
    step: "04",
    title: "Intelligence Audit",
    description: "Receive an executive-grade performance report with skill gap mapping and a growth roadmap.",
    icon: Award
  }
];

const FEATURES = [
  {
    title: "Real-time Tone Analysis",
    description: "Our engine analyzes your communication strategic patterns and confidence levels in real-time.",
    icon: MessageSquare
  },
  {
    title: "Industry Benchmarking",
    description: "Compare your results against anonymized performance nodes from senior engineers at Big Tech.",
    icon: TrendingUp
  },
  {
    title: "Skill Gap Mapping",
    description: "Visualize your technical landscape and identify exactly which nodes require reinforcement.",
    icon: BrainCircuit
  },
  {
    title: "Automated Roadmap",
    description: "Get a personalized learning path with certification recommendations to bridge your gaps.",
    icon: Target
  },
  {
    title: "Code Logic Audit",
    description: "Verify your technical precision with simulated architectural and coding challenges.",
    icon: Code2
  },
  {
    title: "Executive Presence",
    description: "Refine your leadership archetypes and strategic delivery for high-stakes positions.",
    icon: UserCheck
  }
];

const STATS = [
  { label: "Successful Placements", value: "12k+", icon: Globe },
  { label: "Accuracy Rate", value: "98.4%", icon: Cpu },
  { label: "Technical Tracks", value: "60+", icon: Layers },
  { label: "Avg. Readiness Boost", value: "45%", icon: Zap }
];

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

            {/* Right Side: Redesigned Virtual HR Manager Card */}
            <div className="lg:w-7/12 w-full">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative group"
              >
                <Card className="premium-card border-glow-premium p-0 overflow-hidden border-white/10 bg-[#0b0e1a]/80 shadow-[0_0_100px_rgba(147,51,234,0.15)] flex flex-col md:flex-row min-h-[500px]">
                  {/* Left Content */}
                  <div className="flex-1 p-12 flex flex-col justify-between relative z-10">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-accent/20 text-accent border-none px-4 py-1.5 text-[10px] tracking-[0.3em] font-bold uppercase">Neural Agent v4.2</Badge>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase tracking-widest px-3">Premium Feature</Badge>
                      </div>
                      
                      <h2 className="text-5xl font-bold tracking-tighter text-premium">Virtual HR <br />Manager</h2>
                      
                      <div className="grid grid-cols-1 gap-6 pt-4">
                        {[
                          { val: "10 Free", label: "Questions", icon: MessageSquare, color: "text-blue-400" },
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

                  {/* Right Avatar */}
                  <div className="md:w-1/2 relative min-h-[400px] md:min-h-0 p-8 flex items-center justify-center">
                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden glass border-white/20 shadow-2xl">
                      <Image 
                        src="/images/hr-manager.jpg"
                        alt="Virtual HR Manager"
                        fill
                        className="object-cover rounded-2xl opacity-90 group-hover:scale-105 transition-transform duration-[2s] brightness-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e1a]/60 via-transparent to-transparent"></div>
                    </div>
                    
                    {/* Floating Pulse Rings */}
                    <div className="absolute bottom-12 right-12 z-20">
                      <div className="w-4 h-4 rounded-full bg-accent animate-ping"></div>
                    </div>
                  </div>
                </Card>

                {/* Card Feature Highlights below */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { label: "AI-Powered", icon: BrainCircuit },
                    { label: "Real-Life", icon: UserCheck },
                    { label: "Instant", icon: Zap },
                    { label: "Resume Audit", icon: FileText },
                    { label: "Roadmap", icon: Map },
                    { label: "Get Hired", icon: Trophy },
                    { label: "Secure", icon: ShieldCheck }
                  ].map((feat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass px-4 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center justify-center gap-2 border-white/5 whitespace-nowrap"
                    >
                      <feat.icon className="w-3 h-3 text-accent/50" />
                      {feat.label}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Mission Section */}
      <section className="py-32 relative overflow-hidden bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Our Core Mission</Badge>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-premium">Why Nexvoro AI <br /><span className="text-gradient-purple">Exists.</span></h2>
                <p className="text-2xl font-bold text-accent tracking-tight">Talent is everywhere. Opportunity should be too.</p>
              </div>
              
              <div className="space-y-8 text-xl font-light text-muted-foreground leading-relaxed">
                <p>
                  Every year, thousands of talented students and IT professionals attend interviews but fail to secure jobs because they lack proper interview practice, confidence, and real-world preparation.
                </p>
                <p>
                  Many candidates have strong technical skills, yet they struggle to perform under interview pressure. <span className="text-white font-medium">Nexvoro AI was created to solve this problem.</span>
                </p>
                <div className="p-10 glass rounded-[3.5rem] border-accent/20 bg-accent/[0.02] relative group">
                  <div className="absolute -top-6 -left-6 w-16 h-16 rounded-[2rem] bg-accent flex items-center justify-center text-[#050816] shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                    <Quote className="w-8 h-8 fill-current" />
                  </div>
                  <p className="text-2xl text-white font-bold italic tracking-tight leading-snug">
                    "Talent is everywhere. Opportunity should be too."
                  </p>
                </div>
                <p>
                  Our mission is to help candidates practice real interview scenarios, improve their resumes, identify skill gaps, build confidence, and become job-ready through AI-powered guidance.
                </p>
                <p className="text-white/90">
                  We believe that talent should not be rejected because of a lack of preparation.
                </p>
                <div className="flex items-center gap-4 text-accent font-bold tracking-widest uppercase text-sm">
                  <span>Practice smarter</span>
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                  <span>Interview better</span>
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                  <span>Get hired faster</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-accent/20 blur-[120px] rounded-full"></div>
              <div className="relative z-10 premium-card p-0 overflow-hidden border-white/10 shadow-[0_0_80px_rgba(34,211,238,0.1)]">
                <Image 
                  src={PlaceHolderImages.find(img => img.id === 'candidate-prep')?.imageUrl || ''}
                  alt="Candidate Preparing"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover opacity-90 brightness-110"
                  data-ai-hint="professional candidate preparing"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="glass p-6 rounded-2xl flex items-center gap-6 border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                      <Target className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                      Precision-engineered to simulate <br />high-stakes corporate environments.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {STATS.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-4"
              >
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center mx-auto text-accent mb-6">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-5xl font-bold tracking-tighter tabular-nums text-premium">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Operational Sequence</Badge>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 text-premium">How the Protocol <br /><span className="text-gradient-purple">Initializes.</span></h2>
            <p className="text-xl text-muted-foreground font-light">From neural scan to executive readiness in four streamlined phases.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block"></div>
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="premium-card bg-white/[0.01] border-white/5 p-10 text-center relative z-10 group hover:bg-white/[0.03] transition-all"
              >
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-accent/10 transition-colors">
                  <step.icon className="w-8 h-8 text-accent" />
                </div>
                <div className="text-xs font-bold text-accent mb-4 tracking-[0.2em]">{step.step}</div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white/[0.01] relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <Badge className="bg-purple-500/20 text-purple-400 mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Protocol Capabilities</Badge>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-premium">Engineered for <br /><span className="text-gradient-purple">Elite Technical Mastery.</span></h2>
            </div>
            <p className="text-xl text-muted-foreground font-light max-w-sm">Deploying advanced neural models to bridge the gap between potential and reality.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="premium-card p-10 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Roles Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Specialization Library</Badge>
            <h2 className="text-5xl font-bold tracking-tighter text-premium">60+ Neural Simulation <br /><span className="text-gradient-purple">Tracks Available.</span></h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {ROLES.slice(0, 30).map((role, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i % 10) * 0.05 }}
                viewport={{ once: true }}
                className="px-6 py-3 glass rounded-2xl text-xs font-bold uppercase tracking-widest text-white/60 border-white/5 hover:text-white hover:border-accent/30 transition-all cursor-default"
              >
                {role}
              </motion.div>
            ))}
            <div className="px-6 py-3 glass rounded-2xl text-xs font-bold uppercase tracking-widest text-accent border-accent/20">
              & 30+ more tracks
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="premium-card bg-[#0b0e1a] border-accent/20 p-24 text-center max-w-5xl mx-auto shadow-[0_0_100px_rgba(34,211,238,0.1)]"
          >
            <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-accent/30 shadow-2xl">
              <Zap className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-premium mb-8">Ready to Accelerate your <br /><span className="text-gradient-purple">Technical Trajectory?</span></h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-16">
              Initialize your first neural simulation today and benchmark your skills against global hiring standards.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <Button 
                onClick={handleStartVirtualInterview}
                size="lg" 
                className="h-20 px-16 text-lg btn-premium shadow-[0_0_60px_rgba(147,51,234,0.3)]"
              >
                Initialize Arena Simulation
              </Button>
              <Button 
                onClick={handleAnalyzeResumeDirect}
                size="lg" 
                variant="outline" 
                className="h-20 px-12 rounded-full glass border-white/10 hover:bg-white/10 text-lg"
              >
                Audit Career Blueprint
              </Button>
            </div>
          </motion.div>
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

      {/* Professional Footer */}
      <footer className="pt-32 pb-16 border-t border-white/5 bg-black/50 backdrop-blur-3xl relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-24">
            <div className="col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
                  <Command className="text-white w-6 h-6" />
                </div>
                <span className="font-headline font-bold text-2xl tracking-tighter uppercase">NEXVORO<span className="text-accent">AI</span></span>
              </Link>
              <p className="text-muted-foreground font-light leading-relaxed max-w-sm">
                The world's most advanced neural simulation platform for elite technical recruitment and career trajectory acceleration.
              </p>
              <div className="flex gap-4">
                {[Globe, Twitter, Linkedin, Github].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold text-premium">Protocols</h5>
              <ul className="space-y-4 text-sm font-light text-muted-foreground">
                <li><Link href="/interview" className="hover:text-accent transition-colors">Neural Arena</Link></li>
                <li><Link href="/resume" className="hover:text-accent transition-colors">Blueprint Auditor</Link></li>
                <li><Link href="/roadmap" className="hover:text-accent transition-colors">Growth Pathways</Link></li>
                <li><Link href="/features" className="hover:text-accent transition-colors">Capabilities</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold text-premium">Ecosystem</h5>
              <ul className="space-y-4 text-sm font-light text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-accent transition-colors">Economics</Link></li>
                <li><Link href="/about" className="hover:text-accent transition-colors">Neural Team</Link></li>
                <li><Link href="/partners" className="hover:text-accent transition-colors">Hiring Partners</Link></li>
                <li><Link href="/careers" className="hover:text-accent transition-colors">Internal Ops</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold text-premium">Support</h5>
              <ul className="space-y-4 text-sm font-light text-muted-foreground">
                <li><Link href="/docs" className="hover:text-accent transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-accent transition-colors">Neural API</Link></li>
                <li><Link href="/status" className="hover:text-accent transition-colors">System Status</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Encrypted Support</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold text-premium">Legal</h5>
              <ul className="space-y-4 text-sm font-light text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Protocol</Link></li>
                <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Op</Link></li>
                <li><Link href="/security" className="hover:text-accent transition-colors">Encryption Audit</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">
              © 2025 NEXVORO SYSTEMS. WORLDWIDE OPERATIONAL CLEARANCE.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-green-400/60">All Neural Nodes Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Placeholder components for the footer icons
function Twitter(props: any) { return <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>; }
function Linkedin(props: any) { return <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>; }
function Github(props: any) { return <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>; }
