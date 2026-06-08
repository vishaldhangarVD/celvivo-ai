"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Lightbulb,
  Loader2,
  Trash2,
  User,
  GraduationCap,
  Briefcase,
  Trophy,
  Zap,
  Target,
  Mail,
  Phone,
  BarChart3,
  Download,
  Share2,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { type AiResumeAnalysisOutput } from '@/ai/flows/ai-resume-analysis';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export default function ResumeAnalyzer() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiResumeAnalysisOutput | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    // Simulate Neural Processing Time
    setTimeout(() => {
      const mockResult: AiResumeAnalysisOutput = {
        personalInfo: {
          fullName: user?.displayName || "Elite Candidate",
          email: user?.email || "candidate@nexus.ai",
          phone: "+1 (555) 934-2025"
        },
        atsScore: 88,
        resumeQualityScore: 92,
        technicalSkillsScore: 85,
        keywordOptimizationScore: 78,
        skillAnalysis: [
          { skill: "React.js", proficiency: "Expert" },
          { skill: "TypeScript", proficiency: "Advanced" },
          { skill: "Next.js", proficiency: "Advanced" },
          { skill: "Tailwind CSS", proficiency: "Expert" },
          { skill: "Node.js", proficiency: "Intermediate" },
          { skill: "Firebase", proficiency: "Advanced" }
        ],
        sections: {
          education: [
            "B.S. in Computer Science - Tech Institute of Excellence",
            "Full-Stack Certification - Neural Academy"
          ],
          projects: [
            "Nexvoro AI Platform - Built a scalable mock interview system using Next.js 15.",
            "Distributed Ledger Audit - Optimized blockchain validation nodes by 40%."
          ],
          experience: [
            "Senior Engineering Associate at Meta-Sys (2022 - Present)",
            "Frontend Lead at Quantum-Bit Solutions (2020 - 2022)"
          ],
          certifications: [
            "AWS Certified Solutions Architect",
            "Google Professional Cloud Architect"
          ],
          achievements: [
            "Won First Place at Global AI Hackathon 2024",
            "Published 3 research papers on LLM optimization"
          ]
        },
        missingSkills: ["GraphQL", "Docker", "Kubernetes", "Redis"],
        improvementSuggestions: [
          "Quantify your experience with specific metrics (e.g., 'Reduced latency by 30%').",
          "Add more cloud-native deployment experience for current Senior roles.",
          "Strengthen your system design documentation section."
        ],
        roleMatches: [
          { role: "Frontend Developer", matchPercentage: 94 },
          { role: "Full Stack Developer", matchPercentage: 86 },
          { role: "AI Engineer", matchPercentage: 72 }
        ]
      };

      setResult(mockResult);
      setIsAnalyzing(false);

      if (user && db) {
        const resumesRef = collection(db, 'users', user.uid, 'resumes');
        const resumeData = {
          userId: user.uid,
          filename: file.name,
          targetRole,
          atsScore: mockResult.atsScore,
          analysis: mockResult,
          createdAt: serverTimestamp(),
        };

        addDoc(resumesRef, resumeData)
          .catch(async (err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: resumesRef.path,
              operation: 'create',
              requestResourceData: resumeData
            }));
          });
      }

      toast({
        title: "Analysis Complete",
        description: "Your neural career blueprint has been generated.",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <div className="container mx-auto px-4 py-32">
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Blueprint Auditor</Badge>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter text-premium">Resume <span className="text-gradient-purple">Intelligence.</span></h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Deploy elite simulated audits to optimize your career blueprints for global hiring protocols. (Demo Mode Active)
            </p>
          </motion.div>
        </header>

        {!result ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="premium-card bg-white/[0.01] border-white/5 p-12 shadow-[0_0_100px_rgba(34,211,238,0.05)]">
              <div className="space-y-12">
                <div 
                  className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer group relative overflow-hidden ${
                    file ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'
                  }`}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="resume-upload" 
                    className="hidden" 
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileChange}
                  />
                  {!file ? (
                    <div className="space-y-6 relative z-10">
                      <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto transition-all group-hover:scale-110 group-hover:bg-accent/20">
                        <Upload className="w-12 h-12 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold mb-2">Initialize Career Scan</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">PDF, DOCX, or TXT • Enterprise Grade Parsing</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-12 relative z-10">
                      <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-accent" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-xl truncate max-w-[300px]">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR AUDIT</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="rounded-xl h-12 w-12 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground ml-2">Target Neural Track</label>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-18 rounded-2xl glass border-white/10 bg-[#0b0e1a] px-8 focus:outline-none focus:border-accent transition-all text-white font-medium text-lg appearance-none cursor-pointer"
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="Cyber Security Analyst">Cyber Security Analyst</option>
                  </select>
                </div>

                <Button 
                  onClick={runAnalysis}
                  disabled={!file || isAnalyzing}
                  className="w-full h-20 text-lg btn-premium shadow-[0_0_60px_rgba(147,51,234,0.3)] group"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="tracking-[0.3em] uppercase text-sm font-bold">Extracting Knowledge Nodes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Zap className="w-6 h-6 group-hover:animate-pulse" />
                      <span className="tracking-[0.3em] uppercase text-sm font-bold">Execute Neural Audit</span>
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            {/* Left Column: Core Metrics & Sections */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 space-y-12"
            >
              <Card className="premium-card bg-white/[0.02] border-white/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12">
                  <Badge className="bg-accent/20 text-accent border-none px-5 py-2 text-[10px] tracking-[0.3em] uppercase font-bold">VERIFIED AUDIT v4.2</Badge>
                </div>
                
                <CardHeader className="pb-16 border-b border-white/5 mb-16 px-12 pt-12">
                  <div className="flex items-center gap-8 mb-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-5xl font-bold tracking-tighter text-premium mb-2">
                        {result.personalInfo.fullName}
                      </CardTitle>
                      <div className="flex flex-wrap gap-8 text-muted-foreground">
                        <div className="flex items-center gap-2 text-sm font-light">
                          <Mail className="w-4 h-4 text-accent" /> {result.personalInfo.email}
                        </div>
                        {result.personalInfo.phone && (
                          <div className="flex items-center gap-2 text-sm font-light">
                            <Phone className="w-4 h-4 text-accent" /> {result.personalInfo.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm font-light">
                          <Target className="w-4 h-4 text-purple-400" /> {targetRole}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-12 space-y-20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                      { label: "ATS Index", val: result.atsScore, icon: Target, color: "text-accent" },
                      { label: "Quality Rating", val: result.resumeQualityScore, icon: Trophy, color: "text-purple-400" },
                      { label: "Tech Precision", val: result.technicalSkillsScore, icon: Zap, color: "text-orange-400" },
                      { label: "Keyword Density", val: result.keywordOptimizationScore, icon: BarChart3, color: "text-blue-400" }
                    ].map((stat, i) => (
                      <div key={i} className="text-center space-y-6">
                        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle className="text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                            <motion.circle 
                              initial={{ strokeDashoffset: 352 }}
                              animate={{ strokeDashoffset: 352 - (352 * stat.val) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={stat.color} 
                              strokeWidth="6" 
                              strokeDasharray={352} 
                              strokeLinecap="round" 
                              stroke="currentColor" 
                              fill="transparent" 
                              r="56" 
                              cx="64" 
                              cy="64" 
                            />
                          </svg>
                          <span className="absolute text-3xl font-bold tabular-nums">{stat.val}%</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <Tabs defaultValue="experience" className="w-full">
                    <TabsList className="glass border-white/5 p-2 rounded-[2rem] h-auto mb-12 bg-white/[0.01]">
                      {['experience', 'projects', 'education', 'certifications'].map((tab) => (
                        <TabsTrigger 
                          key={tab}
                          value={tab} 
                          className="data-[state=active]:bg-accent data-[state=active]:text-black h-14 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    <AnimatePresence mode="wait">
                      <TabsContent value="experience" className="space-y-6">
                        {result.sections.experience.map((exp, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-8 rounded-[2.5rem] border-white/5 flex gap-6 group hover:bg-white/[0.04] transition-all"
                          >
                            <Briefcase className="w-6 h-6 text-accent shrink-0 mt-1" />
                            <p className="text-lg font-light leading-relaxed text-white/80">{exp}</p>
                          </motion.div>
                        ))}
                      </TabsContent>
                      <TabsContent value="projects" className="space-y-6">
                        {result.sections.projects.map((proj, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-8 rounded-[2.5rem] border-white/5 flex gap-6 group hover:bg-white/[0.04] transition-all"
                          >
                            <Zap className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                            <p className="text-lg font-light leading-relaxed text-white/80">{proj}</p>
                          </motion.div>
                        ))}
                      </TabsContent>
                      <TabsContent value="education" className="space-y-6">
                        {result.sections.education.map((edu, i) => (
                          <motion.div key={i} className="glass p-8 rounded-[2.5rem] border-white/5 flex gap-6">
                            <GraduationCap className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                            <p className="text-lg font-light leading-relaxed text-white/80">{edu}</p>
                          </motion.div>
                        ))}
                      </TabsContent>
                      <TabsContent value="certifications" className="space-y-6">
                        {result.sections.certifications.length > 0 ? result.sections.certifications.map((cert, i) => (
                          <motion.div key={i} className="glass p-8 rounded-[2.5rem] border-white/5 flex gap-6">
                            <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                            <p className="text-lg font-light leading-relaxed text-white/80">{cert}</p>
                          </motion.div>
                        )) : (
                          <p className="text-center text-muted-foreground p-12 italic">No certifications detected in the neural scan.</p>
                        )}
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Strategy & Gaps */}
              <div className="grid md:grid-cols-2 gap-12">
                <Card className="glass p-12 rounded-[3.5rem] border-accent/10 bg-accent/[0.02] shadow-2xl">
                  <h4 className="flex items-center gap-4 font-bold text-xl mb-10">
                    <Lightbulb className="w-8 h-8 text-yellow-400" />
                    Optimization Strategy
                  </h4>
                  <div className="space-y-8">
                    {result.improvementSuggestions.map((suggestion, i) => (
                      <div key={i} className="flex gap-5 text-base font-light leading-relaxed text-white/70">
                        <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="glass p-12 rounded-[3.5rem] border-red-500/10 bg-red-500/[0.02] shadow-2xl">
                  <h4 className="flex items-center gap-4 font-bold text-xl mb-10">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    Neural Skill Gaps
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                      <Badge key={i} variant="outline" className="border-red-500/20 text-red-400/80 text-[10px] font-bold uppercase py-3 px-6 rounded-2xl bg-red-500/5 tracking-widest">
                        {s}
                      </Badge>
                    )) : (
                      <div className="flex items-center gap-3 text-green-400 font-bold uppercase tracking-widest text-xs">
                        <CheckCircle2 className="w-5 h-5" />
                        No Critical Gaps Detected
                      </div>
                    )}
                  </div>
                  <div className="mt-12 pt-12 border-t border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold mb-6">Recommended Learning</p>
                    <div className="p-6 glass rounded-2xl bg-white/[0.02] border-white/5">
                      <p className="text-xs text-white/60 leading-relaxed font-light">
                        Deploy our <b>Neural Learning Roadmap</b> to acquire these missing nodes before your next simulation.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Right Column: Skill Matrix & Match */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-32"
            >
              <Card className="premium-card bg-white/[0.01] border-white/5 shadow-2xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-accent" />
                    Neural Skill Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {result.skillAnalysis.map((s, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                        <span className="text-white/80">{s.skill}</span>
                        <span className="text-accent">{s.proficiency}</span>
                      </div>
                      <Progress 
                        value={s.proficiency === 'Expert' ? 100 : s.proficiency === 'Advanced' ? 80 : s.proficiency === 'Intermediate' ? 60 : 30} 
                        className="h-1.5 bg-white/5" 
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="premium-card bg-accent/5 border-accent/10 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
                <CardHeader className="pb-8">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Target className="w-6 h-6 text-accent" />
                    Deployment Match
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-10">
                  {result.roleMatches.map((match, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{match.role}</span>
                        <span className="text-2xl font-bold text-accent tabular-nums">{match.matchPercentage}%</span>
                      </div>
                      <Progress value={match.matchPercentage} className="h-2 bg-white/5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Button className="w-full h-18 btn-premium text-xs font-bold uppercase tracking-[0.3em]">
                  <Download className="w-5 h-5 mr-3" /> Export Neural Audit
                </Button>
                <Button variant="outline" className="w-full h-18 glass border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-[0.3em]">
                  <Share2 className="w-5 h-5 mr-3" /> Share Blueprint
                </Button>
                <Button 
                  onClick={() => setResult(null)}
                  variant="ghost"
                  className="w-full h-14 text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors"
                >
                  Reset System Scan
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
