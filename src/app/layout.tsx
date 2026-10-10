import type { Metadata } from "next";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { ActivityTracker } from '@/components/activity-tracker';

export const metadata: Metadata = {
  metadataBase: new URL("https://celvivoai.com"),

  title: {
    default: "CELVIVO AI - Free Aptitude, Coding Round & Mock Interview Practice",
    template: "%s | CELVIVO AI",
  },

  description:
    "100% free platform to practice aptitude tests, coding rounds and 2 AI mock interviews. Get free resume analysis and personalized feedback to crack tech interviews.",

  icons: {
    icon: "/LOGO.png",
  },

  alternates: {
    canonical: "/",
  },
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
                <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Celvivo AI",
      url: "https://celvivoai.com",
      logo: "https://celvivoai.com/LOGO.png",
      founder: {
        "@type": "Person",
        name: "Vishal Ramchandra Dhangar",
      },
    }),
  }}
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
          <ActivityTracker />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}