
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Building2, 
  ChevronRight, 
  Rocket, 
  Cpu, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const ALL_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "MERN Stack Developer", "MEAN Stack Developer", "Java Developer", "Python Developer",
  "React Developer", "Angular Developer", "Node.js Developer", ".NET Developer",
  "C# Developer", "C++ Developer", "Android Developer", "iOS Developer",
  "Flutter Developer", "React Native Developer", "DevOps Engineer", "Cloud Engineer",
  "AWS Engineer", "Azure Engineer", "GCP Engineer", "Data Analyst", "Business Analyst",
  "Data Scientist", "Machine Learning Engineer", "AI Engineer", "Prompt Engineer",
  "Gen AI Engineer", "Cyber Security Analyst", "SOC Analyst", "Network Engineer",
  "Database Administrator", "SQL Developer", "QA Engineer", "Automation Tester",
  "Manual Tester", "SDET", "Salesforce Developer", "SAP Consultant", "ServiceNow Developer",
  "UI UX Designer", "Product Manager", "Technical Support Engineer", "System Engineer",
  "Site Reliability Engineer", "Embedded Engineer", "Blockchain Developer", "Game Developer",
  "AR VR Developer"
];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Adobe", "Oracle",
  "IBM", "Intel", "Cisco", "Salesforce", "NVIDIA", "Uber", "Airbnb", "Tesla",
  "Spotify", "PayPal", "Accenture", "Capgemini", "Infosys", "TCS", "Wipro", "HCL",
  "Tech Mahindra", "Cognizant", "Deloitte", "EY", "PwC", "KPMG", "JP Morgan",
  "Goldman Sachs", "Morgan Stanley", "Zoho", "Flipkart", "PhonePe", "Swiggy",
  "Zomato", "Meesho", "Razorpay", "Freshworks", "BrowserStack", "Postman",
  "Dream11", "Groww", "CRED", "Upstox", "Juspay", "Myntra", "LinkedIn", "OpenAI",
  "Anthropic", "Perplexity"
];

const EXPERIENCE_LEVELS = ["Fresher", "0-1 Years", "1-3 Years", "3-5 Years", "5-8 Years", "8+ Years"];

