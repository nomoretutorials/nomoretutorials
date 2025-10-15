import FeaturesSkeleton from "./skeleton/FeaturesSkeleton";
import CompletedStepContent from "./skeleton/CompletedStepContent";
import FailedStepContent from "./skeleton/FailedStepContent";
import GeneratingContentSkeleton from "./skeleton/GeneratingContentSkeleton";
import WaitingForNextStep from "./skeleton/WaitingForNextStep";
import StepContentView from "./StepContentView";

type Step = {
  index: number;
  status: string;
  content?: unknown;
};

type Props = {
  step: Step;
  children?: React.ReactNode;
  onRetry?: () => void;
};

export default function StepContentRenderer({ step, children, onRetry }: Props) {
  switch (step.status) {
    case "PENDING":
      return step.index === 0 ? <FeaturesSkeleton /> : <WaitingForNextStep />;
    case "GENERATING":
      return (
        <div className="">
          <GeneratingContentSkeleton />
        </div>
      );
    case "COMPLETED":
      if (children) return <>{children}</>;
      if (step.content) return <StepContentView content={step.content as string} />;
      return <CompletedStepContent />;
    case "FAILED":
      return <FailedStepContent onRetry={onRetry} />;
    default:
      return null;
  }
}
