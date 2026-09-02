'use client';

import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  BarChart3, 
  FileText, 
  Target, 
  Zap, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';

const features = [
  {
    icon: BrainCircuit,
    title: "Neural Interview Simulation",
    description: "Experience hyper-realistic technical interviews powered by our proprietary Neural Simulation Engine.",
    details: ["Tone Analysis", "Code Logic Auditing", "Real-time Adaptability"]
  },
  {
    icon: FileText,
    title: "Deep Resume Auditing",
    description: "Upload your career blueprints and receive an enterprise-grade ATS compatibility report in seconds.",
    details: ["Keyword Gap Analysis", "Structure Optimization", "Impact Quantification"]
  },
  {
    icon: Target,
    title: "Job Readiness Benchmark",
    description: "Compare your performance against anonymized data from senior engineers at top tech firms.",
    details: ["Industry Comparisons", "Leveling Suggestions", "Market Value Prediction"]
  },
  {
    icon: Zap,
    title: "Instant Performance Feedback",
    description: "Receive deep-dive feedback on your technical accuracy and communication strategic patterns.",
    details: ["Micro-Expression Analysis", "Technical Precision Scoring", "Soft Skill Audit"]
  },
  {
    icon: BarChart3,
    title: "Skill Gap Mapping",
    description: "Visualize your entire technical landscape and identify exactly which nodes need reinforcement.",
    details: ["Skill Trees", "Learning Velocity", "Pathway Optimization"]
  },
  {
    icon: ShieldCheck,
    title: "Verified Skill Badges",
    description: "Earn non-fungible skill credentials recognized by our network of elite hiring partners.",
    details: ["Verified Credentials", "Partner Transparency", "Proof of Knowledge"]
  }
];

export default function FeaturesPage() {
  const { loading: authLoading } = useUser();

  if (authLoading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      
      <main className="container mx-auto px-6 pt-40 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <Badge className="bg-accent/20 text-accent mb-6 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">
            Protocol Capabilities
          </Badge>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-premium mb-8">
            Engineered for <br /><span className="text-gradient-purple">Elite Talent.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Nexvoro AI deploy advanced neural models to bridge the gap between technical potential and executive reality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="premium-card bg-white/[0.01] border-white/5 p-10 group hover:bg-white/[0.03] transition-all"
            >
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent/10 transition-colors">
                <feature.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground font-light leading-relaxed mb-8">{feature.description}</p>
              <div className="space-y-3 pt-6 border-t border-white/5">
                {feature.details.map((detail, j) => (
                  <div key={j} className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase text-white/40">
                    <Zap className="w-3 h-3 text-accent/50" />
                    {detail}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
