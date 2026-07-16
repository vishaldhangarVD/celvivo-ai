
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
  Command, 
  Search, 
  Building2, 
  ChevronRight, 
  Zap, 
  Rocket, 
  ShieldCheck, 
  Award, 
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function InterviewSetupPage() {
  const router = useRouter();
  
  // Selection States
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  
  // Search States
  const [roleSearch, setRoleSearch] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  // Filter Logic
  const filteredRoles = useMemo(() => 
    ALL_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())),
  [roleSearch]);

  const filteredCompanies = useMemo(() => 
    COMPANIES.filter(c => c.toLowerCase().includes(companySearch.toLowerCase())),
  [companySearch]);

  const handleContinue = () => {
    if (selectedRole && selectedCompany && selectedExp) {
      // Transition to Resume Upload node
      router.push('/resume-upload');
    }
  };

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative selection:bg-accent/30 selection:text-white">
      {/* Cinematic Environment */}
      <div className="particles-bg" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" 
        />
      </div>

      <Navbar />
      <NavigationControls onHome={() => router.push('/')} />

      <main className="flex-1 container mx-auto px-6 flex items-center justify-center relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl w-full">
          
          {/* Configuration Node */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <Card className="premium-card bg-white/[0.01] border-white/5 p-12 space-y-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              <header className="space-y-4">
                <Badge className="bg-accent/20 text-accent border-none px-4 py-1.5 text-[10px] tracking-[0.4em] font-black uppercase">Neural Interview Engine</Badge>
                <div className="space-y-2">
                  <h1 className="text-5xl font-bold tracking-tighter text-premium">Interview Setup</h1>
                  <p className="text-muted-foreground font-light text-lg">Configure your interview journey before entering the AI Interview Room.</p>
                </div>
              </header>

              <div className="space-y-10">
                {/* Search Job Role */}
                <div className="space-y-4 relative">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Deployment Track</span>
                    {selectedRole && <span className="text-[10px] font-bold text-accent animate-in fade-in slide-in-from-right-2 uppercase tracking-widest">Selected</span>}
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent transition-colors" />
                    <input 
                      placeholder="Search Job Role... e.g. Data Analyst"
                      value={roleSearch || selectedRole}
                      onChange={(e) => { setRoleSearch(e.target.value); setSelectedRole(""); setIsRoleOpen(true); }}
                      onFocus={() => setIsRoleOpen(true)}
                      className="w-full h-16 pl-16 pr-8 rounded-[1.25rem] glass border-white/10 bg-transparent text-lg font-light focus:outline-none focus:border-accent/50 focus:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all"
                    />
                    <AnimatePresence>
                      {isRoleOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-3 p-3 glass border-white/10 bg-[#0b0e1a]/95 rounded-[1.5rem] z-[100] max-h-[280px] overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-3xl"
                        >
                          {filteredRoles.map(role => (
                            <button 
                              key={role} 
                              onClick={() => { setSelectedRole(role); setIsRoleOpen(false); setRoleSearch(""); }}
                              className="w-full text-left p-4 hover:bg-accent/10 hover:text-accent rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-between group/item"
                            >
                              {role}
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover/item:translate-x-0" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Search Company */}
                <div className="space-y-4 relative">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Target Agency</span>
                    {selectedCompany && <span className="text-[10px] font-bold text-purple-400 animate-in fade-in slide-in-from-right-2 uppercase tracking-widest">Selected</span>}
                  </div>
                  <div className="relative group">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                    <input 
                      placeholder="Search Company... e.g. OpenAI"
                      value={companySearch || selectedCompany}
                      onChange={(e) => { setCompanySearch(e.target.value); setSelectedCompany(""); setIsCompanyOpen(true); }}
                      onFocus={() => setIsCompanyOpen(true)}
                      className="w-full h-16 pl-16 pr-8 rounded-[1.25rem] glass border-white/10 bg-transparent text-lg font-light focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_40px_rgba(168,85,247,0.1)] transition-all"
                    />
                    <AnimatePresence>
                      {isCompanyOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-3 p-3 glass border-white/10 bg-[#0b0e1a]/95 rounded-[1.5rem] z-[100] max-h-[280px] overflow-y-auto custom-scrollbar shadow-2xl backdrop-blur-3xl"
                        >
                          {filteredCompanies.map(comp => (
                            <button 
                              key={comp} 
                              onClick={() => { setSelectedCompany(comp); setIsCompanyOpen(false); setCompanySearch(""); }}
                              className="w-full text-left p-4 hover:bg-purple-500/10 hover:text-purple-400 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-between group/item"
                            >
                              {comp}
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover/item:translate-x-0" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Experience Segmented Selector */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-2">Seniority Grade</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedExp(level)}
                        className={cn(
                          "h-14 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all duration-300",
                          selectedExp === level 
                          ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                          : "glass border-white/10 text-white/40 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleContinue}
                  disabled={!selectedRole || !selectedCompany || !selectedExp}
                  className="w-full h-20 btn-premium rounded-[1.75rem] text-xl font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] group"
                >
                  Continue Journey <ArrowRight className="ml-4 w-6 h-6 transition-transform group-hover:translate-x-2" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Blueprint Node (Sidebar) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <Card className="premium-card bg-accent/[0.02] border-accent/20 p-8 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Command className="w-48 h-48 text-accent" />
              </div>

              <div className="space-y-8 relative z-10">
                <h3 className="text-lg font-black uppercase tracking-tighter text-accent flex items-center gap-3">
                  <Sparkles className="w-5 h-5" /> Simulation Blueprint
                </h3>

                <div className="space-y-6">
                  <div className="p-6 glass rounded-2xl border-white/5 space-y-1 transition-all hover:bg-white/5">
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Active Protocol</p>
                    <p className="text-xl font-bold text-white leading-tight">{selectedRole || "Awaiting Selection"}</p>
                    <p className="text-[10px] text-accent font-bold mt-1 uppercase tracking-wider">{selectedCompany || "---"} • {selectedExp || "---"}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest ml-1">Logic Path Sequence</p>
                    {[
                      { label: "Resume Upload", status: "Step 01" },
                      { label: "Aptitude Audit", status: "Step 02" },
                      { label: "Coding Matrix", status: "Step 03" },
                      { label: "HR Virtual Arena", status: "Step 04" }
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-[10px] font-black text-white/20 transition-all group-hover/item:border-accent/40 group-hover/item:text-accent">
                          0{i + 1}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{step.label}</span>
                          <span className="text-[8px] font-black text-white/10 uppercase">{step.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4 relative z-10">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 glass rounded-xl border-white/5 text-center">
                       <p className="text-[8px] font-black text-white/20 uppercase mb-1">Rounds</p>
                       <p className="text-sm font-bold">4 Nodes</p>
                    </div>
                    <div className="p-4 glass rounded-xl border-white/5 text-center">
                       <p className="text-[8px] font-black text-white/20 uppercase mb-1">Efficiency</p>
                       <p className="text-sm font-bold">AI Audited</p>
                    </div>
                 </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
      `}</style>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
