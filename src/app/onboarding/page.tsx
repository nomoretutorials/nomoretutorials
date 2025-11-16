"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAllTechStacks } from "@/actions/project-actions";
import { completeTechStackSelection } from "@/actions/user-actions";
import { ExperienceLevel, TechStackCategory } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Sparkles } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { useServerAction } from "@/hooks/useServerAction";

type TechStack = {
  id: string;
  name: string;
  slug: string;
  category: TechStackCategory;
  description: string | null;
};

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
      "Get goals and hints for each step. You'll figure out HOW to solve problems by reading docs and experimenting.",
  },
  {
    title: "Learn Production Technologies When You Need Them",
    description:
      "We introduce technologies progressively as your project needs them, not all at once.",
  },
];

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
    if (currentStep === 2 && techStacks.length === 0) {
      fetchTechStacks();
    }
  }, [currentStep, techStacks.length]);

  const fetchTechStacks = async () => {
    setIsLoadingStacks(true);
    setError("");
    const result = await getAllTechStacks();
    if (result.success) {
      setTechStacks(result.data as TechStack[]);
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
      router.push("/"); // Disabled for mock env
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
    if (techStacks.length === 0) {
      fetchTechStacks();
    }
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

    const nextjs = techStacks.find((t) => t.slug === "nextjs");
    const postgresql = techStacks.find((t) => t.slug === "postgresql");
    const prisma = techStacks.find((t) => t.slug === "prisma");
    const betterAuth = techStacks.find((t) => t.slug === "better-auth");

    if (nextjs) {
      setFullStackId(nextjs.id);
      setFrontendId("");
      setBackendId("");
    }

    const toolIds: string[] = [];
    if (postgresql) toolIds.push(postgresql.id);
    if (prisma) toolIds.push(prisma.id);
    if (betterAuth) toolIds.push(betterAuth.id);

    setAdditionalToolIds(toolIds);

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
    setFrontendId("");
    setBackendId("");
  };

  const handleFrontendSelect = (stackId: string) => {
    setError("");
    setFrontendId(stackId);
    setFullStackId("");
  };

  const handleBackendSelect = (stackId: string) => {
    setError("");
    setBackendId(stackId);
    setFullStackId("");
  };

  const handleFinishOnboarding = async () => {
    setError("");
    if (!experienceLevel) {
      setError("Please select your experience level first");
      return;
    }

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

  const getSelectionSummary = () => {
    const parts = [];
    if (fullStackId) {
      parts.push("1 full-stack");
    } else {
      if (frontendId) parts.push("1 frontend");
      if (backendId) parts.push("1 backend");
    }

    const core = parts.join(frontendId && backendId ? " + " : ", ");
    const tools =
      additionalToolIds.length > 0
        ? `${additionalToolIds.length} tool${additionalToolIds.length > 1 ? "s" : ""}`
        : "";

    if (core && tools) return `${core}, ${tools}`;
    return core || tools;
  };

  return (
    <div className="bg-background from-background via-background to-accent/5 relative flex min-h-screen w-full items-start justify-center overflow-hidden bg-linear-to-br">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05], y: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="bg-accent/30 absolute top-20 left-1/2 h-56 w-[85%] max-w-5xl -translate-x-1/2 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.03, 0.07, 0.03], y: [0, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="bg-secondary/40 absolute top-64 left-1/2 h-40 w-[75%] max-w-4xl -translate-x-1/2 rounded-full blur-3xl"
        />
        <div className="bg-accent/10 to-background absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent" />
      </div>

      {/* Progress indicator */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            currentStep >= 1 ? "bg-primary w-8" : "bg-muted w-2"
          }`}
        />
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            currentStep >= 2 ? "bg-primary w-8" : "bg-muted w-2"
          }`}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-start gap-16 px-5 py-24 md:px-8 md:py-32 lg:px-12">
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
                <div className="border-border/50 bg-card/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm backdrop-blur-sm">
                  <span>👋</span>
                  <span className="text-muted-foreground">Welcome</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
                  Break free from
                  <br />
                  <span className="from-primary to-accent bg-linea-to-r bg-clip-text text-transparent">
                    tutorial hell
                  </span>
                </h1>

                <p className="text-muted-foreground max-w-xl text-lg">
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
                <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  See How It Works
                </span>
                <div className="border-border/50 bg-card/50 group shadow-primary/5 relative w-full overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm">
                  {/* Mock video for demo */}
                  <div className="bg-muted/30 flex aspect-video h-full max-h-96 w-full items-center justify-center rounded-lg object-cover transition-all group-hover:brightness-105">
                    <span className="text-muted-foreground">[Demo Video Placeholder - 16:9]</span>
                  </div>
                  {/* <video
                    src="/demo.mp4"
                    controls
                    className="h-full max-h-96 w-full rounded-lg object-cover transition-all group-hover:brightness-105"
                    poster="/demo-thumbnail.png"
                  /> */}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="border-border/30 flex w-full flex-col gap-8 border-t pt-12"
              >
                <div className="flex flex-col items-start gap-2">
                  <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    The NoMoreTutorials Way
                  </span>
                  <h2 className="text-3xl font-semibold tracking-tight">
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
                      className="group border-border/50 bg-card/30 hover:border-primary/40 hover:bg-card/50 hover:shadow-primary/10 flex w-full flex-col gap-3 rounded-xl border p-6 backdrop-blur-sm transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {step.description}
                      </p>
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
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-semibold">Ready to start building?</h3>
                    <p className="text-muted-foreground text-sm">
                      First, let&apos;s set up your core tech stack.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueToTechStack}
                    aria-label="Continue to tech stack selection"
                    className="group bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 relative overflow-hidden rounded-lg px-6 py-3 text-base font-medium shadow-lg transition-all hover:shadow-xl"
                  >
                    <span className="relative z-10">Continue</span>
                    <div className="from-primary to-accent bg-linea-to-r absolute inset-0 z-0 opacity-0 transition-opacity group-hover:opacity-100" />
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
              className="flex w-full flex-col gap-0"
            >
              {/* Header is outside the card for a cleaner look */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 flex flex-col items-start gap-3"
              >
                <div className="border-border/50 bg-card/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm backdrop-blur-sm">
                  <span>Tools</span>
                  <span className="text-muted-foreground">Step 2 of 2</span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Choose your core stack
                </h1>

                <div className="flex flex-col gap-1.5">
                  <p className="text-muted-foreground flex max-w-xl items-start gap-2 text-sm">
                    <Info className="mt-1 h-4 w-4 shrink-0" />
                    <span>
                      You can change your preferences later or use different stacks for different
                      projects.
                    </span>
                  </p>
                </div>
              </motion.header>

              {/* Main selection card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card/30 border-border/50 flex w-full flex-col gap-8 rounded-2xl p-6 shadow-xl backdrop-blur-lg sm:p-8 lg:p-12"
              >
                {isLoadingStacks ? (
                  <div className="flex items-center justify-center py-20">
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
                      <h2 className="text-lg font-semibold">
                        1. What&apos;s your experience level?
                      </h2>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {[
                          {
                            level: ExperienceLevel.BEGINNER,
                            emoji: "🌱",
                            title: "Beginner",
                            desc: "Just starting or haven’t built much yet",
                          },
                          {
                            level: ExperienceLevel.INTERMEDIATE,
                            emoji: "🚀",
                            title: "Intermediate",
                            desc: "Know basics, built small projects",
                          },
                        ].map((item) => (
                          <button
                            key={item.level}
                            onClick={() => setExperienceLevel(item.level)}
                            className={`border-border/50 rounded-lg border p-5 text-left shadow-sm transition-all ${
                              experienceLevel === item.level
                                ? "border-primary bg-primary/10 ring-primary/30 shadow-md ring-2"
                                : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-2xl">{item.emoji}</span>
                                <span className="text-base font-semibold">{item.title}</span>
                                <span className="text-muted-foreground text-sm">{item.desc}</span>
                              </div>
                              {experienceLevel === item.level && (
                                <CheckCircle2 className="text-primary h-5 w-5" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.section>

                    {/* Popular Stack */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <button
                        onClick={handleUsePopularStack}
                        disabled={!experienceLevel}
                        className="border-primary/60 bg-primary/10 hover:bg-primary/20 group w-full rounded-xl border-2 border-dashed p-6 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/20 text-primary rounded-full p-3">
                              <Sparkles className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="flex items-center gap-2 text-lg font-semibold">
                                Use Popular Stack
                                <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                  Recommended
                                </span>
                              </h3>
                              <p className="text-muted-foreground mt-1 text-sm">
                                Next.js + PostgreSQL + Prisma + Better Auth
                              </p>
                            </div>
                          </div>
                          <div className="text-primary text-xl font-bold transition-transform group-hover:translate-x-1">
                            →
                          </div>
                        </div>
                      </button>
                    </motion.section>

                    <div className="relative flex items-center gap-4">
                      <div className="border-border/50 flex-1 border-t" />
                      <span className="text-muted-foreground text-sm font-medium">
                        or build your own
                      </span>
                      <div className="border-border/50 flex-1 border-t" />
                    </div>

                    {/* Core Stack */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <h2 className="text-lg font-semibold">2. Select your core stack</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Full-stack framework OR frontend + backend
                        </p>
                      </div>

                      {/* Grouping container */}
                      <div className="border-border/50 bg-card/10 flex flex-col gap-6 rounded-xl border p-5 md:p-8">
                        {/* Full-Stack */}
                        <div className="flex flex-col gap-3">
                          <h3 className="flex items-center gap-1.5 text-base font-semibold">
                            <span>⚡️</span> Full-Stack
                          </h3>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {fullStackOptions.map((stack) => (
                              <button
                                key={stack.id}
                                onClick={() => handleFullStackSelect(stack.id)}
                                className={`border-border/50 relative rounded-lg border p-4 text-left shadow-sm transition-all ${
                                  fullStackId === stack.id
                                    ? "border-primary bg-primary/10 ring-primary/30 shadow-md ring-2"
                                    : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                                }`}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium">{stack.name}</span>
                                  {stack.description && (
                                    <span className="text-muted-foreground line-clamp-1 text-xs">
                                      {stack.description}
                                    </span>
                                  )}
                                </div>
                                {fullStackId === stack.id && (
                                  <CheckCircle2 className="text-primary absolute top-2 right-2 h-4 w-4" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Frontend & Backend */}
                        <AnimatePresence>
                          {!fullStackId && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col gap-6 overflow-hidden"
                            >
                              {/* Frontend */}
                              <div className="flex flex-col gap-3">
                                <h3 className="flex items-center gap-1.5 text-base font-semibold">
                                  <span>🎨</span> Frontend
                                  <span className="text-muted-foreground text-sm font-normal">
                                    (Optional)
                                  </span>
                                </h3>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                  {frontendOptions.map((stack) => (
                                    <button
                                      key={stack.id}
                                      onClick={() => handleFrontendSelect(stack.id)}
                                      className={`border-border/50 relative rounded-lg border p-4 text-left shadow-sm transition-all ${
                                        frontendId === stack.id
                                          ? "border-primary bg-primary/10 ring-primary/30 shadow-md ring-2"
                                          : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                                      }`}
                                    >
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium">{stack.name}</span>
                                      </div>
                                      {frontendId === stack.id && (
                                        <CheckCircle2 className="text-primary absolute top-2 right-2 h-4 w-4" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Backend */}
                              <div className="flex flex-col gap-3">
                                <h3 className="flex items-center gap-1.5 text-base font-semibold">
                                  <span>⚙️</span> Backend
                                  <span className="text-muted-foreground text-sm font-normal">
                                    (Optional)
                                  </span>
                                </h3>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                  {backendOptions.map((stack) => (
                                    <button
                                      key={stack.id}
                                      onClick={() => handleBackendSelect(stack.id)}
                                      className={`border-border/50 relative rounded-lg border p-4 text-left shadow-sm transition-all ${
                                        backendId === stack.id
                                          ? "border-primary bg-primary/10 ring-primary/30 shadow-md ring-2"
                                          : "bg-card/30 hover:border-primary/40 hover:bg-card/50"
                                      }`}
                                    >
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium">{stack.name}</span>
                                      </div>
                                      {backendId === stack.id && (
                                        <CheckCircle2 className="text-primary absolute top-2 right-2 h-4 w-4" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.section>

                    {/* Optional Tools */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <h2 className="text-lg font-semibold">3. Optional: Pre-select tools</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                          We’ll introduce them as needed otherwise.
                        </p>
                      </div>

                      {[
                        { title: "Database", icon: "🗄️", options: databaseOptions },
                        { title: "ORM", icon: "🔗", options: ormOptions },
                        { title: "Authentication", icon: "🔐", options: authOptions },
                      ].map((section) => (
                        <div key={section.title} className="flex flex-col gap-3">
                          <h3 className="flex items-center gap-1.5 text-base font-semibold">
                            <span>{section.icon}</span> {section.title}
                          </h3>
                          <div
                            className={`grid gap-3 ${
                              section.title === "Database"
                                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                : section.title === "ORM"
                                  ? "grid-cols-2"
                                  : "grid-cols-1 md:grid-cols-3"
                            }`}
                          >
                            {section.options.map((stack) => {
                              const isSelected = additionalToolIds.includes(stack.id);
                              return (
                                <button
                                  key={stack.id}
                                  onClick={() => toggleAdditionalTool(stack.id)}
                                  className={`border-border/50 relative rounded-lg border p-3 text-left shadow-sm transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/10 ring-primary/30 shadow-md ring-2"
                                      : "bg-card/30 hover:bg-card/50 hover:border-primary/40"
                                  }`}
                                >
                                  <span className="text-sm font-medium">{stack.name}</span>
                                  {isSelected && (
                                    <CheckCircle2 className="text-primary absolute top-2 right-2 h-4 w-4" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </motion.section>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-destructive/10 text-destructive border-destructive/30 rounded-lg border p-4 text-sm"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Footer */}
                    <motion.footer
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="border-border/30 flex w-full flex-col-reverse gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-muted-foreground hover:text-foreground group flex items-center gap-1.5 text-sm font-medium transition-colors"
                      >
                        <span className="transition-transform group-hover:-translate-x-1">←</span>
                        Back
                      </button>

                      <div className="flex w-full flex-col-reverse gap-4 sm:w-auto sm:flex-row sm:items-center">
                        <div className="text-muted-foreground text-left text-sm sm:text-right">
                          {getSelectionSummary()}
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
                          className="group bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 relative w-full overflow-hidden rounded-lg px-6 py-3 text-base font-medium shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {isSaving ? <Spinner /> : "Start Building"}
                          </span>
                          <div className="from-primary to-accent absolute inset-0 z-0 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.button>
                      </div>
                    </motion.footer>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
