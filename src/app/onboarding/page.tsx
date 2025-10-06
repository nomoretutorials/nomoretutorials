"use client";

import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/actions/user-actions";
import * as Sentry from "@sentry/nextjs";
import { motion } from "framer-motion";

import { Spinner } from "@/components/ui/spinner";
import { useServerAction } from "@/hooks/useServerAction";

// TODO: Rewrite it.

const steps = [
  {
    title: "Choose Your Path",
    description:
      "Browse projects that match your current skill level and what you want to learn next.",
  },
  {
    title: "Build With Guidance",
    description: "Get hints and direction when stuck, but solve the real problems yourself.",
  },
  {
    title: "Track Your Progress",
    description: "Watch your portfolio grow as you complete projects and develop real skills.",
  },
];

const OnboardingPage = () => {
  const router = useRouter();

  const { execute: finishOnboarding, isPending: isLoading } = useServerAction(completeOnboarding, {
    successMessage: "Onboarding completed!",
    onSuccess: () => {
      Sentry.addBreadcrumb({
        category: "onboarding",
        message: "Onboarding completed successfully",
        level: "info",
      });
      router.push("/");
    },
    onError: (error) => {
      Sentry.captureException(new Error(error), {
        tags: {
          component: "Onboarding",
          operation: "complete_onboarding",
        },
      });
    },
  });

  const handleSubmit = async () => {
    Sentry.addBreadcrumb({
      category: "onboarding",
      message: "User attempting to complete onboarding",
      level: "info",
    });

    await finishOnboarding();
  };

  return (
    <div className="bg-background relative flex min-h-screen w-full items-start justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ opacity: [0.08, 0.15, 0.08], y: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="bg-accent/30 absolute top-24 left-1/2 h-[240px] w-[90%] max-w-6xl -translate-x-1/2 rounded-xl blur-2xl"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05], y: [0, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="bg-secondary/40 absolute top-72 left-1/2 h-[180px] w-[80%] max-w-5xl -translate-x-1/2 rounded-xl blur-xl"
        />
        <div className="bg-accent/20 dark:bg-accent/1 to-background absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent" />
      </div>

      <div className="text-muted-foreground absolute top-6 right-6 flex items-center gap-4 text-sm">
        <button
          onClick={handleSubmit}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Skip onboarding and go to dashboard"
        >
          Skip
        </button>
      </div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-start gap-16 px-6 py-16 md:px-12 lg:px-20">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="border-border/50 bg-card/30 inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-sm">
            <span>👋</span>
            <span className="text-muted-foreground text-base">Welcome Aboard</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-5xl">
            Let’s get you started
            <br />
            with{" "}
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
              NoMoreTutorials
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-lg">
            Youre about to break free from tutorial hell. Here&apos;s a quick walkthrough of how
            everything works.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex w-full flex-col gap-3"
        >
          <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Quick Tour
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
              How It Works
            </span>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Learn by building, not watching
            </h2>
          </div>

          <div className="flex w-full flex-col gap-4">
            {steps.map((step, index) => (
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
                Jump in and complete your first project today.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              aria-label="Complete onboarding and start building"
              className="group bg-primary text-primary-foreground relative overflow-hidden rounded-lg px-6 py-3 text-base font-medium shadow-md transition-all hover:shadow-lg"
            >
              <span className="relative z-10">
                {isLoading ? <Spinner /> : <div>Start Building</div>}
              </span>
              <div className="from-primary to-accent absolute inset-0 -z-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default OnboardingPage;
