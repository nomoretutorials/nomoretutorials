import StepContentView, { StepContent } from "./StepContentView";

type Step = {
  index: number;
  status: string;
  content?: unknown;
};

type Props = {
  step: Step;
  children?: React.ReactNode;
};

export default function StepContentRenderer({ step, children }: Props) {
  if (step.status === "PENDING") {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-muted-foreground">Loading step content...</p>
      </div>
    );
  }

  if (step.status === "GENERATING") {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-muted-foreground">AI is generating content for this step...</p>
      </div>
    );
  }

  if (step.status === "COMPLETED" && children) {
    return <>{children}</>;
  }

  if (step.status === "COMPLETED" && step.content) {
    return <StepContentView content={step.content as StepContent} />;
  }

  return null;
}
