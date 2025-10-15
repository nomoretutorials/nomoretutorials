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
  const [loading] = useState(true);
  return (
    <div className="relative h-full w-full">
      <Loader loadingStates={loadingStates} loading={loading} duration={4000} loop={false} />
    </div>
  );
}
