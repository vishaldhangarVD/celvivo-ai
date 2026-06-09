'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Target, 
  Eye, 
  BrainCircuit, 
  FileSearch, 
  Map, 
  Globe, 
  Cpu, 
  Zap,
  TrendingUp,
  ShieldCheck,
  Award,
  Users
} from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const sections = [
  {
    icon: BrainCircuit,
    title: "AI Interview Technology",
    desc: "Our proprietary Neural Simulation Engine mimics the complex reasoning and pressure of high-stakes corporate interviews."
  },
  {
    icon: FileSearch,
    title: "Resume Intelligence",
    desc: "A multi-dimensional blueprint auditor that parses career history for ATS compatibility and strategic keyword density."
  },
  {
    icon: Map,
    title: "Career Roadmaps",
    desc: "Dynamic growth pathways that evolve based on session performance, identifying critical certification milestones."
  },
  {
    icon: Globe,
    title: "Global Hiring Standards",
    desc: "Our protocol is calibrated against hiring benchmarks from the Fortune 500 and top-tier silicon valley startups."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40 pb-32">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
              The Neural Foundation
            </Badge>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-premium mb-8">
              About <span className="text-gradient-purple">Nexvoro AI.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Nexvoro AI is an advanced AI-powered interview preparation and career development platform designed for elite IT professionals.
            </p>
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-12 mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="premium-card bg-white/[0.01] border-white/5 p-12"
          >
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-8 text-accent">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-muted-foreground font-light text-lg leading-relaxed">
              To democratize elite interview preparation. We empower job seekers with hyper-realistic simulations, ensuring that talent is never rejected simply because of a lack of preparation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="premium-card bg-white/[0.01] border-white/5 p-12"
          >
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-8 text-purple-400">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-muted-foreground font-light text-lg leading-relaxed">
              To become the global standard for career readiness. We envision a future where every technical professional has a verified neural roadmap to their highest career potential.
            </p>
          </motion.div>
        </div>

        {/* Why Nexvoro AI - Detailed Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-premium mb-4">The Neural Architecture</h2>
            <p className="text-muted-foreground font-light">Engineered to simulate high-stakes corporate environments.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-10 rounded-[2.5rem] border-white/5 hover:bg-white/[0.03] transition-all group"
              >
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <section.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{section.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Future Innovations */}
        <Card className="premium-card bg-accent/5 border-accent/10 p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <Badge className="bg-accent/20 text-accent mb-6 border-none px-4 py-1 font-bold tracking-widest text-[10px] uppercase">R&D Protocol</Badge>
              <h2 className="text-5xl font-bold tracking-tighter mb-8 text-premium">Future <br /><span className="text-gradient-purple">Innovations.</span></h2>
              <ul className="space-y-6">
                {[
                  "Multi-modal video analysis for body language audit",
                  "AI-driven portfolio verification protocols",
                  "Real-time technical whiteboard simulation",
                  "Direct pipeline integration with elite hiring partners"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 text-muted-foreground font-light text-lg">
                    <div className="w-2 h-2 rounded-full bg-accent mt-3 shrink-0"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden glass border-white/10">
              <Image 
                src={PlaceHolderImages.find(img => img.id === 'demo-preview')?.imageUrl || ''}
                alt="Future Tech"
                fill
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Cpu className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-[0.4em]">Neural Core v5.0 Pending</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
