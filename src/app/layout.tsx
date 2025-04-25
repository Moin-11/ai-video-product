import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSwitcherWrapper from "@/components/ThemeSwitcherWrapper";
import DebugPanel from "@/components/ui/DebugPanel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShowReel v1 - AI Product Video Generator",
  description:
    "Create professional marketing videos from product images using AI. Simply upload an image and get a video in minutes.",
  keywords: "AI video, product videos, marketing videos, Midjourney, GPT-4o-mini, Runway Gen-2",
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
        <ThemeProvider>
          {children}
          <ThemeSwitcherWrapper />
          <DebugPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
