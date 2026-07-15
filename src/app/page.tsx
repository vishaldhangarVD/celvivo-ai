'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Rocket,
  Loader2,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  Star
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const hrImg = PlaceHolderImages.find(img => img.id === 'ai-hr-interviewer')?.imageUrl || "https://picsum.photos/seed/nexvoro_hr/800/1000";

  const handleStartVirtualInterview = () => {
    if (!user) {
      router.push('/login?redirectTo=/interview');
      return;
    }
    router.push('/interview');
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-[#050816]">
      {/* Dynamic Background Elements */}
      <div className="particles-bg" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <Navbar />
      
      <section className="relative flex-1 flex items-center justify-center pt-20 px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 items-center gap-16 lg:gap-24">
            
            {/* Left Content Section */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-10"
            >
              <div className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass border-white/10"
                >
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[9px] font-bold tracking-[0.5em] uppercase text-white/60">Neural Matrix v5.0 Active</span>
                </motion.div>
                
                <div className="space-y-6">
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] text-premium">
                    Master Every <br />
                    <span className="text-gradient-purple">Interview.</span>
                  </h1>
                  
                  <p className="max-w-xl text-lg lg:text-xl text-muted-foreground font-light leading-relaxed">
                    Deploy high-fidelity simulations calibrated for elite IT standards. Bridge the gap between technical potential and executive reality.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <Button 
                  onClick={handleStartVirtualInterview} 
                  size="lg" 
                  className="h-16 px-10 text-sm btn-premium rounded-2xl shadow-[0_20px_50px_rgba(147,51,234,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  Initialize Virtual Arena <Zap className="ml-3 w-5 h-5 fill-current" />
                </Button>
                <Link href="/question-bank">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16 px-10 text-sm glass border-white/10 hover:bg-white/5 flex gap-3 group rounded-2xl transition-all"
                  >
                    <Star className="w-4 h-4 text-accent transition-transform group-hover:rotate-12" />
                    Knowledge Library
                  </Button>
                </Link>
              </div>

              {/* Trust Badge / Metrics */}
              <div className="flex items-center gap-10 pt-8 border-t border-white/5">
                {[
                  { label: "Precision", val: "98.4%", icon: Cpu },
                  { label: "Simulations", val: "1.2M+", icon: BrainCircuit },
                  { label: "Success", val: "84%", icon: ShieldCheck }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">
                      <stat.icon className="w-3 h-3" /> {stat.label}
                    </div>
                    <div className="text-xl font-bold text-white/90">{stat.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Card Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 30 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-accent/20 rounded-[3rem] blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000" />
              
              <Card className="premium-card border-glow-premium p-0 overflow-hidden border-white/10 bg-[#0b0e1a]/90 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row min-h-[520px] rounded-[3rem] relative z-10">
                <div className="md:w-[65%] p-12 flex flex-col justify-between relative z-10">
                  <div className="space-y-10">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-bold tracking-tighter text-premium">Simulation Protocol</h2>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-[0.5em] flex items-center gap-3">
                        <Rocket className="w-4 h-4" /> Sequential Logic Path
                      </p>
                    </div>
                    
                    <div className="space-y-4 pl-1">
                      {[
                        { label: "Resume Intelligence", desc: "Identity Verification", color: "text-purple-400" },
                        { label: "Aptitude Screening", desc: "Logic Node Audit", color: "text-blue-400" },
                        { label: "Syntax Matrix", desc: "Implementation Check", color: "text-emerald-400" },
                        { label: "Neural Arena", desc: "Elite Virtual Interview", color: "text-accent" },
                        { label: "Master Performance Audit", desc: "Full Analytics Report", color: "text-amber-400" }
                      ].map((step, idx, arr) => (
                        <div key={idx} className="flex flex-col">
                          <motion.div 
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-5 group/step cursor-default"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xs font-black transition-all group-hover/step:border-accent/50 group-hover/step:bg-accent/5">
                                {idx + 1}
                              </div>
                              {idx < arr.length - 1 && (
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/90 group-hover/step:text-white transition-colors uppercase tracking-widest">{step.label}</span>
                              <span className={`text-[9px] ${step.color} font-bold uppercase tracking-widest opacity-60 group-hover/step:opacity-100 transition-opacity`}>{step.desc}</span>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleStartVirtualInterview} 
                    className="w-full h-16 btn-orange-premium text-[10px] font-black tracking-[0.4em] uppercase mt-12 rounded-2xl group/btn overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Launch Journey <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </Button>
                </div>
                
                <div className="md:w-[35%] relative min-h-[300px] md:min-h-full flex items-center justify-center bg-black/40 border-l border-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-50" />
                  <div className="relative w-full h-full">
                    <Image 
                      src={hrImg} 
                      alt="Neural Interviewer" 
                      fill 
                      className="object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 scale-105 group-hover:scale-100" 
                      priority 
                      sizes="(max-width: 768px) 100vw, 35vw"
                      data-ai-hint="professional interviewer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e1a] via-transparent to-transparent md:bg-gradient-to-l" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
