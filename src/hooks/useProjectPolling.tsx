// src/hooks/useProjectPolling.ts
import { useEffect, useRef, useState } from "react";
import { Feature, Step } from "@/types/project";

type ProjectData = {
  projectId: string;
  features: Feature[];
  steps: Step[];
  status: string;
  updatedAt: string;
};

type PollingOptions = {
  enabled?: boolean;
  interval?: number;
  onError?: (error: Error) => void;
};

export function useProjectPolling(projectId: string, options: PollingOptions = {}) {
  const { enabled = true, interval = 3000, onError } = options;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !projectId) {
      setIsPolling(false);
      return;
    }

    let isMounted = true;

    const fetchProject = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/project/${projectId}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (isMounted) {
          // Extract just the project data from the API response
          setProject(result.data?.project || result);
          setError(null);
          setIsLoading(false);
          setIsPolling(true);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (isMounted) {
          const error = err instanceof Error ? err : new Error("Unknown error");
          setError(error);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    fetchProject();
    const intervalId = setInterval(fetchProject, interval);

    return () => {
      isMounted = false;
      setIsPolling(false);
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [projectId, enabled, interval, onError]);

  return { project, isLoading, error, isPolling };
}
