"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, CheckCircle2, XCircle, Star, ShieldAlert,
  Clock, Check, X, User
} from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "kunaldhangar1316@gmail.com";

type StatusTab = "pending" | "approved" | "rejected";

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState<StatusTab>("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const feedbackQuery = useMemo(() => {
    if (!db || !isAdmin) return null;
    return query(collection(db, "userFeedback"), where("status", "==", activeTab));
  }, [db, isAdmin, activeTab]);

  const { data: feedbackList, loading: feedbackLoading } = useCollection(feedbackQuery);

  const sortedFeedback = useMemo(() => {
    if (!feedbackList) return [];
    return [...feedbackList].sort((a: any, b: any) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  }, [feedbackList]);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    if (!db || processingId) return;
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "userFeedback", id), { status: newStatus });
    } catch (err) {
      console.error("[Admin Feedback] Failed to update status:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/login?redirectTo=/admin/feedback");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center gap-6 p-12 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Not Authorized</h2>
        <p className="text-white/40 max-w-sm">
          This page is restricted to administrators only.
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">
              Admin Only
            </Badge>
            <h1 className="text-4xl font-bold tracking-tighter text-white">
              Feedback <span className="text-gradient-purple">Approval.</span>
            </h1>
            <p className="text-white/40 font-light">
              Review and approve community feedback before it appears in Success Stories.
            </p>
          </div>

          <div className="flex gap-3">
            {([
              { key: "pending", label: "Pending", icon: Clock },
              { key: "approved", label: "Approved", icon: CheckCircle2 },
              { key: "rejected", label: "Rejected", icon: XCircle },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "h-11 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                  activeTab === tab.key
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "glass border-white/10 text-white/40 hover:text-white/70"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {feedbackLoading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : sortedFeedback.length === 0 ? (
            <div className="py-24 text-center text-white/20">
              <User className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">
                No {activeTab} feedback
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFeedback.map((f: any) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass border-white/10 bg-white/[0.02] p-6 rounded-2xl">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold text-white uppercase tracking-wide">{f.name}</p>
                          <span className="text-[10px] text-accent font-bold uppercase tracking-widest">
                            {f.role} {f.company ? `@ ${f.company}` : ""}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: f.rating || 0 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <p className="text-sm text-white/70 font-light leading-relaxed">{f.feedback}</p>
                        {f.photoURL && (
                          <img
                            src={f.photoURL}
                            alt={f.name}
                            className="w-14 h-14 rounded-full object-cover border border-white/10 mt-2"
                          />
                        )}
                      </div>

                      {activeTab === "pending" && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            disabled={processingId === f.id}
                            onClick={() => handleUpdateStatus(f.id, "approved")}
                            className="h-9 px-4 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 text-[9px] font-bold uppercase tracking-widest"
                          >
                            {processingId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5 mr-1" /> Approve</>}
                          </Button>
                          <Button
                            size="sm"
                            disabled={processingId === f.id}
                            onClick={() => handleUpdateStatus(f.id, "rejected")}
                            className="h-9 px-4 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-[9px] font-bold uppercase tracking-widest"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {activeTab === "approved" && (
                        <Button
                          size="sm"
                          disabled={processingId === f.id}
                          onClick={() => handleUpdateStatus(f.id, "rejected")}
                          className="h-9 px-4 bg-white/5 text-white/40 hover:bg-white/10 border border-white/10 text-[9px] font-bold uppercase tracking-widest flex-shrink-0"
                        >
                          Revoke
                        </Button>
                      )}
                      {activeTab === "rejected" && (
                        <Button
                          size="sm"
                          disabled={processingId === f.id}
                          onClick={() => handleUpdateStatus(f.id, "approved")}
                          className="h-9 px-4 bg-white/5 text-white/40 hover:bg-white/10 border border-white/10 text-[9px] font-bold uppercase tracking-widest flex-shrink-0"
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}