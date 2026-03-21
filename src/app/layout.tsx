import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

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
    url: "https://arinzeokigbo.com",
    title: "Arinze Okigbo | Founder, Engineer, Builder",
    description:
      "Co-Founder & CEO of Splita. AI DevOps @ Snorkel AI. Engineering @ Queralt Inc. CS @ Trinity College.",
    siteName: "ArinzeOkigbo.com",
    images: [
      {
        url: "https://arinzeokigbo.com/profile.jpg", // 🔥 MUST be absolute
        width: 1200,
        height: 630,
        alt: "Arinze Okigbo",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
