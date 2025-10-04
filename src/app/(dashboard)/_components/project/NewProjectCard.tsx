"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { parseProjectMetadataAgent } from "@/actions/ai/parseProjectMetadataAgent";
import { createNewProject } from "@/actions/projectActions";
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
import { Textarea } from "@/components/ui/textarea";

// TODO: Add Form Integration in the Dialog
// TODO: fix submit on enter. currently pressing enter submits even if on title or description. change it to ctrl + enter.

const NewProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      let finalTitle = title;
      let finalDescription = description;

      if (!finalTitle || !finalDescription) {
        if (!idea) {
          return toast.error("Please enter an idea to generate project.");
        }
        const { title: genTitle, description: genDescription } =
          await parseProjectMetadataAgent(idea);

        finalTitle = genTitle;
        finalDescription = genDescription;

        setTitle(finalTitle);
        setDescription(finalDescription);
      }

      const { project } = await createNewProject({
        title: finalTitle,
        description: finalDescription,
      });

      if (!project) return toast.error("Error creating project in database");

      router.push(`/project/${project.id}`);
    } catch {
      return toast.error("Error creating project.");
    }
  };

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
  }, [open]);

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
            onClick={handleSubmit}
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Create project
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
    <Card className="group border-border/70 bg-card relative flex h-64 w-full max-w-sm flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
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
            Kick off a fresh project powered by AI. Add stacks and integrations anytime — no setup
            required.
          </p>
        </CardContent>

        <CardFooter className="border-border flex items-center justify-between border-t pt-3">
          <NewProjectDialog />
          <span className="text-muted-foreground text-xs">
            Shortcut:{" "}
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </span>
        </CardFooter>
      </div>
    </Card>
  );
};

export default NewProjectCard;
