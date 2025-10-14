"use client";

import { useState } from "react";

import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";

const loadingStates = [
  {
    text: "Analyzing your project requirements",
  },
  {
    text: "Understanding selected features",
  },
  {
    text: "Mapping tech stack dependencies",
  },
  {
    text: "Creating logical build sequence",
  },
  {
    text: "Generating step-by-step roadmap",
  },
  {
    text: "Crafting learning-focused content",
  },
  {
    text: "Setting up your workspace",
  },
  {
    text: "Finalizing your project structure",
  },
];

export default function ProjectStepLoader() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="relative w-full h-full">
      {/* Core Loader Modal */}
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} loop={false} />
    </div>
  );
}
