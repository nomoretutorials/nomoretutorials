"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";
import React, { useState } from "react";

const NewStackDialog = () => {
  const [open, setOpen] = useState(true);

  const handleSubmit = () => {
    console.log("Form submitted");
    setOpen(false);
  };

  const handleSkip = () => {
    console.log("Skipped");
    setOpen(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Tell us about your tech stack
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select the tools you are familiar with.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Frontend */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Frontend</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox id="frontend-react" />
                <span className="text-sm">React</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox id="frontend-next" />
                <span className="text-sm">Next.js</span>
              </label>
            </div>
          </div>

          {/* Backend */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Backend</Label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox id="backend-next" />
                <span className="text-sm">Next.js</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox id="backend-express" />
                <span className="text-sm">Express.js</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox id="backend-hono" />
                <span className="text-sm">Hono.js</span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleSkip}>
            Skip for Now
            <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              Esc
            </kbd>
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Create project
            <kbd className="ml-1 rounded bg-muted/10 px-1.5 py-0.5 text-xs font-mono">
              <CornerDownLeft />
            </kbd>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewStackDialog;
