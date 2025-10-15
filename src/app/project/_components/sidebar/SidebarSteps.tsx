"use client";

import { Step } from "@/types/project";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SidebarStepsProps = {
  steps: Step[];
  currentStepIndex: number;
  onStepSelect: (index: number) => void;
};

const SidebarSteps = ({ steps, currentStepIndex, onStepSelect }: SidebarStepsProps) => {
  const visibleSteps = steps.slice(0, 2);
  const remainingSteps = steps.slice(2);
  const hasGeneratedSteps = remainingSteps.length > 0;

  return (
    <div className="space-y-3">
      <h2 className="text-muted-foreground my-3 text-xs font-medium tracking-wide uppercase">
        Project Steps
      </h2>

      {/* First two static steps */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {visibleSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <StepButton
                step={step}
                isActive={currentStepIndex === step.index}
                onClick={() => onStepSelect(step.index)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Remaining steps or skeletons */}
      <div className="space-y-1.5 border-t pt-3">
        <AnimatePresence mode="popLayout">
          {hasGeneratedSteps ? (
            remainingSteps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <StepButton
                  step={step}
                  isActive={currentStepIndex === step.index}
                  onClick={() => onStepSelect(step.index)}
                />
              </motion.div>
            ))
          ) : (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Skeleton className="h-8 w-full rounded-md" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function StepButton({
  step,
  isActive,
  onClick,
}: {
  step: Step;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "border-border w-full justify-start gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
        isActive
          ? "border-primary bg-secondary text-foreground"
          : "hover:border-border hover:bg-muted border-transparent"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all duration-200",
          step.isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {step.isCompleted ? "✓" : step.index}
      </span>
      <span className="truncate">{step.title}</span>
    </Button>
  );
}

export default SidebarSteps;
