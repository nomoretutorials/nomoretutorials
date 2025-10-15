import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  console.log(`[SSE] 🏁 New connection for project: ${id}`);

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const safeClose = () => {
        if (!closed) {
          closed = true;
          try {
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
            safeClose();
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
          safeClose();
        }
      };

      // initial push
      await sendUpdate();

      const interval = setInterval(sendUpdate, 2000);

      // handle client disconnect
      request.signal.addEventListener("abort", () => {
        console.log(`[SSE] 🚪 Client disconnected: ${id}`);
        clearInterval(interval);
        safeClose();
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
