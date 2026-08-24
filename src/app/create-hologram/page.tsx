
'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import NavigationControls from '@/components/NavigationControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Info,
  Loader2,
  RefreshCcw,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CreateHologramPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Camera Access Denied", description: "Please enable camera permissions to capture your identity." });
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      setImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Maximum size is 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    setIsValidating(true);
    // Simulation logic for Step 1 completion
    await new Promise(r => setTimeout(r, 1500));
    setIsValidating(false);
    
    toast({ title: "Identity Logged", description: "Proceeding to 3D Synthesis." });
    // router.push('/create-hologram/generate'); // Next Step Placeholder
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden selection:bg-accent/30">
      <div className="particles-bg" />
      <Navbar />
      <NavigationControls />

      <main className="flex-1 container mx-auto px-6 pt-32 pb-16 flex flex-col items-center">
        <div className="max-w-5xl w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Info */}
          <div className="lg:col-span-5 space-y-8">
            <header className="space-y-4">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-1 text-[10px] tracking-widest font-black uppercase">Phase 01: Identity Capture</Badge>
              <h1 className="text-6xl font-bold tracking-tighter text-premium">Create Your <span className="text-gradient-purple">Hologram.</span></h1>
              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                Our neural engine will transform your 2D portrait into a high-fidelity 3D particle avatar for elite interview simulations.
              </p>
            </header>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-3">
                <Info className="w-4 h-4 text-accent" /> Protocols for Best Results
              </h3>
              <div className="grid gap-3">
                {[
                  "Face the camera directly with a neutral expression",
                  "Ensure even lighting across your entire face",
                  "Use a plain, non-distracting background",
                  "Remove sunglasses, hats, or face obstructions"
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 glass rounded-2xl border-white/5 bg-white/[0.01]">
                    <div className="w-5 h-5 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] font-black text-accent shrink-0">0{i+1}</div>
                    <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interaction Area */}
          <div className="lg:col-span-7">
            <Card className="premium-card bg-[#0b0e1a]/80 border-white/10 p-10 min-h-[500px] flex flex-col gap-8 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {image ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 flex flex-col gap-8"
                  >
                    <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border-2 border-accent/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] group">
                      <img src={image} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <button 
                        onClick={() => setImage(null)}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full glass border-white/20 flex items-center justify-center text-white/40 hover:text-white transition-all z-20"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <Badge className="bg-green-500/20 text-green-400 border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck className="w-3 h-3" /> Identity Captured
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => setImage(null)}
                        variant="ghost"
                        className="h-16 px-8 glass border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" /> Retake
                      </Button>
                      <Button 
                        onClick={handleContinue}
                        disabled={isValidating}
                        className="flex-1 h-16 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl group"
                      >
                        {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue to Synthesis <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" /></>}
                      </Button>
                    </div>
                  </motion.div>
                ) : isCameraActive ? (
                  <motion.div 
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col gap-6"
                  >
                    <div className="relative flex-1 rounded-[2.5rem] overflow-hidden bg-black border border-white/5">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 pointer-events-none border-2 border-accent/20 m-12 rounded-full flex items-center justify-center">
                        <div className="w-full h-px bg-accent/20 absolute animate-scan-line" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        onClick={stopCamera}
                        variant="ghost"
                        className="h-16 px-8 glass border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={capturePhoto}
                        className="flex-1 h-16 btn-premium rounded-2xl text-xs font-black uppercase tracking-[0.3em]"
                      >
                        <Zap className="w-5 h-5 mr-2 fill-current" /> Capture Identity
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                  >
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center relative group">
                      <User className="w-12 h-12 text-white/20 group-hover:text-accent transition-colors" />
                      <div className="absolute inset-0 bg-accent/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      <Button 
                        onClick={startCamera}
                        className="h-24 glass border-white/10 hover:border-accent/40 bg-white/[0.01] rounded-3xl flex flex-col gap-2 group"
                      >
                        <Camera className="w-6 h-6 text-accent transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Webcam Capture</span>
                      </Button>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 glass border-white/10 hover:border-purple-500/40 bg-white/[0.01] rounded-3xl flex flex-col gap-2 group"
                      >
                        <Upload className="w-6 h-6 text-purple-400 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Portrait</span>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </Button>
                    </div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Awaiting visual identity token...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan-line {
          position: absolute;
          width: 100%;
          animation: scan-line 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
