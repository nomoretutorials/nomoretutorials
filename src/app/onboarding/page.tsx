"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAllTechStacks } from "@/actions/project-actions";
import { completeTechStackSelection } from "@/actions/user-actions";
import { ExperienceLevel, TechStackCategory } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility, if not, standard template literals work

import { useServerAction } from "@/hooks/useServerAction";

// --- Types ---
type TechStack = {
  id: string;
  name: string;
  slug: string;
  category: TechStackCategory;
  description: string | null;
};

// --- Constants ---
const INTRO_STEPS = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Idea to Plan",
    description: "Tell us what to build. We break it down into actionable steps.",
  },
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "Active Learning",
    description: "Get hints, not answers. Learn by reading docs and solving.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Just-in-Time Tech",
    description: "We introduce tools only when your project actually needs them.",
  },
];

const EXPERIENCE_OPTIONS = [
  {
    level: ExperienceLevel.BEGINNER,
    emoji: "🌱",
    title: "Beginner",
    desc: "Starting out / Learning core concepts",
  },
  {
    level: ExperienceLevel.INTERMEDIATE,
    emoji: "🚀",
    title: "Intermediate",
    desc: "Built a few apps / Know the basics",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Data State
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [isLoadingStacks, setIsLoadingStacks] = useState(false);

  // Form State
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [fullStackId, setFullStackId] = useState<string>("");
  const [frontendId, setFrontendId] = useState<string>("");
  const [backendId, setBackendId] = useState<string>("");
  const [additionalToolIds, setAdditionalToolIds] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // --- Effects & Data Fetching ---
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
      setError("Failed to load tech stacks. Please refresh.");
    }
    setIsLoadingStacks(false);
  };

  // --- Memos ---
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

  // --- Actions ---
  const { execute: saveStack, isPending: isSaving } = useServerAction(completeTechStackSelection, {
    onSuccess: () => {
      router.push("/"); // Disabled for mock env
    },
    onError: (error) => {
      setError(error);
    },
  });

  // --- Handlers ---
  const handleContinue = () => {
    setCurrentStep(2);
    if (techStacks.length === 0) {
      fetchTechStacks();
    }
  };

  const handleUsePopularStack = () => {
    if (!experienceLevel) {
      setError("Please select your experience level first.");
      return;
    }
    setError("");

    const findId = (slug: string) => techStacks.find((t) => t.slug === slug)?.id;
    const nextId = findId("nextjs");

    if (nextId) {
      setFullStackId(nextId);
      setFrontendId("");
      setBackendId("");
    }

    const toolIds: string[] = [];
    if (postgresql) toolIds.push(postgresql.id);
    if (prisma) toolIds.push(prisma.id);
    if (betterAuth) toolIds.push(betterAuth.id);

    setAdditionalToolIds(toolIds);
  };

  const toggleTool = (id: string) => {
    setAdditionalToolIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setError("");
    if (!experienceLevel) return setError("Experience level is required.");
    if (!fullStackId && (!frontendId || !backendId)) {
      // Note: Allowing frontend OR backend alone might be valid depending on your logic,
      // but typically you want at least one core selection.
      if (!fullStackId && !frontendId && !backendId) return setError("Select a core stack.");
    }

    const primaryTechStackIds = fullStackId
      ? [fullStackId]
      : [frontendId, backendId].filter(Boolean);

    await saveStack({
      primaryTechStackIds,
      additionalToolIds,
      experienceLevel,
    });
  };

  // --- Selection Summary Helper ---
  const summaryText = useMemo(() => {
    const parts = [];
    if (fullStackId) parts.push("Full-stack");
    else {
      if (frontendId) parts.push("Frontend");
      if (backendId) parts.push("Backend");
    }
    const core = parts.join(" + ");
    const tools = additionalToolIds.length > 0 ? `+ ${additionalToolIds.length} tools` : "";
    return core ? `${core} ${tools}` : "No selection yet";
  }, [fullStackId, frontendId, backendId, additionalToolIds]);

  return (
    <div className="bg-background selection:bg-primary/20 relative flex min-h-screen w-full justify-center overflow-hidden font-sans">
      {/* --- Ambient Background --- */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/5 absolute top-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-[100px]" />
        <div className="bg-accent/5 absolute right-0 bottom-0 h-[300px] w-[600px] translate-y-1/3 rounded-[100%] blur-[80px]" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
      </div>

      {/* --- Progress Bar (Top Fixed) --- */}
      <div className="bg-background/50 fixed top-0 right-0 left-0 z-50 flex h-1.5 justify-center gap-1 backdrop-blur-md">
        <motion.div
          className="bg-primary h-full"
          initial={{ width: "0%" }}
          animate={{ width: currentStep === 1 ? "50%" : "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>

      <main className="z-10 flex w-full max-w-4xl flex-col px-6 py-20 lg:py-24">
        <AnimatePresence mode="wait">
          {/* ================= STEP 1: INTRO ================= */}
          {currentStep === 1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-primary/10 text-primary ring-primary/20 mb-6 rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset">
                Welcome to NoMoreTutorials
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                Learn by <span className="text-primary">Doing</span>, <br />
                Not Watching.
              </h1>

              <p className="text-muted-foreground mb-12 max-w-2xl text-lg">
                Stop watching endless tutorials. Start building real projects with just enough
                guidance to succeed.
              </p>

              {/* Feature Grid - More compact */}
              <div className="mb-12 grid w-full gap-6 md:grid-cols-3">
                {INTRO_STEPS.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="group border-border/50 bg-card/40 hover:border-primary/20 hover:bg-card/60 relative overflow-hidden rounded-2xl border p-6 text-left backdrop-blur-sm transition-colors"
                  >
                    <div className="bg-primary/10 text-primary mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                      {step.icon}
                    </div>
                    <h3 className="text-foreground mb-2 font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium shadow-lg transition-all"
              >
                Let&apos;s Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ================= STEP 2: STACK SELECTION ================= */}
          {currentStep === 2 && (
            <motion.div
              key="stack"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <header className="mb-8 flex flex-col gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-muted-foreground hover:text-foreground mb-2 flex w-fit items-center text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to Intro
                </button>
                <h1 className="text-3xl font-bold tracking-tight">Configure your Stack</h1>
                <p className="text-muted-foreground">Select the tools you want to master.</p>
              </header>

              <div className="border-border/50 bg-background/60 rounded-2xl border p-1 shadow-sm backdrop-blur-xl">
                <div className="flex flex-col gap-8 p-6 md:p-8">
                  {/* 1. Experience Level */}
                  <section>
                    <h2 className="text-muted-foreground mb-4 text-sm font-medium tracking-wider uppercase">
                      1. Experience Level
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <SelectableCard
                          key={opt.level}
                          selected={experienceLevel === opt.level}
                          onClick={() => setExperienceLevel(opt.level)}
                          title={opt.title}
                          subtitle={opt.desc}
                          icon={opt.emoji}
                        />
                      ))}
                    </div>
                  </section>

                  {/* 2. Stack Recommendation */}
                  <section className="space-y-4">
                    <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                      2. Core Technology
                    </h2>

                    <button
                      onClick={handleUsePopularStack}
                      disabled={!experienceLevel}
                      className={cn(
                        "group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border-2 border-dashed p-4 text-left transition-all",
                        experienceLevel
                          ? "border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10"
                          : "border-border cursor-not-allowed opacity-50"
                      )}
                    >
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-semibold">
                            Quick Start (Recommended)
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Next.js, PostgreSQL, Prisma, Better-Auth
                        </p>
                      </div>
                      {experienceLevel && (
                        <div className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="border-border/50 w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background text-muted-foreground px-2">
                          Or build custom
                        </span>
                      </div>
                    </div>

                    {/* Custom Selection */}
                    {isLoadingStacks ? (
                      <div className="flex justify-center py-8">
                        <Spinner />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Fullstack */}
                        <div>
                          <label className="mb-3 block text-sm font-medium">
                            Full Stack Frameworks
                          </label>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {fullStackOptions.map((s) => (
                              <CompactSelectable
                                key={s.id}
                                label={s.name}
                                selected={fullStackId === s.id}
                                onClick={() => {
                                  setFullStackId(s.id);
                                  setFrontendId("");
                                  setBackendId("");
                                  setError("");
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Separate Frontend/Backend (Animated Collapse) */}
                        <motion.div layout className="overflow-hidden">
                          <AnimatePresence initial={false}>
                            {!fullStackId && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid gap-6 pt-2 md:grid-cols-2"
                              >
                                <div>
                                  <label className="mb-3 block text-sm font-medium">Frontend</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {frontendOptions.map((s) => (
                                      <CompactSelectable
                                        key={s.id}
                                        label={s.name}
                                        selected={frontendId === s.id}
                                        onClick={() => setFrontendId(s.id)}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="mb-3 block text-sm font-medium">Backend</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {backendOptions.map((s) => (
                                      <CompactSelectable
                                        key={s.id}
                                        label={s.name}
                                        selected={backendId === s.id}
                                        onClick={() => setBackendId(s.id)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    )}
                  </section>

                  {/* 3. Extras */}
                  <section>
                    <h2 className="text-muted-foreground mb-4 text-sm font-medium tracking-wider uppercase">
                      3. Additional Tools (Optional)
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        {
                          title: "Database",
                          opts: databaseOptions,
                          icon: <Database className="h-4 w-4" />,
                        },
                        {
                          title: "Auth",
                          opts: authOptions,
                          icon: <CheckCircle2 className="h-4 w-4" />,
                        },
                        { title: "ORM", opts: ormOptions, icon: <Layers className="h-4 w-4" /> },
                      ].map((group) => (
                        <div
                          key={group.title}
                          className="border-border/30 bg-card/20 rounded-xl border p-4"
                        >
                          <div className="text-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                            {group.icon} {group.title}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {group.opts.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => toggleTool(s.id)}
                                className={cn(
                                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                                  additionalToolIds.includes(s.id)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border/50 bg-background/50 hover:border-primary/50"
                                )}
                              >
                                {s.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Footer Action */}
                <div className="border-border/50 bg-muted/20 border-t px-6 py-4 md:px-8">
                  <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-muted-foreground text-sm font-medium">
                      Selected: <span className="text-foreground">{summaryText}</span>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                      {error && (
                        <span className="text-destructive self-center text-sm">{error}</span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinish}
                        disabled={isSaving || !experienceLevel}
                        className="bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 inline-flex h-10 min-w-[140px] items-center justify-center rounded-lg px-4 text-sm font-medium shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
                      >
                        {isSaving ? <Spinner className="h-4 w-4" /> : "Start Building"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Subcomponents for cleanness ---

interface SelectableCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  icon: string;
}

function SelectableCard({ selected, onClick, title, subtitle, icon }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "focus-visible:ring-primary/50 relative flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 outline-none focus-visible:ring-2",
        selected
          ? "border-primary bg-primary/5 ring-primary shadow-[0_0_0_1px_rgba(var(--primary))] ring-1"
          : "border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30"
      )}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-foreground font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs">{subtitle}</div>
      </div>
      {selected && (
        <div className="text-primary absolute top-4 right-4">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}
    </button>
  );
}

interface CompactSelectableProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function CompactSelectable({ label, selected, onClick }: CompactSelectableProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-all outline-none",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border/50 bg-card/40 hover:border-primary/40 hover:bg-accent/5"
      )}
    >
      {label}
      {selected && <CheckCircle2 className="h-4 w-4" />}
    </button>
  );
}
