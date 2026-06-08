"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  BrainCircuit, 
  MessageSquare, 
  Zap,
  TrendingUp,
  Map,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { generateInterviewFeedback, type InterviewFeedbackOutput } from '@/ai/flows/ai-interview-feedback';
import { generateLearningRoadmap, type LearningRoadmapOutput } from '@/ai/flows/ai-learning-roadmap';

export default function FeedbackReport() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Software Engineer';
  const exp = searchParams.get('exp') || 'Mid';
  const rawData = searchParams.get('data');
  
  const [feedback, setFeedback] = useState<InterviewFeedbackOutput | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processData = async () => {
      if (!rawData) return;
      setIsLoading(true);
      try {
        const history = JSON.parse(decodeURIComponent(rawData));
        const transcript = history.map((h: any) => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
        
        const feedbackResult = await generateInterviewFeedback({
          interviewTranscript: transcript,
          role,
          experienceLevel: exp
        });
        setFeedback(feedbackResult);

        const roadmapResult = await generateLearningRoadmap({
          ...feedbackResult,
          role,
          experienceLevel: exp
        });
        setRoadmap(roadmapResult);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    processData();
  }, [rawData, role, exp]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Performance</h2>
          <p className="text-muted-foreground animate-pulse">Our AI is drafting your personalized report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Summary */}
          <div className="glass-card p-10 rounded-[3rem] mb-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="text-center md:text-left">
              <Badge className="bg-primary/20 text-primary mb-4 border-none">Interview Complete</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-2">{role}</h1>
              <p className="text-lg text-muted-foreground">Detailed performance analysis and roadmap</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gradient mb-1">{feedback?.overallInterviewScore}%</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall Score</div>
              </div>
              <div className="w-px h-16 bg-white/10"></div>
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-1">{feedback?.jobReadinessScore}%</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Job Readiness</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Scores & Performance */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-blue-400" /> Technical Knowledge</span>
                        <span>{feedback?.technicalKnowledgeScore}/100</span>
                      </div>
                      <Progress value={feedback?.technicalKnowledgeScore} className="h-2 bg-white/5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-400" /> Communication</span>
                        <span>{feedback?.communicationScore}/100</span>
                      </div>
                      <Progress value={feedback?.communicationScore} className="h-2 bg-white/5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> Problem Solving</span>
                        <span>{feedback?.problemSolvingScore}/100</span>
                      </div>
                      <Progress value={feedback?.problemSolvingScore} className="h-2 bg-white/5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Confidence</span>
                        <span>{feedback?.confidenceScore}/100</span>
                      </div>
                      <Progress value={feedback?.confidenceScore} className="h-2 bg-white/5" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-3xl p-6 flex flex-col justify-center border border-white/5">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Candidate Profile
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "Your performance reflects a strong grasp of core {role} principles, with particularly impressive results in communication. To reach senior level, focus on deepening your knowledge in systems design and edge-case handling."
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass-card border-green-500/10 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                      <ChevronUp className="w-5 h-5" /> Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedback?.strengths.map((s, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                        <span>{s}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="glass-card border-red-500/10 bg-red-500/5">
                  <CardHeader>
                    <CardTitle className="text-red-400 text-lg flex items-center gap-2">
                      <ChevronDown className="w-5 h-5" /> Growth Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedback?.weaknesses.map((w, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                        <span>{w}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Learning Roadmap Detail */}
              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="bg-gradient-premium p-8">
                  <CardTitle className="text-white flex items-center gap-3 text-2xl">
                    <Map className="w-8 h-8" />
                    Personalized Learning Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <div>
                    <h4 className="font-bold mb-4 text-lg">Recommended Steps</h4>
                    <div className="space-y-4">
                      {roadmap?.careerImprovementPlan.map((step, i) => (
                        <div key={i} className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</div>
                          <p className="text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-4 text-lg">Learning Resources</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {roadmap?.learningResources.map((res, i) => (
                        <div key={i} className="glass-card p-5 rounded-2xl border-white/5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="outline" className="text-[10px] text-muted-foreground uppercase">{res.type}</Badge>
                              <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                            <h5 className="font-bold text-sm mb-1">{res.name}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-2">{res.description}</p>
                          </div>
                          <Button variant="link" className="p-0 h-auto text-primary text-xs mt-4 justify-start group">
                            Explore Resource <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Improvement Suggestions & Summary */}
            <div className="space-y-8 h-fit lg:sticky lg:top-24">
              <Card className="glass-card border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">Improvement Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {feedback?.improvementSuggestions.map((tip, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm leading-relaxed">
                      {tip}
                    </div>
                  ))}
                  <Button className="w-full bg-gradient-premium rounded-2xl h-12">
                    Share Results
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Missing Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {roadmap?.missingSkills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-orange-500/10 text-orange-400 border-none px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
