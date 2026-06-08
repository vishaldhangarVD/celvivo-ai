import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, LayoutDashboard, LogIn } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tighter">
            Nexvoro<span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/#roles" className="hover:text-foreground transition-colors">Roles</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
          <Button className="bg-gradient-premium hover:opacity-90 transition-opacity">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}
