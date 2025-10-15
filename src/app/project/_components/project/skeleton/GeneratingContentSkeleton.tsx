"use client";

import { motion } from "framer-motion";

import AIGeneratingContent from "@/components/generating-content";

export default function GeneratingContentSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* --- Top AI Loader bar (exact same as reference) --- */}
      <div className="w-full">
        <AIGeneratingContent />
      </div>

      {/* --- Content Skeleton exactly matching your screenshot --- */}
      <div className="space-y-6">

        {/* Paragraph group 1 */}
        <div className="space-y-3">
          <SkeletonLine w="100%" />
          <SkeletonLine w="90%" />
          <SkeletonLine w="100%" />
          <SkeletonLine w="60%" />
        </div>

        {/* Gap between groups */}
        <div className="h-2" />

        {/* Paragraph group 2 */}
        <div className="space-y-3">
          <SkeletonLine w="80%" />
          <SkeletonLine w="70%" />
          <SkeletonLine w="100%" />
          <SkeletonLine w="60%" />
        </div>
      </div>
    </div>
  );
}

function SkeletonLine({ w }: { w: string }) {
  return (
    <motion.div
      className="bg-muted/80 h-3.5 rounded-md"
      style={{ width: w }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  );
}
