
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  ChevronRight, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  Loader2,
  Zap,
  Rocket,
  ArrowRight,
  Sparkles,
  SearchCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const IT_ROLES = [
  "Data Analyst", "Data Scientist", "Data Analytics", "Business Analyst", "Power BI Developer",
  "SQL Developer", "Python Developer", "Full Stack Developer", "Frontend Developer",
  "Backend Developer", "React Developer", "React Native Developer", "Java Developer",
  ".NET Developer", "Node.js Developer", "Software Engineer", "Software Developer",
  "DevOps Engineer", "Cloud Engineer", "AWS Developer", "Azure Developer", "AI Engineer",
  "Machine Learning Engineer", "Deep Learning Engineer", "Generative AI Engineer",
  "NLP Engineer", "Computer Vision Engineer", "Cyber Security Analyst", "Ethical Hacker",
  "Database Administrator", "Data Engineer", "UI/UX Designer", "QA Engineer",
  "Automation Tester", "Manual Tester", "Mobile App Developer", "Android Developer",
  "iOS Developer", "Product Manager", "Project Manager", "Technical Support Engineer",
  "IT Support Engineer", "System Administrator", "Network Engineer"
];

export default function InterviewSetup() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const filteredRoles = useMemo(() => 
    IT_ROLES.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['.pdf', '.doc', '.docx'];
      const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(ext)) {
        toast({ variant: "destructive", title: "Format Error", description: "Please upload PDF or DOCX." });
        return;
      }
      
      setFile(selected);
      setIsAnalyzing(true);
      // Simulate resume indexing
      setTimeout(() => {
        setIsAnalyzing(false);
        setStep(2);
        toast({ title: "Blueprint Indexed", description: "Your professional nodes are synchronized." });
      }, 2000);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />
      
      <div className="flex-1 container mx-auto px-6 py-32 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          
          <header className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Simulation Calibration v6.0</Badge>
            <h1 className="text-5xl font-bold tracking-tighter text-premium">
              Arena <span className="text-gradient-purple">Onboarding.</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-24 rounded-full transition-all duration-500 ${step >= i ? 'bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`} />
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="step1">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-12 text-center space-y-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
                    <Upload className="w-12 h-12 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Resume Blueprint Required</h2>
                    <p className="text-muted-foreground font-light max-w-sm mx-auto italic">Upload your latest blueprint to calibrate the AI interviewer.</p>
                  </div>

                  <div 
                    onClick={() => !isAnalyzing && document.getElementById('resume-upload-calibration')?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer group relative overflow-hidden",
                      isAnalyzing ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/30 hover:bg-white/[0.02]"
                    )}
                  >
                    <input type="file" id="resume-upload-calibration" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Synchronizing Neural Node...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileText className="w-10 h-10 text-muted-foreground group-hover:text-accent mx-auto transition-colors" />
                        <p className="font-bold text-lg">Select Professional Blueprint</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF, DOC, DOCX • 10MB LIMIT</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : step === 2 ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step2">
                <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Briefcase className="w-6 h-6 text-accent" /> Target Deployment
                      </h2>
                      <p className="text-sm text-muted-foreground font-light">Select the role you are being deployed for.</p>
                    </div>
                    <div className="relative w-full md:w-72 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search roles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-xl glass border-white/10 bg-transparent text-sm font-light focus:outline-none focus:border-accent/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredRoles.map(role => (
                      <button 
                        key={role} 
                        onClick={() => handleRoleSelect(role)}
                        className="text-left p-4 rounded-xl border border-white/5 glass hover:bg-accent/10 hover:border-accent/30 transition-all text-xs font-bold uppercase tracking-widest group flex items-center justify-between"
                      >
                        {role}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="step3">
                <Card className="premium-card bg-[#0b0e1a]/80 border-accent/20 p-12 text-center space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="w-32 h-32 text-accent" />
                  </div>
                  
                  <div className="w-24 h-24 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                    <Rocket className="w-12 h-12 text-accent" />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tighter">Calibration Success</h2>
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-white/60 font-light">Target Identity: <span className="text-white font-bold">{file?.name}</span></p>
                       <p className="text-white/60 font-light">Deployment Track: <span className="text-accent font-bold uppercase tracking-widest">{selectedRole}</span></p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => router.push('/special-hr-interview')}
                    className="w-full h-20 btn-premium rounded-[2.5rem] text-lg font-black uppercase tracking-[0.3em] shadow-2xl group"
                  >
                    Start AI Interview <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" />
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
