"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  ChevronRight, 
  Rocket,
  Loader2,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  Star,
  Users,
  Lock,
  Twitter,
  Linkedin,
  Github,
  Command,
  ArrowUpRight
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useState, useMemo, memo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';

/* ---------- CONSTANTS ---------- */

const COMPANIES = [
  { name: "Google", logo: "GOOG", color: "text-blue-400" },
  { name: "Microsoft", logo: "MSFT", color: "text-blue-500" },
  { name: "Amazon", logo: "AMZN", color: "text-orange-400" },
  { name: "Meta", logo: "META", color: "text-blue-600" },
  { name: "Oracle", logo: "ORCL", color: "text-red-500" },
  { name: "IBM", logo: "IBM", color: "text-blue-300" },
  { name: "Cisco", logo: "CSCO", color: "text-blue-400" },
  { name: "TCS", logo: "TCS", color: "text-purple-400" },
  { name: "Infosys", logo: "INFY", color: "text-blue-500" },
  { name: "Accenture", logo: "ACN", color: "text-purple-500" },
  { name: "Deloitte", logo: "DTT", color: "text-green-500" },
  { name: "Capgemini", logo: "CAP", color: "text-blue-400" },
  { name: "Wipro", logo: "WIT", color: "text-blue-300" },
  { name: "Cognizant", logo: "CTSH", color: "text-blue-600" },
];

const TRUST_CARDS = [
  { icon: Star, title: "4.9/5 User Rating", subtitle: "Thousands of students trust Nexvoro AI.", color: "text-yellow-400" },
  { icon: Users, title: "Students & Professionals", subtitle: "Used by freshers, graduates and experienced candidates.", color: "text-blue-400" },
  { icon: BrainCircuit, title: "Powered by Advanced AI", subtitle: "AI-driven interview simulation with intelligent feedback.", color: "text-purple-400" },
  { icon: Zap, title: "Real Interview Experience", subtitle: "Experience realistic HR and Technical interview environments.", color: "text-accent" },
  { icon: Lock, title: "100% Secure & Private", subtitle: "Your interview data and reports remain secure.", color: "text-green-400" }
];

