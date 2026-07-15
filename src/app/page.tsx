
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
      
      <section className="relative flex-1 flex items-center pt-32 pb-16 lg:pt-40">
        <div className="container mx-auto px-6 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content Section */}
            <div className="lg:w-1/2 text-left space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/5"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/70">Neural Recruitment v5.0</span>
              </motion.div>
              
              <div className="space-y-4">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] text-premium"
                >
                  Master Every <br />
                  <span className="text-gradient-purple">Interview.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.1 }}
                  className="max-w-md text-base lg:text-lg text-muted-foreground font-light leading-relaxed"
                >
                  Experience hyper-realistic simulations calibrated for Big Tech hiring standards.
                </motion.p>
              </div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Button 
                  onClick={handleStartVirtualInterview} 
                  size="lg" 
                  className="h-12 px-8 text-sm btn-premium rounded-xl"
                >
                  Start Virtual Interview <Zap className="ml-2 w-4 h-4" />
                </Button>
                <Link href="/question-bank">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-12 px-8 text-sm glass border-white/10 hover:bg-white/5 flex gap-2 group rounded-xl"
                  >
                    ✨ Library Access
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Card Section */}
            <div className="lg:w-1/2 w-full max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                <Card className="premium-card border-glow-premium p-0 overflow-hidden border-white/10 bg-[#0b0e1a]/80 shadow-[0_0_80px_rgba(147,51,234,0.1)] flex flex-col md:flex-row min-h-[420px] rounded-[2rem]">
                  <div className="md:w-[70%] p-8 flex flex-col justify-between relative z-10">
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold tracking-tighter text-premium">Virtual HR Arena</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-accent font-bold text-[9px] uppercase tracking-[0.3em]">
                          <Rocket className="w-3.5 h-3.5" /> Simulation Journey
                        </div>
                        
                        <div className="space-y-2 pl-1">
                          {[
                            { label: "Resume Analysis", emoji: "📄", desc: "Intelligence Sync" },
                            { label: "Aptitude Test", emoji: "🧠", desc: "Logic Nodes" },
                            { label: "Coding Challenge", emoji: "💻", desc: "Syntax Matrix" },
                            { label: "Virtual Interview", emoji: "🎤", desc: "Neural Arena" },
                            { label: "AI Performance Report", emoji: "📊", desc: "Master Audit" }
                          ].map((step, idx, arr) => (
                            <div key={idx} className="flex flex-col">
                              <motion.div 
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx + 0.4 }}
                                className="flex items-center gap-3 group/step"
                              >
                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/5 group-hover/step:border-accent/30 transition-colors">
                                  {step.emoji}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-white group-hover/step:text-accent transition-colors uppercase tracking-widest">{step.label}</span>
                                  <span className="text-[8px] text-muted-foreground uppercase font-medium">{step.desc}</span>
                                </div>
                              </motion.div>
                              {idx < arr.length - 1 && (
                                <div className="pl-3.5 py-1">
                                  <div className="w-px h-3 bg-gradient-to-b from-white/10 to-transparent" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleStartVirtualInterview} 
                      className="w-full h-12 btn-orange-premium text-[10px] font-bold tracking-[0.2em] uppercase mt-6 rounded-xl"
                    >
                      Initialize Journey <ChevronRight className="ml-2 w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  <div className="md:w-[30%] relative min-h-[300px] md:min-h-full flex items-center justify-center bg-black/20 border-l border-white/5">
                    <div className="relative w-full h-full">
                      <Image 
                        src={hrImg} 
                        alt="HR Manager" 
                        fill 
                        className="object-cover opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
                        priority 
                        sizes="(max-width: 768px) 100vw, 30vw"
                        data-ai-hint="professional businessman"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e1a] via-transparent to-transparent md:bg-gradient-to-l" />
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
