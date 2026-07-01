'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Code2, 
  Database, 
  Globe, 
  ChevronRight,
  Search
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const CAREER_PATHS = [
  {
    title: "Data Analyst",
    description: "Master data analysis and visualization skills",
    icon: BarChart3,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    progress: 0,
    skills: ["Excel", "SQL", "Power BI", "Python", "+1 more"]
  },
  {
    title: "Software Developer",
    description: "Build modern web applications",
    icon: Code2,
    color: "text-green-400",
    bg: "bg-green-500/20",
    progress: 0,
    skills: ["HTML", "CSS", "JavaScript", "React", "+2 more"]
  },
  {
    title: "Data Scientist",
    description: "Unlock insights from data using ML and AI",
    icon: Database,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    progress: 0,
    skills: ["Python", "Machine Learning", "Deep Learning", "Data Visualization", "+1 more"]
  },
  {
    title: "Web Developer",
    description: "Create beautiful and functional websites",
    icon: Globe,
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    progress: 0,
    skills: ["HTML5", "CSS3", "JavaScript", "React", "+2 more"]
  }
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40 pb-32">
        {/* Top Section */}
        <header className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl font-bold tracking-tighter text-premium mb-6">
              Learning <span className="text-gradient-purple">Roadmap</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Track your progress and master skills for your dream career.
            </p>
          </motion.div>
        </header>

        {/* Section Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-white/90">Choose Your Career Path</h2>
        </div>

        {/* Career Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {CAREER_PATHS.map((path, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass rounded-[20px] border border-white/10 p-8 cursor-pointer group hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl ${path.bg} flex items-center justify-center ${path.color} transition-transform group-hover:scale-110`}>
                  <path.icon className="w-7 h-7" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-bold text-white">{path.title}</h3>
                <p className="text-sm text-muted-foreground font-light">{path.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Progress</span>
                  <span className="text-xs font-bold text-accent">{path.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${path.progress}%` }}
                    className="h-full bg-accent rounded-full"
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {path.skills.map((skill, j) => (
                  <Badge 
                    key={j} 
                    variant="outline" 
                    className="bg-black/40 border-white/10 rounded-full px-3 py-1 text-[10px] font-medium text-white/70 whitespace-nowrap"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
