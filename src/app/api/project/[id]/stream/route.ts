import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  console.log(`[SSE] 🏁 New connection for project: ${id}`);

  const subscriber = redis.duplicate();
  subscriber.subscribe("features-updates");

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const safeClose = async () => {
        if (!closed) {
          closed = true;
          try {
            await subscriber.unsubscribe("features-updates");
            await subscriber.quit();
            controller.close();
            console.log(`[SSE] 🧹 Stream closed for project: ${id}`);
          } catch {
            console.warn(`[SSE] ⚠️ Tried closing already closed stream: ${id}`);
          }
        }
      };

      const sendUpdate = async () => {
        if (closed) return;
        try {
          const project = await prisma.project.findUnique({
            where: { id },
            include: { Steps: { orderBy: { index: "asc" } } },
          });

          if (!project) {
            console.warn(`[SSE] ⚠️ Project not found: ${id}`);
            await safeClose();
            return;
          }

          const data = JSON.stringify({
            features: project.features,
            steps: project.Steps,
            status: project.status,
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error("[SSE] ❌ Error while sending update:", error);
          await safeClose();
        }
      };

      await subscriber.on("message", async (channel, message: unknown) => {
        console.log(`[SSE] 🔔 Redis message: ${message}, Channel: ${channel}`);
        if ((message as string) === id) await sendUpdate();
      });

      subscriber.on("end", async () => {
        console.warn("[Redis] 🔌 Disconnected, reconnecting...");
        try {
          await subscriber.connect();
          await subscriber.subscribe("features-updates");
        } catch (err) {
          console.error("[Redis] ⚠️ Reconnect failed:", err);
        }
      });

      // Initial push
      await sendUpdate();

      const interval = setInterval(() => {
        if (closed) return;
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 10000);

      request.signal.addEventListener("abort", async () => {
        clearInterval(interval);
        await safeClose();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
