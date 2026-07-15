
'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  Star,
  Globe,
  Award,
  ExternalLink,
  Flame,
  LayoutGrid,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { useState, useRef } from 'react';

const COMPANIES = [
  { name: "Google", logo: "GOOG", color: "text-blue-400" },
  { name: "Microsoft", logo: "MSFT", color: "text-blue-500" },
  { name: "Amazon", logo: "AMZN", color: "text-orange-400" },
  { name: "Meta", logo: "META", color: "text-blue-600" },
  { name: "Oracle", logo: "ORCL", color: "text-red-500" },
  { name: "IBM", logo: "IBM", color: "text-blue-300" },
  { name: "Cisco", logo: "CSCO", color: "text-blue-400" },
  { name: "TCS", logo: "TCS", color: "text-purple-400" },
  { name: "Infosys", logo: "INFY", color: "text-blue-500" },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [isScrollingPaused, setIsScrollingPaused] = useState(false);

  const hrImg = "/hr.png.png";

  const handleStartVirtualInterview = () => {
    if (!user) {
      router.push('/login?redirectTo=/interview');
      return;
    }
    router.push('/interview');
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-[#050816]">
      {/* Dynamic Background Elements */}
      <div className="particles-bg" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <Navbar />
      
      <section className="relative flex flex-col items-center justify-center pt-32 pb-16 px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 items-center gap-14 lg:gap-14 mb-12">
            
            {/* Left Content Section */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass border-white/10"
                >
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[9px] font-bold tracking-[0.5em] uppercase text-white/60">Neural Matrix v5.0 Active</span>
                </motion.div>
                
                <div className="space-y-4">
                  <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[0.95] text-premium">
                    Master Every <br />
                    <span className="text-gradient-purple">Interview.</span>
                  </h1>
                  
                  <p className="max-w-md text-xl text-muted-foreground font-light leading-relaxed">
                    Deploy high-fidelity simulations calibrated for elite IT standards. Bridge the gap between technical potential and executive reality.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button 
                  onClick={handleStartVirtualInterview} 
                  className="h-14 px-8 text-xs btn-premium rounded-2xl shadow-[0_20px_50px_rgba(147,51,234,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  Initialize Virtual Arena <Zap className="ml-3 w-4 h-4 fill-current" />
                </Button>
                <Link href="/question-bank">
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 text-xs glass border-white/10 hover:bg-white/5 flex gap-3 group rounded-2xl transition-all"
                  >
                    <Star className="w-4 h-4 text-accent transition-transform group-hover:rotate-12" />
                    Knowledge Library
                  </Button>
                </Link>
              </div>

              {/* Trust Badge / Metrics */}
              <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                {[
                  { label: "Precision", val: "98.4%", icon: Cpu },
                  { label: "Simulations", val: "1.2M+", icon: BrainCircuit },
                  { label: "Success", val: "84%", icon: ShieldCheck }
                ].map((stat, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-bold text-white/30">
                      <stat.icon className="w-2.5 h-2.5" /> {stat.label}
                    </div>
                    <div className="text-lg font-bold text-white/90">{stat.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Card Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 30 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative group w-full"
            >
              <div className="absolute inset-0 bg-accent/20 rounded-[3rem] blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000" />
              
              <Card className="premium-card overflow-hidden rounded-[3rem] border border-cyan-500/20 bg-[#0B0F1D] backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,255,0.08)] transition-all duration-500 hover:shadow-[0_0_120px_rgba(59,130,246,0.18)] flex flex-col md:flex-row min-h-[500px]">
                <div className="md:w-[60%] p-10 flex flex-col justify-between relative z-10">
                  <div className="space-y-8">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-bold tracking-tighter text-premium">Simulation Protocol</h2>
                      <p className="text-[9px] text-accent font-bold uppercase tracking-[0.5em] flex items-center gap-3">
                        <Rocket className="w-3.5 h-3.5" /> Sequential Logic Path
                      </p>
                    </div>
                    
                    <div className="space-y-3 pl-1">
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
                            className="flex items-center gap-4 group/step cursor-default"
                          >
                            <div className="relative">
                              <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[10px] font-black transition-all group-hover/step:border-accent/50 group-hover/step:bg-accent/5">
                                {idx + 1}
                              </div>
                              {idx < arr.length - 1 && (
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-gradient-to-b from-white/10 to-transparent" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white/90 group-hover/step:text-white transition-colors uppercase tracking-widest">{step.label}</span>
                              <span className={`text-[8px] ${step.color} font-bold uppercase tracking-widest opacity-60 group-hover/step:opacity-100 transition-opacity`}>{step.desc}</span>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleStartVirtualInterview} 
                    className="w-full h-12 btn-orange-premium text-[9px] font-black tracking-[0.4em] uppercase mt-10 rounded-2xl group/btn overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Launch Journey <ChevronRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </Button>
                </div>
                
                <div className="relative w-full md:w-[40%] min-h-[400px] md:min-h-full overflow-hidden rounded-r-[3rem] bg-black">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-50 z-10" />
                  <div className="absolute inset-0">
                    <Image
                      src={hrImg}
                      alt="AI HR Manager"
                      fill
                      priority
                      sizes="(max-width:768px)100vw,40vw"
                      className="object-cover object-center scale-[1.10]"
                    />

                    {/* Premium Light Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/30 via-transparent to-transparent z-20" />

                    {/* Blue Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-blue-500/10 z-20" />

                    {/* Premium Border Glow */}
                    <div className="absolute inset-0 ring-1 ring-cyan-400/10 rounded-r-[3rem] z-20" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* New Premium Enterprise Showcase Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mt-24 mb-16 relative"
          >
            {/* Background Neural Mesh Orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Verified Hiring Ecosystem</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-premium">
                  TRUSTED BY GLOBAL TECH <span className="text-gradient-purple">LEADERS.</span>
                </h2>
                <p className="text-muted-foreground font-light max-w-xl mx-auto text-lg">
                  Preparing candidates for companies shaping the future of global technology.
                </p>
              </div>

              {/* Infinite Scroller Showcase */}
              <div 
                className="relative glass rounded-[2.5rem] border-white/5 bg-white/[0.01] overflow-hidden py-16 px-4 group"
                onMouseEnter={() => setIsScrollingPaused(true)}
                onMouseLeave={() => setIsScrollingPaused(false)}
              >
                {/* Gradient Border Animation */}
                <div className="absolute inset-0 border-glow-premium opacity-10" />

                <motion.div 
                  className="flex gap-8 w-max"
                  animate={{ x: isScrollingPaused ? 0 : [0, -100 * COMPANIES.length] }}
                  transition={{ 
                    duration: 40, 
                    repeat: Infinity, 
                    ease: "linear",
                    repeatType: "loop"
                  }}
                >
                  {[...COMPANIES, ...COMPANIES].map((company, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -10, scale: 1.05 }}
                      className="w-64 h-40 glass rounded-3xl border-white/10 flex flex-col items-center justify-center gap-4 group/card relative transition-all duration-500 hover:bg-white/[0.05] hover:border-accent/30 hover:shadow-[0_20px_50px_rgba(34,211,238,0.15)]"
                    >
                      {/* Parallax Card Content */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-3xl" />
                      
                      <div className={`text-4xl font-black ${company.color} opacity-40 group-hover/card:opacity-100 transition-all duration-500 group-hover/card:scale-110 tracking-tighter`}>
                        {company.logo}
                      </div>
                      
                      <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 group-hover/card:text-white transition-colors">
                        {company.name}
                      </div>

                      {/* Animated Corner Orbs */}
                      <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-accent opacity-0 group-hover/card:opacity-100 blur-[2px] transition-opacity" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-purple-500 opacity-0 group-hover/card:opacity-100 blur-[2px] transition-opacity" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Scroller Overlays */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050816] to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050816] to-transparent z-10" />
              </div>

              <div className="mt-12 text-center">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/30">
                  Trusted by students preparing for the world's leading technology companies.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
