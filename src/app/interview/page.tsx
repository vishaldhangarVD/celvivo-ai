
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  GraduationCap, 
  Play, 
  Settings2,
  Trophy,
  Clock,
  Layers,
  Code2,
  Users,
  HandMetal
} from 'lucide-react';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer",
  "Data Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer",
  "DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst", "QA Engineer", "UI/UX Designer"
];

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"];

const ROUNDS = [
  { id: 'HR Round', label: 'HR Round', icon: Users },
  { id: 'Technical Round', label: 'Technical Round', icon: Code2 },
  { id: 'Managerial Round', label: 'Managerial Round', icon: HandMetal },
  { id: 'Full Interview Process', label: 'Full Interview Process', icon: Layers }
];

export default function InterviewSetup() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_LEVELS[0]);
  const [selectedRound, setSelectedRound] = useState(ROUNDS[0].id);

  const startInterview = () => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&exp=${selectedExp}&round=${encodeURIComponent(selectedRound)}`);
  };

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-16">
            <Badge className="bg-accent/20 text-accent mb-4 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Session Calibration</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tighter">Arena <span className="text-gradient-purple">Setup.</span></h1>
            <p className="text-muted-foreground text-xl font-light">Define your assessment track and initialize the simulation.</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Role Selection */}
              <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <Briefcase className="w-6 h-6 text-accent" />
                    Target Role
                  </CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`text-left px-6 py-5 rounded-2xl border transition-all text-sm font-bold ${
                        selectedRole === role 
                          ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10' 
                          : 'glass border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Experience Selection */}
                <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold">
                      <GraduationCap className="w-6 h-6 text-accent" />
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <div className="flex flex-col gap-4">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedExp(level)}
                        className={`py-5 rounded-2xl border transition-all font-bold tracking-widest uppercase text-[10px] ${
                          selectedExp === level
                            ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10'
                            : 'glass border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white'
                        }`}
                      >
                        {level} Grade
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Round Selection */}
                <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold">
                      <Layers className="w-6 h-6 text-accent" />
                      Interview Round
                    </CardTitle>
                  </CardHeader>
                  <div className="flex flex-col gap-4">
                    {ROUNDS.map((round) => (
                      <button
                        key={round.id}
                        onClick={() => setSelectedRound(round.id)}
                        className={`py-5 px-6 rounded-2xl border transition-all font-bold text-left flex items-center gap-4 text-sm ${
                          selectedRound === round.id
                            ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10'
                            : 'glass border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white'
                        }`}
                      >
                        <round.icon className={`w-5 h-5 ${selectedRound === round.id ? 'text-accent' : 'text-muted-foreground'}`} />
                        {round.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Card className="premium-card bg-accent/5 border-accent/10 h-fit sticky top-32">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-bold">Mission Directive</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="space-y-4">
                    {[
                      { icon: Layers, label: "Questions", val: "5 Main Questions" },
                      { icon: Clock, label: "Duration", val: "15-20 Min" },
                      { icon: Trophy, label: "Audit", val: "Executive Grade", badge: true }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-accent" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</span>
                        </div>
                        <span className="text-xs text-white font-bold">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/10 space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Active Configuration</p>
                      <div className="space-y-2">
                        <p className="text-lg font-bold text-white leading-tight">{selectedRole}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-accent/30 text-accent font-bold text-[8px] uppercase">{selectedExp}</Badge>
                          <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-bold text-[8px] uppercase">{selectedRound}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={startInterview}
                      className="w-full h-18 text-xs btn-premium uppercase tracking-[0.3em]"
                    >
                      Enter Arena Simulation
                      <Play className="ml-3 w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
