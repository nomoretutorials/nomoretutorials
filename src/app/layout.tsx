import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

import MinWidth from "@/components/min-width";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoMoreTutorials",
  description: "Stop Watching. Start Building.",
  openGraph: {
    title: "NoMoreTutorials",
    description:
      "An AI-powered platform that guides beginner and intermediate developers out of tutorial-hell by providing personalized, mentor-style step-by-step instructions to build real, production-grade projects from scratch.",
    images: [
      {
        url: "https://app.nomoretutorials.com/dashboard.png",
        width: "1200",
        height: "630",
        alt: "NoMoreTutorials Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NoMoreTutorials",
    description:
      "An AI-powered platform that guides beginner and intermediate developers out of tutorial-hell by providing personalized, mentor-style step-by-step instructions to build real, production-grade projects from scratch.",
    images: ["https://app.nomoretutorials.com/dashboard.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <MinWidth>{children}</MinWidth>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
