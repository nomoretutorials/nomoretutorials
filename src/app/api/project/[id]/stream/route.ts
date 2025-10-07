import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendUpdate = async () => {
          try {
            const project = await prisma.project.findUnique({
              where: { id },
              include: {
                Steps: {
                  orderBy: { index: "asc" },
                },
              },
            });

            if (!project) {
              controller.close();
              return;
            }

            const data = JSON.stringify({
              features: project.features,
              steps: project.Steps,
              status: project.status,
            });

            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch {
            controller.close();
          }
        };

        await sendUpdate();

        // send every 2 seconds
        const interval = setInterval(sendUpdate, 2000);

        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
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
  } catch {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
