'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import NavigationControls from '@/components/NavigationControls';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  HelpCircle, 
  Globe, 
  Twitter, 
  Linkedin, 
  Github,
  Clock,
  Send,
  Loader2,
  ShieldCheck,
  Zap,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FAQS = [
  {
    q: "How accurate is the Neural Simulation?",
    a: "Our engine operates at 98.4% precision relative to senior-level hiring rubrics used at Big Tech firms."
  },
  {
    q: "Is my resume data encrypted?",
    a: "Yes. Every blueprint upload is encrypted using AES-256 protocols and anonymized for privacy."
  },
  {
    q: "Can I use Nexvoro AI for non-tech roles?",
    a: "Currently, our neural tracks are specialized for over 60+ IT and engineering roles."
  }
];

export default function ContactPage() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Protocol Initialized",
        description: "Your message has been received by our team.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
              Encrypted Support Channels
            </Badge>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-premium mb-8">
              Contact <span className="text-gradient-purple">Nexvoro.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Our team is available for technical support and business enquiries.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <Card className="premium-card bg-white/[0.01] border-white/5 p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Full Name</Label>
                    <Input placeholder="John Doe" className="h-14 rounded-2xl glass border-white/10 bg-transparent px-6" required />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Identity Email</Label>
                    <Input type="email" placeholder="john@nexus.ai" className="h-14 rounded-2xl glass border-white/10 bg-transparent px-6" required />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Subject Protocol</Label>
                  <Input placeholder="Technical Support Request" className="h-14 rounded-2xl glass border-white/10 bg-transparent px-6" required />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Message Intelligence</Label>
                  <Textarea placeholder="Describe your requirement..." className="min-h-[200px] rounded-[2rem] glass border-white/10 bg-transparent p-8 resize-none" required />
                </div>
                <Button disabled={isSending} className="w-full h-18 btn-premium text-sm font-bold tracking-[0.3em] uppercase">
                  {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      Execute Transmission <Send className="ml-3 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-8"
          >
            <Card className="premium-card bg-accent/5 border-accent/10 p-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-accent" /> Strategic Support
              </h3>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-accent">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Email Support</p>
                    <p className="text-lg font-bold">support@nexvoro.ai</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-purple-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Technical Ops</p>
                    <p className="text-lg font-bold">tech@nexvoro.ai</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-blue-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Global Response</p>
                    <p className="text-lg font-bold">+1 (888) NEXVORO</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
              <h3 className="text-xl font-bold mb-6">Response Metrics</h3>
              <div className="flex items-center gap-4 p-4 glass rounded-2xl border-white/5">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-xs font-bold">AVG RESPONSE TIME</p>
                  <p className="text-lg font-bold text-accent">&lt; 2 Operational Hours</p>
                </div>
              </div>
            </Card>

            <div className="flex justify-center gap-6">
              {[Twitter, Linkedin, Github, Globe].map((Icon, i) => (
                <button key={i} className="w-14 h-14 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                  <Icon className="w-6 h-6" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter text-premium">Frequently Asked Protocols</h2>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-[2.5rem] border-white/5"
              >
                <div className="flex gap-6">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-accent shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold">{faq.q}</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
