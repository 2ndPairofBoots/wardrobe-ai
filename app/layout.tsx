import type { Metadata } from "next";
import localFont from "next/font/local";
import { GlobalHeader } from "@/components/site/GlobalHeader";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WardrobeAI | Plan Better Outfits",
  description: "Scan your wardrobe, generate weather-aware outfit ideas, and plan your week in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalHeader />
        {children}
      </body>
    </html>
  );
}
