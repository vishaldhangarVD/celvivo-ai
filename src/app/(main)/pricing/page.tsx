'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  Zap, 
  Star, 
  Crown, 
  ShieldCheck, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Script from 'next/script';

export default function PricingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAction = async (plan: string) => {
    if (plan === 'FREE') {
      if (user) {
        router.push('/interview');
      } else {
        router.push('/signup?redirectTo=/interview');
      }
      return;
    }

    if (!user) {
      router.push('/login?redirectTo=/pricing');
      return;
    }

    const planType = plan.toLowerCase();
    setIsProcessing(planType);

    try {
      const res = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType })
      });

      if (!res.ok) throw new Error("Failed to initialize payment gateway.");
      
      const { subscriptionId, keyId } = await res.json();

      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: "Nexvoro AI",
        description: `${plan} Plan Subscription`,
        image: "/favicon.ico",
        handler: async function (response: any) {
          setIsProcessing('verifying');
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.verified && db) {
            await updateDoc(doc(db, 'users', user.uid), {
              plan: planType,
              subscriptionStatus: 'active',
              subscriptionId: response.razorpay_subscription_id,
              paymentId: response.razorpay_payment_id,
              subscriptionStart: serverTimestamp(),
              updatedAt: serverTimestamp()
            });

            toast({
              title: "PROTOCOL UPGRADED",
              description: `Welcome to ${plan} tier. All elite nodes are now unlocked.`,
            });
            router.push('/dashboard');
          } else {
            toast({
              variant: "destructive",
              title: "VERIFICATION FAILED",
              description: "Security signature mismatch. Please contact support.",
            });
          }
          setIsProcessing(null);
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#22d3ee"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "GATEWAY ERROR",
        description: error.message || "Could not reach payment servers.",
      });
      setIsProcessing(null);
    }
  };

  const plans = [
    {
      name: "FREE",
      price: "₹0",
      description: "Ideal for initial calibration",
      icon: Zap,
      color: "text-blue-400",
      button: "GET STARTED FREE",
      features: [
        "One-time initial access",
        "Resume Analysis",
        "Aptitude Round",
        "Coding Round",
        "AI Mock Interview",
        "Basic Feedback"
      ]
    },
    {
      name: "PRO",
      price: isYearly ? "₹4,790" : "₹499",
      period: isYearly ? "/year" : "/month",
      description: "Engineered for active seekers",
      icon: Star,
      color: "text-purple-400",
      button: "UPGRADE TO PRO",
      features: [
        "Resume Generation — 3 Uses Every Day",
        "Aptitude Assessments — 10 Uses Every Day",
        "Coding Assessments — 5 Uses Every Day",
        "AI Mock Interviews — 8 Uses Every Day",
        "30/90-Day Personalized Learning Roadmap",
        "Advanced Performance Feedback",
        "24/7 AI Career Coach"
      ]
    },
    {
      name: "PREMIUM",
      price: isYearly ? "₹9,590" : "₹999",
      period: isYearly ? "/year" : "/month",
      description: "The ultimate mastery track",
      icon: Crown,
      color: "text-accent",
      button: "UPGRADE TO PREMIUM",
      popular: true,
      features: [
        "Everything in Pro",
        "Elite HR Interview — 5 Priority Sessions Every Day",
        "Resume Generation",
        "Aptitude Assessments",
        "Coding Assessments",
        "AI Mock Interviews",
        "Advanced Performance Feedback",
        "High-Fidelity Advanced Reports",
        "Priority Neural Access",
        "Confidence Vector Analysis",
        "Communication Strategic Audit",
        "Deep Technical Precision Index",
        "Job Readiness Benchmarking",
        "Personalized Career Guidance",
        "Full Resume Blueprint Optimization",
        "Executive Priority Support",
        "24/7 AI Career Coach"
      ]
    }
  ];

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="particles-bg" />
      
      <main className="container mx-auto px-6 pt-40">
        <header className="max-w-4xl mx-auto text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase mb-6">Neural Economic Protocol</Badge>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-premium">
              Simple, Transparent <br /><span className="text-gradient-purple">Pricing.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mt-6">
              Choose the plan that fits your interview preparation needs. High-fidelity simulations for elite career placement.
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-6 pt-8">
            <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", !isYearly ? "text-white" : "text-white/40")}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-16 h-8 rounded-full glass border-white/10 p-1 relative transition-all"
            >
              <motion.div 
                animate={{ x: isYearly ? 32 : 0 }}
                className="w-6 h-6 rounded-full bg-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              />
            </button>
            <div className="flex items-center gap-3">
              <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", isYearly ? "text-white" : "text-white/40")}>Yearly</span>
              <Badge className="bg-green-500/20 text-green-400 border-none text-[9px] font-black uppercase px-2 py-0.5">Save 20%</Badge>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 border-none text-white px-6 py-1.5 font-bold tracking-[0.2em] text-[9px] uppercase rounded-full shadow-lg">
                    MOST POPULAR PROTOCOL
                  </Badge>
                </div>
              )}
              
              <Card className={cn(
                "premium-card h-full flex flex-col p-10 transition-all duration-500 bg-white/[0.01]",
                plan.popular ? "border-accent/40 bg-accent/[0.03] shadow-[0_0_80px_rgba(34,211,238,0.1)] scale-105" : "border-white/5 hover:border-white/10"
              )}>
                <div className="mb-10">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 glass", plan.color)}>
                    <plan.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={plan.price}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-6 font-black tracking-tighter"
                      >
                        {plan.price}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground font-light text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-12 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 border-b border-white/5 pb-2">Capability Matrix</p>
                  {plan.features.map((feature, j) => {
                    const isEliteFeature = feature.includes("Elite HR Interview");
                    return (
                      <div key={j} className={cn(
                        "flex items-start gap-4 text-sm transition-all group",
                        isEliteFeature ? "text-accent font-bold" : "font-light text-white/70"
                      )}>
                        <div className={cn("mt-1 shrink-0", (plan.popular || isEliteFeature) ? "text-accent" : "text-white/20")}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span className={cn(
                          "transition-colors leading-snug",
                          isEliteFeature ? "text-accent" : "group-hover:text-white"
                        )}>
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Button 
                  onClick={() => handleAction(plan.name)}
                  disabled={isProcessing !== null}
                  className={cn(
                    "w-full h-16 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all shadow-2xl group/btn",
                    plan.popular 
                    ? "btn-premium hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]" 
                    : "glass border-white/10 hover:bg-white/10"
                  )}
                >
                  {isProcessing === plan.name.toLowerCase() ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isProcessing === 'verifying' && plan.name !== 'FREE' ? (
                    "VERIFYING..."
                  ) : (
                    <>{plan.button} <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" /></>
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 max-w-4xl mx-auto text-center">
          <div className="p-12 glass rounded-[3rem] border-white/5 bg-white/[0.01] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldCheck className="w-48 h-48 text-accent" /></div>
            <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-6" />
            <h4 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Enterprise Grade Security</h4>
            <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto italic">
              "All neural simulation data is encrypted with AES-256 protocols. We prioritize the integrity of your professional identity."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
