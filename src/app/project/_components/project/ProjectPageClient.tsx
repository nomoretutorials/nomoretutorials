"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import { useProjectStore } from "@/store/project-store";
import { Project, TechStack } from "@/types/project";
import { parseStepFeatures } from "@/utils/project-step-utils";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";
import { useProjectSave } from "@/hooks/useProjectSave";
import { useProjectStream } from "@/hooks/useProjectStream";
import ProjectStepLoader from "../ProjectStepLoader";
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

const ProjectPageClient = memo(function ProjectPageClient({ project, techStacks }: Props) {
  const {
    selectedStepIndex,
    selectedFeatures,
    selectedTechStacks,
    toggleFeature,
    toggleTechStack,
    setSelectedStepIndex,
    isNavigating,
    resetState,
    isSaving,
  } = useProjectStore();

  const { data: sseData, isConnected } = useProjectStream(project.id);

  const currentProject = useMemo(() => {
    if (sseData) {
      return {
        ...project,
        features: sseData.features,
        Steps: sseData.steps,
        status: sseData.status,
      };
    }
    return project;
  }, [project, sseData]);

  const {
    showUnsavedDialog,
    handleBackToDashboard,
    handleConfirmNavigation,
    handleDialogOpenChange,
  } = useProjectNavigation();

  useEffect(() => {
    console.log("Selected step changed:", selectedStepIndex);
  }, [selectedStepIndex]);

  const { handleSaveAndContinue } = useProjectSave(project.id);

  // Memoize expensive calculations
  const currentStep = useMemo(() => {
    return currentProject.Steps![selectedStepIndex] ?? currentProject.Steps![0];
  }, [currentProject.Steps, selectedStepIndex]);

  const features = useMemo(() => {
    if (currentStep?.index === 0) {
      return parseStepFeatures(currentStep.content);
    }
    return [];
  }, [currentStep]);

  // Memoize callback functions
  const handleStepSelect = useCallback(
    (index: number) => {
      setSelectedStepIndex(index);
    },
    [setSelectedStepIndex]
  );

  const areStepsLocked = useMemo(() => {
    return currentProject.Steps!.length > 2;
  }, [currentProject.Steps]);

  useEffect(() => {
    if (selectedStepIndex < 0 || selectedStepIndex >= currentProject.Steps!.length) {
      setSelectedStepIndex(0);
    }
  }, [selectedStepIndex, currentProject.Steps, setSelectedStepIndex]);

  useEffect(() => {
    return () => {
      if (isNavigating) {
        resetState();
      }
    };
  }, [resetState, isNavigating]);

  return (
    <>
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={handleDialogOpenChange}
        onConfirm={handleConfirmNavigation}
      />

      <div className="h-lvh overflow-hidden p-2">
        <div className="bg-background h-full overflow-hidden rounded-2xl border px-0 py-0 shadow-sm">
          <div className="relative flex h-full">
            {isSaving && (
              <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-xl">
                <ProjectStepLoader />
              </div>
            )}
            <Sidebar
              projectId={currentProject.id}
              steps={currentProject.Steps!}
              title={currentProject.title}
              repoUrl={currentProject.repositoryUrl!}
              currentStepIndex={selectedStepIndex}
              onStepSelect={handleStepSelect}
            />

            <main className="relative flex h-full min-h-full flex-1 flex-col overflow-y-auto">
              <div className="mx-auto ml-10 w-4xl flex-1 p-8">
                <div className="space-y-6">
                  {/* SSE Connection Status */}
                  <div className="rounded-lg border bg-gray-50 p-2">
                    <div className="text-xs text-gray-600">
                      SSE Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                    </div>
                  </div>
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
                disabled={isNavigating || isSaving}
                onClick={handleBackToDashboard}
                className="bg-background/80 text-muted-foreground hover:text-foreground fixed top-6 right-6 z-50 flex cursor-pointer items-center justify-center transition-colors"
                size="sm"
                variant="link"
              >
                {isNavigating ? (
                  <div className="text-center">
                    <Spinner className="text-foreground" />
                  </div>
                ) : (
                  <>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Dashboard
                  </>
                )}
              </Button>

              <ChangeStep
                currentStepIndex={selectedStepIndex}
                totalSteps={currentProject.Steps!.length}
                selectedFeatures={selectedFeatures}
                selectedTechStacks={selectedTechStacks}
                onNext={() => handleStepSelect(selectedStepIndex + 1)}
                onPrev={() => handleStepSelect(selectedStepIndex - 1)}
                onSaveAndContinue={handleSaveAndContinue}
                areStepsLocked={areStepsLocked}
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
});

export default ProjectPageClient;
