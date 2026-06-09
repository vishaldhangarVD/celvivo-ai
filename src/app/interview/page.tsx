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
  Layers
} from 'lucide-react';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer",
  "Data Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer",
  "DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst", "QA Engineer", "UI/UX Designer"
];

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"];

export default function InterviewSetup() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_LEVELS[0]);

  const startInterview = () => {
    // Generate a simple ID for the session
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(selectedRole)}&exp=${selectedExp}`);
  };

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Interview <span className="text-gradient-purple">Setup</span></h1>
            <p className="text-muted-foreground text-lg font-light">Configure your session and step into the arena.</p>
          </header>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-8">
              <Card className="premium-card bg-white/[0.01] border-white/5 overflow-hidden p-0">
                <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="w-5 h-5 text-accent" />
                    Target Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`text-left px-6 py-4 rounded-xl border transition-all text-sm font-medium ${
                          selectedRole === role 
                            ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10' 
                            : 'glass border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-0 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    Experience Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex gap-4">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedExp(level)}
                        className={`flex-1 py-5 rounded-2xl border transition-all font-bold tracking-widest uppercase text-xs ${
                          selectedExp === level
                            ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10'
                            : 'glass border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card className="premium-card bg-accent/5 border-accent/10 h-fit sticky top-32">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-bold">Session Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="space-y-4">
                    {[
                      { icon: Layers, label: "Structure", val: "5 Main Questions" },
                      { icon: Clock, label: "Estimated Time", val: "15-20 Minutes" },
                      { icon: Trophy, label: "Feedback", val: "Detailed Audit", badge: true }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-accent" />
                          <span className="text-xs font-medium text-white/70">{item.label}</span>
                        </div>
                        {item.badge ? (
                          <Badge className="bg-accent/20 text-accent border-none text-[10px] uppercase font-bold tracking-widest">Detailed</Badge>
                        ) : (
                          <span className="text-xs text-white font-bold">{item.val}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <div className="mb-8">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Current Configuration</p>
                      <p className="text-lg font-bold text-premium">{selectedRole} • {selectedExp}</p>
                    </div>
                    <Button 
                      onClick={startInterview}
                      className="w-full h-16 text-xs btn-premium uppercase tracking-[0.3em]"
                    >
                      Enter Interview Room
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
