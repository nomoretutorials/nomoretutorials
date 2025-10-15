"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function FailedStepContent({
  message = "Something went wrong while generating content.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      className="border-destructive/40 bg-destructive/10 text-destructive flex flex-col items-center justify-center space-y-4 rounded-xl border py-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AlertTriangle className="text-destructive h-10 w-10" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="border-destructive/50 text-destructive"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </motion.div>
  );
}
