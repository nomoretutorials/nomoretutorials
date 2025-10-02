import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  currentStepIndex: number;
  totalSteps: number;
  selectedFeatures?: string[];
  onNext: () => void;
  onPrev: () => void;
  onSaveAndContinue?: () => Promise<void>;
};

const ChangeStep = ({
  currentStepIndex,
  totalSteps,
  selectedFeatures = [],
  onNext,
  onPrev,
  onSaveAndContinue,
}: Props) => {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex >= totalSteps - 1;

  const isFeatureStep = currentStepIndex === 0;
  const canProceedFromFeatures = selectedFeatures.length > 0;

  const handleNext = async () => {
    if (isFeatureStep && onSaveAndContinue) {
      await onSaveAndContinue();
    } else {
      onNext();
    }
  };
  return (
    <div className="bg-background border-border sticky right-0 bottom-0 left-0 flex h-16 items-center justify-between border-t p-4 shadow-[0_8px_60px_rgba(0,0,0,0.8)]">
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
        disabled={isLastStep || (isFeatureStep && !canProceedFromFeatures)}
      >
        <span>{isFeatureStep ? "Save & Continue" : "Next Step"}</span>
        <ArrowRight />
      </Button>
    </div>
  );
};

export default ChangeStep;