const LOADING_MESSAGES = [
  "Initializing AI Interview...",
  "Loading Company Pattern...",
  "Preparing Assessment...",
  "Building Interview Pipeline...",
  "AI Ready..."
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);
  
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  
  const [roleSearch, setRoleSearch] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [errors, setErrors] = useState<{role?: boolean, company?: boolean, exp?: boolean}>({});

  const filteredRoles = useMemo(() => 
    ALL_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())),
  [roleSearch]);

  const filteredCompanies = useMemo(() => 
    COMPANIES.filter(c => c.toLowerCase().includes(companySearch.toLowerCase())),
  [companySearch]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTransitioning && loadingMsgIdx < LOADING_MESSAGES.length - 1) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => prev + 1);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isTransitioning, loadingMsgIdx]);

  const handleContinue = async () => {
    // Free Trial Enforcement
    if (profile?.plan === 'free' && profile?.freeTrialUsed) {
      toast({
        variant: "destructive",
        title: "Protocol Restriction",
        description: "Your Free Journey is complete. Upgrade to Pro for continued access.",
      });
      router.push('/pricing');
      return;
    }

    const newErrors = {
      role: !selectedRole,
      company: !selectedCompany,
      exp: !selectedExp
    };

    setErrors(newErrors);

    if (newErrors.role || newErrors.company || newErrors.exp) {
      toast({
        variant: "destructive",
        title: "Calibration Incomplete",
        description: "Please define all required neural parameters to proceed.",
      });
      return;
    }

    if (!user || !db) return;

    setIsTransitioning(true);
    
    try {
      const sessionId = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      await setDoc(doc(db, 'users', user.uid, 'journey', 'active'), {
        role: selectedRole,
        company: selectedCompany,
        experience: selectedExp,
        sessionId,
        status: "Active",
        currentStage: "Resume Upload",
        updatedAt: serverTimestamp(),
        step: 1
      }, { merge: true });

      setTimeout(() => {
        router.push('/resume-upload');
      }, 4000);

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Protocol Fault" });
      setIsTransitioning(false);
    }
  };

  const handleSkipToCoding = async () => {
    if (!user || !db) return;
    
    // Free Trial Enforcement
    if (profile?.plan === 'free' && profile?.freeTrialUsed) {
      toast({
        variant: "destructive",
        title: "Protocol Restriction",
        description: "Your Free Journey is complete. Upgrade to Pro for continued access.",
      });
      router.push('/pricing');
      return;
    }

    const role = selectedRole || "Software Engineer";
    const company = selectedCompany || "Google";
    const exp = selectedExp || "Senior";
    
    const sessionId = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    await setDoc(doc(db, 'users', user.uid, 'journey', 'active'), {
      role,
      company,
      experience: exp,
      sessionId,
      status: "Active",
      currentStage: "Coding Assessment",
      updatedAt: serverTimestamp(),
      step: 4
    }, { merge: true });
    
    router.push('/interview/coding');
  };

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative selection:bg-accent/30 selection:text-white">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-24 right-8 z-[100]">
          <Button 
            onClick={handleSkipToCoding}
            variant="ghost" 
            className="h-8 px-3 rounded-lg glass border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent"
          >
            Skip → Coding
          </Button>
        </div>
      )}

      <main className="flex-1 container mx-auto px-6 flex items-center justify-center relative z-10 pt-16">
        <div className="grid lg:grid-cols-12 gap-6 max-w-6xl w-full">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 flex flex-col h-full"
          >
            <Card className="premium-card bg-white/[0.01] border-white/5 p-8 space-y-6 shadow-2xl">
              <header className="space-y-1">
                <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-[0.4em] font-black uppercase">Neural Interview Engine</Badge>
                <h1 className="text-4xl font-bold tracking-tighter text-premium">Interview Setup</h1>
                <p className="text-muted-foreground font-light text-base">Configure your interview before entering the AI Interview Room.</p>
              </header>

              <div className="space-y-6">
                <div className="space-y-2 relative">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] px-2", errors.role ? "text-red-400" : "text-white/30")}>Deployment Track</span>
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent transition-colors" />
                    <input 
                      placeholder="Search Job Role..."
                      value={roleSearch || selectedRole}
                      onChange={(e) => { setRoleSearch(e.target.value); setSelectedRole(""); setIsRoleOpen(true); }}
                      onFocus={() => setIsRoleOpen(true)}
                      className="w-full h-14 pl-16 pr-8 rounded-xl glass border-white/10 bg-transparent text-lg font-light focus:outline-none focus:border-accent/50 transition-all"
                    />
                    <AnimatePresence>
                      {isRoleOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-2 p-2 glass border-white/10 bg-[#0b0e1a]/95 rounded-xl z-[100] max-h-[200px] overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-3xl">
                          {filteredRoles.map(role => (
                            <button key={role} onClick={() => { setSelectedRole(role); setIsRoleOpen(false); setRoleSearch(""); }} className="w-full text-left p-3 hover:bg-accent/10 hover:text-accent rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group/item">
                              {role} <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] px-2", errors.company ? "text-red-400" : "text-white/30")}>Target Agency</span>
                  <div className="relative group">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                    <input 
                      placeholder="Search Company..."
                      value={companySearch || selectedCompany}
                      onChange={(e) => { setCompanySearch(e.target.value); setSelectedCompany(""); setIsCompanyOpen(true); }}
                      onFocus={() => setIsCompanyOpen(true)}
                      className="w-full h-14 pl-16 pr-8 rounded-xl glass border-white/10 bg-transparent text-lg font-light focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                    <AnimatePresence>
                      {isCompanyOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-2 p-2 glass border-white/10 bg-[#0b0e1a]/95 rounded-xl z-[100] max-h-[180px] overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-3xl">
                          {filteredCompanies.map(comp => (
                            <button key={comp} onClick={() => { setSelectedCompany(comp); setIsCompanyOpen(false); setCompanySearch(""); }} className="w-full text-left p-3 hover:bg-purple-500/10 hover:text-purple-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group/item">
                              {comp} <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] px-2", errors.exp ? "text-red-400" : "text-white/30")}>Seniority Grade</span>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button key={level} onClick={() => setSelectedExp(level)} className={cn("h-12 rounded-lg border font-bold text-[9px] uppercase tracking-widest transition-all duration-300", selectedExp === level ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "glass border-white/10 text-white/40 hover:bg-white/5")}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleContinue} disabled={isTransitioning} className="w-full h-18 btn-premium rounded-2xl text-lg font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group">
                  {isTransitioning ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Continue <ChevronRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" /></>}
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4">
            <Card className="premium-card bg-accent/[0.02] border-accent/20 p-8 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                <h3 className="text-lg font-black uppercase tracking-tighter text-accent flex items-center gap-3"><Sparkles className="w-5 h-5" /> Simulation Blueprint</h3>
                <div className="space-y-4">
                  <div className="p-5 glass rounded-xl border-white/5 space-y-1">
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Active Protocol</p>
                    <p className="text-lg font-bold text-white leading-tight truncate">{selectedRole || "Awaiting..."}</p>
                    <p className="text-[10px] text-accent font-bold mt-1 uppercase tracking-wider">{selectedCompany || "---"} • {selectedExp || "---"}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest ml-1">Logic Path Sequence</p>
                    {[
                      { label: "Resume Upload", status: "Node 01" },
                      { label: "Aptitude Assessment", status: "Node 02" },
                      { label: "Syntax Matrix", status: "Node 03" },
                      { label: "HR Virtual Arena", status: "Node 04" }
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-[9px] font-black text-white/20 transition-all group-hover/item:border-accent/40 group-hover/item:text-accent">0{i + 1}</div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">{step.label}</span>
                          <span className="text-[8px] font-black text-white/10 uppercase">{step.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#050816]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-12">
              <div className="w-32 h-32 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
              <Cpu className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-6 max-w-md">
              <h2 className="text-4xl font-bold tracking-tighter text-premium">Synthesizing Environment</h2>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, ease: "linear" }} className="h-full bg-accent shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
              </div>
              <div className="h-4">
                <AnimatePresence mode="wait">
                  <motion.p key={loadingMsgIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
