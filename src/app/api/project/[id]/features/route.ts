import { NextResponse } from "next/server";
import { getServerUserSession } from "@/utils/get-server-user-session";

import { parseFeatures, projectFeaturesAgent } from "@/lib/ai/agents/features-agent";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;

    const user = await getServerUserSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Invalid Project Id" }, { status: 404 });
    }

    const result = await projectFeaturesAgent(project.title, project.description);
    const text = await result.text;
    const features = parseFeatures(text);

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: {
          features,
          status: "CONFIGURING",
        },
      }),

      prisma.step.upsert({
        where: {
          projectId_index: {
            projectId,
            index: 0,
          },
        },
        update: {
          status: "COMPLETED",
          content: features,
        },
        create: {
          projectId,
          index: 0,
          title: "Choose Features",
          status: "COMPLETED",
          content: features,
        },
      }),

      prisma.step.upsert({
        where: {
          projectId_index: {
            projectId,
            index: 1,
          },
        },
        update: {
          status: "PENDING",
        },
        create: {
          projectId,
          index: 1,
          title: "Select Tech Stack",
          status: "PENDING",
        },
      }),
    ]);

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Error generating project features:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
