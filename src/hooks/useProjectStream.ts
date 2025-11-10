import { useEffect, useState } from "react";
import type { Feature, Step } from "@/types/project";

type ProjectData = {
  features: Feature[];
  steps: Step[];
  status: string;
};

export function useProjectStream(projectId: string) {
  const [data, setData] = useState<ProjectData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const eventSource = new EventSource(`/api/project/${projectId}/stream`);

    eventSource.onopen = () => {
      console.log("[SSE] ✅ Connected to stream");
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

    eventSource.onerror = (err) => {
      console.error("[SSE] ❌ Connection error:", err);
      setIsConnected(false);
    };

    return () => {
      console.log("[SSE] 🔌 Closing EventSource");
      eventSource.close();
    };
  }, [projectId]);

  return { data, isConnected };
}