const STATIC_TESTIMONIALS = [
  {
    name: "Prof. Rahul Patil",
    role: "FOUNDER & CEO",
    company: "Hruta Solutions Software company",
    image: "https://ui-avatars.com/api/?name=Rahul+Patil&background=7C3AED&color=fff&size=200&bold=true",
    text: "I was genuinely impressed by NexVoroAI’s technical depth. Its aptitude, coding assessments, resume analysis, and interview simulations go far beyond basic practice.",
    rating: 5
  },
  {
    name: "SHUBHAM SOMWANSHI",
    role: "FOUNDER & CEO",
    company: "GOLDWINGS IT",
    image: "https://ui-avatars.com/api/?name=Shubham+Somwanshi&background=06B6D4&color=fff&size=200&bold=true",
    text: "As a Founder & CEO, I use NexVoroAI’s with my students for aptitude and coding practice. It has helped them overcome interview anxiety and improve their confidence.",
    rating: 5
  },
  {
    name: "ABHINAY CHAUHAN",
    role: "Full-Stack Software Engineer",
    company: "Microsoft",
    image: "https://ui-avatars.com/api/?name=Abhinay+Chauhan&background=F97316&color=fff&size=200&bold=true",
    text: "As a Full-Stack Software Engineer with AI/ML experience, I found NexVoroAI’s aptitude, coding, and resume analysis incredibly powerful and accurate.",
    rating: 5
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const HeroSection = memo(({ onStart, onEnterRoom }: { onStart: () => void, onEnterRoom: () => void }) => {
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="grid lg:grid-cols-12 items-center gap-14 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] font-bold tracking-[0.5em] uppercase text-white/60">Neural Matrix v5.0 Active</span>
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[0.95] text-premium">
                Master Every <br />
                <span className="text-gradient-purple">Interview.</span>
              </h1>
              <p className="max-w-md text-xl text-muted-foreground font-light leading-relaxed">
                Deploy high-fidelity simulations calibrated for elite IT standards. Bridge the gap between technical potential and executive reality.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button 
              onClick={onStart} 
              className="h-14 px-8 text-xs btn-premium shadow-[0_20px_50px_rgba(147,51,234,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              🚀 Start Mock Interview <Zap className="ml-3 w-4 h-4 fill-current" />
            </Button>
            <Link href="/resume-atelier">
              <Button variant="outline" className="h-14 px-8 glass border-white/10 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-white/5">
                🤖 Resume Atelier
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-4 border-t border-white/5">
            {[
              { label: "Precision", val: "98.4%", icon: Cpu },
              { label: "Simulations", val: "1.2M+", icon: BrainCircuit },
              { label: "Success", val: "84%", icon: ShieldCheck }
            ].map((stat, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-bold text-white/30">
                  <stat.icon className="w-2.5 h-2.5" /> {stat.label}
                </div>
                <div className="text-lg font-bold text-white/90">{stat.val}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, x: 30 }} 
          animate={{ opacity: 1, scale: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-7 relative group w-full"
        >
          <div className="absolute inset-0 bg-accent/20 rounded-[3rem] blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000" />
          
          <Card className="premium-card overflow-hidden rounded-[3rem] border border-cyan-500/20 bg-[#0B0F1D] backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,255,0.08)] transition-all duration-500 hover:shadow-[0_0_120px_rgba(59,130,246,0.18)] flex flex-col md:flex-row min-h-[500px]">
            <div className="md:w-[50%] p-10 flex flex-col justify-between relative z-10">
              <div className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tighter text-premium">Simulation Protocol</h2>
                  <p className="text-[9px] text-accent font-bold uppercase tracking-[0.5em] flex items-center gap-3">
                    <Rocket className="w-3.5 h-3.5" /> INTERVIEW EVALUATION PIPELINE
                  </p>
                </div>
                
                <div className="space-y-3 pl-1">
                  {[
                    { label: "RESUME CALIBRATION", desc: "IDENTITY & SKILL SYNC", color: "text-blue-400" },
                    { label: "APTITUDE SCREENING", desc: "LOGICAL & QUANTITATIVE ASSESSMENT", color: "text-emerald-400" },
                    { label: "SYNTAX MATRIX", desc: "CODING & IMPLEMENTATION TEST", color: "text-accent" },
                    { label: "NEURAL ARENA", desc: "AI VIRTUAL HR INTERVIEW", color: "text-amber-400" }
                  ].map((step, idx, arr) => (
                    <div key={idx} className="flex flex-col">
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-4 group/step cursor-default"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[10px] font-black transition-all group-hover/step:border-accent/50 group-hover/step:bg-accent/5">
                            {idx + 1}
                          </div>
                          {idx < arr.length - 1 && (
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-gradient-to-b from-white/10 to-transparent" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/90 group-hover/step:text-white transition-colors uppercase tracking-widest">{step.label}</span>
                          <span className={`text-[8px] ${step.color} font-bold uppercase tracking-widest opacity-60 group-hover/step:opacity-100 transition-opacity`}>{step.desc}</span>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={onEnterRoom} 
                className="w-full h-12 btn-orange-premium text-[9px] font-black tracking-[0.4em] uppercase mt-10 rounded-2xl group/btn overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  🚪 Enter Interview Room <ChevronRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                </span>
              </button>
            </div>
            
            <div className="relative w-full md:w-[50%] min-h-[400px] md:min-h-full overflow-hidden rounded-r-[3rem] bg-black">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-50 z-10" />
              <div className="absolute inset-0">
                <video
                  src="/home.mp4"
                  autoPlay
                  muted={isVideoMuted}
                  playsInline
                  controls={false}
                  preload="metadata"
                  onPlaying={() => {
                    setTimeout(() => {
                      setIsVideoMuted(false);
                    }, 100);
                  }}
                  onPause={(e) => {
                    // If the browser paused the video due to a blocked unmute attempt, resume it muted instead of leaving it stuck paused
                    const video = e.currentTarget;
                    if (!video.ended && video.paused) {
                      video.muted = true;
                      setIsVideoMuted(true);
                      video.play().catch(() => {
                        // If even muted play fails, leave it paused silently — no further action needed
                      });
                    }
                  }}
                  onEnded={(e) => {
                    const video = e.currentTarget;
                    video.currentTime = 0;
                    video.pause();
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/30 via-transparent to-transparent z-20" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-blue-500/10 z-20" />
                <div className="absolute inset-0 ring-1 ring-cyan-400/10 rounded-r-[3rem] z-20" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});
HeroSection.displayName = "HeroSection";

const TrustSection = memo(() => {
  const [isScrollingPaused, setIsScrollingPaused] = useState(false);

  return (
    <div className="container mx-auto max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-[40px] mb-[24px] relative"
      >
        <div className="absolute -inset-24 bg-accent/5 rounded-full blur-[100px] pointer-events-none opacity-20" />
        
        <Card className="relative overflow-hidden glass border-cyan-500/20 rounded-[24px] py-[30px] px-0 bg-white/[0.01] shadow-[0_0_40px_rgba(34,211,238,0.05)] group">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-light-streak" />
          </div>

          <div className="text-center mb-10 px-[30px]">
            <h2 className="text-[11px] font-black tracking-[0.4em] uppercase text-gradient-purple">
              TRUSTED BY TOP COMPANIES WORLDWIDE
            </h2>
          </div>

          <div 
            className="relative overflow-hidden py-4"
            onMouseEnter={() => setIsScrollingPaused(true)}
            onMouseLeave={() => setIsScrollingPaused(false)}
          >
            <motion.div 
              className="flex gap-12 w-max items-center"
              animate={{ x: isScrollingPaused ? 0 : [0, -100 * COMPANIES.length] }}
              transition={{ 
                duration: 40, 
                repeat: Infinity, 
                ease: "linear",
                repeatType: "loop"
              }}
            >
              {[...COMPANIES, ...COMPANIES].map((company, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 transition-all duration-300 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-[1.08] cursor-default"
                >
                  <div className={`text-2xl font-black ${company.color} tracking-tighter`}>
                    {company.logo}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{company.name}</span>
                </div>
              ))}
            </motion.div>
            
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050816]/50 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050816]/50 to-transparent z-10" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10 px-4"
          >
            {TRUST_CARDS.map((card, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ translateY: -8, scale: 1.03 }}
                className="glass rounded-[18px] p-8 border-cyan-500/20 bg-white/[0.02] shadow-[0_0_30px_rgba(34,211,238,0.05)] hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] transition-all duration-300 group/card min-h-[280px] flex flex-col"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover/card:bg-accent/20 transition-colors">
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover/card:text-accent transition-colors">{card.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{card.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">
            Trusted by students preparing for the world's leading technology companies.
          </p>
        </div>
      </motion.div>
    </div>
  );
});
TrustSection.displayName = "TrustSection";

export default function LandingPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();

  const feedbackQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'userFeedback'),
      where('status', '==', 'approved'),
      where('consent', '==', true)
    );
  }, [db]);

  const { data: communityFeedback } = useCollection(feedbackQuery);

  const allTestimonials = useMemo(() => {
    const dynamic = communityFeedback?.map(f => ({
      name: f.name,
      role: f.role,
      company: f.company,
      image: f.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || 'User')}&background=7C3AED&color=fff&size=200&bold=true`,
      text: f.feedback,
      rating: Math.max(0, Math.min(5, Number(f.rating) || 5))
    })) || [];
    return [...STATIC_TESTIMONIALS, ...dynamic];
  }, [communityFeedback]);

  const handleStartMockInterview = () => {
    if (!user) {
      router.push('/login?redirectTo=/interview/setup');
      return;
    }
    router.push('/interview/setup');
  };

  const handleEnterInterviewRoom = () => {
    if (!user) {
      router.push('/login?redirectTo=/interview/setup');
      return;
    }
    router.push('/interview/setup');
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen relative bg-[#050816]">
      <div className="particles-bg" />
      
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <section className="relative flex flex-col items-center justify-center pt-32 pb-16 px-8">
        <HeroSection onStart={handleStartMockInterview} onEnterRoom={handleEnterInterviewRoom} />
        <TrustSection />
      </section>

      <section className="pt-12 pb-32 px-8 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20 space-y-4">
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Testimonials</Badge>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-premium">Success <span className="text-gradient-purple">Stories.</span></h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg">
              Engineers from the world's most innovative companies used Nexvoro AI to master their interviews.
            </p>
            <div className="pt-8">
              <FeedbackDialog />
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {allTestimonials.map((t, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="glass p-10 rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all h-full flex flex-col justify-between group">
                  <div className="space-y-6">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white/80 font-light leading-relaxed text-lg italic">"{t.text}"</p>
                  </div>
                  
                  <div className="pt-8 mt-8 border-t border-white/5 flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/20">
                      <Image 
                        src={t.image} 
                        alt={t.name} 
                        fill 
                        className="object-cover" 
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">{t.name}</p>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{t.role} {t.company ? `@ ${t.company}` : ''}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="pt-32 pb-16 px-8 border-t border-white/5 bg-black/20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-1 space-y-8">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg border border-white/10 group-hover:rotate-90 transition-transform duration-500">
                  <Command className="text-white w-5 h-5" />
                </div>
                <span className="font-headline font-bold text-2xl tracking-tighter uppercase text-premium">
                  NEXVORO<span className="text-accent">AI</span>
                </span>
              </Link>
              <p className="text-white/40 text-sm font-light leading-relaxed">
                The global standard for high-fidelity technical interview preparation. Calibrated for elite IT performance.
              </p>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-xl glass border-white/5 flex items-center justify-center text-white/20 hover:text-accent hover:border-accent/20 transition-all">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-12">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Platform</h4>
                <ul className="space-y-4">
                  {['Features', 'Pricing', 'Question Bank', 'About'].map((item) => (
                    <li key={item}>
                      <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-white/40 hover:text-accent transition-colors flex items-center gap-2 group">
                        {item} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Products</h4>
                <ul className="space-y-4">
                  {['Resume Atelier', 'Mock Interviews', 'Skill Gap', 'Personal Roadmaps'].map((item) => (
                    <li key={item}>
                      <Link href={item === 'Mock Interviews' ? '/interview' : item === 'Resume Atelier' ? '/resume-atelier' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-white/40 hover:text-accent transition-colors flex items-center gap-2 group">
                        {item} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Support</h4>
                <ul className="space-y-4">
                  {['Documentation', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                    <li key={item}>
                      <Link href={item === 'Contact' ? '/contact' : '#'} className="text-sm text-white/40 hover:text-accent transition-colors flex items-center gap-2 group">
                        {item} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
              © 2026 NEXVORO AI PROTOCOLS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 glass rounded-full border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">System Optimal</span>
              </div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">v5.0.2 Deployment</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes light-streak {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-light-streak {
          animation: light-streak 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
