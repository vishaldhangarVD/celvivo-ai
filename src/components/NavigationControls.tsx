
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function NavigationControls({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const isInterviewPage = pathname?.startsWith('/interview');

  const handleTotalReset = async () => {
    if (user && db) {
      const docRef = doc(db, 'users', user.uid, 'journey', 'active');
      await deleteDoc(docRef);
    }
    
    // Clear all simulation state
    localStorage.removeItem("resumeAnalysis");
    sessionStorage.clear();
    
    toast({ title: "Neural Cleanup", description: "Simulation session state has been purged." });
    router.push('/dashboard');
  };

  return (
    <div className={cn("fixed top-28 left-4 md:left-8 z-[60] flex flex-col gap-4", className)}>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white/70 group-hover:text-accent" />
        </Button>
      </motion.div>

      {isInterviewPage ? (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
                title="Return Home & Reset"
              >
                <Home className="w-5 h-5 text-white/70 group-hover:text-accent" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass border-white/10 bg-[#0b0e1a] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Abandon Simulation?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Returning to the Home Hub will terminate your active session and purge all current draft data. Historical records will be preserved. Continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent text-white border-white/10">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTotalReset} className="bg-red-500 text-white">Confirm Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      ) : (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="w-12 h-12 rounded-2xl glass border-white/10 shadow-2xl hover:bg-white/10 hover:text-accent transition-all group"
            title="Dashboard"
          >
            <Home className="w-5 h-5 text-white/70 group-hover:text-accent" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
