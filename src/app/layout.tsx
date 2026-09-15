import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/hive/Header";
import { Footer } from "@/components/hive/Footer";
import { PageTransition, ProfiledIsland } from "@/components/hive/Interactions";
import { MotionProvider } from "@/components/hive/Motion";
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  preload: true,
});
const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});
export const metadata: Metadata = {
  metadataBase: new URL("https://arinzeokigbo.com"),
  other: { "hive:commit": process.env.VERCEL_GIT_COMMIT_SHA || "local" },
  title: { default: "Arinze Okigbo — Founder. Engineer. Builder.", template: "%s — Arinze Okigbo" },
  description:
    "Founder and engineer working across browser-native authentication, group payments, and AI agent systems. Explore the work, and the systems behind it.",
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", siteName: "Arinze Okigbo", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};
export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0b" },
    { media: "(prefers-color-scheme: light)", color: "#f3f4ef" },
  ],
};
export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" className={`${geist.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('hive-theme')||'dark'}catch{}",
          }}
        />
      </head>
      <body>
        <MotionProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <ProfiledIsland name="Navigation">
            <Header />
          </ProfiledIsland>
          <main id="main" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
