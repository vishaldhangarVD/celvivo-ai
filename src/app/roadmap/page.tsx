'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Target, 
  Map as MapIcon, 
  ChevronRight, 
  Award, 
  BrainCircuit,
  Rocket,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const steps = [
  {
    title: "Core Protocol Mastery",
    desc: "Acquire fundamental logic nodes for elite engineering tracks.",
    skills: ["React 19", "Next.js 15", "Neural Architecture"],
    status: "Completed",
    icon: BrainCircuit
  },
  {
    title: "Deployment Strategy",
    desc: "Master CI/CD and enterprise-grade deployment protocols.",
    skills: ["Docker", "Kubernetes", "AWS Infrastructure"],
    status: "Active",
    icon: Rocket
  },
  {
    title: "Executive Synthesis",
    desc: "Refine strategic communication and system design logic.",
    skills: ["Strategic Design", "Leadership Archetypes"],
    status: "Locked",
    icon: Target
  }
];

export default function CareerRoadmap() {
  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-32">
        <div className="max-w-5xl mx-auto space-y-16">
          <header className="text-center">
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Personalized Career Pathway</Badge>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-premium mb-8">Growth Architecture</h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Your neural evolution path, dynamically calculated from your session performance and career blueprints.
            </p>
          </header>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block"></div>
            
            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1 w-full">
                    <Card className={`premium-card p-10 bg-white/[0.01] border-white/5 hover:bg-white/[0.03] transition-all group ${step.status === 'Active' ? 'border-accent/30 bg-accent/[0.02]' : ''}`}>
                      <div className="flex justify-between items-start mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center glass ${step.status === 'Completed' ? 'text-green-400' : 'text-accent'}`}>
                          <step.icon className="w-7 h-7" />
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-bold tracking-widest uppercase border-white/10 ${step.status === 'Active' ? 'bg-accent/20 text-accent border-accent/30' : 'text-muted-foreground'}`}>
                          {step.status}
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-muted-foreground font-light leading-relaxed mb-8">{step.desc}</p>
                      <div className="flex flex-wrap gap-3">
                        {step.skills.map((skill, j) => (
                          <Badge key={j} className="bg-white/5 text-white/50 border-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="relative z-10 w-16 h-16 rounded-full glass border-white/10 flex items-center justify-center hidden md:flex">
                    <div className={`w-3 h-3 rounded-full ${step.status === 'Completed' ? 'bg-green-400' : step.status === 'Active' ? 'bg-accent' : 'bg-white/10'}`}></div>
                  </div>
                  
                  <div className="flex-1 hidden md:block"></div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-24 text-center">
            <Card className="premium-card bg-white/[0.01] border-white/5 p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
              <div className="relative z-10 space-y-8">
                <Award className="w-20 h-20 text-accent mx-auto" />
                <h2 className="text-4xl font-bold tracking-tight">System Ready for Acceleration</h2>
                <p className="text-muted-foreground font-light max-w-xl mx-auto">Complete 3 more simulations to unlock the Executive Tier credentials and partner hiring network.</p>
                <Link href="/interview">
                  <Button className="h-16 px-12 btn-premium group">
                    Begin Next Simulation <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}