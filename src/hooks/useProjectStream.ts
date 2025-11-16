import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useProjectStream(projectId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!projectId) return;

    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      console.log(`[SSE] 🔌 Connecting to stream (attempt ${reconnectAttemptsRef.current + 1})...`);

      const eventSource = new EventSource(`/api/project/${projectId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("[SSE] ✅ Connected to stream");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset on successful connection
      };

      eventSource.onmessage = (event) => {
        const raw = event.data;

        if (!raw || raw.trim() === "") return;
        if (raw.startsWith(":")) return;

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          console.warn("[SSE] Non-JSON received:", raw);
          return;
        }

        if (parsed.type === "connected") {
          console.log("[SSE] 🎉 Connection confirmed");
        }

        if (parsed.type === "update") {
          console.log("[SSE] 🔁 Update received");
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        }
      };

      eventSource.onerror = (err) => {
        console.error("[SSE] ❌ Connection error:", err);
        setIsConnected(false);
        eventSource.close();

        // Exponential backoff for reconnection
        const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;

        console.log(`[SSE] 🔄 Reconnecting in ${backoffTime}ms...`);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffTime);
      };
    };

    connect();

    // Cleanup on unmount
    return () => {
      console.log("[SSE] 🔌 Cleaning up connection");

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsConnected(false);
    };
  }, [projectId, queryClient]);

  return { isConnected };
}
