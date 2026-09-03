'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth, useDoc } from '@/firebase';
import { motion } from 'framer-motion';
import NavigationControls from '@/components/NavigationControls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Camera,
  Trash2,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const profileRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  const [newName, setNewName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (profile?.displayName) {
      setNewName(profile.displayName);
    } else if (user?.displayName) {
      setNewName(user.displayName);
    }
  }, [profile, user]);

  const formattedName = useMemo(() => {
    if (!user) return 'Operator';
    const name = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!auth?.currentUser || !db || !user) return;
    
    // VALIDATION: Require full name
    const nameParts = newName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      toast({
        variant: "destructive",
        title: "Full Name Required",
        description: "Please enter your professional first and last name.",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      // 1. Update Auth Node
      await updateProfile(auth.currentUser, { displayName: newName });
      
      // 2. Update Firestore Archive
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: newName,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Identity Synchronized",
        description: "Your professional name has been updated across the network.",
      });
    } catch (e: any) {
      console.error("[Profile Sync Error]", e);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: e.message || "Could not reconcile identity nodes.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth?.currentUser || !user?.email) return;

    if (!currentPassword || !newPassword) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both your current and new password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "New password must be at least 6 characters.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      console.error("[Password Change Error]", e);
      let description = "Could not update password. Please try again.";
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        description = "Your current password is incorrect.";
      } else if (e.code === "auth/too-many-requests") {
        description = "Too many attempts. Please try again later.";
      }
      toast({
        variant: "destructive",
        title: "Update Failed",
        description,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth?.currentUser || !user?.email || !db) return;

    if (!deletePassword) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter your password to confirm account deletion.",
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Delete the Firestore profile document first, then the Auth account.
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(auth.currentUser);

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently removed.",
      });
      router.push('/');
    } catch (e: any) {
      console.error("[Account Deletion Error]", e);
      let description = "Could not delete account. Please try again.";
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        description = "Your password is incorrect.";
      }
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description,
      });
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmOpen(false);
      setDeletePassword("");
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <NavigationControls />
      
      <main className="container mx-auto px-6 pt-32 pb-32">
        <div className="max-w-6xl mx-auto">
          <header className="mb-16">
            <h1 className="text-5xl font-bold tracking-tighter text-premium">Settings</h1>
            <p className="text-muted-foreground font-light uppercase tracking-[0.3em] text-[10px] mt-4 font-bold">Manage your profile and account settings</p>
          </header>

          <Tabs defaultValue="profile" className="space-y-12">
            <TabsList className="glass border-white/5 p-2 rounded-2xl h-auto gap-2 bg-white/[0.01]">
              <TabsTrigger value="profile" className="data-[state=active]:bg-accent data-[state=active]:text-[#050816] h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex gap-3">
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-accent data-[state=active]:text-[#050816] h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex gap-3">
                <Shield className="w-4 h-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-accent data-[state=active]:text-[#050816] h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex gap-3">
                <CreditCard className="w-4 h-4" /> Billing
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-accent data-[state=active]:text-[#050816] h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex gap-3">
                <Bell className="w-4 h-4" /> Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                  <Card className="premium-card bg-white/[0.01] border-white/5">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-10">
                      <div className="flex items-center gap-8">
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-5xl font-bold shadow-2xl">
                            {formattedName.substring(0, 2).toUpperCase()}
                          </div>
                          <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold">{formattedName}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <Button variant="outline" size="sm" className="h-10 rounded-xl glass border-white/10 text-xs font-bold uppercase tracking-widest">Update Avatar</Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Full Name</Label>
                          <Input 
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. Ananya Birla"
                            className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white px-6 focus:border-accent" 
                          />
                          <p className="text-[8px] text-white/30 uppercase tracking-widest ml-2">This name will appear on your certificates.</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Email Address</Label>
                          <Input defaultValue={user.email || ""} disabled className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white/50 px-6 cursor-not-allowed" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile || newName === (profile?.displayName || user.displayName)}
                          className="h-14 px-12 rounded-2xl btn-premium text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl"
                        >
                          {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <Card className="premium-card bg-white/[0.01] border-white/5">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-6 glass rounded-2xl border-white/5 space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Plan</p>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-accent" />
                          <p className="text-lg font-bold text-accent uppercase tracking-tighter">{profile?.plan || "Free"} Plan</p>
                        </div>
                      </div>
                      {!deleteConfirmOpen ? (
                        <Button 
                          variant="destructive" 
                          onClick={() => setDeleteConfirmOpen(true)}
                          className="w-full h-14 rounded-2xl text-xs font-bold uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 mr-3" /> Delete Account
                        </Button>
                      ) : (
                        <div className="space-y-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
                          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">This cannot be undone</p>
                          <Input 
                            type="password"
                            placeholder="Enter your password to confirm"
                            value={deletePassword}
                            onChange={e => setDeletePassword(e.target.value)}
                            className="h-12 rounded-xl glass border-red-500/20 bg-transparent text-white px-4 text-sm"
                          />
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost"
                              onClick={() => { setDeleteConfirmOpen(false); setDeletePassword(""); }}
                              className="flex-1 h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              disabled={isDeletingAccount || !deletePassword}
                              className="flex-1 h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-red-500 hover:bg-red-600"
                            >
                              {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <Card className="premium-card bg-white/[0.01] border-white/5 max-w-4xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <Lock className="w-7 h-7 text-accent" /> Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-12">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Password</Label>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white px-6" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white px-6" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !currentPassword || !newPassword}
                      className="h-14 px-8 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
