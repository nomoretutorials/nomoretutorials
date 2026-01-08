"use client";

import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

import { createProjectStore, ProjectActions, ProjectState } from "./project-store";

type ProjectStoreApi = ReturnType<typeof createProjectStore>;

const ProjectStoreContext = createContext<ProjectStoreApi | undefined>(undefined);

export const ProjectStoreProvider = ({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) => {
  const storeRef = useRef<ProjectStoreApi>(null);
  if (!storeRef.current) {
    storeRef.current = createProjectStore(projectId);
  }

  return (
    <ProjectStoreContext.Provider value={storeRef.current}>{children}</ProjectStoreContext.Provider>
  );
};

// Custom hook to use the store
export const useProjectStore = <T,>(selector: (store: ProjectState & ProjectActions) => T): T => {
  const context = useContext(ProjectStoreContext);
  if (!context) throw new Error("useProjectStore must be used within ProjectStoreProvider");
  return useStore(context, selector);
};
