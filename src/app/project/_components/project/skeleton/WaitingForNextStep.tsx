"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function WaitingForNextStep({ message }: { message?: string }) {
  return (
    <motion.div
      className="border-muted bg-muted/20 flex flex-col items-center justify-center space-y-4 rounded-xl border py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="relative flex h-12 w-12 items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      >
        <Clock className="text-muted-foreground h-10 w-10" />
      </motion.div>
      <p className="text-muted-foreground text-sm">
        {message || "Waiting for the previous step to complete..."}
      </p>
    </motion.div>
  );
}
