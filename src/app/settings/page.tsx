'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
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
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="w-12 h-12 text-accent animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="particles-bg" />
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-32">
        <div className="max-w-6xl mx-auto">
          <header className="mb-16">
            <h1 className="text-5xl font-bold tracking-tighter text-premium">Control Panel</h1>
            <p className="text-muted-foreground font-light uppercase tracking-[0.3em] text-[10px] mt-4 font-bold">Manage system protocols and identity</p>
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
                      <CardTitle className="text-2xl font-bold">Personal Identity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-10">
                      <div className="flex items-center gap-8">
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-5xl font-bold shadow-2xl">
                            {user.displayName?.substring(0, 2).toUpperCase() || 'OP'}
                          </div>
                          <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold">{user.displayName || 'Operator'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <Button variant="outline" size="sm" className="h-10 rounded-xl glass border-white/10 text-xs font-bold uppercase tracking-widest">Update Avatar</Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preferred Name</Label>
                          <Input defaultValue={user.displayName || ""} className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white px-6" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Professional Email</Label>
                          <Input defaultValue={user.email || ""} disabled className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white/50 px-6 cursor-not-allowed" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                        <Button variant="ghost" className="h-14 px-8 rounded-2xl text-xs font-bold uppercase tracking-widest">Cancel</Button>
                        <Button className="h-14 px-12 rounded-2xl btn-premium text-xs font-bold uppercase tracking-widest">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <Card className="premium-card bg-white/[0.01] border-white/5">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-6 glass rounded-2xl border-white/5 space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Type</p>
                        <p className="text-lg font-bold text-accent">Elite Protocol</p>
                      </div>
                      <Button variant="destructive" className="w-full h-14 rounded-2xl text-xs font-bold uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">
                        <Trash2 className="w-4 h-4 mr-3" /> Deactivate Identity
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <Card className="premium-card bg-white/[0.01] border-white/5 max-w-4xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <Lock className="w-7 h-7 text-accent" /> Authentication Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-12">
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Token</Label>
                        <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white px-6" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Token</Label>
                        <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl glass border-white/10 bg-transparent text-white px-6" />
                      </div>
                    </div>
                    <Button className="h-14 px-8 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Update Security Token</Button>
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
