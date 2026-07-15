
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
  Loader2
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
      
      <section className="relative flex-1 flex items-center pt-20">
        <div className="container mx-auto px-8 z-10">
          <div className="grid lg:grid-cols-2 items-center gap-14 lg:gap-14 max-w-7xl mx-auto">
            {/* Left Content Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass border-white/5"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/80">Neural Recruitment v5.0</span>
                </motion.div>
                
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] text-premium">
                    Master Every <br />
                    <span className="text-gradient-purple">Interview.</span>
                  </h1>
                  
                  <p className="max-w-xl text-lg lg:text-xl text-muted-foreground font-light leading-relaxed">
                    Experience hyper-realistic simulations calibrated for Big Tech hiring standards. Bridge the gap between engineering potential and executive reality.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 pt-2">
                <Button 
                  onClick={handleStartVirtualInterview} 
                  size="lg" 
                  className="h-14 px-10 text-base btn-premium rounded-2xl shadow-[0_20px_50px_rgba(147,51,234,0.2)]"
                >
                  Start Virtual Interview <Zap className="ml-2.5 w-5 h-5" />
                </Button>
                <Link href="/question-bank">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-10 text-base glass border-white/10 hover:bg-white/5 flex gap-2 group rounded-2xl"
                  >
                    ✨ Library Access
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Card Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Card className="premium-card border-glow-premium p-0 overflow-hidden border-white/10 bg-[#0b0e1a]/80 shadow-[0_0_100px_rgba(147,51,234,0.15)] flex flex-col md:flex-row min-h-[480px] rounded-[2.5rem]">
                <div className="md:w-[68%] p-10 flex flex-col justify-between relative z-10">
                  <div className="space-y-8">
                    <h2 className="text-3xl font-bold tracking-tighter text-premium">Virtual HR Arena</h2>
                    
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 text-accent font-bold text-[10px] uppercase tracking-[0.4em]">
                        <Rocket className="w-4 h-4" /> Simulation Journey
                      </div>
                      
                      <div className="space-y-3 pl-1">
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
                              transition={{ delay: 0.1 * idx + 0.3 }}
                              className="flex items-center gap-4 group/step"
                            >
                              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-base border border-white/5 group-hover/step:border-accent/40 transition-all">
                                {step.emoji}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white group-hover/step:text-accent transition-colors uppercase tracking-widest">{step.label}</span>
                                <span className="text-[9px] text-muted-foreground uppercase font-medium tracking-tight">{step.desc}</span>
                              </div>
                            </motion.div>
                            {idx < arr.length - 1 && (
                              <div className="pl-[15px] py-1.5">
                                <div className="w-px h-4 bg-gradient-to-b from-white/10 to-transparent" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleStartVirtualInterview} 
                    className="w-full h-14 btn-orange-premium text-[11px] font-bold tracking-[0.3em] uppercase mt-10 rounded-2xl"
                  >
                    Initialize Journey <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="md:w-[32%] relative min-h-[350px] md:min-h-full flex items-center justify-center bg-black/20 border-l border-white/5">
                  <div className="relative w-full h-full">
                    <Image 
                      src={hrImg} 
                      alt="HR Manager" 
                      fill 
                      className="object-cover opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000" 
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
      </section>
    </div>
  );
}
