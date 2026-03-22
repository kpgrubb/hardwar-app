import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Barlow_Semi_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HARDWAR Companion",
  description: "AI-powered companion for the Hardwar 6mm sci-fi tactical miniatures wargame",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${barlowSemiCondensed.variable} ${barlow.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
