import { useEffect, useState } from "react";
import { Feature, Step } from "@/types/project";

type ProjectData = {
  features: Feature;
  steps: Step[];
  status: string;
};

export function useProjectStream(projectId: string) {
  const [data, setData] = useState<ProjectData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`/api/project/${projectId}/stream`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (error) {
        console.error("[SSE] ❌ Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [projectId]);

  return { data, isConnected };
}
