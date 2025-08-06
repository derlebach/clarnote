import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import MobileTouchOptimizer from "@/components/MobileTouchOptimizer";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Clarnote - AI-Powered Meeting Assistant",
  description: "Transform your meetings with AI-powered transcription, summaries, and action items",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clarnote"
  },
  icons: {
    apple: "/icon-192x192.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          <MobileTouchOptimizer>
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </MobileTouchOptimizer>
        </Providers>
      </body>
    </html>
  );
}
