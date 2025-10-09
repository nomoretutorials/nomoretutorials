import { Prisma } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  index: number;
  title: string;
  status: string;
  content: Prisma.JsonValue;
  isCompleted: boolean;
};

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
      
      <div className="space-y-1.5">
        {visibleSteps.map((step) => (
          <StepButton
            key={step.index}
            step={step}
            isActive={currentStepIndex === step.index}
            onClick={() => onStepSelect(step.index)}
          />
        ))}
      </div>

      {hasGeneratedSteps ? (
        <div className="space-y-1.5 border-t pt-3">
          {remainingSteps.map((step) => (
            <StepButton
              key={step.id}
              step={step}
              isActive={currentStepIndex === step.index}
              onClick={() => onStepSelect(step.index)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-2 space-y-2 border-t pt-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      )}
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
        "w-full justify-start gap-3 rounded-md border border-border px-3 py-2 text-sm transition-colors",
        isActive
          ? "border-primary bg-secondary text-foreground"
          : "hover:border-border hover:bg-muted border-transparent"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
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
