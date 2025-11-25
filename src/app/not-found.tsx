"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";



import { Button } from "@/components/ui/button";


export default function NotFound() {
  return (
    <main className="bg-background relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-white">
      {/* Background Grid Pattern (Optional, adds depth like a dark graph paper) 
        Lower opacity to keep it subtle.
      */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* The "404" Text with Dot Matrix Effect 
           We make the text transparent, then apply a background image of dots, 
           then clip that background to the text shape.
        */}
        <motion.h1
          className="font-black tracking-tighter text-transparent select-none"
          style={{
            fontSize: "clamp(10rem, 30vw, 30rem)", // Responsive massive size
            lineHeight: 0.8,
            backgroundImage: "radial-gradient(#333 2px, transparent 2px)", // The 'dots'
            backgroundSize: "10px 10px", // Density of dots
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          404
        </motion.h1>

        {/* Content Container */}
        <motion.div
          className="mt-12 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="text-muted-foreground text-lg font-medium">
            Sorry, we can&apos;t find the page you&apos;re looking for.
          </p>

          <Link href="/" className="inline-block">
            <Button
              variant="ghost"
              className="group border-border/40 flex h-10 items-center gap-2 rounded-full border bg-white/5 px-6 text-sm font-medium text-white/90 transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Go to homepage
              <ArrowRight
                className="opacity-60 transition-transform duration-300 group-hover:translate-x-0.5"
                size={16}
              />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Vignette Overlay for that "focused" look */}
      <div className="bg-radial-gradient-to-t pointer-events-none absolute inset-0 from-black via-transparent to-transparent" />
    </main>
  );
}