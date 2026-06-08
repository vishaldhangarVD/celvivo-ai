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

export default function ResumeAnalyzer() {
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
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Resume <span className="text-gradient">Analyzer</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get an instant ATS score and detailed feedback to optimize your resume for your dream job.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <section className="space-y-8">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                    file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30'
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
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-semibold mb-2">Click to select or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT (Max 5MB)</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="w-10 h-10 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="ml-4 hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-4">
                  <label className="text-sm font-medium text-muted-foreground">Target Role</label>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </select>
                </div>

                <Button 
                  onClick={runAnalysis}
                  disabled={!file || isAnalyzing}
                  className="w-full mt-8 h-12 text-lg bg-gradient-premium hover:opacity-90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    'Run Analysis'
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Results Section */}
          <section>
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="glass-card border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Analysis Results</CardTitle>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 px-3 py-1">
                      {targetRole}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* ATS Score */}
                    <div className="text-center">
                      <div className="relative inline-flex items-center justify-center mb-4">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            className="text-white/5"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="58"
                            cx="64"
                            cy="64"
                          />
                          <circle
                            className="text-primary"
                            strokeWidth="8"
                            strokeDasharray={364}
                            strokeDashoffset={364 - (364 * result.atsScore) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="58"
                            cx="64"
                            cy="64"
                          />
                        </svg>
                        <span className="absolute text-4xl font-bold">{result.atsScore}</span>
                      </div>
                      <p className="text-lg font-semibold">ATS Compatibility Score</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Skill Analysis */}
                      <div className="glass-card p-5 rounded-2xl border-white/5">
                        <h4 className="flex items-center gap-2 font-bold mb-4">
                          <Search className="w-4 h-4 text-blue-400" />
                          Found Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.skillAnalysis.map((s, i) => (
                            <div key={i} className="flex flex-col gap-1 p-2 bg-white/5 rounded-lg border border-white/5 w-full">
                              <span className="text-xs font-semibold">{s.skill}</span>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground uppercase">{s.proficiency}</span>
                                <div className="h-1 bg-primary w-1/2 rounded-full"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="glass-card p-5 rounded-2xl border-white/5">
                        <h4 className="flex items-center gap-2 font-bold mb-4">
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                          Missing Skills
                        </h4>
                        <div className="space-y-2">
                          {result.missingSkills.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Improvement Suggestions */}
                    <div className="glass-card p-6 rounded-2xl border-white/5">
                      <h4 className="flex items-center gap-2 font-bold mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Actionable Suggestions
                      </h4>
                      <div className="space-y-4">
                        {result.improvementSuggestions.map((suggestion, i) => (
                          <div key={i} className="flex gap-3 text-sm leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full min-h-[400px] rounded-3xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Upload your resume and click "Run Analysis" to see your results and optimization tips.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
