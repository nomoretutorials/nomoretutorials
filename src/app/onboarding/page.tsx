"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAllTechStacks } from "@/actions/project-actions";
import { completeTechStackSelection } from "@/actions/user-actions";
import { ExperienceLevel, TechStackCategory } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, Sparkles } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { useServerAction } from "@/hooks/useServerAction";

// Step 1: Introduction content
const introSteps = [
  {
    title: "Start with an Idea",
    description:
      "Tell us what you want to build. We'll break it down into clear, achievable features and steps.",
  },
  {
    title: "Build With Guidance, Not Tutorials",
    description:
      "Get goals and hints for each step. You'll figure out HOW to solve problems by reading docs and experimenting - just like real developers.",
  },
  {
    title: "Learn Tools When You Need Them",
    description:
      "We introduce tools (email services, AI APIs, queues) progressively as your project needs them, not all at once.",
  },
];

type TechStack = {
  id: string;
  name: string;
  slug: string;
  category: TechStackCategory;
  description: string | null;
};

const OnboardingPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1); // 1 = intro, 2 = tech stack

  // Tech stack data
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [isLoadingStacks, setIsLoadingStacks] = useState(false);

  // Selection state
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(ExperienceLevel.BEGINNER);
  const [fullStackId, setFullStackId] = useState<string>("");
  const [frontendId, setFrontendId] = useState<string>("");
  const [backendId, setBackendId] = useState<string>("");
  const [additionalToolIds, setAdditionalToolIds] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (techStacks.length === 0) {
      fetchTechStacks();
    }
  }, [currentStep, techStacks.length]);

  const fetchTechStacks = async () => {
    setIsLoadingStacks(true);
    const result = await getAllTechStacks();
    if (result.success) {
      setTechStacks(result.data);
    } else {
      setError("Failed to load tech stacks. Please try again.");
    }
    setIsLoadingStacks(false);
  };

  // Group tech stacks by category
  const fullStackOptions = useMemo(
    () => techStacks.filter((t) => t.category === TechStackCategory.FULLSTACK),
    [techStacks]
  );
  const frontendOptions = useMemo(
    () => techStacks.filter((t) => t.category === TechStackCategory.FRONTEND),
    [techStacks]
  );
  const backendOptions = useMemo(
    () => techStacks.filter((t) => t.category === TechStackCategory.BACKEND),
    [techStacks]
  );
  const databaseOptions = useMemo(
    () => techStacks.filter((t) => t.category === TechStackCategory.DATABASE),
    [techStacks]
  );
  const ormOptions = useMemo(
    () => techStacks.filter((t) => t.category === TechStackCategory.ORM),
    [techStacks]
  );
  const authOptions = useMemo(
    () => techStacks.filter((t) => t.category === TechStackCategory.AUTHENTICATION),
    [techStacks]
  );

  const { execute: saveStack, isPending: isSaving } = useServerAction(completeTechStackSelection, {
    onSuccess: () => {
      Sentry.addBreadcrumb({
        category: "onboarding",
        message: "Tech stack selection completed",
        level: "info",
      });
      router.push("/");
    },
    onError: (error) => {
      Sentry.captureException(new Error(error), {
        tags: {
          component: "Onboarding",
          operation: "complete_tech_stack",
        },
      });
      setError(error);
    },
  });

  const handleContinueToTechStack = () => {
    setCurrentStep(2);
    Sentry.addBreadcrumb({
      category: "onboarding",
      message: "User moved to tech stack selection",
      level: "info",
    });
  };

  const handleUsePopularStack = () => {
    if (!experienceLevel) {
      setError("Please select your experience level first");
      return;
    }

    setError("");

    // Find the popular stack items by slug
    const nextjs = techStacks.find((t) => t.slug === "nextjs");
    const postgresql = techStacks.find((t) => t.slug === "postgresql");
    const prisma = techStacks.find((t) => t.slug === "prisma");
    const betterAuth = techStacks.find((t) => t.slug === "better-auth");

    // Auto-select Next.js as full-stack
    if (nextjs) {
      setFullStackId(nextjs.id);
      setFrontendId("");
      setBackendId("");
    }

    // Auto-select additional tools
    const toolIds: string[] = [];
    if (postgresql) toolIds.push(postgresql.id);
    if (prisma) toolIds.push(prisma.id);
    if (betterAuth) toolIds.push(betterAuth.id);

    setAdditionalToolIds(toolIds);

    // Log for Sentry
    Sentry.addBreadcrumb({
      category: "onboarding",
      message: "User auto-selected popular stack",
      level: "info",
    });
  };

  const toggleAdditionalTool = (toolId: string) => {
    setError("");
    setAdditionalToolIds((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleFullStackSelect = (stackId: string) => {
    setError("");
    setFullStackId(stackId);
    // Clear frontend and backend if full-stack is selected
    setFrontendId("");
    setBackendId("");
  };

  const handleFrontendSelect = (stackId: string) => {
    setError("");
    setFrontendId(stackId);
    // Clear full-stack if frontend is selected
    setFullStackId("");
  };

  const handleBackendSelect = (stackId: string) => {
    setError("");
    setBackendId(stackId);
    // Clear full-stack if backend is selected
    setFullStackId("");
  };

  const handleFinishOnboarding = async () => {
    // Validation: Must have experience level
    if (!experienceLevel) {
      setError("Please select your experience level first");
      return;
    }

    // Validation: Must have either full-stack OR (frontend OR backend)
    if (!fullStackId && !frontendId && !backendId) {
      setError("Please select at least one core tech stack (Full-stack, Frontend, or Backend)");
      return;
    }

    const primaryTechStackIds: string[] = [];

    if (fullStackId) {
      primaryTechStackIds.push(fullStackId);
    } else {
      if (frontendId) primaryTechStackIds.push(frontendId);
      if (backendId) primaryTechStackIds.push(backendId);
    }

    await saveStack({
      primaryTechStackIds,
      additionalToolIds,
      experienceLevel,
    });
  };

  return (
    <div className="bg-background relative flex min-h-screen w-full items-start justify-center overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ opacity: [0.08, 0.15, 0.08], y: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="bg-accent/30 absolute top-24 left-1/2 h-60 w-[90%] max-w-6xl -translate-x-1/2 rounded-xl blur-2xl"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05], y: [0, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="bg-secondary/40 absolute top-72 left-1/2 h-45 w-[80%] max-w-5xl -translate-x-1/2 rounded-xl blur-xl"
        />
        <div className="bg-accent/20 dark:bg-accent/10 to-background absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent" />
      </div>

      {/* Progress indicator */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            currentStep >= 1 ? "bg-primary w-8" : "bg-muted"
          }`}
        />
        <div
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            currentStep >= 2 ? "bg-primary w-8" : "bg-muted"
          }`}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-start gap-16 px-6 py-16 md:px-12 lg:px-20">
        <AnimatePresence mode="wait">
          {/* STEP 1: INTRODUCTION */}
          {currentStep === 1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="flex w-full flex-col gap-16"
            >
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-start gap-4"
              >
                <div className="border-border/50 bg-card/30 inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-sm">
                  <span>👋</span>
                  <span className="text-muted-foreground text-base">Welcome</span>
                </div>

                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-5xl">
                  Break free from
                  <br />
                  <span className="from-primary to-accent bg-linear-to-r bg-clip-text text-transparent">
                    tutorial hell
                  </span>
                </h1>

                <p className="text-muted-foreground max-w-2xl text-lg">
                  Stop watching endless tutorials. Start building real projects with just enough
                  guidance to succeed.
                </p>
              </motion.header>

              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex w-full flex-col gap-3"
              >
                <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                  See How It Works
                </span>
                <div className="border-border/50 bg-card/50 group relative w-full overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm">
                  <video
                    src="/demo.mp4"
                    controls
                    className="h-full w-full rounded-xl transition-all group-hover:brightness-105"
                    poster="/demo-thumbnail.png"
                  />
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="border-border/30 flex w-full flex-col gap-8 border-t pt-12"
              >
                <div className="flex flex-col items-start gap-2">
                  <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    The NoMoreTutorials Way
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Learn by solving, not copying
                  </h2>
                </div>

                <div className="flex w-full flex-col gap-4">
                  {introSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      className="group border-border/50 bg-card/30 hover:border-primary/40 hover:bg-card/50 flex w-full flex-col gap-3 rounded-lg border p-6 backdrop-blur-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="border-border/30 flex w-full flex-col items-start gap-4 border-t pt-12"
              >
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-semibold">Ready to start building?</h3>
                    <p className="text-muted-foreground text-sm">
                      First, let&apos;s set up your core tech stack preferences.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueToTechStack}
                    aria-label="Continue to tech stack selection"
                    className="group bg-primary text-primary-foreground relative overflow-hidden rounded-lg px-6 py-3 text-base font-medium shadow-md transition-all hover:shadow-lg"
                  >
                    <span className="relative z-10">Continue</span>
                    <div className="from-primary to-accent absolute inset-0 z-0 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.button>
                </div>
              </motion.footer>
            </motion.div>
          )}

          {/* STEP 2: TECH STACK SELECTION */}
          {currentStep === 2 && (
            <motion.div
              key="tech-stack"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex w-full flex-col gap-8"
            >
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-start gap-4"
              >
                <div className="border-border/50 bg-card/30 inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-sm">
                  <span>🛠️</span>
                  <span className="text-muted-foreground text-base">Step 2 of 2</span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Choose your core stack
                </h1>

                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground flex max-w-2xl items-start gap-2 text-sm">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      You can change your preferences later or use different stacks for different
                      projects.
                    </span>
                  </p>
                </div>
              </motion.header>

              {isLoadingStacks ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Experience Level */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col gap-4"
                  >
                    <h2 className="text-lg font-semibold">1. What&apos;s your experience level?</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <button
                        onClick={() => setExperienceLevel(ExperienceLevel.BEGINNER)}
                        className={`border-border/50 rounded-xl border p-5 text-left transition-all ${
                          experienceLevel === ExperienceLevel.BEGINNER
                            ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                            : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-2">
                            <span className="text-2xl">🌱</span>
                            <span className="text-base font-semibold">Beginner</span>
                            <span className="text-muted-foreground text-sm">
                              Just starting out or have watched tutorials but haven&apos;t built much
                            </span>
                          </div>
                          {experienceLevel === ExperienceLevel.BEGINNER && (
                            <Check className="text-primary h-5 w-5" />
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setExperienceLevel(ExperienceLevel.INTERMEDIATE)}
                        className={`border-border/50 rounded-xl border p-5 text-left transition-all ${
                          experienceLevel === ExperienceLevel.INTERMEDIATE
                            ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                            : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-2">
                            <span className="text-2xl">🚀</span>
                            <span className="text-base font-semibold">Intermediate</span>
                            <span className="text-muted-foreground text-sm">
                              Know the basics and have built small projects independently
                            </span>
                          </div>
                          {experienceLevel === ExperienceLevel.INTERMEDIATE && (
                            <Check className="text-primary h-5 w-5" />
                          )}
                        </div>
                      </button>
                    </div>
                  </motion.section>

                  {/* Popular Stack Quick Select */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                  >
                    <button
                      onClick={handleUsePopularStack}
                      disabled={!experienceLevel}
                      className="border-primary/40 bg-primary/5 hover:bg-primary/10 group w-full rounded-xl border-2 border-dashed p-6 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/20 text-primary rounded-full p-3">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                              Use Popular Stack
                              <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                                Recommended
                              </span>
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                              Next.js (full-stack) + PostgreSQL + Prisma + Better Auth
                            </p>
                          </div>
                        </div>
                        <div className="text-primary">→</div>
                      </div>
                    </button>
                  </motion.section>

                  <div className="relative flex items-center gap-4">
                    <div className="border-border/50 flex-1 border-t" />
                    <span className="text-muted-foreground text-sm">or build your own</span>
                    <div className="border-border/50 flex-1 border-t" />
                  </div>

                  {/* Core Stack Options */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <h2 className="text-lg font-semibold">2. Select your core stack</h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Choose a full-stack framework OR pick frontend/backend separately
                      </p>
                    </div>

                    {/* Full-Stack */}
                    <div className="flex flex-col gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-medium">
                        <span>⚡</span> Full-Stack Frameworks
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {fullStackOptions.map((stack) => (
                          <button
                            key={stack.id}
                            onClick={() => handleFullStackSelect(stack.id)}
                            className={`border-border/50 relative rounded-lg border p-4 text-left transition-all ${
                              fullStackId === stack.id
                                ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                                : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">{stack.name}</span>
                              {stack.description && (
                                <span className="text-muted-foreground line-clamp-2 text-xs">
                                  {stack.description}
                                </span>
                              )}
                            </div>
                            {fullStackId === stack.id && (
                              <div className="bg-primary absolute top-2 right-2 rounded-full p-0.5">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frontend & Backend */}
                    {!fullStackId && (
                      <div className="flex flex-col gap-6">
                        {/* Frontend */}
                        <div className="flex flex-col gap-3">
                          <h3 className="flex items-center gap-2 text-sm font-medium">
                            <span>🎨</span> Frontend
                            <span className="text-muted-foreground text-xs font-normal">
                              (Optional)
                            </span>
                          </h3>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {frontendOptions.map((stack) => (
                              <button
                                key={stack.id}
                                onClick={() => handleFrontendSelect(stack.id)}
                                className={`border-border/50 relative rounded-lg border p-4 text-left transition-all ${
                                  frontendId === stack.id
                                    ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                                    : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium">{stack.name}</span>
                                  {stack.description && (
                                    <span className="text-muted-foreground line-clamp-2 text-xs">
                                      {stack.description}
                                    </span>
                                  )}
                                </div>
                                {frontendId === stack.id && (
                                  <div className="bg-primary absolute top-2 right-2 rounded-full p-0.5">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Backend */}
                        <div className="flex flex-col gap-3">
                          <h3 className="flex items-center gap-2 text-sm font-medium">
                            <span>⚙️</span> Backend
                            <span className="text-muted-foreground text-xs font-normal">
                              (Optional)
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {backendOptions.map((stack) => (
                              <button
                                key={stack.id}
                                onClick={() => handleBackendSelect(stack.id)}
                                className={`border-border/50 relative rounded-lg border p-4 text-left transition-all ${
                                  backendId === stack.id
                                    ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                                    : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium">{stack.name}</span>
                                  {stack.description && (
                                    <span className="text-muted-foreground line-clamp-2 text-xs">
                                      {stack.description}
                                    </span>
                                  )}
                                </div>
                                {backendId === stack.id && (
                                  <div className="bg-primary absolute top-2 right-2 rounded-full p-0.5">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.section>

                  {/* Optional Database/ORM/Auth */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="border-border/30 flex flex-col gap-4 border-t pt-6"
                  >
                    <div>
                      <h2 className="text-lg font-semibold">
                        3. Optional: Pre-select common tools
                      </h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        If you already know you need these, select them now. Otherwise, we&apos;ll
                        introduce them as your project requires.
                      </p>
                    </div>

                    {/* Database */}
                    <div className="flex flex-col gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-medium">
                        <span>🗄️</span> Database
                      </h3>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                        {databaseOptions.map((stack) => {
                          const isSelected = additionalToolIds.includes(stack.id);
                          return (
                            <button
                              key={stack.id}
                              onClick={() => toggleAdditionalTool(stack.id)}
                              className={`border-border/50 relative rounded-lg border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20"
                                  : "bg-card/30 hover:bg-card/50 hover:border-purple-500/40"
                              }`}
                            >
                              <span className="text-sm font-medium">{stack.name}</span>
                              {isSelected && (
                                <div className="absolute top-2 right-2 rounded-full bg-purple-500 p-0.5">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ORM */}
                    <div className="flex flex-col gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-medium">
                        <span>🔗</span> ORM
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {ormOptions.map((stack) => {
                          const isSelected = additionalToolIds.includes(stack.id);
                          return (
                            <button
                              key={stack.id}
                              onClick={() => toggleAdditionalTool(stack.id)}
                              className={`border-border/50 relative rounded-lg border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20"
                                  : "bg-card/30 hover:bg-card/50 hover:border-purple-500/40"
                              }`}
                            >
                              <span className="text-sm font-medium">{stack.name}</span>
                              {isSelected && (
                                <div className="absolute top-2 right-2 rounded-full bg-purple-500 p-0.5">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Authentication */}
                    <div className="flex flex-col gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-medium">
                        <span>🔐</span> Authentication
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {authOptions.map((stack) => {
                          const isSelected = additionalToolIds.includes(stack.id);
                          return (
                            <button
                              key={stack.id}
                              onClick={() => toggleAdditionalTool(stack.id)}
                              className={`border-border/50 relative rounded-lg border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20"
                                  : "bg-card/30 hover:bg-card/50 hover:border-purple-500/40"
                              }`}
                            >
                              <span className="text-sm font-medium">{stack.name}</span>
                              {isSelected && (
                                <div className="absolute top-2 right-2 rounded-full bg-purple-500 p-0.5">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.section>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Footer */}
                  <motion.footer
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="border-border/30 flex w-full items-center justify-between gap-4 border-t pt-6"
                  >
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                    >
                      ← Back
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="text-muted-foreground hidden text-sm sm:block">
                        {fullStackId
                          ? "1 full-stack"
                          : `${frontendId ? "1 frontend" : ""}${
                              frontendId && backendId ? " + " : ""
                            }${backendId ? "1 backend" : ""}`}
                        {additionalToolIds.length > 0 &&
                          `, ${additionalToolIds.length} optional tool${additionalToolIds.length > 1 ? "s" : ""}`}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinishOnboarding}
                        disabled={
                          isSaving ||
                          !experienceLevel ||
                          (!fullStackId && !frontendId && !backendId)
                        }
                        className="group bg-primary text-primary-foreground relative overflow-hidden rounded-lg px-6 py-3 text-base font-medium shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="relative z-10">
                          {isSaving ? <Spinner /> : "Start Building"}
                        </span>
                        <div className="from-primary to-accent absolute inset-0 z-0 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.button>
                    </div>
                  </motion.footer>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
