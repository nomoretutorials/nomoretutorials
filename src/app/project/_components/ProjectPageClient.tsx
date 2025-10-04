"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { saveProjectConfiguration, saveSelectedFeatures } from "@/actions/project-actions";
import { featureSelectionSchema, techStackSelectionSchema } from "@/schemas/project-schema";
import { useProjectStore } from "@/store/project-store";
import { Project, TechStack } from "@/types/project";
import { parseStepFeatures } from "@/utils/project-step-utils";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ChangeStep from "./ChangeStep";
import Sidebar from "./sidebar/Sidebar";
import StepContentView, { StepContent } from "./StepContentView";
import TechStackSelection from "./TechStackSelection";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

// TODO: Implement Zustand for State management
// TODO: Selected step index goes to negative on step change.

type Props = {
  project: Project;
  techStacks: TechStack[];
};

export default function ProjectPageClient({ project, techStacks }: Props) {
  const router = useRouter();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const {
    selectedStepIndex,
    selectedFeatures,
    selectedTechStacks,
    isSaving,
    error,
    hasUnsavedChanges,
    setSelectedStepIndex,
    toggleFeature,
    toggleTechStack,
    setIsSaving,
    setError,
    setHasUnsavedChanges,
    resetState,
  } = useProjectStore();

  const currentStep = useMemo(() => {
    if (selectedStepIndex < 0 || selectedStepIndex >= project.Steps.length) {
      setSelectedStepIndex(0);
      return project.Steps[0];
    }
    return project.Steps[selectedStepIndex];
  }, [project.Steps, selectedStepIndex, setSelectedStepIndex]);

  const features = useMemo(() => {
    if (currentStep?.index == 0) {
      return parseStepFeatures(currentStep.content);
    }
    return [];
  }, [currentStep]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Push a dummy state when there are unsaved changes
    window.history.pushState(null, "", window.location.href);

    const preventBackNavigation = (e: PopStateEvent) => {
      // Push state again to stay on current page
      window.history.pushState(null, "", window.location.href);
      // Show the dialog
      setShowUnsavedDialog(true);
    };

    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, [hasUnsavedChanges]);

  const handleSaveAndContinue = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (selectedStepIndex === 0) {
        const validation = featureSelectionSchema.safeParse({
          projectId: project.id,
          selectedFeatures,
        });

        if (!validation.success) {
          console.log("Zod Errors: ", validation.error);
          setError(validation.error.message);
        }
        await saveSelectedFeatures(project.id, selectedFeatures);
        setHasUnsavedChanges(false);
        setSelectedStepIndex(1);
      } else if (selectedStepIndex === 1) {
        const validation = techStackSelectionSchema.safeParse({
          projectId: project.id,
          selectedFeatures,
          selectedTechStacks,
        });

        if (!validation.success) {
          setError(validation.error.message);
          return;
        }
        await saveProjectConfiguration(project.id, selectedFeatures, selectedTechStacks);
        setHasUnsavedChanges(false);
        setSelectedStepIndex(2);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save. Please try again.";
      setError(errorMessage);
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedStepIndex,
    project.id,
    selectedFeatures,
    selectedTechStacks,
    setIsSaving,
    setError,
    setHasUnsavedChanges,
    setSelectedStepIndex,
  ]);

  const handleBackToDashboard = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      resetState();
      router.push("/");
    }
  }, [hasUnsavedChanges, router, resetState]);

  const handleConfirmNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    setHasUnsavedChanges(false); // Clear this FIRST so the popstate listener doesn't interfere
    resetState();

    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      router.back();
    }, 0);
  }, [resetState, router, setHasUnsavedChanges]);

  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    // User wants to stay, push state again to maintain position
    window.history.pushState(null, "", window.location.href);
  }, []);

  const handleStepSelect = useCallback(
    (index: number) => {
      if (index < 0 || index >= project.Steps.length) {
        return;
      }
      setSelectedStepIndex(index);
    },
    [project.Steps.length, setSelectedStepIndex]
  );

  return (
    <>
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={(open) => {
          if (!open) {
            // Dialog closed without confirming - user wants to stay
            setShowUnsavedDialog(false);
            window.history.pushState(null, "", window.location.href);
          }
        }}
        onConfirm={handleConfirmNavigation}
      />
      <div className="h-lvh overflow-hidden p-2">
        <div className="bg-background h-full overflow-hidden rounded-2xl border px-0 py-0 shadow-sm">
          <div className="flex h-full">
            <Sidebar
              steps={project.Steps}
              title={project.title}
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

                      {/* TODO: select all button */}
                      {/* Step 1: Features */}
                      {currentStep.index === 0 && (
                        <>
                          {currentStep.status === "PENDING" && (
                            <div className="py-12 text-center">
                              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                              <p className="text-muted-foreground">Generating features...</p>
                            </div>
                          )}

                          {currentStep.status === "COMPLETED" && features.length > 0 && (
                            <>
                              <p className="text-muted-foreground mb-4 text-base font-medium">
                                Select the features you want to include in your project
                              </p>

                              {selectedFeatures.length > 0 && (
                                <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 shadow-sm">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    {selectedFeatures.length}
                                  </span>
                                  <p className="text-sm font-medium text-blue-800">
                                    Feature
                                    {selectedFeatures.length > 1 ? "s" : ""} selected
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-col space-y-3">
                                {features.map((feature) => {
                                  const isSelected = selectedFeatures.includes(feature.id);
                                  return (
                                    <div
                                      key={feature.id}
                                      className={`group hover:border-primary/40 relative flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:shadow-sm ${isSelected ? "border-primary bg-primary/5" : "border-muted"}`}
                                      onClick={() => toggleFeature(feature.id)}
                                    >
                                      <Checkbox
                                        id={feature.id}
                                        checked={isSelected}
                                        onClick={(e) => e.stopPropagation()}
                                        onCheckedChange={() => toggleFeature(feature.id)}
                                        className="mt-1"
                                      />
                                      <div className="flex-1">
                                        <Label
                                          htmlFor={feature.id}
                                          className="cursor-pointer text-base leading-tight font-semibold"
                                        >
                                          {feature.name}
                                        </Label>
                                        <p className="text-muted-foreground mt-1 text-sm leading-snug">
                                          {feature.description}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {currentStep.index === 1 && (
                        <TechStackSelection
                          techStacks={techStacks}
                          selectedTechStacks={selectedTechStacks}
                          onToggleTechStack={toggleTechStack}
                        />
                      )}

                      {currentStep.index >= 2 && (
                        <>
                          {currentStep.status === "PENDING" && (
                            <div className="py-12 text-center">
                              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                              <p className="text-muted-foreground">Loading step content...</p>
                            </div>
                          )}

                          {currentStep.status === "GENERATING" && (
                            <div className="py-12 text-center">
                              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                              <p className="text-muted-foreground">
                                AI is generating content for this step...
                              </p>
                            </div>
                          )}

                          {currentStep.status === "COMPLETED" && currentStep.content && (
                            <StepContentView content={currentStep.content as StepContent} />
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No steps available yet</p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleBackToDashboard}
                className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
                size={"sm"}
                variant={"link"}
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
