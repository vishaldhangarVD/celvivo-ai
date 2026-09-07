
import type { Metadata } from "next";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "CELVIVO AI - Ace Your Technical Interviews",
  description:
    "AI-powered mock interviews, resume analysis, and personalized feedback for tech job seekers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#050816' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body 
        className="font-body antialiased bg-background text-foreground selection:bg-primary/30"
        style={{ backgroundColor: '#050816' }}
      >
        <FirebaseClientProvider>
          <AuthGuard>
            <Navbar />
            {children}
          </AuthGuard>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
