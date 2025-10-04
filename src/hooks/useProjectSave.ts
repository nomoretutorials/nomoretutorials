import { useCallback } from "react";
import { saveProjectConfiguration, saveSelectedFeatures } from "@/actions/project-actions";
import { featureSelectionSchema, techStackSelectionSchema } from "@/schemas/project-schema";
import { useProjectStore } from "@/store/project-store";

export function useProjectSave(projectId: string) {
  const {
    selectedStepIndex,
    selectedFeatures,
    selectedTechStacks,
    setIsSaving,
    setError,
    setHasUnsavedChanges,
    setSelectedStepIndex,
  } = useProjectStore();

  const handleSaveAndContinue = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (selectedStepIndex === 0) {
        const validation = featureSelectionSchema.safeParse({
          projectId,
          selectedFeatures,
        });

        if (!validation.success) {
          console.error("Validation errors:", validation.error);
          setError(validation.error.message);
          return;
        }

        await saveSelectedFeatures(projectId, selectedFeatures);
        setHasUnsavedChanges(false);
        setSelectedStepIndex(1);
      } else if (selectedStepIndex === 1) {
        const validation = techStackSelectionSchema.safeParse({
          projectId,
          selectedFeatures,
          selectedTechStacks,
        });

        if (!validation.success) {
          setError(validation.error.message);
          return;
        }

        await saveProjectConfiguration(projectId, selectedFeatures, selectedTechStacks);
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
    projectId,
    selectedFeatures,
    selectedTechStacks,
    setIsSaving,
    setError,
    setHasUnsavedChanges,
    setSelectedStepIndex,
  ]);

  return { handleSaveAndContinue };
}
