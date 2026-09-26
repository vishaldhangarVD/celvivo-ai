'use client';

import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  Mail,
  HelpCircle,
  Globe,
  Instagram,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const FAQS = [
  {
    q: "How accurate is the AI interview simulation?",
    a: "Our engine operates at 98.4% precision relative to senior-level hiring standards used at top tech companies."
  },
  {
    q: "Is my resume data secure?",
    a: "Yes. Every resume you upload is encrypted and kept private."
  },
  {
    q: "Can I use CELVIVO AI for non-tech roles?",
    a: "Currently, our platform is specialized for 60+ IT and engineering roles."
  }
];

// 👉 Ithe tuझा Web3Forms Access Key aahe (tुझ्या signup email var messages yetil)
const WEB3FORMS_ACCESS_KEY = "2bb08add-ddfb-4e69-ad8e-87f0191f7298";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thanks for reaching out — we'll get back to you soon.",
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(result.message || "Something went wrong");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Message Not Sent",
        description: "Something went wrong. Please try again or email us directly.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <div className="particles-bg" />

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <main className="flex-1 container mx-auto px-6 pt-40 pb-32 flex flex-col items-center">
        {/* ===== ABOUT / FOUNDER SECTION ===== */}
        <header className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="bg-accent/20 text-accent border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
              Built By A Student, For Students
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-premium">
              About <span className="text-gradient-purple">CELVIVO AI.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mt-6">
              Real interview practice, at a price every student can afford.
            </p>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full max-w-5xl"
        >
          <Card className="premium-card bg-white/[0.02] border-white/5 p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-16 md:gap-24 shadow-2xl backdrop-blur-3xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <BrainCircuit className="w-64 h-64 text-white" />
            </div>

            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative shrink-0 perspective-1000 group"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-15px] rounded-full border-2 border-dashed border-accent/20 opacity-40 group-hover:opacity-100 group-hover:border-accent/40 transition-all duration-500"
              />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, opacity: 0.6 }}
                className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-md pointer-events-none"
              />

              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src="/founder-photo.jpg"
                    alt="Vishal Dhangar - Founder & CEO"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 192px, 256px"
                    data-ai-hint="professional portrait"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/40 via-transparent to-transparent" />
                </motion.div>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-accent border-4 border-[#0b0e1a] shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20"
              />
            </div>

            <div className="flex-1 space-y-8 text-center md:text-left relative z-10">
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Vishal Dhangar</h2>
                  <p className="text-accent font-black uppercase tracking-[0.3em] text-xs">Founder & CEO of CELVIVO AI</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                  Vishal is a final-year student who watched classmates lose job offers not because they lacked skill, but because they'd never actually sat through a real interview before the one that mattered. Aptitude rounds felt unfamiliar, coding rounds were a mystery, and most resumes never made it past the first screen.
                </p>
                <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                  So he built CELVIVO AI — a place where students can practice the real thing: realistic aptitude tests, coding rounds, and AI-powered mock interviews that talk back and push back, plus resume tools that turn a rough draft into something a recruiter actually stops on. All of it priced so a student, not just a placement cell, can afford it.
                </p>
                <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                  The goal isn't to remove the nerves before an interview — it's to make sure the first real one isn't the first one you've ever done.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Built by a Student</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-400/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Priced for Students</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-accent/30 to-transparent mx-auto mb-8" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Why This Exists</h3>
          <p className="text-muted-foreground font-light italic leading-relaxed">
            "Every student deserves to walk into their first real interview having already faced one before. CELVIVO AI exists so that practice, not privilege, decides who's ready."
          </p>
        </motion.div>

        {/* ===== CONTACT SECTION ===== */}
        <div id="contact" className="w-full max-w-4xl mx-auto mt-40 scroll-mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
              Support
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-premium mb-8">
              Contact <span className="text-gradient-purple">Us.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Have a question or need help? Send us a message and we'll get back to you soon.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <Card className="premium-card bg-white/[0.01] border-white/5 p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Full Name</Label>
                      <Input
                        placeholder="John Doe"
                        className="h-14 rounded-2xl glass border-white/10 bg-transparent px-6"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Email Address</Label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-14 rounded-2xl glass border-white/10 bg-transparent px-6"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Subject</Label>
                    <Input
                      placeholder="e.g. Technical Support Request"
                      className="h-14 rounded-2xl glass border-white/10 bg-transparent px-6"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Your Message</Label>
                    <Textarea
                      placeholder="Describe your question or issue..."
                      className="min-h-[200px] rounded-[2rem] glass border-white/10 bg-transparent p-8 resize-none"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <Button disabled={isSending} className="w-full h-18 btn-premium text-sm font-bold tracking-[0.3em] uppercase">
                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        Send Message <Send className="ml-3 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-8"
            >
              <Card className="premium-card bg-accent/5 border-accent/10 p-10">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-accent" /> Get in Touch
                </h3>
                <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-accent">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Email Support</p>
                      <p className="text-lg font-bold">support@celvivoai.com</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="premium-card bg-white/[0.01] border-white/5 p-10">
                <h3 className="text-xl font-bold mb-6">Response Time</h3>
                <div className="flex items-center gap-4 p-4 glass rounded-2xl border-white/5">
                  <Clock className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-xs font-bold">AVERAGE RESPONSE TIME</p>
                    <p className="text-lg font-bold text-accent">Under 24 Hours</p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center gap-6">
                <motion.a
                  href="https://www.instagram.com/celvivo.ai?stkn=NGMxODlnNmM5ejlj"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 transition-shadow hover:shadow-pink-500/50"
                >
                  <Instagram className="w-6 h-6" />
                </motion.a>
                <motion.a
                  href="https://celvivoai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, rotate: -8 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 transition-shadow hover:shadow-cyan-500/50"
                >
                  <Globe className="w-6 h-6" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter text-premium">Frequently Asked Questions</h2>
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
        </div>
      </main>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
