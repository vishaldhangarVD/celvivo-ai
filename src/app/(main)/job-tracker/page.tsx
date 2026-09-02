'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectItemText,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  ChevronRight,
  Briefcase,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutGrid,
  MoreVertical
} from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "Rejected",
  "Selected"
];

const STATUS_COLORS: Record<string, string> = {
  "Applied": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Shortlisted": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Interview Scheduled": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Rejected": "text-red-400 bg-red-400/10 border-red-400/20",
  "Selected": "text-green-400 bg-green-400/10 border-green-400/20",
};

export default function JobTrackerPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    location: "",
    appliedDate: format(new Date(), 'yyyy-MM-dd'),
    link: "",
    notes: "",
    status: "Applied"
  });

  const appsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'job_applications'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: applications, loading: appsLoading } = useCollection(appsQuery);

  const filteredApps = useMemo(() => {
    return applications?.filter(app => {
      const matchesSearch = app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const handleAddApplication = async () => {
    if (!user || !db || !formData.companyName || !formData.role) return;
    setIsSaving(true);

    const appData = {
      userId: user.uid,
      companyName: formData.companyName,
      role: formData.role,
      location: formData.location || "",
      appliedDate: formData.appliedDate,
      link: formData.link || "",
      notes: formData.notes || "",
      status: formData.status,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'job_applications'), appData);
      setIsAddOpen(false);
      setFormData({
        companyName: "",
        role: "",
        location: "",
        appliedDate: format(new Date(), 'yyyy-MM-dd'),
        link: "",
        notes: "",
        status: "Applied"
      });
      toast({ title: "Deployment Noted", description: `${formData.companyName} mission added to log.` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Protocol Error", description: "Failed to persist application." });
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!user || !db) return;
    try {
      const appRef = doc(db, 'users', user.uid, 'job_applications', id);
      await updateDoc(appRef, { status: newStatus });
      toast({ title: "Pipeline Updated", description: `Application status moved to ${newStatus}.` });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'job_applications', id));
      toast({ title: "Node Purged", description: "Application record removed from archives." });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] pb-32">
      <div className="particles-bg" />
      <NavigationControls />

      <main className="container mx-auto px-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-bold uppercase">Deployment Intelligence</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">Job Application <span className="text-gradient-purple">Tracker.</span></h1>
              <p className="text-muted-foreground font-light max-w-xl">Monitor your professional trajectory across global hiring nodes.</p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-16 px-8 btn-premium flex gap-3 text-[10px] tracking-widest uppercase">
                  <Plus className="w-5 h-5" /> Initialize Application
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/10 bg-[#0b0e1a] text-white max-w-2xl rounded-[2.5rem]">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tighter">New Mission Node</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 p-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Company Name</Label>
                    <Input 
                      placeholder="e.g. Google" 
                      className="glass border-white/10 bg-transparent h-12 rounded-xl"
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Target Role</Label>
                    <Input 
                      placeholder="e.g. Senior Frontend" 
                      className="glass border-white/10 bg-transparent h-12 rounded-xl"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Location</Label>
                    <Input 
                      placeholder="Remote / Bangalore" 
                      className="glass border-white/10 bg-transparent h-12 rounded-xl"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Applied Date</Label>
                    <Input 
                      type="date" 
                      className="glass border-white/10 bg-transparent h-12 rounded-xl"
                      value={formData.appliedDate}
                      onChange={e => setFormData({...formData, appliedDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Application Link</Label>
                    <Input 
                      placeholder="https://..." 
                      className="glass border-white/10 bg-transparent h-12 rounded-xl"
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Intelligence Notes</Label>
                    <Textarea 
                      placeholder="Referral name, salary range, etc." 
                      className="glass border-white/10 bg-transparent min-h-[100px] rounded-2xl p-4"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl text-[10px] font-bold uppercase tracking-widest">Abort</Button>
                  <Button onClick={handleAddApplication} disabled={isSaving} className="btn-premium h-12 px-10 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Persist Mission"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </header>

          <Card className="premium-card bg-white/[0.01] border-white/5 p-8">
            <div className="flex flex-col md:flex-row gap-6 mb-12">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                <Input 
                  placeholder="Search by company or role..."
                  className="h-14 pl-12 glass border-white/10 bg-transparent rounded-2xl"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-14 glass border-white/10 bg-transparent rounded-2xl px-6">
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    <SelectItem value="All"><SelectItemText>All Pipelines</SelectItemText></SelectItem>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}><SelectItemText>{opt}</SelectItemText></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {appsLoading ? (
              <div className="py-32 flex flex-col items-center gap-6">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Synchronizing Pipelines...</p>
              </div>
            ) : filteredApps && filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app: any) => (
                  <motion.div
                    layout
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-8 rounded-[2rem] border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <Select defaultValue={app.status} onValueChange={(val) => updateStatus(app.id, val)}>
                        <SelectTrigger className="w-fit h-8 border-none bg-transparent hover:bg-white/5 transition-all px-2">
                           <Badge className={`${STATUS_COLORS[app.status]} border-none font-bold text-[8px] uppercase tracking-widest`}>
                            <SelectValue />
                          </Badge>
                        </SelectTrigger>
                        <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}><SelectItemText>{opt}</SelectItemText></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 mb-8">
                      <h3 className="text-xl font-bold group-hover:text-accent transition-colors truncate">{app.companyName}</h3>
                      <p className="text-sm font-light text-white/60 truncate">{app.role}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" /> {app.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest justify-end">
                        <Calendar className="w-3 h-3" /> {app.appliedDate}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex gap-2">
                        {app.link && (
                          <a href={app.link} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => deleteApplication(app.id)}
                          className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(STATUS_OPTIONS.indexOf(app.status) + 1) * 20}%` }}
                          className="h-full bg-accent"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center glass rounded-[3rem] border-white/5 border-dashed">
                <LayoutGrid className="w-16 h-16 text-white/5 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">No Active Missions</h3>
                <p className="text-muted-foreground font-light max-w-sm mx-auto">
                  Your job tracking archives are empty. Initialize your first application node to monitor your deployment success.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}