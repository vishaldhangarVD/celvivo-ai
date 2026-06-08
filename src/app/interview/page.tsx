"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
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
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Interview <span className="text-gradient">Setup</span></h1>
            <p className="text-muted-foreground text-lg">Configure your session and step into the arena.</p>
          </header>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-8">
              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Target Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                          selectedRole === role 
                            ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader className="bg-white/5 border-b border-white/10">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    Experience Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedExp(level)}
                        className={`flex-1 py-4 rounded-2xl border transition-all font-bold ${
                          selectedExp === level
                            ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground'
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
              <Card className="glass-card border-white/10 h-fit sticky top-24">
                <CardHeader>
                  <CardTitle>Session Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Structure</span>
                      </div>
                      <span className="text-sm text-muted-foreground">5 Main Questions</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Estimated Time</span>
                      </div>
                      <span className="text-sm text-muted-foreground">15-20 Minutes</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Feedback</span>
                      </div>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-none">Detailed</Badge>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Current Settings</p>
                      <p className="text-lg font-bold">{selectedRole} • {selectedExp}</p>
                    </div>
                    <Button 
                      onClick={startInterview}
                      className="w-full h-14 text-lg bg-gradient-premium hover:opacity-90 rounded-2xl shadow-xl shadow-primary/20 group"
                    >
                      Enter Interview Room
                      <Play className="ml-2 w-5 h-5 group-hover:fill-current" />
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
