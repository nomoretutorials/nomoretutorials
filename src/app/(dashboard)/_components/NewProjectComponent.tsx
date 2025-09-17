'use client'

import {
  Card,
  CardFooter,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { Textarea } from "@/components/ui/textarea";

// TODO: Add Form Integration in the Dialog

const NewProjectDialog = () => {
  const [open, setOpen] = React.useState(false);

  // Keyboard shortcut handler: Ctrl+P / Cmd+P
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            <Input id="idea" placeholder="e.g. AI Powered TODO Application" />
          </div>

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" placeholder="TodoGPT" />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            variant="secondary"
            className="flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </Button>
          <Button type="submit">Create project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NewProjectCard = () => {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* subtle gradient top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/15 to-transparent"
      />
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Plus className="size-5" />
          </span>
          Start a new project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Spin up a blank project. You can add stacks and integrations any time.
        </p>
      </CardContent>
      <CardFooter className="border-t border-border flex items-center justify-between">
        <NewProjectDialog />
        <span className="text-xs text-muted-foreground">
          Shortcut: <kbd className="rounded bg-muted px-1 py-0.5">Ctrl + P</kbd>
        </span>
      </CardFooter>
    </Card>
  );
};

export default NewProjectCard;
