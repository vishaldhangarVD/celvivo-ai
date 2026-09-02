'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import NavigationControls from '@/components/NavigationControls';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, BrainCircuit, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

/**
 * @fileOverview About NEXVORO AI Page.
 * Features a premium glassmorphism layout with 3D mouse-tracking interaction for the founder profile.
 */

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking values for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transformations for subtle 3D rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize to -0.5 to 0.5
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <NavigationControls />

      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <main className="flex-1 container mx-auto px-6 pt-40 pb-32 flex flex-col items-center">
        <header className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
              The Visionary Protocol
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-premium">
              About <span className="text-gradient-purple">NEXVORO AI.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mt-6">
              Empowering students with AI-powered interview success.
            </p>
          </motion.div>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full max-w-5xl"
        >
          <Card className="premium-card bg-white/[0.02] border-white/5 p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-16 md:gap-24 shadow-2xl backdrop-blur-3xl">
            {/* Background decorative element */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <BrainCircuit className="w-64 h-64 text-white" />
            </div>

            {/* Interactive Founder Image Section */}
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative shrink-0 perspective-1000 group"
            >
              {/* Outer Glowing Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-15px] rounded-full border-2 border-dashed border-accent/20 opacity-40 group-hover:opacity-100 group-hover:border-accent/40 transition-all duration-500" 
              />
              
              {/* Inner Pulsing Ring */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, opacity: 0.6 }}
                className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-md pointer-events-none"
              />

              {/* 3D Image Wrapper */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-full h-full relative"
                >
                  <Image 
                    src="https://picsum.photos/seed/vinay/600/600"
                    alt="Vinay Dange - Founder & CEO"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 192px, 256px"
                    data-ai-hint="professional portrait"
                    priority
                  />
                  {/* Subtle glass overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/40 via-transparent to-transparent" />
                </motion.div>
              </motion.div>

              {/* Decorative status indicator */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-accent border-4 border-[#0b0e1a] shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20" 
              />
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-8 text-center md:text-left relative z-10">
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Vinay Dange</h2>
                  <p className="text-accent font-black uppercase tracking-[0.3em] text-xs">Founder & CEO of NEXVORO AI</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                  NEXVORO AI was created to help students reduce interview fear, improve confidence, strengthen communication skills, and become job-ready through AI-powered interview practice and resume analysis.
                </p>
                
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Student Centric</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-400/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Neural Precision</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Vision Statement Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-accent/30 to-transparent mx-auto mb-8" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Bridging the Gap</h3>
          <p className="text-muted-foreground font-light italic leading-relaxed">
            "We believe talent is universal, but elite interview preparation is not. NEXVORO AI is here to democratize high-stakes career placement for the next generation of engineers."
          </p>
        </motion.div>
      </main>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
