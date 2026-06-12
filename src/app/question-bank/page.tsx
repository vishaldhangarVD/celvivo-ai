
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  Layers,
  Zap,
  CheckCircle2,
  Bookmark,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  History,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Play
} from 'lucide-react';
import { QUESTIONS, CATEGORIES, COMPANIES, type Question, type Difficulty } from '@/lib/question-data';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function QuestionBankPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [viewedCount, setViewedCount] = useState(0);

  // Fetch Favorites
  const favoritesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'favorite_questions'));
  }, [db, user?.uid]);
  const { data: favorites } = useCollection(favoritesQuery);

  const favoriteIds = useMemo(() => new Set(favorites?.map(f => f.questionId)), [favorites]);

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesCompany = selectedCompany === 'All' || q.company === selectedCompany;
      const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesCompany && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedCompany, selectedDifficulty]);

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedIds);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
      if (!revealedIds.has(id)) setViewedCount(prev => prev + 1);
    }
    setRevealedIds(newRevealed);
  };

  const toggleFavorite = async (q: Question) => {
    if (!user || !db) {
      toast({ title: "Auth Required", description: "Please log in to save favorites." });
      return;
    }

    if (favoriteIds.has(q.id)) {
      const favDoc = favorites?.find(f => f.questionId === q.id);
      if (favDoc) {
        await deleteDoc(doc(db, 'users', user.uid, 'favorite_questions', favDoc.id));
        toast({ title: "Node Purged", description: "Intelligence removed from favorites." });
      }
    } else {
      const favData = {
        userId: user.uid,
        questionId: q.id,
        category: q.category,
        text: q.text,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'users', user.uid, 'favorite_questions'), favData);
      toast({ title: "Intelligence Archived", description: "Question added to your neural favorites." });
    }
  };

  const handlePractice = (q: Question) => {
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/interview/${sessionId}?role=${encodeURIComponent(q.category)}&exp=Senior&round=Technical%20Round&practiceQuestion=${encodeURIComponent(q.text)}`);
  };

  const difficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="text-center space-y-4">
            <Badge className="bg-accent/20 text-accent mb-4 border-none px-6 py-1.5 font-bold tracking-[0.4em] text-[10px] uppercase">Technical Intelligence Repository</Badge>
            <h1 className="text-6xl font-bold tracking-tighter text-premium">Question <span className="text-gradient-purple">Bank.</span></h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              Master core engineering nodes through our curated technical repository, revealing deep intelligence for elite placement.
            </p>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Nodes Viewed", val: viewedCount, icon: Eye, color: "text-blue-400" },
              { label: "Nodes Saved", val: favoriteIds.size, icon: Bookmark, color: "text-accent" },
              { label: "Available Knowledge", val: QUESTIONS.length, icon: History, color: "text-purple-400" }
            ].map((stat, i) => (
              <Card key={i} className="glass p-6 rounded-3xl border-white/5 flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold tabular-nums">{stat.val}</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Filters Bar */}
          <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                <Input 
                  placeholder="Search technical concepts or answers..."
                  className="h-14 pl-12 glass border-white/10 bg-transparent rounded-2xl"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <select 
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="h-14 px-6 glass border-white/10 bg-[#0b0e1a] rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-accent"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select 
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                  className="h-14 px-6 glass border-white/10 bg-[#0b0e1a] rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-accent"
                >
                  <option value="All">All Companies</option>
                  {COMPANIES.map(comp => <option key={comp} value={comp}>{comp}</option>)}
                </select>
                <select 
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value as any)}
                  className="h-14 px-6 glass border-white/10 bg-[#0b0e1a] rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-accent"
                >
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Questions Grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Found {filteredQuestions.length} Knowledge Nodes</p>
            </div>

            <div className="grid gap-6">
              {filteredQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass rounded-[2rem] border-white/5 hover:border-white/10 transition-all group p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                      <div className="flex flex-wrap gap-3">
                        <Badge className="bg-accent/10 text-accent border-accent/20 font-bold text-[8px] uppercase tracking-widest">
                          {q.category}
                        </Badge>
                        {q.company && (
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold text-[8px] uppercase tracking-widest flex items-center gap-1.5">
                            <Building2 className="w-2.5 h-2.5" /> {q.company}
                          </Badge>
                        )}
                        <Badge className={`${difficultyColor(q.difficulty)} border-none font-bold text-[8px] uppercase tracking-widest`}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handlePractice(q)}
                          variant="ghost" 
                          className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent/20 hover:text-accent transition-all flex gap-2"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Practice
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => toggleFavorite(q)}
                          className={`h-10 w-10 rounded-xl transition-all ${favoriteIds.has(q.id) ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/20'}`}
                        >
                          <Star className={`w-5 h-5 ${favoriteIds.has(q.id) ? 'fill-accent' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold leading-tight mb-8 text-white/90">
                      {q.text}
                    </h3>

                    <div className="space-y-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleReveal(q.id)}
                        className="flex items-center gap-3 text-accent hover:text-accent/80 p-0 h-auto font-bold text-[10px] uppercase tracking-widest group/btn"
                      >
                        {revealedIds.has(q.id) ? (
                          <><EyeOff className="w-4 h-4" /> Conceal Intelligence</>
                        ) : (
                          <><Eye className="w-4 h-4 group-hover/btn:animate-pulse" /> Reveal Intelligence</>
                        )}
                      </Button>

                      <AnimatePresence>
                        {revealedIds.has(q.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 border-t border-white/5 mt-4 space-y-6">
                              <div className="glass bg-accent/[0.03] border-accent/10 p-8 rounded-2xl relative">
                                <div className="absolute top-0 right-0 p-4">
                                  <CheckCircle2 className="w-4 h-4 text-accent/30" />
                                </div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4">Detailed Intelligence</h4>
                                <p className="text-lg font-light leading-relaxed text-white/80">
                                  {q.answer}
                                </p>
                              </div>

                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.01]">
                                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                                    <Lightbulb className="w-4 h-4 text-yellow-400" /> Interview Tips
                                  </h5>
                                  <ul className="space-y-3">
                                    {(q.tips || ["Focus on clear architectural reasoning.", "Explain the trade-offs involved."]).map((tip, idx) => (
                                      <li key={idx} className="flex gap-3 text-xs font-light text-white/60 leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.01]">
                                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                                    <AlertCircle className="w-4 h-4 text-red-400" /> Common Pitfalls
                                  </h5>
                                  <ul className="space-y-3">
                                    {(q.mistakes || ["Giving a superficial answer without depth.", "Ignoring the performance implications."]).map((m, idx) => (
                                      <li key={idx} className="flex gap-3 text-xs font-light text-white/60 leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                        {m}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {q.usage && (
                                <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.01]">
                                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                                    <TrendingUp className="w-4 h-4 text-blue-400" /> Real-World Usage
                                  </h5>
                                  <p className="text-sm font-light text-white/60 leading-relaxed">
                                    {q.usage}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="py-32 text-center glass rounded-[3rem] border-white/5 border-dashed">
                  <BookOpen className="w-16 h-16 text-white/5 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">No Nodes Found</h3>
                  <p className="text-muted-foreground font-light max-w-sm mx-auto">
                    Recalibrate your search parameters to find the technical intelligence you seek.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
