'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
  Smartphone
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function LandingPage() {
  const hrImage = PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer');

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32">
        <div className="container mx-auto px-4 text-center z-10">
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
            className="text-7xl md:text-[9rem] font-bold mb-10 tracking-tighter leading-[0.85] text-premium"
          >
            Neural <br />
            <span className="text-gradient-purple">Intelligence.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground mb-16 font-light leading-relaxed"
          >
            Deploy elite AI simulations to audit your technical performance, analyze your resume, and generate verified career roadmaps.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link href="/interview">
              <Button size="lg" className="h-20 px-16 text-xl btn-premium group">
                Start Interview
                <Zap className="ml-3 w-6 h-6 group-hover:animate-pulse" />
              </Button>
            </Link>
            <Link href="/resume">
              <Button size="lg" variant="outline" className="h-20 px-16 text-xl rounded-full glass border-white/10 hover:bg-white/10">
                <FileText className="mr-3 w-6 h-6" />
                Analyze Resume
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="ghost" className="h-20 px-12 text-xl font-bold tracking-widest uppercase text-white/50 hover:text-white">
                <LayoutDashboard className="mr-3 w-6 h-6" />
                Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/20 blur-[180px] rounded-full animate-float"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[180px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* AI HR Section */}
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
                  src={hrImage?.imageUrl || ''}
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

      {/* Live Demo Section Preview */}
      <section className="py-40 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-premium">Simulation Interface</h2>
            <p className="text-muted-foreground text-xl font-light">The most advanced interview cockpit ever engineered.</p>
          </div>
          
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="premium-card p-4 overflow-hidden border-white/5 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/80 via-transparent to-transparent z-10"></div>
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'demo-preview')?.imageUrl || ''}
              alt="Simulation Demo"
              width={1600}
              height={900}
              className="rounded-[2.5rem] w-full object-cover"
              data-ai-hint="software ui interface"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Link href="/interview">
                <Button size="lg" className="h-24 px-16 text-2xl btn-premium rounded-3xl shadow-[0_0_80px_rgba(34,211,238,0.3)]">
                  Launch Live Demo
                  <Zap className="ml-4 w-8 h-8" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40">
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto glass p-32 rounded-[5rem] border-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
            <h2 className="text-7xl md:text-9xl font-bold mb-10 text-premium tracking-tighter">Perfect Your Pitch.</h2>
            <p className="text-3xl text-muted-foreground mb-16 font-light max-w-3xl mx-auto">
              Join 15,000+ engineers who used Nexvoro AI to secure roles at top-tier tech firms.
            </p>
            <Link href="/interview">
              <Button size="lg" className="h-24 px-20 text-2xl btn-premium">
                Initialize System
                <ArrowRight className="ml-4 w-8 h-8" />
              </Button>
            </Link>
          </motion.div>
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
              <Link href="#" className="hover:text-white transition-colors">Protocols</Link>
              <Link href="#" className="hover:text-white transition-colors">Neural</Link>
              <Link href="#" className="hover:text-white transition-colors">Enterprise</Link>
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