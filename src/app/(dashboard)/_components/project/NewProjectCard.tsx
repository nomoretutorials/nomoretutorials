"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { generateMetadata } from "@/actions/ai/generate-metadata";
import { createNewProject } from "@/actions/project-actions";
import * as Sentry from "@sentry/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useServerAction } from "@/hooks/useServerAction";

const NewProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const { execute: runGenerateMetadata, isPending: isGeneraing } = useServerAction(
    generateMetadata,
    {
      successMessage: "Generated project details",
      onSuccess: (data) => {
        if (!title) setTitle(data.title);
        setDescription(data.description);

        Sentry.addBreadcrumb({
          category: "ai",
          message: "AI generation successful",
          level: "info",
        });
      },
      onError: (error) => {
        Sentry.captureException(error, {
          tags: { function: "NewProjectCard" },
        });
      },
    }
  );

  const { execute: createProject, isPending: isSubmitting } = useServerAction(createNewProject, {
    successMessage: "Project created successfully!",
    onSuccess: (data) => {
      Sentry.addBreadcrumb({
        category: "project",
        message: "Project created successfully",
        level: "info",
        data,
      });
      router.push(`/project/${data.projectId}`);
    },
    onError: (error) => {
      Sentry.captureException(new Error("Project creation failed"), {
        tags: { component: "NewProjectDialog", operation: "create_project" },
        extra: { error },
      });
    },
  });

  const handleGenerate = useCallback(async () => {
    if (!idea) {
      return toast.error("Please enter an idea before generating.");
    }

    const data = await runGenerateMetadata(idea);

    if (!data?.description) {
      return toast.error("AI couldn’t generate project details. Please try again.");
    }

    if (!title) setTitle(data.title);
    setDescription(data.description);
  }, [idea, title, runGenerateMetadata]);

  const handleSubmit = useCallback(async () => {
    if (!idea) {
      return toast.error("Please enter an idea before creating a project.");
    }

    if (!title || !description) {
      if (title && !description) {
        toast.message("Generating description...");
        const data = await runGenerateMetadata(idea);
        if (!data?.description) {
          return toast.error("AI couldn’t generate description. Please try again.");
        }
        setDescription(data.description);

        await createProject({ title, description: data.description });
        return;
      }

      return toast.error("Please generate details before creating.");
    }

    await createProject({ title, description });
  }, [idea, title, description, runGenerateMetadata, createProject]);

  const handleCancel = () => {
    setOpen(false);
    setIdea("");
    setTitle("");
    setDescription("");
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen(true);
      } else if (open && (e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (open && e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleSubmit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>Start a new project</DialogTitle>
          <DialogDescription>
            Describe your idea briefly — AI will generate a suitable name and description for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          {/* Idea */}
          <div className="grid gap-1">
            <Label htmlFor="idea">
              Your idea <span className="text-destructive/80 text-xl">*</span>
            </Label>
            <Input
              id="idea"
              placeholder="e.g. AI Powered TODO Application"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              required
            />
          </div>

          {/* Name */}
          <div className="grid gap-1">
            <Label htmlFor="name">
              Project Title <span className="text-destructive/80 text-xl">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Generate with AI (or enter your own)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground text-xs tracking-tight">
                ( auto generated )
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Auto Generated by AI"
              rows={3}
              disabled
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
            <kbd className="bg-muted ml-1 rounded px-1.5 py-0.5 font-mono text-xs">Esc</kbd>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isGeneraing || !idea}
            onClick={handleGenerate}
            className={cn(
              "relative flex items-center gap-2 overflow-hidden rounded-md transition-all",
              "focus-visible:ring-primary/40 focus:outline-none focus-visible:ring-2",
              isGeneraing && "cursor-wait shadow-inner",
              !isGeneraing && "hover:shadow-md active:scale-[0.98]"
              // disabled && "bg-muted/50 cursor-not-allowed opacity-70"
            )}
          >
            {/* Shimmer overlay when generating */}
            <AnimatePresence>
              {isGeneraing && (
                <motion.div
                  key="shimmer"
                  className="via-primary/10 absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Icon */}
            <motion.div
              className={cn(
                "relative flex items-center justify-center rounded-full",
                isGeneraing
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 group-hover:text-primary transition-colors"
              )}
              animate={{
                scale: isGeneraing ? [1, 1.05, 1] : 1,
                opacity: isGeneraing ? [1, 0.85, 1] : 1,
              }}
              transition={
                isGeneraing
                  ? { duration: 1.6, ease: "easeInOut", repeat: Infinity }
                  : { duration: 0.2 }
              }
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>

            {/* Text / Spinner transition */}
            <AnimatePresence mode="wait" initial={false}>
              {isGeneraing ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Spinner className="scale-90" />
                </motion.div>
              ) : (
                <motion.span
                  key="label"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium"
                >
                  Generate
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !idea || !title}>
            {isSubmitting ? (
              <div>
                <Spinner />
              </div>
            ) : (
              "Create project"
            )}
            <kbd className="bg-muted/10 ml-1 rounded px-1.5 py-0.5 font-mono text-xs">
              <CornerDownLeft />
            </kbd>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NewProjectCard = () => {
  return (
    <Card className="group border-border/70 bg-card relative flex h-68 w-full max-w-sm flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent)]" />
      </div>

      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="bg-primary/10 ring-primary/20 group-hover:ring-primary/40 relative flex size-10 items-center justify-center rounded-xl ring-1 transition group-hover:scale-110">
            <span className="border-primary/30 absolute inset-0 rounded-xl border-2 border-dashed" />
            <Plus className="text-primary relative z-10 size-5" />
          </span>
          <span className="text-foreground">Start a new project</span>
        </CardTitle>
      </CardHeader>

      <div className="mt-auto flex flex-col gap-6">
        <CardContent>
          <p className="text-muted-foreground text-sm leading-snug">
            Turn your idea into a real project — instantly. Describe your idea and let AI generate
            title and description for you.
          </p>
        </CardContent>

        <CardFooter className="border-border flex items-center justify-between border-t pt-3">
          <NewProjectDialog />
          <span className="text-muted-foreground text-xs">
            Shortcut:{" "}
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>P</Kbd>
            </KbdGroup>
          </span>
        </CardFooter>
      </div>
    </Card>
  );
};

export default NewProjectCard;
