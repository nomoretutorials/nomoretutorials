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
};

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setSelectedStepIndex: (index: number) => set({ selectedStepIndex: Math.max(0, index) }),

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
          set((state) => ({
            ...initialState,
            isNavigating: state.isNavigating, // Preserve navigation state
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
        name: "project-storage",
        partialize: (state) => ({
          selectedStepIndex: state.selectedStepIndex,
          selectedFeatures: state.selectedFeatures,
          selectedTechStacks: state.selectedTechStacks,
        }),
      }
    )
  )
);
