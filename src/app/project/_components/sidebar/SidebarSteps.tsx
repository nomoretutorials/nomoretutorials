import { Prisma } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  const hasGeneratedSteps = remainingSteps.length > 0 && remainingSteps[0].status !== "PENDING";

  return (
    <div className="space-y-2">
      <h2 className="mb-3 text-sm font-semibold">Project Steps</h2>

      {visibleSteps.map((step) => (
        <Button
          key={step.id}
          variant={currentStepIndex === step.index ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onStepSelect(step.index)}
        >
          <span className="flex-1 text-left">{step.title}</span>
        </Button>
      ))}

      {/* Show skeleton loaders OR actual remaining steps */}
      {hasGeneratedSteps ? (
        remainingSteps.map((step) => (
          <Button
            key={step.id}
            variant={currentStepIndex === step.index ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onStepSelect(step.index)}
          >
            <span
              className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                step.isCompleted
                  ? "bg-green-500 text-white"
                  : step.status === "COMPLETED"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200"
              }`}
            >
              {step.isCompleted ? "✓" : step.index + 1}
            </span>
            <span className="flex-1 text-left">{step.title}</span>
          </Button>
        ))
      ) : (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarSteps;
