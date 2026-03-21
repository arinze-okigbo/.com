import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
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
    type: "website",
    url: "https://www.arinzeokigbo.com",
    title: "Arinze Okigbo | Founder, Engineer, Builder",
    description:
      "Co-Founder & CEO of Splita. AI DevOps @ Snorkel AI. Engineering @ Queralt Inc. CS @ Trinity College.",
    siteName: "ArinzeOkigbo.com",
    images: [
      {
        url: "https://arinzeokigbo.com/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Arinze Okigbo",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Arinze Okigbo | Founder, Engineer, Builder",
    description:
      "Building AI-forward products with depth in infrastructure, security, and fintech.",
    images: ["https://arinzeokigbo.com/profile.jpg"],
  },

  alternates: {
    canonical: "https://arinzeokigbo.com",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${instrumentSerif.variable} antialiased`}>
        <SmoothScrollProvider>
          <div className="min-h-screen">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}