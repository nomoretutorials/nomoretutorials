"use client";

import { useEffect, useMemo } from "react";
import { useProjectStore } from "@/store/project-store";
import { Project, TechStack } from "@/types/project";
import { parseStepFeatures } from "@/utils/project-step-utils";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";
import { useProjectSave } from "@/hooks/useProjectSave";
import Sidebar from "../sidebar/Sidebar";
import UnsavedChangesDialog from "../UnsavedChangesDialog";
import ChangeStep from "./ChangeStep";
import FeatureSelection from "./FeatureSelection";
import StepContentRenderer from "./StepContentRenderer";
import TechStackSelection from "./TechStackSelection";

type Props = {
  project: Project;
  techStacks: TechStack[];
};

export default function ProjectPageClient({ project, techStacks }: Props) {
  const {
    selectedStepIndex,
    selectedFeatures,
    selectedTechStacks,
    toggleFeature,
    toggleTechStack,
    setSelectedStepIndex,
  } = useProjectStore();

  const {
    showUnsavedDialog,
    handleBackToDashboard,
    handleConfirmNavigation,
    handleDialogOpenChange,
  } = useProjectNavigation();

  const { handleSaveAndContinue } = useProjectSave(project.id);

  useEffect(() => {
    if (selectedStepIndex < 0 || selectedStepIndex >= project.Steps.length) {
      setSelectedStepIndex(0);
    }
  }, [selectedStepIndex, project.Steps.length, setSelectedStepIndex]);

  const currentStep = project.Steps[selectedStepIndex] ?? project.Steps[0];

  const features = useMemo(() => {
    if (currentStep?.index === 0) {
      return parseStepFeatures(currentStep.content);
    }
    return [];
  }, [currentStep]);

  return (
    <>
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={handleDialogOpenChange}
        onConfirm={handleConfirmNavigation}
      />

      <div className="h-lvh overflow-hidden p-2">
        <div className="bg-background h-full overflow-hidden rounded-2xl border px-0 py-0 shadow-sm">
          <div className="flex h-full">
            <Sidebar
              steps={project.Steps}
              title={project.title}
              repoUrl={project.repositoryUrl!}
              currentStepIndex={selectedStepIndex}
              onStepSelect={setSelectedStepIndex}
            />

            <main className="relative flex h-full min-h-full flex-1 flex-col overflow-y-auto">
              <div className="mx-auto ml-10 w-4xl flex-1 p-8">
                <div className="space-y-6">
                  {currentStep ? (
                    <div className="space-y-4">
                      <h2 className="mb-6 h-10 border-b text-2xl font-bold">
                        Step {currentStep.index} - {currentStep.title}
                      </h2>

                      {currentStep.index === 0 && (
                        <StepContentRenderer step={currentStep}>
                          <FeatureSelection
                            features={features}
                            selectedFeatures={selectedFeatures}
                            onToggleFeature={toggleFeature}
                          />
                        </StepContentRenderer>
                      )}

                      {currentStep.index === 1 && (
                        <TechStackSelection
                          techStacks={techStacks}
                          selectedTechStacks={selectedTechStacks}
                          onToggleTechStack={toggleTechStack}
                        />
                      )}

                      {currentStep.index >= 2 && <StepContentRenderer step={currentStep} />}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No steps available yet</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleBackToDashboard}
                className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
                size="sm"
                variant="link"
              >
                <ArrowLeft />
                Back to Dashboard
              </Button>

              <ChangeStep
                currentStepIndex={selectedStepIndex}
                totalSteps={project.Steps.length}
                selectedFeatures={selectedFeatures}
                selectedTechStacks={selectedTechStacks}
                onNext={() => setSelectedStepIndex(selectedStepIndex + 1)}
                onPrev={() => setSelectedStepIndex(selectedStepIndex - 1)}
                onSaveAndContinue={handleSaveAndContinue}
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
