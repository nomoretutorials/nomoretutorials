// src/app/api/project/[id]/stream/route.ts

import { NextRequest } from "next/server";

import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

// Define types for the stream context
interface StreamContext {
  keepAlive?: NodeJS.Timeout;
  messageHandler?: (channel: string, message: string) => void;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed to Promise
) {
  // Await params to get the actual values
  const { id } = await params;
  const projectId = id;

  console.log("[SSE] 🏁 New connection for project:", projectId);

  // Create a new Redis subscriber instance
  const subscriber = redis.duplicate();

  // For ioredis duplicate(), DON'T call connect() - it inherits the connection
  // Just wait a bit for it to be ready if needed
  if (subscriber.status === "wait" || subscriber.status === "connecting") {
    await new Promise((resolve) => {
      subscriber.once("ready", resolve);
    });
  }

  // Subscribe to the channel
  await subscriber.subscribe("features-updates");

  const encoder = new TextEncoder();

  // Create context object to store cleanup references
  const context: StreamContext = {};

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      console.log("[SSE] Stream started for project:", projectId);

      // Message handler
      const messageHandler = (channel: string, message: string) => {
        try {
          console.log("[SSE] Received message:", { channel, message });

          // Parse the message if it's JSON
          let parsedMessage: any;
          try {
            parsedMessage = JSON.parse(message);
          } catch {
            parsedMessage = message;
          }

          // Filter messages for this specific project if needed
          if (parsedMessage.projectId && parsedMessage.projectId !== projectId) {
            return; // Skip messages for other projects
          }

          // Send the message to the client
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        } catch (error) {
          console.error("[SSE] Error sending message:", error);
        }
      };

      // Attach the message handler
      subscriber.on("message", messageHandler);

      // Send initial connection success message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", projectId })}\n\n`)
      );

      // Keep-alive ping every 30 seconds to prevent timeout
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch (error) {
          console.error("[SSE] Keep-alive error:", error);
          clearInterval(keepAlive);
        }
      }, 30000);

      // Store in context for cleanup
      context.keepAlive = keepAlive;
      context.messageHandler = messageHandler;
    },

    async cancel() {
      console.log("[SSE] Client disconnected for project:", projectId);

      // Clear keep-alive interval
      if (context.keepAlive) {
        clearInterval(context.keepAlive);
      }

      // Remove message handler
      if (context.messageHandler) {
        subscriber.off("message", context.messageHandler);
      }

      // Unsubscribe and disconnect
      try {
        await subscriber.unsubscribe("features-updates");

        // For ioredis, disconnect the subscriber
        subscriber.disconnect();
      } catch (error) {
        console.error("[SSE] Cleanup error:", error);
      }
    },
  });

  // Return the stream with appropriate headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  });
}
