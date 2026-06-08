"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3
} from 'lucide-react';
import { analyzeResume, type AiResumeAnalysisOutput } from '@/ai/flows/ai-resume-analysis';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ResumeAnalyzer() {
  const { user } = useUser();
  const db = useFirestore();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiResumeAnalysisOutput | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string);
        const output = await analyzeResume({
          resumeDataUri: base64String,
          targetRole: targetRole
        });
        
        setResult(output);
        setIsAnalyzing(false);

        if (user && db) {
          const resumesRef = collection(db, 'users', user.uid, 'resumes');
          const resumeData = {
            userId: user.uid,
            filename: file.name,
            targetRole,
            atsScore: output.atsScore,
            analysis: output,
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
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <div className="container mx-auto px-4 py-32">
        <header className="mb-20 text-center">
          <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Neural Blueprint Auditor</Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tighter text-premium">Resume <span className="text-gradient-purple">Intelligence.</span></h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">
            Deploy elite ATS simulation to audit your technical history and optimize your career blueprints.
          </p>
        </header>

        {!result ? (
          <div className="max-w-3xl mx-auto">
            <Card className="premium-card bg-white/[0.01] border-white/5 p-12">
              <div className="space-y-12">
                <div 
                  className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer group ${
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
                    <div className="space-y-6">
                      <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto transition-colors group-hover:bg-accent/20">
                        <Upload className="w-12 h-12 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold mb-2">Initialize Career Scan</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">PDF, DOCX, or TXT • Enterprise Grade Parsing</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-12">
                      <FileText className="w-16 h-16 text-accent" />
                      <div className="text-left flex-1">
                        <p className="font-bold text-xl truncate max-w-[300px]">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="rounded-xl h-12 w-12 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Target Neural Track</label>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-16 rounded-2xl glass border-white/10 bg-transparent px-8 focus:outline-none focus:border-accent transition-all text-white font-medium text-lg"
                  >
                    <option className="bg-[#050816]" value="Frontend Developer">Frontend Developer</option>
                    <option className="bg-[#050816]" value="Backend Developer">Backend Developer</option>
                    <option className="bg-[#050816]" value="Full Stack Developer">Full Stack Developer</option>
                    <option className="bg-[#050816]" value="Data Scientist">Data Scientist</option>
                    <option className="bg-[#050816]" value="DevOps Engineer">DevOps Engineer</option>
                    <option className="bg-[#050816]" value="AI Engineer">AI Engineer</option>
                  </select>
                </div>

                <Button 
                  onClick={runAnalysis}
                  disabled={!file || isAnalyzing}
                  className="w-full h-20 text-lg btn-premium shadow-[0_0_50px_rgba(147,51,234,0.3)]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      <span className="tracking-[0.2em] uppercase text-sm font-bold">Analyzing Neural Blueprint...</span>
                    </>
                  ) : (
                    <span className="tracking-[0.2em] uppercase text-sm font-bold">Execute Global Audit</span>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            {/* Left Column: Core Metrics */}
            <div className="lg:col-span-8 space-y-12">
              <Card className="premium-card bg-white/[0.02] border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-10">
                  <Badge className="bg-accent/20 text-accent border-none px-4 py-1.5 text-[10px] tracking-widest uppercase font-bold">Verified Audit</Badge>
                </div>
                <CardHeader className="pb-12 border-b border-white/5 mb-12">
                  <CardTitle className="text-3xl font-bold flex items-center gap-4">
                    <User className="w-8 h-8 text-accent" />
                    {result.personalInfo.fullName}
                  </CardTitle>
                  <div className="flex gap-8 mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Mail className="w-4 h-4 text-accent" /> {result.personalInfo.email}
                    </div>
                    {result.personalInfo.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Phone className="w-4 h-4 text-accent" /> {result.personalInfo.phone}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-16">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                      { label: "ATS Index", val: result.atsScore, icon: Target, color: "text-accent" },
                      { label: "Quality Score", val: result.resumeQualityScore, icon: Trophy, color: "text-purple-400" },
                      { label: "Tech Precision", val: result.technicalSkillsScore, icon: Zap, color: "text-orange-400" },
                      { label: "Keywords", val: result.keywordOptimizationScore, icon: BarChart3, color: "text-blue-400" }
                    ].map((stat, i) => (
                      <div key={i} className="text-center space-y-4">
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle className="text-white/5" strokeWidth="4" stroke="currentColor" fill="transparent" r="44" cx="48" cy="48" />
                            <circle className={stat.color} strokeWidth="4" strokeDasharray={276} strokeDashoffset={276 - (276 * stat.val) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="44" cx="48" cy="48" />
                          </svg>
                          <span className="absolute text-xl font-bold">{stat.val}%</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <Tabs defaultValue="experience" className="w-full">
                    <TabsList className="glass border-white/5 p-1 rounded-2xl h-auto mb-10">
                      <TabsTrigger value="experience" className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest">Experience</TabsTrigger>
                      <TabsTrigger value="education" className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest">Education</TabsTrigger>
                      <TabsTrigger value="projects" className="data-[state=active]:bg-accent data-[state=active]:text-black h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest">Projects</TabsTrigger>
                    </TabsList>
                    <TabsContent value="experience" className="space-y-6">
                      {result.sections.experience.map((exp, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border-white/5 flex gap-4">
                          <Briefcase className="w-5 h-5 text-accent shrink-0 mt-1" />
                          <p className="text-sm font-light leading-relaxed">{exp}</p>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="education" className="space-y-6">
                      {result.sections.education.map((edu, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border-white/5 flex gap-4">
                          <GraduationCap className="w-5 h-5 text-accent shrink-0 mt-1" />
                          <p className="text-sm font-light leading-relaxed">{edu}</p>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="projects" className="space-y-6">
                      {result.sections.projects.map((proj, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border-white/5 flex gap-4">
                          <Zap className="w-5 h-5 text-accent shrink-0 mt-1" />
                          <p className="text-sm font-light leading-relaxed">{proj}</p>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass p-10 rounded-[3rem] border-accent/10 bg-accent/[0.02]">
                  <h4 className="flex items-center gap-4 font-bold text-lg mb-8">
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                    Optimization Strategy
                  </h4>
                  <div className="space-y-6">
                    {result.improvementSuggestions.map((suggestion, i) => (
                      <div key={i} className="flex gap-4 text-sm font-light leading-relaxed text-white/80">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="glass p-10 rounded-[3rem] border-red-500/10 bg-red-500/[0.02]">
                  <h4 className="flex items-center gap-4 font-bold text-lg mb-8">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    Neural Gaps
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((s, i) => (
                      <Badge key={i} variant="outline" className="border-red-500/20 text-red-400/70 text-[10px] font-bold uppercase py-2 px-4 rounded-xl">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Skill Matrix & Match */}
            <div className="lg:col-span-4 space-y-12">
              <Card className="premium-card bg-white/[0.01] border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Neural Skill Matrix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.skillAnalysis.map((s, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>{s.skill}</span>
                        <span className="text-accent">{s.proficiency}</span>
                      </div>
                      <Progress value={s.proficiency === 'Expert' ? 100 : s.proficiency === 'Advanced' ? 80 : 50} className="h-1.5 bg-white/5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="premium-card bg-accent/5 border-accent/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Target className="w-6 h-6 text-accent" />
                    Deployment Match
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {result.roleMatches.map((match, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/70">{match.role}</span>
                        <span className="text-xl font-bold text-accent">{match.matchPercentage}%</span>
                      </div>
                      <Progress value={match.matchPercentage} className="h-2 bg-white/5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button 
                onClick={() => setResult(null)}
                className="w-full h-16 glass border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-[0.2em]"
              >
                Reset System Scan
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
