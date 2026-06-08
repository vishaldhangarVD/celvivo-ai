import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Mic, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Terminal, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer",
  "Data Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer",
  "DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst", "QA Engineer", "UI/UX Designer"
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Next-Gen Interview Prep</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter animate-in slide-in-from-bottom-4 duration-700">
            Ace Your Technical <br />
            <span className="text-gradient">Interviews with AI</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed animate-in slide-in-from-bottom-6 duration-1000">
            Practice real technical interviews, get instant feedback, improve confidence, and increase your chances of getting hired.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/interview">
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-premium hover:opacity-90 transition-all rounded-full group">
                Start Interview
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/resume">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-md">
                <FileText className="mr-2 w-5 h-5" />
                Upload Resume
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Logos Bar */}
      <section className="py-12 glass-card border-x-0">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
            <div>
              <div className="text-3xl font-bold font-headline mb-1">10k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Interviews Conducted</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-headline mb-1">98%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-headline mb-1">13+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Tech Roles</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-headline mb-1">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your AI Interviewer */}
      <section className="py-24" id="features">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full"></div>
              <div className="glass-card p-8 rounded-3xl overflow-hidden relative">
                <Image 
                  src={PlaceHolderImages.find(img => img.id === 'ai-interviewer')?.imageUrl || ''}
                  alt="AI Interviewer"
                  width={600}
                  height={600}
                  className="rounded-2xl object-cover"
                  data-ai-hint="ai robot avatar"
                />
                <div className="absolute bottom-12 left-12 right-12 glass-card p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">AI Interviewer Active</p>
                    <p className="text-xs text-muted-foreground italic">"Tell me about your experience with React..."</p>
                  </div>
                  <Mic className="text-primary w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Meet Your Personal <br />
                <span className="text-gradient">AI Career Coach</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nexvoro AI simulates high-pressure technical interviews tailored to your exact role. It asks follow-up questions, probes for deep knowledge, and evaluates your responses in real-time.
              </p>
              <ul className="space-y-4">
                {[
                  "Natural Conversational Flow",
                  "Adaptive Questioning Engine",
                  "Real-time Sentiment Analysis",
                  "Industry-standard Rubrics"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Select Interview Role */}
      <section className="py-24 bg-white/5" id="roles">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Path</h2>
          <p className="text-muted-foreground text-lg">Select from over 13 industry-relevant roles and start practicing.</p>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ROLES.map((role, idx) => (
              <Link key={idx} href={`/interview?role=${encodeURIComponent(role)}`}>
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-white/10 transition-all border-transparent hover:border-primary/50">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    {idx % 4 === 0 ? <Terminal className="w-6 h-6" /> : 
                     idx % 4 === 1 ? <Target className="w-6 h-6" /> :
                     idx % 4 === 2 ? <ShieldCheck className="w-6 h-6" /> : 
                     <Smartphone className="w-6 h-6" />}
                  </div>
                  <span className="font-semibold text-sm group-hover:text-primary transition-colors">{role}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto glass-card p-12 md:p-20 rounded-[4rem] border-white/20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Get Hired?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of job seekers who improved their performance with Nexvoro AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-16 px-10 text-xl bg-gradient-premium hover:opacity-90 rounded-2xl">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            <span className="font-headline font-bold text-xl">Nexvoro AI</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 Nexvoro AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
