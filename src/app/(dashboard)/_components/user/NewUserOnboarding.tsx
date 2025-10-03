"use client";

import { useState } from "react";
import { completeOnboarding } from "@/actions/userActions";
import { ExperienceLevel } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

export interface onboardingPayload {
  experienceLevel: ExperienceLevel;
  frontend: string[];
  backend: string[];
}

const NewStackDialog = () => {
  const [open, setOpen] = useState(true);

  const handleSubmit = async () => {
    try {
      await completeOnboarding();
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col items-start justify-center sm:max-w-[480px]">
        <DialogHeader>
          <div>Welcome</div>
        </DialogHeader>
        {/* TODO: Fill Content */}
        <Button className="justify-end" onClick={handleSubmit}>
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewStackDialog;
