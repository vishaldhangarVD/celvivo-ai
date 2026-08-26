import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Nexvoro AI - Ace Your Technical Interviews",
  description:
    "AI-powered mock interviews, resume analysis, and personalized feedback for tech job seekers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Browser-native import map for TalkingHead - Three.js mapping removed to fix duplication */}
        <script
          type="importmap"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                "talkinghead": "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.7/modules/talkinghead.mjs"
              }
            })
          }}
        />
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              import { TalkingHead } from 'talkinghead';
              window.TalkingHeadClass = TalkingHead;
              window.dispatchEvent(new CustomEvent('talkinghead-ready'));
            `
          }}
        />
      </head>

      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/30">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
