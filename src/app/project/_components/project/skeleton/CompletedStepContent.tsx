"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function CompletedStepContent({ message }: { message?: string }) {
  return (
    <motion.div
      className="border-muted bg-muted/30 flex flex-col items-center justify-center space-y-3 rounded-xl border py-12 shadow-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="relative flex h-14 w-14 items-center justify-center"
        initial={{ rotate: -45, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
      >
        <CheckCircle2 className="h-14 w-14 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500/20 blur-md"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.p
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {message || "Step completed successfully!"}
      </motion.p>
    </motion.div>
  );
}
