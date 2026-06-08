'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

const tiers = [
  {
    name: "Initiate",
    price: "$0",
    description: "Explore the neural platform core.",
    features: [
      "1 AI Mock Interview",
      "Standard Resume Audit",
      "Basic Performance Scores",
      "Community Support"
    ],
    button: "Get Started",
    highlight: false
  },
  {
    name: "Elite",
    price: "$49",
    description: "The gold standard for serious engineers.",
    features: [
      "Unlimited AI Interviews",
      "Advanced ATS Optimization",
      "Neural Communication Feedback",
      "Personalized Learning Roadmap",
      "Priority API Processing"
    ],
    button: "Go Elite",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Bespoke systems for recruiting teams.",
    features: [
      "Custom Interview Archetypes",
      "Team Performance Analytics",
      "Dedicated Neural Training",
      "SLA Guaranteed Uptime",
      "SSO & Custom Integration"
    ],
    button: "Contact Sales",
    highlight: false
  }
];

export default function PricingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const handleAction = (tier: any) => {
    if (!user) {
      router.push(`/login?redirectTo=/pricing`);
      return;
    }
    // Logic for actual subscription can go here
  };

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <Badge className="bg-purple-500/20 text-purple-400 mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
            Platform Economics
          </Badge>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-premium mb-8">
            Invest in your <br /><span className="text-gradient-purple">Intelligence.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Choose the subscription tier that matches your career trajectory.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`premium-card relative p-12 ${tier.highlight ? 'border-accent/30 bg-accent/[0.02] shadow-[0_0_50px_rgba(34,211,238,0.1)]' : 'border-white/5 bg-white/[0.01]'}`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-[#050816] px-4 py-1 font-bold tracking-widest text-[10px] uppercase">Most Deployed</Badge>
                </div>
              )}
              
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-2 uppercase tracking-widest">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-bold tracking-tighter">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mo</span>}
                </div>
                <p className="text-muted-foreground font-light text-sm">{tier.description}</p>
              </div>

              <div className="space-y-6 mb-12">
                {tier.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-4 text-sm font-light text-white/80">
                    <Check className={`w-5 h-5 ${tier.highlight ? 'text-accent' : 'text-white/20'}`} />
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleAction(tier)}
                className={`w-full h-16 rounded-2xl text-xs font-bold tracking-[0.2em] uppercase transition-all ${tier.highlight ? 'btn-premium' : 'glass border-white/10 hover:bg-white/10'}`}
              >
                {tier.button}
              </Button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}