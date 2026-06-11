
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
  EyeOff
} from 'lucide-react';
import { QUESTIONS, CATEGORIES, type Question, type Difficulty } from '@/lib/question-data';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function QuestionBankPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Fetch Favorites
  const favoritesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return collection(db, 'users', user.uid, 'favorite_questions');
  }, [db, user?.uid]);
  const { data: favorites } = useCollection(favoritesQuery);

  const favoriteIds = useMemo(() => new Set(favorites?.map(f => f.questionId)), [favorites]);

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedIds);
    if (newRevealed.has(id)) newRevealed.delete(id);
    else newRevealed.add(id);
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
        toast({ title: "Removed", description: "Question removed from favorites." });
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
      toast({ title: "Saved", description: "Question added to your neural favorites." });
    }
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
              Master core engineering nodes through our curated technical repository. revealing deep intelligence for elite placement.
            </p>
          </header>

          {/* Filters Bar */}
          <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                <Input 
                  placeholder="Search technical concepts..."
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
              <div className="flex items-center gap-2 text-accent">
                <Bookmark className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{favoriteIds.size} Saved</span>
              </div>
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
                        <Badge className={`${difficultyColor(q.difficulty)} border-none font-bold text-[8px] uppercase tracking-widest`}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => toggleFavorite(q)}
                        className={`h-10 w-10 rounded-xl transition-all ${favoriteIds.has(q.id) ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/20'}`}
                      >
                        <Star className={`w-5 h-5 ${favoriteIds.has(q.id) ? 'fill-accent' : ''}`} />
                      </Button>
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
                            <div className="pt-6 border-t border-white/5 mt-4">
                              <div className="glass bg-accent/[0.03] border-accent/10 p-8 rounded-2xl relative">
                                <div className="absolute top-0 right-0 p-4">
                                  <CheckCircle2 className="w-4 h-4 text-accent/30" />
                                </div>
                                <p className="text-lg font-light leading-relaxed text-white/70 italic">
                                  "{q.answer}"
                                </p>
                              </div>
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
