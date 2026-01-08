import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface ProjectState {
  selectedStepIndex: number;
  selectedFeatures: string[];
  selectedTechStacks: string[];
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  isNavigating: boolean;
  isGenerated: boolean;
}

export interface ProjectActions {
  setSelectedStepIndex: (index: number) => void;
  toggleFeature: (featureId: string) => void;
  toggleTechStack: (stackId: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setIsNavigating: (isNavigating: boolean) => void;
  resetState: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsGenerated: (isGenerated: boolean) => void;
}

type ProjectStore = ProjectState & ProjectActions;

const initialState: ProjectState = {
  selectedStepIndex: 0,
  selectedFeatures: [],
  selectedTechStacks: [],
  isSaving: false,
  error: null,
  hasUnsavedChanges: false,
  isNavigating: false,
  isGenerated: false,
};

export const createProjectStore = (projectId: string) => {
  return create<ProjectStore>()(
    devtools(
      persist(
        (set) => ({
          ...initialState,

          setSelectedStepIndex: (index: number) => set({ selectedStepIndex: Math.max(0, index) }),

          setIsGenerated: (status: boolean) => set({ isGenerated: status }),

          toggleFeature: (featureId: string) =>
            set((state) => ({
              selectedFeatures: state.selectedFeatures.includes(featureId)
                ? state.selectedFeatures.filter((id) => id !== featureId)
                : [...state.selectedFeatures, featureId],
              hasUnsavedChanges: true,
            })),

          toggleTechStack: (stackId: string) =>
            set((state) => ({
              selectedTechStacks: state.selectedTechStacks.includes(stackId)
                ? state.selectedTechStacks.filter((id) => id !== stackId)
                : [...state.selectedTechStacks, stackId],
              hasUnsavedChanges: true,
            })),

          setIsSaving: (isSaving: boolean) => set({ isSaving }),

          setError: (error: string | null) => set({ error }),

          setHasUnsavedChanges: (hasChanges: boolean) => set({ hasUnsavedChanges: hasChanges }),

          resetState: () =>
            set(() => ({
              isSaving: initialState.isSaving,
              hasUnsavedChanges: initialState.hasUnsavedChanges,
              isNavigating: initialState.isNavigating,
              error: initialState.error,
            })),

          nextStep: () =>
            set((state) => ({
              selectedStepIndex: state.selectedStepIndex + 1,
            })),

          prevStep: () =>
            set((state) => ({
              selectedStepIndex: Math.max(0, state.selectedStepIndex - 1),
            })),

          setIsNavigating: (isNavigating: boolean) => set({ isNavigating }),
        }),
        {
          name: `project-storage-${projectId}`,
          partialize: (state) => ({
            isGenerated: state.isGenerated,
            selectedStepIndex: state.selectedStepIndex,
            selectedFeatures: state.selectedFeatures,
            selectedTechStacks: state.selectedTechStacks,
          }),
        }
      )
    )
  );
};
