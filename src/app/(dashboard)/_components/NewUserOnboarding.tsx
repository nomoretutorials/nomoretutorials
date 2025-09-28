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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { completeOnboarding } from "@/actions/user/completeOnboarding";

export interface onboardingPayload {
  experienceLevel: string;
  frontend: string[];
  backend: string[];
}

const NewStackDialog = () => {
  const [open, setOpen] = useState(true);

  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [frontend, setFrontend] = useState<string[]>([]);
  const [backend, setBackend] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggleStack = (
    stack: string,
    state: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (state.includes(stack)) {
      setState(state.filter((s) => s !== stack));
    } else {
      setState([...state, stack]);
    }
  };

  const handleSubmit = async () => {
    if (!experienceLevel) {
      setError("Please select your experience level");
      return;
    }

    setError("");

    const payload: onboardingPayload = {
      experienceLevel,
      frontend,
      backend,
    };

    try {
      await completeOnboarding(payload);
      setOpen(false);
    } catch (error) {
      console.error("Onboarding failed:", error);
      throw new Error("Error completing onboarding");
    }
  };

  const handleSkip = () => {
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
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Tell us about your tech stack
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select the tools you are familiar with.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Experience Level</Label>
            <RadioGroup
              value={experienceLevel ?? ""}
              onValueChange={(val) => {
                setExperienceLevel(val);
                setError("");
              }}
              className="flex items-center gap-3"
            >
              <label className="flex items-center gap-3 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <RadioGroupItem value="BEGINNER" id="beginner" />
                <Label htmlFor="beginner">Beginner</Label>
              </label>
              <label className="flex items-center gap-3 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <RadioGroupItem value="INTERMEDIATE" id="intermediate" />
                <Label htmlFor="intermediate">Intermediate</Label>
              </label>
            </RadioGroup>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <span className="text-xs text-muted-foreground">
              *generated content will be modified as per your selection.
            </span>
          </div>

          {/* Frontend */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Frontend</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox
                  id="frontend-react"
                  checked={frontend.includes("react")}
                  onCheckedChange={() =>
                    toggleStack("react", frontend, setFrontend)
                  }
                />
                <span className="text-sm">React</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox
                  id="frontend-next"
                  checked={frontend.includes("next")}
                  onCheckedChange={() =>
                    toggleStack("next", frontend, setFrontend)
                  }
                />
                <span className="text-sm">Next.js</span>
              </label>
            </div>
          </div>

          {/* Backend */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Backend</Label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox
                  id="backend-next"
                  checked={backend.includes("next")}
                  onCheckedChange={() =>
                    toggleStack("next", backend, setBackend)
                  }
                />
                <span className="text-sm">Next.js</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox
                  id="backend-express"
                  checked={backend.includes("express")}
                  onCheckedChange={() =>
                    toggleStack("express", backend, setBackend)
                  }
                />
                <span className="text-sm">Express.js</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-accent/50">
                <Checkbox
                  id="backend-hono"
                  checked={backend.includes("hono")}
                  onCheckedChange={() =>
                    toggleStack("hono", backend, setBackend)
                  }
                />
                <span className="text-sm">Hono.js</span>
              </label>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            *more stacks coming soon.
          </span>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleSkip}>
            Skip for Now
            <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              Esc
            </kbd>
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Submit
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
