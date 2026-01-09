"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import { useProjectStore } from "@/store/project-store-provider";
import { Feature, Project, TechStack, UserTechStack } from "@/types/project";
import { parseStepFeatures } from "@/utils/project-step-utils";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";
import { useProjectPolling } from "@/hooks/useProjectPolling";
import { useProjectSave } from "@/hooks/useProjectSave";
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
  userTechStack: UserTechStack[];
};

const ProjectPageClient = memo(function ProjectPageClient({
  project,
  techStacks,
  userTechStack,
}: Props) {
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
  } = useProjectStore((s) => s);

  // const { data: sseData, isConnected } = useProjectStream(project.id);
  const { project: projectData } = useProjectPolling(project.id);

  const currentProject = useMemo(() => {
    if (projectData) {
      console.log("Project Page Client", projectData);
      return {
        ...project,
        features: projectData.features || project.features,
        Steps: projectData.steps || project.Steps,
        status: projectData.status || project.Steps,
      };
    }

    return project;
  }, [project, projectData]);

  const steps = useMemo(() => currentProject!.Steps || [], [currentProject]);
  const features: Feature[] =
    !currentProject || !currentProject.features
      ? []
      : (currentProject.features as unknown as Feature[]);

  console.log("Step", steps);

  const {
    showUnsavedDialog,
    handleBackToDashboard,
    handleConfirmNavigation,
    handleDialogOpenChange,
  } = useProjectNavigation();

  const { handleSaveAndContinue } = useProjectSave(project.id);

  // Memoize expensive calculations
  const currentStep = useMemo(() => {
    if (!steps.length) return null;
    return steps[selectedStepIndex] ?? steps[0];
  }, [steps, selectedStepIndex]);

  console.log("Current Step", currentStep);

  // const features = useMemo(() => {
  //   if (currentStep?.index === 0) {
  //     return parseStepFeatures(currentStep.content);
  //   }
  //   return [];
  // }, [currentStep]);

  // Memoize callback functions
  const handleStepSelect = useCallback(
    (index: number) => {
      setSelectedStepIndex(index);
    },
    [setSelectedStepIndex]
  );

  const areStepsLocked = useMemo(() => {
    return steps.length > 2;
  }, [steps]);

  useEffect(() => {
    if (steps.length > 0 && (selectedStepIndex < 0 || selectedStepIndex >= steps.length)) {
      setSelectedStepIndex(0);
    }
  }, [selectedStepIndex, steps, setSelectedStepIndex]);

  useEffect(() => {
    return () => {
      if (isNavigating) {
        resetState();
      }
    };
  }, [resetState, isNavigating, setSelectedStepIndex]);

  const handleNext = async () => {
    const nextStep = selectedStepIndex + 1;

    // Instantly update UI
    setSelectedStepIndex(nextStep);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/project/${project.id}/steps/${nextStep}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Generation": "true",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Step transition failed:", err);
      }
    } catch (error) {
      console.error("Step transition error:", error);
    }
  };

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
              steps={steps}
              title={currentProject.title}
              repoUrl={currentProject.repositoryUrl!}
              currentStepIndex={selectedStepIndex}
              onStepSelect={handleStepSelect}
            />

            <main className="relative flex h-full min-h-full flex-1 flex-col overflow-y-auto">
              <div className="mx-auto ml-10 w-[700px] flex-1 p-8">
                <div className="space-y-6">
                  {/* SSE Connection Status */}
                  {/* <div className="rounded-lg border bg-gray-50 p-2">
                    <div className="text-xs text-gray-600">
                      SSE Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                    </div>
                  </div> */}
                  {currentStep ? (
                    <div className="space-y-4">
                      <h2 className="mb-6 border-b pb-2 text-2xl font-bold">
                        Step {currentStep.index} - {currentStep.title}
                      </h2>

                      {currentStep.index === 0 && (
                        <FeatureSelection
                          features={features}
                          selectedFeatures={selectedFeatures}
                          onToggleFeature={toggleFeature}
                        />
                      )}

                      {currentStep.index === 1 && (
                        <TechStackSelection
                          techStacks={techStacks}
                          userTechStack={userTechStack}
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
                totalSteps={steps.length}
                selectedFeatures={selectedFeatures}
                selectedTechStacks={selectedTechStacks}
                onNext={handleNext}
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
