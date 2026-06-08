"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Lightbulb,
  Loader2,
  Trash2
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

        // Persist analysis result
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
    <div className="min-h-screen bg-[#050816] pb-20">
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

        <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* Upload Section */}
          <section className="space-y-8">
            <Card className="premium-card bg-white/[0.01] border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <Upload className="w-8 h-8 text-accent" />
                  Blueprint Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-10">
                <div 
                  className={`border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all cursor-pointer group ${
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
                      <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto transition-colors group-hover:bg-accent/20">
                        <FileText className="w-10 h-10 text-accent" />
                      </div>
                      <div>
                        <p className="text-xl font-bold mb-2">Initialize Career Scan</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">PDF, DOCX, or TXT • Enterprise Grade Parsing</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-8">
                      <FileText className="w-12 h-12 text-accent" />
                      <div className="text-left flex-1">
                        <p className="font-bold text-lg truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="rounded-xl hover:bg-red-500/10 hover:text-red-400"
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
                    className="w-full h-16 rounded-2xl glass border-white/10 bg-transparent px-6 focus:outline-none focus:border-accent transition-all text-white font-medium"
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
                  className="w-full h-20 text-lg btn-premium"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      <span className="tracking-[0.2em] uppercase text-sm font-bold">Analyzing Neural Blueprint...</span>
                    </>
                  ) : (
                    <span className="tracking-[0.2em] uppercase text-sm font-bold">Execute Audit</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Results Section */}
          <section>
            {result ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                <Card className="premium-card bg-white/[0.02] border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <Badge variant="outline" className="border-accent/30 text-accent px-4 py-1 text-[10px] tracking-widest uppercase font-bold">
                      {targetRole} Verified
                    </Badge>
                  </div>
                  <CardHeader className="pb-12 border-b border-white/5 mb-12">
                    <CardTitle className="text-3xl font-bold">Audit Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-16">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                          <circle className="text-accent" strokeWidth="8" strokeDasharray={552} strokeDashoffset={552 - (552 * result.atsScore) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                        </svg>
                        <span className="absolute text-5xl font-bold tracking-tighter tabular-nums">{result.atsScore}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.4em] font-bold text-muted-foreground">ATS Compatibility Index</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.01]">
                        <h4 className="flex items-center gap-3 font-bold text-sm uppercase tracking-widest mb-6">
                          <Search className="w-5 h-5 text-blue-400" />
                          Detected Nodes
                        </h4>
                        <div className="space-y-4">
                          {result.skillAnalysis.slice(0, 5).map((s, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span>{s.skill}</span>
                                <span className="text-accent">{s.proficiency}</span>
                              </div>
                              <Progress value={s.proficiency === 'Expert' ? 100 : s.proficiency === 'Advanced' ? 80 : 50} className="h-1 bg-white/5" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.01]">
                        <h4 className="flex items-center gap-3 font-bold text-sm uppercase tracking-widest mb-6">
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                          Delta Gaps
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.missingSkills.map((s, i) => (
                            <Badge key={i} variant="outline" className="border-orange-500/20 text-orange-400/70 text-[10px] font-bold uppercase py-1.5 px-3">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass p-10 rounded-[2.5rem] border-accent/10 bg-accent/[0.02]">
                      <h4 className="flex items-center gap-4 font-bold text-lg mb-8">
                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                        Neural Optimization Strategy
                      </h4>
                      <div className="space-y-6">
                        {result.improvementSuggestions.map((suggestion, i) => (
                          <div key={i} className="flex gap-4 text-sm font-light leading-relaxed text-white/80">
                            <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full min-h-[600px] rounded-[3rem] border border-white/5 bg-white/[0.01] glass flex flex-col items-center justify-center text-center p-12">
                <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-10 border border-white/5">
                  <Search className="w-16 h-16 text-muted-foreground/20 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Audit Standby</h3>
                <p className="text-muted-foreground max-w-sm font-light leading-relaxed">
                  Initialize a career scan to deploy our neural engine and audit your career blueprints.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
