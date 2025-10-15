"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-background text-foreground relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="from-background via-muted/10 to-background absolute inset-0 bg-gradient-to-br" />

      <motion.div
        className="border-border animate-float absolute top-20 left-20 h-48 w-48 rotate-12 rounded-2xl border opacity-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2 }}
      />

      <motion.div
        className="border-border bg-card/80 relative z-10 flex w-full max-w-md flex-col items-center rounded-xl border p-10 shadow-xl backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="border-primary/20 absolute inset-0 rounded-xl border"
          animate={{ rotate: [0, 1, -1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.h1
          className="from-primary to-accent bg-gradient-to-r bg-clip-text text-[6rem] font-extrabold tracking-tight text-transparent select-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          404
        </motion.h1>

        <motion.p
          className="text-muted-foreground mt-3 max-w-sm text-center text-lg leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          We all get lost sometimes - what matters is getting back in line.
        </motion.p>

        <motion.div
          className="via-primary/40 my-6 h-px w-2/3 bg-gradient-to-r from-transparent to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        />

        <motion.div
          className="mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link href="/">
            <Button className="border-border bg-primary/10 text-primary hover:bg-primary/20 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-6 py-2 font-medium transition-colors duration-300">
              <ArrowLeft size={17} />
              Go Back Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="border-border animate-spin-slow absolute right-24 bottom-20 h-16 w-16 rounded-xl border opacity-10"
        initial={{ rotate: 45 }}
      />
    </main>
  );
}
