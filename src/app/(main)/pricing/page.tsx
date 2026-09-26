'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Zap, Star, Crown, Check, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { cn } from '@/lib/utils';

const CREDIT_PACKS = [
  {
    id: 'bundle_1',
    name: 'Full Practice Pack',
    price: 49,
    desc: '1 of each Credit',
    icon: Crown,
    popular: true,
    features: [
      '1 Special HR Interview',
      '1 Aptitude Round',
      '1 Coding Round',
      '1 Interview Round',
      '2 Resume Builder',
    ],
  },
];

const PLANS = [
  { id: 'starter', name: 'Starter Plan', price: 299, desc: 'For consistent practice', features: ['05 Special HR Interview','15 Aptitude Tests', '10 Coding Rounds', '10 AI Interviews','Resume Builder','Advanced Feedback','Learning Roadmap'] },
  { id: 'pro', name: 'Pro Plan', price: 599, desc: 'Unrestricted growth', features: ['Everything in Pro','15 Special HR Interview','Unlimited Aptitude', 'Unlimited Coding', 'Unlimited Interviews','Unlimited Resume Builder','Advanced Reports','Confidence Analysis','Communication Analysis','Technical Analysis','Personalized Career Guidance','Premium Support'], popular: true },
];

// ── design-only: entrance + hover motion variants ──────────────────────────
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function PricingPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Yaने actual Razorpay checkout suru hoto — फक्त user already logged-in astana call hoto
  const startPurchase = async (pack: any, type: 'order' | 'subscription') => {
    if (!user) return;

    setLoadingId(pack.id);

    try {
      const endpoint =
        type === 'order'
          ? '/api/payment/create-order'
          : '/api/payment/create-subscription';

      const body =
        type === 'order'
          ? { packId: pack.id }
          : {
              planType: pack.id,
              userId: user.uid,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.details ||
          data?.error ||
          `Payment failed (${res.status})`
        );
      }

      const { orderId, subscriptionId, keyId } = data;

      if (!keyId) {
        throw new Error('Razorpay Key ID is missing');
      }

      if (type === 'subscription' && !subscriptionId) {
        throw new Error('Razorpay Subscription ID is missing');
      }

      if (type === 'order' && !orderId) {
        throw new Error('Razorpay Order ID is missing');
      }

      const options = {
        key: keyId,
        amount: type === 'order' ? pack.price * 100 : undefined,
        order_id: orderId,
        subscription_id: subscriptionId,
        name: 'Celvivo AI',

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...response,
                type,
                userId: user.uid,
                packId: type === 'order' ? pack.id : undefined,
                planType: type === 'subscription' ? pack.id : undefined,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData?.details ||
                verifyData?.error ||
                'Payment verification failed'
              );
            }

            if (verifyData.verified) {
              toast({
                title: 'Purchase Success',
                description: 'Your account has been updated.',
              });

              router.push('/dashboard');
            } else {
              throw new Error('Payment could not be verified');
            }
          } catch (error: any) {
            console.error('VERIFICATION ERROR:', error);

            toast({
              variant: 'destructive',
              title: 'Verification Error',
              description:
                error?.message || 'Payment verification failed',
            });
          } finally {
            setLoadingId(null);
          }
        },

        prefill: {
          email: user.email || '',
        },

        theme: {
          color: '#22d3ee',
        },

        modal: {
          ondismiss: () => {
            // वापरकर्त्याने payment popup बंद केलं (cancel केलं) — loader थांबव
            setLoadingId(null);
          },
        },
      };

      const Razorpay = (window as any).Razorpay;

      if (!Razorpay) {
        throw new Error('Razorpay checkout is not loaded');
      }

      new Razorpay(options).open();
    } catch (e: any) {
      console.error('PAYMENT ERROR:', e);

      toast({
        variant: 'destructive',
        title: 'Gateway Error',
        description:
          e?.message || 'Payment request failed',
      });

      setLoadingId(null);
    }
  };

  // Yaने button clicks handle hotat — user logged-in nasel tar purchase intent save karून login kade pathavto
  const handlePurchase = (pack: any, type: 'order' | 'subscription') => {
    if (!user) {
      sessionStorage.setItem('pendingPurchase', JSON.stringify({ packId: pack.id, type }));
      return router.push('/login?redirectTo=/pricing');
    }
    return startPurchase(pack, type);
  };

  // Login nantar pricing page var परत aalyavar, jar pending purchase असेल tar automatically checkout ughad
  useEffect(() => {
    if (!user) return;
    const pending = sessionStorage.getItem('pendingPurchase');
    if (!pending) return;

    sessionStorage.removeItem('pendingPurchase');
    try {
      const { packId, type } = JSON.parse(pending);
      const fullPack = type === 'order'
        ? CREDIT_PACKS.find(p => p.id === packId)
        : PLANS.find(p => p.id === packId);
      if (fullPack) startPurchase(fullPack, type);
    } catch (e) {
      console.error('Failed to resume pending purchase:', e);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#050816] pt-32 pb-24 px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold tracking-tighter text-premium">Choose Your <span className="text-gradient-purple">Plan.</span></h1>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">Buy a one-time pack to try it out, or subscribe monthly for unlimited interview practice.</p>
        </div>

        {/* asymmetric columns: left column ata card chya rundi itkich (~400px), mule madhla dead space nighun gela */}
        <div className="grid lg:grid-cols-[minmax(0,400px)_1fr] gap-8 items-start">
          {/* Credits Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3"><CreditCard className="text-accent" /> One-Time Credits</h2>
            <motion.div
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {CREDIT_PACKS.map(pack => (
                <motion.div key={pack.id} variants={cardVariants} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                  <Card className="p-8 glass border-white/5 hover:border-accent/30 hover:shadow-[0_20px_40px_-24px_rgba(76,111,255,0.5)] transition-all duration-300">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                        <pack.icon className="w-6 h-6 text-accent" />
                      </div>
                      <span className="text-2xl font-bold">₹{pack.price}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{pack.name}</h3>
                    <p className="text-xs text-white/40 uppercase mb-6 tracking-wide">{pack.desc}</p>
                    {pack.features && (
                      <div className="space-y-3.5 mb-8">
                        {pack.features.map(f => (
                          <div key={f} className="flex gap-2.5 text-sm text-white/70">
                            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {f}
                          </div>
                        ))}
                      </div>
                    )}
                    <Button onClick={() => handlePurchase(pack, 'order')} disabled={loadingId === pack.id} className="w-full btn-premium h-12 text-sm font-semibold hover:-translate-y-0.5 transition-transform">
                      {loadingId === pack.id ? <Loader2 className="animate-spin" /> : "Buy Credit"}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Subscriptions Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3"><Crown className="text-purple-400" /> Monthly Subscriptions</h2>
            <motion.div
              className="grid sm:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {PLANS.map(plan => (
                <motion.div key={plan.id} variants={cardVariants} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                  <Card className={cn(
                    "p-8 glass border-white/5 relative transition-all duration-300 hover:shadow-[0_20px_40px_-24px_rgba(76,111,255,0.5)]",
                    plan.popular ? "border-purple-500/40 hover:border-purple-500/60" : "hover:border-accent/30"
                  )}>
                    {plan.popular && (
                      <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-400 text-[#0a0d18] border-0 text-xs font-bold px-3 py-1">
                        BEST VALUE
                      </Badge>
                    )}
                    <div className="mb-7">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-4xl font-black mt-2">₹{plan.price}<span className="text-base text-white/40 font-medium">/mo</span></p>
                    </div>
                    <div className="space-y-3.5 mb-8">
                      {plan.features.map(f => (
                        <div key={f} className="flex gap-2.5 text-sm text-white/70">
                          <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> {f}
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => handlePurchase(plan, 'subscription')} disabled={loadingId === plan.id} className="w-full btn-premium py-3.5 text-sm font-semibold hover:-translate-y-0.5 transition-transform">
                      {loadingId === plan.id ? <Loader2 className="animate-spin" /> : "Subscribe"}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
