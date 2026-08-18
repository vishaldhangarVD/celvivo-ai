"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Camera,
  X
} from 'lucide-react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function FeedbackDialog() {
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    feedback: '',
    role: '',
    company: '',
    consent: false
  });

  const resetForm = () => {
    setFormData({ name: '', feedback: '', role: '', company: '', consent: false });
    setRating(5);
    setImageFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open && !user) {
      router.push('/login?redirectTo=/');
      return;
    }
    
    // If the dialog is being closed, we purge all temporary local state
    if (!open) {
      resetForm();
    }
    
    setIsOpen(open);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ variant: "destructive", title: "Invalid Format", description: "Please upload a JPG, PNG or WEBP image." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Image size must be less than 5MB." });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !formData.consent) return;

    setIsSubmitting(true);
    try {
      let finalPhotoURL = null;

      // Only perform the storage upload if the form is valid and being submitted
      if (imageFile && storage) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, `userFeedback/${user.uid}/${fileName}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        finalPhotoURL = await getDownloadURL(uploadResult.ref);
      }

      // Create the firestore document
      await addDoc(collection(db, 'userFeedback'), {
        userId: user.uid,
        name: formData.name,
        role: formData.role,
        company: formData.company,
        feedback: formData.feedback,
        rating,
        photoURL: finalPhotoURL,
        consent: formData.consent,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setIsSuccess(true);
      // Auto-close after success notification
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 3000);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Protocol Error",
        description: "Failed to transmit feedback node. Please try again."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-14 px-8 glass border-white/10 flex gap-3 text-[10px] tracking-widest uppercase hover:bg-accent/10 hover:text-accent transition-all">
          <MessageSquare className="w-4 h-4" />
          Share Your Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-white/10 bg-[#0b0e1a] text-white max-w-xl rounded-[2.5rem] overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold tracking-tighter">Feedback Received</h3>
                <p className="text-muted-foreground font-light px-12">
                  Thank you! Your feedback has been submitted for review. It will be shared with the community once verified.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                     <Sparkles className="w-4 h-4" />
                   </div>
                   <DialogTitle className="text-3xl font-bold tracking-tighter">Share Your Journey</DialogTitle>
                </div>
                <p className="text-sm text-muted-foreground font-light">Your insights help us calibrate the neural engine for future talent.</p>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Performance Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-transform active:scale-90"
                      >
                        <Star className={cn(
                          "w-8 h-8 transition-colors",
                          s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-4 glass rounded-2xl border-white/5 bg-white/[0.01]">
                    <div className="relative group">
                      <Avatar className="w-20 h-20 border-2 border-white/10 group-hover:border-accent transition-all cursor-pointer overflow-hidden">
                        <AvatarImage src={imagePreview || ""} className="object-cover" />
                        <AvatarFallback className="bg-white/5 text-white/20">
                          <Camera className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      {imagePreview && (
                        <button 
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Profile Picture (Optional)</Label>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          id="profile-upload" 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/webp" 
                          onChange={handleImageChange} 
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          onClick={() => document.getElementById('profile-upload')?.click()}
                          className="h-9 px-4 rounded-xl glass border-white/10 text-[9px] font-bold uppercase tracking-widest hover:bg-white/10"
                        >
                          Select Image
                        </Button>
                        <p className="text-[8px] text-white/20 uppercase">JPG, PNG, WEBP • Max 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</Label>
                    <Input 
                      placeholder="e.g. John Doe"
                      className="glass border-white/10 bg-transparent h-12 rounded-xl"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Professional Role</Label>
                      <Input 
                        placeholder="e.g. Senior Software Engineer"
                        className="glass border-white/10 bg-transparent h-12 rounded-xl"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Company / Org (Optional)</Label>
                      <Input 
                        placeholder="e.g. Google, Amazon"
                        className="glass border-white/10 bg-transparent h-12 rounded-xl"
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Your Feedback</Label>
                  <Textarea 
                    placeholder="Describe your experience with our neural simulations..."
                    className="glass border-white/10 bg-transparent min-h-[100px] rounded-2xl p-4 resize-none font-light leading-relaxed"
                    value={formData.feedback}
                    onChange={e => setFormData({...formData, feedback: e.target.value})}
                    required
                  />
                </div>

                <div className="flex items-start gap-3 p-4 glass rounded-2xl border-white/5 bg-white/[0.01]">
                  <Checkbox 
                    id="consent" 
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData({...formData, consent: checked as boolean})}
                    className="mt-1 border-white/20 data-[state=checked]:bg-accent data-[state=checked]:text-black"
                  />
                  <Label htmlFor="consent" className="text-[10px] leading-relaxed text-white/40 cursor-pointer">
                    I agree that NexvoroAI may display my name, role, and feedback in the Success Stories section to help other candidates.
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="flex-1 h-16 rounded-2xl glass border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.consent || !formData.feedback || !formData.name || !formData.role}
                    className="flex-[2] h-16 btn-premium text-[10px] font-bold tracking-[0.3em] uppercase shadow-2xl"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4" />
                        Submit Feedback
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}