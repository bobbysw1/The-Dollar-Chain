import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ScrollToTop } from "@/components/ScrollToTop";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dollarchain.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "The Dollar Chain — $1. Your number. Real change.",
  description:
    "An open Australian community fund. Everyone pays $1. Together we fund real local good — chosen by the people who chip in.",
  openGraph: {
    title: "The Dollar Chain",
    description: "$1 a week. Your number. Real change.",
    url: SITE_URL,
    siteName: "The Dollar Chain",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "The Dollar Chain",
    description: "$1 a week. Your number. Real change.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${jakarta.variable}`}>
      <body className="font-sans text-ink bg-cream antialiased"><ScrollToTop />{children}</body>
    </html>
  );
}
