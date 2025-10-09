import { NextResponse } from "next/server";
import { Feature } from "@/types/project";
import { getServerUserSession } from "@/utils/get-server-user-session";

import { projectBuildStepsAgent } from "@/lib/ai/agents/build-steps-agent";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;

    const [user, project] = await Promise.all([
      getServerUserSession(),
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          ProjectTechStack: { include: { techStack: true } },
          Steps: { orderBy: { createdAt: "asc" } },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!project) {
      return NextResponse.json({ error: "Project Doesn't Exist" }, { status: 404 });
    }

    const features = (project?.features ?? []) as Feature[];
    const selectedFeatures = features.filter((f) => f.selected);
    const techStackNames = project.ProjectTechStack.map((pts) => pts.techStack.name);

    const buildSteps = await projectBuildStepsAgent(
      project.title,
      project.description,
      selectedFeatures,
      techStackNames
    );

    const stepsToCreate = buildSteps.map((step) => ({
      projectId,
      index: step.index + 1,
      title: step.title,
      status: "PENDING" as const,
    }));

    await prisma.$transaction([
      prisma.step.deleteMany({
        where: { projectId, index: { gte: 2 } },
      }),
      prisma.step.createMany({ data: stepsToCreate }),
      prisma.project.update({
        where: { id: projectId },
        data: { status: "ACTIVE" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error generating build steps:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
