
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Terminal, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Cpu,
  Globe
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ROLES = [
  "Frontend Engineer", "Backend Architect", "Full Stack Developer", "AI Specialist",
  "Data Scientist", "ML Operations", "DevOps Strategist", "Security Analyst"
];

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
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32">
        <div className="container mx-auto px-4 text-center z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">Trusted by Fortune 500 Leaders</span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl md:text-9xl font-bold mb-8 tracking-tighter leading-[0.9]"
          >
            Intelligence <br />
            <span className="text-gradient-purple">Perfected.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground mb-12 font-light leading-relaxed"
          >
            Nexvoro AI deploy enterprise-grade neural simulation to prepare top-tier candidates for high-stakes technical environments.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/interview">
              <Button size="lg" className="h-16 px-12 text-lg btn-premium group">
                Initialize Session
                <Zap className="ml-2 w-5 h-5 group-hover:animate-pulse" />
              </Button>
            </Link>
            <Link href="/resume">
              <Button size="lg" variant="outline" className="h-16 px-12 text-lg rounded-full glass border-white/5 hover:bg-white/10">
                <FileText className="mr-2 w-5 h-5" />
                Audit Resume
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[150px] rounded-full animate-float"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Enterprise Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Sessions", val: "250K+" },
              { label: "Precision", val: "99.9%" },
              { label: "Placements", val: "15K+" },
              { label: "Enterprise", val: "120+" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold text-premium mb-2">{stat.val}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section: The Neural Engine */}
      <section className="py-32" id="features">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="premium-card relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Image 
                  src={PlaceHolderImages.find(img => img.id === 'ai-interviewer')?.imageUrl || ''}
                  alt="Neural Engine"
                  width={800}
                  height={800}
                  className="rounded-3xl object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
                  data-ai-hint="luxury ai robot"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 glass rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(147,51,234,0.3)]">
                    <Cpu className="w-12 h-12 text-accent" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="lg:w-1/2 space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl md:text-6xl font-bold mb-6 text-premium">The Neural <br /> Advantage.</h2>
                <p className="text-xl text-muted-foreground font-light leading-relaxed">
                  Our proprietary engine simulates not just the questions, but the intellectual intensity of top-tier technical assessments.
                </p>
              </motion.div>

              <div className="grid gap-8">
                {[
                  { icon: Globe, title: "Global Benchmarking", desc: "Compare results against the top 1% of silicon valley engineers." },
                  { icon: ShieldCheck, title: "Contextual Privacy", desc: "Enterprise-grade encryption for all candidate simulation data." },
                  { icon: Terminal, title: "Advanced Rubrics", desc: "Granular scoring based on system design, logic, and efficiency." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selector Section */}
      <section className="py-32 bg-white/[0.01]" id="roles">
        <div className="container mx-auto px-4 text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-premium">Elite Tracks</h2>
          <p className="text-muted-foreground text-xl font-light">Select your discipline to begin simulation.</p>
        </div>
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {ROLES.map((role, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link href={`/interview?role=${encodeURIComponent(role)}`}>
                  <div className="glass p-8 rounded-[2rem] text-center group cursor-pointer hover:bg-white/[0.08] hover:border-accent/30 transition-all duration-500 border-white/5 h-full flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors shadow-xl group-hover:shadow-accent/10">
                      <Target className="w-8 h-8 text-accent" />
                    </div>
                    <span className="font-bold text-sm tracking-widest uppercase group-hover:text-accent transition-colors">{role}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-40 relative">
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto glass p-24 rounded-[4rem] border-white/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
            <h2 className="text-5xl md:text-8xl font-bold mb-8 text-premium tracking-tighter">Accelerate Your <br /> Future.</h2>
            <p className="text-2xl text-muted-foreground mb-12 font-light max-w-2xl mx-auto">
              Deployment ready? Start your elite technical simulation today.
            </p>
            <Link href="/interview">
              <Button size="lg" className="h-20 px-16 text-xl btn-premium">
                Launch System
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <Sparkles className="text-accent w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-2xl tracking-tighter">NEXVORO</span>
          </div>
          <div className="flex gap-12 text-sm text-muted-foreground font-light tracking-widest uppercase">
            <Link href="#" className="hover:text-white transition-colors">Architecture</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Network</Link>
          </div>
          <p className="text-muted-foreground text-sm font-light">© 2025 NEXVORO SYSTEMS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
