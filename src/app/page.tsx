
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
  BrainCircuit, 
  ChevronRight, 
  Rocket,
  Loader2,
  Command
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
                <Link href="/question-bank">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg glass border-white/10 hover:bg-white/5 flex gap-2 group">
                    ✨ Library Access
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-7/12 w-full">
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="relative group">
                <Card className="premium-card border-glow-premium p-0 overflow-hidden border-white/10 bg-[#0b0e1a]/80 shadow-[0_0_100px_rgba(147,51,234,0.15)] flex flex-col md:flex-row min-h-[550px]">
                  <div className="md:w-[75%] p-10 md:p-12 flex flex-col justify-between relative z-10">
                    <div className="space-y-8">
                      <h2 className="text-4xl font-bold tracking-tighter text-premium">Virtual HR Arena</h2>
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-accent font-bold text-xs uppercase tracking-[0.4em]">
                          <Rocket className="w-4 h-4" /> Simulation Journey
                        </div>
                        
                        <div className="space-y-3 pl-2">
                          {[
                            { label: "Resume Analysis", emoji: "📄", desc: "Intelligence Sync" },
                            { label: "Aptitude Test", emoji: "🧠", desc: "Logic Nodes" },
                            { label: "Coding Challenge", emoji: "💻", desc: "Syntax Matrix" },
                            { label: "Virtual Interview", emoji: "🎤", desc: "Neural Arena" },
                            { label: "AI Performance Report", emoji: "📊", desc: "Master Audit" }
                          ].map((step, idx, arr) => (
                            <div key={idx} className="flex flex-col">
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-center gap-4 group/step"
                              >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg border border-white/10 group-hover/step:border-accent/30 transition-colors">
                                  {step.emoji}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white group-hover/step:text-accent transition-colors uppercase tracking-widest">{step.label}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase font-medium">{step.desc}</span>
                                </div>
                              </motion.div>
                              {idx < arr.length - 1 && (
                                <div className="pl-5 py-2">
                                  <div className="w-px h-6 bg-gradient-to-b from-white/10 to-transparent ml-[3px]" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleStartVirtualInterview} className="w-full h-18 btn-orange-premium text-sm font-bold tracking-[0.3em] uppercase mt-12">
                      Initialize Journey <ChevronRight className="ml-3 w-5 h-5" />
                    </Button>
                  </div>
                  <div className="md:w-[25%] relative min-h-[550px] flex items-center justify-center bg-black/20 border-l border-white/5">
                    <div className="relative w-full h-full">
                      <Image src={hrImg} alt="HR Manager" fill className="object-cover opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" priority />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
