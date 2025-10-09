"use client";

import { motion } from "framer-motion";

import AIGeneratingContent from "@/components/generating-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturesSkeleton() {
  return (
    <div className="flex flex-col space-y-5">
      <AIGeneratingContent />

      <div className="flex flex-col space-y-3">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="border-muted relative flex items-start space-x-3 rounded-lg border p-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Skeleton className="mt-1 h-5 w-5 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
