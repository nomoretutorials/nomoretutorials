"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { parseProjectMetadataAgent } from "@/actions/ai/parse-project-metadata-agent";
import { createNewProject } from "@/actions/project-actions";
import * as Sentry from "@sentry/nextjs";
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

// TODO: fix submit on enter. currently pressing enter submits even if on title or description. change it to ctrl + enter.

const NewProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!idea) return toast.error("Please enter an idea to generate project details.");

    setIsGenerating(true);

    Sentry.addBreadcrumb({
      category: "ai",
      message: "User generating project metadata with AI",
      level: "info",
      data: {
        idea: idea.length,
      },
    });

    try {
      const { title: genTitle, description: genDescription } =
        await parseProjectMetadataAgent(idea);

      if (!title) setTitle(genTitle);
      if (!description) setDescription(genDescription);

      Sentry.addBreadcrumb({
        category: "ai",
        message: "AI generation successful",
        level: "info",
      });

      toast.success("Generated project details!");
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          component: "NewProjectDialog",
          operation: "ai_generate",
        },
        extra: {
          ideaLength: idea.length,
          hasTitle: !!title,
          hasDescription: !!description,
        },
      });

      toast.error("Error generating project details.");
    } finally {
      setIsGenerating(false);
    }
  }, [idea, title, description]);

  const handleSubmit = useCallback(async () => {
    if (!title || !description)
      return toast.error("Please fill in title and description before submitting.");

    Sentry.addBreadcrumb({
      category: "project",
      message: "User creating new project",
      level: "info",
      data: {
        titleLength: title.length,
        descriptionLength: description.length,
      },
    });

    setIsSubmitting(true);
    try {
      const response = await createNewProject({
        title,
        description,
      });

      if (!response.success) {
        Sentry.captureException(new Error("Failed to create project in database"), {
          tags: {
            component: "NewProjectDialog",
            operation: "create_project",
          },
          extra: {
            response,
            title,
            descriptionLength: description.length,
          },
        });
        return toast.error("Error creating project in database");
      }

      const { projectId } = response.data;

      Sentry.addBreadcrumb({
        category: "project",
        message: "Project created successfully",
        level: "info",
        data: {
          projectId,
        },
      });

      router.push(`/project/${projectId}`);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          component: "NewProjectDialog",
          operation: "create_project",
        },
        extra: {
          title,
          descriptionLength: description.length,
        },
      });
      toast.error("Error creating project.");
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, router]);

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

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Enter your idea, and let AI generate details for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          {/* Idea */}
          <div className="grid gap-2">
            <Label htmlFor="idea">Idea</Label>
            <Input
              id="idea"
              placeholder="e.g. AI Powered TODO Application"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
          </div>

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="TodoGPT"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description..."
              rows={3}
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
            className="flex items-center gap-1"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? (
              <div>
                <Spinner />
              </div>
            ) : (
              "Generate"
            )}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <div>
                <Spinner />
              </div>
            ) : (
              "Generate"
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
          <p className="text-muted-foreground text-base leading-snug">
            Kick off a fresh project powered by AI. Choose features and tech stack and start building right away.
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
