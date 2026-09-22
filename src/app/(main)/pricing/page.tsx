'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  { id: 'aptitude_1', name: 'Aptitude Test', price: 15, desc: '1 Aptitude Credit', icon: Star },
  { id: 'coding_1', name: 'Coding Round', price: 20, desc: '1 Coding Credit', icon: Zap },
  { id: 'interview_1', name: 'Interview Session', price: 10, desc: '1 Interview Credit', icon: Sparkles },
  { id: 'bundle_1', name: 'Full Practice Pack', price: 49, desc: '1 of each Credit', icon: Crown, popular: true },
];

const PLANS = [
  { id: 'starter', name: 'Starter Plan', price: 299, desc: 'For consistent practice', features: ['15 Aptitude Tests', '10 Coding Rounds', '10 AI Interviews'] },
  { id: 'pro', name: 'Pro Plan', price: 599, desc: 'Unrestricted growth', features: ['Unlimited Aptitude', 'Unlimited Coding', 'Unlimited Interviews'], popular: true },
];

export default function PricingPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (pack: any, type: 'order' | 'subscription') => {
    if (!user) {
      return router.push('/login?redirectTo=/pricing');
    }

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

  return (
    <div className="min-h-screen bg-[#050816] pt-32 pb-24 px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold tracking-tighter text-premium">Simple <span className="text-gradient-purple">Pricing.</span></h1>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">Choose flexible credits or monthly plans for your interview preparation.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Credits Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3"><CreditCard className="text-accent" /> One-Time Credits</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {CREDIT_PACKS.map(pack => (
                <Card key={pack.id} className="p-6 glass border-white/5 hover:border-accent/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <pack.icon className="w-6 h-6 text-accent" />
                    <span className="text-lg font-bold">₹{pack.price}</span>
                  </div>
                  <h3 className="font-bold mb-1">{pack.name}</h3>
                  <p className="text-[10px] text-white/40 uppercase mb-6">{pack.desc}</p>
                  <Button onClick={() => handlePurchase(pack, 'order')} disabled={loadingId === pack.id} className="w-full btn-premium h-10 text-[9px]">
                    {loadingId === pack.id ? <Loader2 className="animate-spin" /> : "Buy Credit"}
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          {/* Subscriptions Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3"><Crown className="text-purple-400" /> Monthly Subscriptions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PLANS.map(plan => (
                <Card key={plan.id} className={cn("p-8 glass border-white/5 relative", plan.popular && "border-purple-500/40")}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">BEST VALUE</Badge>}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-3xl font-black mt-2">₹{plan.price}<span className="text-sm text-white/40">/mo</span></p>
                  </div>
                  <div className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <div key={f} className="flex gap-2 text-[10px] text-white/70">
                        <Check className="w-3 h-3 text-purple-400" /> {f}
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => handlePurchase(plan, 'subscription')} disabled={loadingId === plan.id} className="w-full btn-premium h-12 text-[10px]">
                    {loadingId === plan.id ? <Loader2 className="animate-spin" /> : "Subscribe"}
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}