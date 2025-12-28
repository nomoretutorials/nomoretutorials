import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  currentStepIndex: number;
  totalSteps: number;
  selectedFeatures?: string[];
  selectedTechStacks?: string[];
  onNext: () => void;
  onPrev: () => void;
  onSaveAndContinue?: () => Promise<void>;
  areStepsLocked?: boolean;
};

const ChangeStep = ({
  currentStepIndex,
  totalSteps,
  selectedFeatures = [],
  selectedTechStacks = [],
  onNext,
  onPrev,
  onSaveAndContinue,
  areStepsLocked,
}: Props) => {
  const isFirstStep = currentStepIndex === 0;
  // const isLastStep = currentStepIndex >= totalSteps - 1;

  const isFeatureStep = currentStepIndex === 0;
  const isTechStackStep = currentStepIndex === 1;

  const canProceedFromFeatures = selectedFeatures.length > 0;
  const canProceedFromTechStack = selectedTechStacks.length > 0;

  const handleNext = async () => {
    try {
      if ((isFeatureStep || isTechStackStep) && !areStepsLocked && onSaveAndContinue) {
        await onSaveAndContinue();
      } else {
        onNext();
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="bg-background border-border sticky right-0 bottom-0 left-0 flex h-16 items-center justify-between border-t p-4 shadow-[0_0.5rem_3.75rem_rgba(0,0,0,0.8)]">
      <Button
        variant={"outline"}
        className="cursor-pointer rounded-sm"
        onClick={onPrev}
        disabled={isFirstStep}
      >
        <ArrowLeft />
        <span>Previous Step</span>
      </Button>
      <div className="text-muted-foreground text-sm">
        Step {currentStepIndex + 1} of {totalSteps || "..."}
      </div>
      <Button
        variant={"outline"}
        className="cursor-pointer rounded-sm rounded-br-xl"
        onClick={handleNext}
        disabled={
          !areStepsLocked &&
          ((isFeatureStep && !canProceedFromFeatures) ||
            (isTechStackStep && !canProceedFromTechStack))
        }
      >
        <span>
          {!areStepsLocked && (isFeatureStep || isTechStackStep) ? "Save & Continue" : "Next Step"}
        </span>
        <ArrowRight />
      </Button>
    </div>
  );
};

export default ChangeStep;
