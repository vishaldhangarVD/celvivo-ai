'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Code2, 
  Database, 
  Globe, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const CAREER_PATHS = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    description: "Master data analysis and visualization skills",
    icon: BarChart3,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    skills: ["Excel", "SQL", "Power BI", "Python", "+1 more"]
  },
  {
    id: "software-developer",
    title: "Software Developer",
    description: "Build modern web applications",
    icon: Code2,
    color: "text-green-400",
    bg: "bg-green-500/20",
    skills: ["HTML", "CSS", "JavaScript", "React", "+2 more"]
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Unlock insights from data using ML and AI",
    icon: Database,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    skills: ["Python", "Machine Learning", "Deep Learning", "Data Visualization", "+1 more"]
  },
  {
    id: "web-developer",
    title: "Web Developer",
    description: "Create beautiful and functional websites",
    icon: Globe,
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    skills: ["HTML5", "CSS3", "JavaScript", "React", "+2 more"]
  }
];

export default function RoadmapPage() {
  const { user } = useUser();
  const db = useFirestore();

  const roadmapsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'roadmaps'));
  }, [db, user?.uid]);

  const { data: userRoadmaps, loading } = useCollection(roadmapsQuery);

  const roadmapProgressMap = useMemo(() => {
    const map: Record<string, number> = {};
    userRoadmaps?.forEach((doc: any) => {
      map[doc.id] = doc.progress || 0;
    });
    return map;
  }, [userRoadmaps]);

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />

      <main className="container mx-auto px-6 pt-40 pb-32">
        <header className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl font-bold tracking-tighter text-premium mb-4">
              Learning <span className="text-gradient-purple">Roadmap</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Track your progress and master skills for your dream career.
            </p>
          </motion.div>
        </header>

        <div className="max-w-[1400px] mx-auto mb-8 px-2">
          <h2 className="text-xl font-bold tracking-tight text-white/90">Choose Your Career Path</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-[1400px] mx-auto px-2">
          {CAREER_PATHS.map((path, i) => (
            <Link href={`/roadmap/${path.id}`} key={i}>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl border border-white/10 px-7 py-5 cursor-pointer group hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all duration-300 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-2xl ${path.bg} flex items-center justify-center ${path.color} transition-transform group-hover:scale-105`}>
                      <path.icon className="w-8 h-8" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-accent group-hover:translate-x-1 transition-all mt-1" />
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="text-lg font-bold text-white leading-tight">{path.title}</h3>
                    <p className="text-[13px] text-muted-foreground font-light leading-snug">{path.description}</p>
                  </div>
                </div>

                <div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Progress</span>
                      <span className="text-[11px] font-bold text-accent">{roadmapProgressMap[path.id] || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${roadmapProgressMap[path.id] || 0}%` }}
                        className="h-full bg-accent rounded-full"
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {path.skills.map((skill, j) => (
                      <Badge 
                        key={j} 
                        variant="outline" 
                        className="bg-black/40 border-white/5 rounded-full px-2.5 py-0.5 text-[9px] font-medium text-white/60 whitespace-nowrap"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
