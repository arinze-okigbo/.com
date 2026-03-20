import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Instrument_Serif, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import MagneticDock from "@/components/ui/magnetic-dock";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arinzeokigbo.com"),
  title: {
    default: "Arinze Okigbo | Founder, Engineer, Builder",
    template: "%s | Arinze Okigbo",
  },
  description:
    "Founder and engineer building at the intersection of AI, security, infrastructure, and fintech.",
  openGraph: {
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${instrumentSerif.variable} bg-background text-foreground antialiased`}
      >
        <SmoothScrollProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            
            <SiteHeader />

            <main className="pb-32">{children}</main>

            <SiteFooter />

            {/* Dock */}
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
              <MagneticDock />
            </div>

          </div>
        </SmoothScrollProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}