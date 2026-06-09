'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Zap, Star, ShieldCheck, Crown } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

const tiers = [
  {
    name: "Starter",
    price: "₹0",
    description: "Initialize your career trajectory with basic neural audits.",
    icon: Zap,
    features: [
      "Limited Resume Analysis",
      "Basic ATS Score",
      "Limited Interview Questions",
      "Community Support"
    ],
    button: "Get Started",
    highlight: false,
    color: "text-blue-400"
  },
  {
    name: "Professional",
    price: "₹299",
    description: "The standard for engineers seeking rapid market leveling.",
    icon: Star,
    features: [
      "Unlimited Resume Analysis",
      "Advanced ATS Score",
      "Skill Gap Analysis",
      "Personalized Feedback",
      "Virtual HR Manager",
      "Real-Life Interview Experience",
      "AI Career Roadmap",
      "Interview History",
      "Priority Support"
    ],
    button: "Upgrade Now",
    highlight: false,
    color: "text-purple-400"
  },
  {
    name: "Enterprise Premium",
    price: "₹499",
    description: "Total neural dominance for elite executive placement.",
    icon: Crown,
    features: [
      "Everything in Professional",
      "AI Avatar Interviewer",
      "Voice-Based Interviews",
      "Real-Time Interview Feedback",
      "Advanced Resume Intelligence",
      "Job Readiness Score",
      "Personalized Learning Roadmap",
      "Unlimited Interview Sessions",
      "Premium Analytics Dashboard",
      "Performance Tracking",
      "Downloadable Reports",
      "Priority Premium Support"
    ],
    button: "Go Enterprise",
    highlight: true,
    color: "text-accent"
  }
];

export default function PricingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const handleAction = (tierName: string) => {
    if (!user) {
      router.push(`/login?redirectTo=/pricing`);
      return;
    }
    // Stripe/Payment integration would be initialized here
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
            Neural Economic Protocols
          </Badge>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-premium mb-8">
            Invest in your <br /><span className="text-gradient-purple">Elite Potential.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Choose the simulation tier that matches your career trajectory. High-fidelity feedback for high-stakes roles.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`premium-card relative flex flex-col p-10 min-h-[700px] transition-all duration-500 ${
                tier.highlight 
                ? 'border-accent/40 bg-accent/[0.03] shadow-[0_0_80px_rgba(34,211,238,0.15)] scale-105 z-10' 
                : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-accent text-[#050816] px-6 py-1.5 font-bold tracking-[0.2em] text-[10px] uppercase rounded-full shadow-lg">
                    MOST POPULAR PROTOCOL
                  </Badge>
                </div>
              )}
              
              <div className="mb-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 glass ${tier.color}`}>
                  <tier.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2 uppercase tracking-widest">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-bold tracking-tighter">{tier.price}</span>
                  {tier.price !== "₹0" && <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/ month</span>}
                </div>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-6">Capability Matrix</p>
                {tier.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-4 text-sm font-light text-white/80 group">
                    <div className={`mt-1 shrink-0 ${tier.highlight ? 'text-accent' : 'text-white/20'}`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleAction(tier.name)}
                className={`w-full h-16 rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase transition-all shadow-2xl ${
                  tier.highlight 
                  ? 'btn-premium hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]' 
                  : 'glass border-white/10 hover:bg-white/10'
                }`}
              >
                {tier.button}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 max-w-4xl mx-auto text-center">
          <div className="p-12 glass rounded-[3rem] border-white/5 bg-white/[0.01]">
            <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-6" />
            <h4 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Enterprise Grade Security</h4>
            <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              All neural simulation data is encrypted with AES-256 protocols. We prioritize the integrity of your professional identity. For corporate team licensing or custom neural tracks, contact our strategic operations team.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
