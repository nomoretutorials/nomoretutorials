// src/app/api/project/[id]/stream/route.ts
import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { onProjectUpdate } from "@/lib/project-events";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  console.log("[SSE] 🔌 Client connected for project:", projectId);

  const encoder = new TextEncoder();

  // Track cleanup functions
  let keepAliveInterval: NodeJS.Timeout | null = null;
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      console.log("[SSE] 🚀 Stream started for project:", projectId);

      // Helper function to fetch and send project data
      const sendProjectData = async () => {
        try {
          const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
              id: true,
              features: true,
              status: true,
              Steps: {
                orderBy: { index: "asc" },
              },
            },
          });

          if (!project) {
            console.error("[SSE] ❌ Project not found:", projectId);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "Project not found" })}\n\n`)
            );
            return;
          }

          const data = {
            projectId: project.id,
            features: project.features,
            steps: project.Steps,
            status: project.status,
          };

          // Send data in SSE format: "data: {json}\n\n"
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          console.log("[SSE] ✅ Sent project data to client");
        } catch (error) {
          console.error("[SSE] ❌ Error fetching project data:", error);
        }
      };

      // 1. Send initial project data immediately when client connects
      await sendProjectData();

      // 2. Listen for updates to this specific project
      unsubscribe = onProjectUpdate(projectId, async () => {
        console.log("[SSE] 🔔 Received update notification for project:", projectId);
        // Fetch fresh data and send to client
        await sendProjectData();
      });

      console.log("[SSE] 🎧 Listening for updates on project:", projectId);

      // 3. Keep-alive: Send ping every 30 seconds to prevent connection timeout
      keepAliveInterval = setInterval(() => {
        try {
          // Comments (lines starting with ":") are ignored by EventSource
          controller.enqueue(encoder.encode(`: keep-alive ${Date.now()}\n\n`));
          console.log("[SSE] 💓 Keep-alive ping sent");
        } catch (error) {
          console.error("[SSE] ❌ Keep-alive failed:", error);
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
          }
        }
      }, 30000);
    },

    cancel() {
      console.log("[SSE] 🔌 Client disconnected for project:", projectId);

      // Clean up keep-alive interval
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        console.log("[SSE] ✅ Keep-alive interval cleared");
      }

      // Unsubscribe from project updates
      if (unsubscribe) {
        unsubscribe();
        console.log("[SSE] ✅ Unsubscribed from project updates");
      }

      console.log("[SSE] ✅ Cleanup complete");
    },
  });

  // Return response with SSE headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering if behind nginx
    },
  });
}
