import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "Lodestar — Formal proofs of correctness for agent outputs.";
const DESCRIPTION = "Mathematical verification that ships only what is provably correct.";
const SITE_URL = "https://lodestar-akventurecorp.vercel.app";

export const metadata: Metadata = {
  title: { default: TITLE, template: "%s · Lodestar" },
  description: DESCRIPTION,
  applicationName: "Lodestar",
  generator: "Next.js",
  keywords: [
    "Lodestar",
    "lodestar.ca",
    "Toronto",
    "AI agents",
    "agent infrastructure",
    "Aletheia",
    "autonomous agents",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Lodestar",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
  other: {
    "aletheia:stack": "Part of the Aletheia stack",
    "aletheia:city": "Toronto",
    "aletheia:country": "Canada",
  },
};

export const viewport: Viewport = {
  themeColor: "#a070e0",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lodestar",
  description: DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  publisher: {
    "@type": "Organization",
    name: "Aletheia",
    url: "https://abduljaleel.xyz/aletheia",
  },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
