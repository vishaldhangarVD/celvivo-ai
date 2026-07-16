
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  SearchCheck, 
  Zap, 
  Target, 
  BarChart3, 
  Briefcase, 
  Code2, 
  Award, 
  FileSearch,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';

const ANALYSIS_VECTORS = [
  { id: 'ats', title: 'ATS Score', icon: Target, color: 'text-accent' },
  { id: 'keywords', title: 'Keyword Match', icon: SearchCheck, color: 'text-purple-400' },
  { id: 'skills', title: 'Skill Analysis', icon: Cpu, color: 'text-blue-400' },
  { id: 'experience', title: 'Experience Evaluation', icon: Briefcase, color: 'text-orange-400' },
  { id: 'projects', title: 'Projects Review', icon: Code2, color: 'text-green-400' },
  { id: 'recommendation', title: 'Final AI Recommendation', icon: Award, color: 'text-yellow-400' },
];

export default function ResumeIntelligencePage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      {/* Background Ambience */}
      <div className="particles-bg" />
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-20">
          
          {/* Top Hero Section */}
          <header className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase mb-6">
                🤖 AI Resume Analysis
              </Badge>
              <h1 className="text-7xl font-bold tracking-tighter text-premium mb-6">
                AI Resume <span className="text-gradient-purple">Intelligence.</span>
              </h1>
              <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed">
                Upload your resume and receive AI-powered ATS scoring, keyword optimization, recruiter insights, skill gap detection and personalized improvement suggestions.
              </p>
            </motion.div>
          </header>

          {/* Section 1: Upload Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="premium-card bg-white/[0.01] border-white/5 p-1 flex flex-col items-center justify-center relative overflow-hidden group"
            >
              {/* Light sweep effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent group-hover:animate-light-streak" />
              </div>

              <div className="w-full border-2 border-dashed border-white/5 rounded-[2.8rem] p-20 text-center space-y-10 transition-all group-hover:border-accent/30 group-hover:bg-white/[0.01]">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:bg-accent/20 duration-500">
                    <FileSearch className="w-10 h-10 text-accent" />
                  </div>
                  <motion.div 
                    animate={isHovered ? { opacity: 1, scale: 1.2 } : { opacity: 0, scale: 0.8 }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-bold tracking-tight text-white">Drag & Drop Resume</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
                    Supported: PDF • DOCX • Maximum 5MB
                  </p>
                </div>

                <Button className="h-16 px-12 btn-premium text-xs font-bold uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_50px_rgba(147,51,234,0.2)] hover:scale-105 transition-all">
                  Initialize Upload Node
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Section 2: Analysis Vector Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ANALYSIS_VECTORS.map((vector, i) => (
              <motion.div
                key={vector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Card className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group min-h-[180px] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${vector.color} transition-all group-hover:scale-110 group-hover:bg-white/10`}>
                      <vector.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="border-white/5 text-[8px] font-bold text-white/20 tracking-widest uppercase">Awaiting Protocol</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/90">{vector.title}</h4>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> No analysis available
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Section 3: Bottom Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-6 pt-10"
          >
            <Button className="h-18 px-16 btn-premium text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(147,51,234,0.3)]">
              <Zap className="w-4 h-4 mr-3 fill-current" /> Analyze Resume
            </Button>
            <Button variant="ghost" className="h-18 px-10 rounded-2xl glass border-white/5 hover:bg-white/5 text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 hover:text-white">
              <RotateCcw className="w-4 h-4 mr-3" /> Reset Terminal
            </Button>
          </motion.div>

        </div>
      </main>

      <style jsx global>{`
        @keyframes light-streak {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-light-streak {
          animation: light-streak 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
