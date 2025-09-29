"use client";

import React, { useState, useTransition } from "react";
import { generateProjectMetadata } from "@/actions/ai/generateProjectMetadata";
import { createNewProject } from "@/actions/project/createNewProject";
import { CornerDownLeft, Plus, Sparkles } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// TODO: Add Form Integration in the Dialog
// TODO: fix submit on enter. currently pressing enter submits even if on title or description. change it to ctrl + enter.

const NewProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const generateMetadata = () => {
    startTransition(async () => {
      try {
        const { title, description } = await generateProjectMetadata(idea);
        setTitle(title || "");
        setDescription(description || "");
      } catch (error) {
        console.error("Failed to generate metadata:", error);
      }
    });
  };

  const handleSubmit = async () => {
    try {
      await createNewProject({ title, description });
      console.log(idea, title, description);
      setOpen(false);
    } catch {
      throw new Error("Error creating project.");
    }
  };

  const handleCancel = () => {
    console.log("Project creation cancelled");
    setOpen(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen(true);
      } else if (open && e.key === "Enter") {
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
            onClick={generateMetadata}
            disabled={isPending}
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
    <Card className="relative h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* subtle gradient top */}
      <div
        aria-hidden
        className="from-primary/15 pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b to-transparent"
      />
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="bg-primary/15 text-primary ring-primary/30 inline-flex size-9 items-center justify-center rounded-lg ring-1">
            <Plus className="size-5" />
          </span>
          Start a new project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Spin up a blank project. You can add stacks and integrations any time.
        </p>
      </CardContent>
      <CardFooter className="border-border flex items-center justify-between border-t">
        <NewProjectDialog />
        <span className="text-muted-foreground text-xs">
          Shortcut: <kbd className="bg-muted rounded px-1 py-0.5">Ctrl + P</kbd>
        </span>
      </CardFooter>
    </Card>
  );
};

export default NewProjectCard;
