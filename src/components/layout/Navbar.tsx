'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Command, 
  LayoutDashboard, 
  Award, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Crown,
  CreditCard,
  Sparkles,
  Briefcase,
  Info,
  MessageSquare,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, Suspense, useCallback } from 'react';
import { useUser, useAuth, useDoc, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { doc, collection, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';

function NavbarContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  const userInitial = useMemo(() => {
    if (!user && !profile) return 'U';
    const rawName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
    return rawName.trim().split(/\s+/)[0].charAt(0).toUpperCase() || 'U';
  }, [user, profile]);

  const userFirstName = useMemo(() => {
    if (!user && !profile) return 'U';
    const rawName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
    const firstName = rawName.trim().split(/\s+/)[0];
    return firstName.toUpperCase() || 'U';
  }, [user, profile]);

  const notificationsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db, user?.uid]);

  const { data: notifications } = useCollection(notificationsQuery);

  const unreadCount = useMemo(() => 
    notifications?.filter((n: any) => !n.read).length || 0, 
  [notifications]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    if (!db || !user?.uid) return;
    try {
      const ref = doc(db, 'users', user.uid, 'notifications', id);
      await updateDoc(ref, { read: true });
    } catch (e) {
      console.error("[Notifications] Failed to update node:", e);
    }
  }, [db, user?.uid]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const isFounder = profile?.role === 'founder';

  const pillClasses = "relative flex items-center gap-2.5 px-4 py-1.5 rounded-full glass border-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all duration-250 group/pill";
  const pillActiveClasses = "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]";
  const pillHoverClasses = "hover:border-cyan-500/50 hover:bg-white/[0.05] hover:-translate-y-[3px] hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]";
  const pillIconWrapperClasses = "w-5 h-5 rounded-full flex items-center justify-center border border-cyan-500/20 bg-cyan-500/10 text-accent group-hover/pill:bg-cyan-500/20 group-hover/pill:text-white transition-all";
  const pillActiveIconWrapperClasses = "bg-cyan-500 border-cyan-400 text-white";
  const pillUnderlineClasses = "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-accent group-hover/pill:w-1/3 transition-all duration-300 shadow-[0_0_8px_#22d3ee]";

  return (
    <nav className="fixed top-0 z-[100] w-full h-[72px] border-b border-cyan-500/20 bg-[#080c19]/75 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-4 group">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-white/10"
            >
              <Command className="text-white w-5 h-5" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xl tracking-tighter uppercase text-premium leading-none">
                NEXVORO<span className="text-accent">AI</span>
              </span>
              <span className="text-[7px] font-black tracking-[0.3em] uppercase text-white/30 mt-1">AI Career Tools</span>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <Link 
                href="/special-hr-resume-upload" 
                className={cn(
                  pillClasses, 
                  "border-purple-500/30 bg-purple-500/5 hover:border-purple-400 hover:bg-purple-500/10 hover:-translate-y-[3px] hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]", 
                  pathname.startsWith('/special-hr') && "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                )}
              >
                <div className={cn(
                  pillIconWrapperClasses, 
                  "border-purple-500/20 bg-purple-500/10 text-purple-400 group-hover/pill:text-purple-300", 
                  pathname.startsWith('/special-hr') && "bg-purple-500 border-purple-400 text-white"
                )}>
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                </div>
                SPECIAL HR INTERVIEW
                <span className={cn(pillUnderlineClasses, "bg-purple-400 shadow-[0_0_8px_#a855f7]")} />
              </Link>

              <Link 
                href="/dashboard" 
                className={cn(pillClasses, pillHoverClasses, pathname === '/dashboard' && pillActiveClasses)}
              >
                <div className={cn(pillIconWrapperClasses, pathname === '/dashboard' && pillActiveIconWrapperClasses)}>
                  <LayoutDashboard className="w-2.5 h-2.5" />
                </div>
                DASHBOARD
                <span className={pillUnderlineClasses} />
              </Link>
              <Link 
                href="/certificates" 
                className={cn(pillClasses, pillHoverClasses, pathname === '/certificates' && pillActiveClasses)}
              >
                <div className={cn(pillIconWrapperClasses, pathname === '/certificates' && pillActiveIconWrapperClasses)}>
                  <Award className="w-2.5 h-2.5" />
                </div>
                CERTIFICATES
                <span className={pillUnderlineClasses} />
              </Link>
              <Link 
                href="/pricing" 
                className={cn(pillClasses, pillHoverClasses, pathname === '/pricing' && pillActiveClasses)}
              >
                <div className={cn(pillIconWrapperClasses, pathname === '/pricing' && pillActiveIconWrapperClasses)}>
                  <CreditCard className="w-2.5 h-2.5" />
                </div>
                PRICING
                <span className={pillUnderlineClasses} />
              </Link>

              {isFounder && (
                <Link 
                  href="/founder" 
                  className={cn(pillClasses, pillHoverClasses, "border-purple-500/20", pathname === '/founder' && "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]")}
                >
                  <div className={cn(pillIconWrapperClasses, "border-purple-500/20 bg-purple-500/10 text-purple-400", pathname === '/founder' && "bg-purple-500 border-purple-400 text-white")}>
                    <Crown className="w-2.5 h-2.5" />
                  </div>
                  FOUNDER CONSOLE
                  <span className={cn(pillUnderlineClasses, "bg-purple-400 shadow-[0_0_8px_#a855f7]")} />
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full glass border-white/5 bg-white/[0.02]">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
            </div>
            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-green-400/80">AI Online</span>
          </div>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-6">
                  <Link href="/user-dashboard" className="hidden lg:flex flex-col items-end group transition-all duration-300">
                    <span className="text-white font-black tracking-[0.4em] text-xs leading-none group-hover:text-accent transition-colors">
                      {userFirstName}
                    </span>
                    <span className="text-[#22D3EE] font-bold tracking-[0.3em] text-[7px] leading-tight uppercase mt-1 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all">
                      IDENTITY
                    </span>
                  </Link>

                  <div className="w-px h-6 bg-white/10 hidden lg:block"></div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="relative p-2 text-white/40 hover:text-accent transition-colors group">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#080c19]"></span>
                        )}
                        <div className="absolute inset-0 bg-accent/5 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 glass border-white/10 bg-[#0b0e1a] text-white p-0 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Sparkles className="w-3.5 h-3.5 text-accent" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Neural Notifications</span>
                         </div>
                         {unreadCount > 0 && (
                           <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black">{unreadCount} UNREAD</Badge>
                         )}
                      </div>
                      <ScrollArea className="h-80">
                         <div className="p-2 space-y-1">
                            {notifications && notifications.length > 0 ? (
                              notifications.map((n: any) => (
                                <div 
                                  key={n.id} 
                                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                                  className={cn(
                                    "p-4 rounded-xl transition-all cursor-pointer border border-transparent group/item",
                                    !n.read ? "bg-accent/5 border-accent/10" : "opacity-60 hover:bg-white/5"
                                  )}
                                >
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <p className="text-xs font-bold text-white group-hover/item:text-accent transition-colors">{n.title}</p>
                                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1" />}
                                  </div>
                                  <p className="text-[10px] text-white/60 line-clamp-2 leading-relaxed font-light">{n.message}</p>
                                  <div className="flex items-center gap-2 mt-3 opacity-30 group-hover/item:opacity-50 transition-opacity">
                                    <Clock className="w-2.5 h-2.5" />
                                    <p className="text-[8px] font-bold uppercase tracking-widest">
                                      {n.createdAt?.seconds ? format(new Date(n.createdAt.seconds * 1000), 'MMM d, HH:mm') : 'Recent'}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
                                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/10">
                                   <MessageSquare className="w-6 h-6" />
                                 </div>
                                 <div className="space-y-1">
                                   <p className="text-sm font-bold text-white/80">No new notifications</p>
                                   <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Your archive is empty.</p>
                                 </div>
                              </div>
                            )}
                         </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>

                  <div className="w-px h-6 bg-white/10"></div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="outline-none">
                        <Avatar className="w-9 h-9 border border-white/10 hover:border-accent/50 transition-all cursor-pointer shadow-lg hover:shadow-accent/10">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-[10px] font-black text-white">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass border-white/10 bg-[#0b0e1a] text-white mt-2 p-2 rounded-2xl">
                      <DropdownMenuLabel className="px-3 py-2">
                        <p className="text-xs font-black uppercase tracking-widest">Operator {userFirstName}</p>
                        <p className="text-[10px] text-white/40 font-light truncate">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-xl focus:bg-white/5 focus:text-accent cursor-pointer gap-3 text-[10px] uppercase font-bold tracking-widest py-3">
                        <LayoutDashboard className="w-4 h-4" /> System Dashboard
                      </DropdownMenuItem>
                      {isFounder && (
                        <DropdownMenuItem onClick={() => router.push('/founder')} className="rounded-xl focus:bg-purple-500/10 focus:text-purple-400 cursor-pointer gap-3 text-[10px] uppercase font-bold tracking-widest py-3 text-purple-400">
                          <Crown className="w-4 h-4" /> Founder Console
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-xl focus:bg-white/5 focus:text-accent cursor-pointer gap-3 text-[10px] uppercase font-bold tracking-widest py-3">
                        <Award className="w-4 h-4" /> Credentials
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem onClick={handleSignOut} className="rounded-xl focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer gap-3 text-[10px] uppercase font-bold tracking-widest py-3">
                        <LogOut className="w-4 h-4" /> Terminate Session
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="ghost" className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white">
                      LOGIN
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="h-10 px-6 btn-premium text-[9px] tracking-[0.2em] uppercase rounded-xl border border-white/10">
                      SIGN IN
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

          <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 top-[72px] w-full bg-[#050816]/95 backdrop-blur-2xl p-12 flex flex-col gap-8 md:hidden z-[100]"
          >
            {user && (
              <>
                <Link href="/special-hr-resume-upload" onClick={() => setIsOpen(false)} className="text-2xl font-bold tracking-tighter uppercase text-purple-400 hover:text-purple-300 flex items-center gap-4">
                  <Sparkles className="w-6 h-6" /> Special HR Interview
                </Link>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-2xl font-bold tracking-tighter uppercase text-white hover:text-accent flex items-center gap-4">
                  <LayoutDashboard className="w-6 h-6" /> Dashboard
                </Link>
                {isFounder && (
                  <Link href="/founder" onClick={() => setIsOpen(false)} className="text-2xl font-bold tracking-tighter uppercase text-purple-400 hover:text-purple-300 flex items-center gap-4">
                    <Crown className="w-6 h-6" /> Founder Console
                  </Link>
                )}
                <Link href="/certificates" onClick={() => setIsOpen(false)} className="text-2xl font-bold tracking-tighter uppercase text-white hover:text-accent flex items-center gap-4">
                  <Award className="w-6 h-6" /> Certificates
                </Link>
                <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-2xl font-bold tracking-tighter uppercase text-white hover:text-accent flex items-center gap-4">
                  <CreditCard className="w-6 h-6" /> Pricing
                </Link>
                <Link href="/user-dashboard" onClick={() => setIsOpen(false)} className="text-2xl font-bold tracking-tighter uppercase text-white hover:text-accent flex items-center gap-4">
                  <ShieldCheck className="w-6 h-6" /> Verified Identity: {userFirstName}
                </Link>
                <div className="h-px bg-white/5 my-4"></div>
              </>
            )}
            
            <div className="mt-auto flex flex-col gap-6">
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="w-full h-16 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs text-red-400"
                >
                  Terminate Session
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-16 rounded-2xl glass border-white/10 font-bold uppercase tracking-widest text-xs">LOGIN</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-16 btn-premium font-bold uppercase tracking-widest text-xs">SIGN IN</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}
