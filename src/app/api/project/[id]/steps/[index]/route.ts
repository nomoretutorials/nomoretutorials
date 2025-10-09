// src/app/api/project/[id]/steps/[index]/route.ts

import { NextResponse } from "next/server";
import { Feature } from "@/types/project";
import { getServerUserSession } from "@/utils/get-server-user-session";

import { projectStepContentAgent } from "@/lib/ai/agents/step-content-agent";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; index: number }> }
) {
  try {
    const { id: projectId, index: stepIndex } = await params;
    console.log(projectId, stepIndex);

    const [user, project] = await Promise.all([
      getServerUserSession(),
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          ProjectTechStack: { include: { techStack: true } },
          Steps: { orderBy: { index: "asc" } },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!project) {
      console.warn("❌ Project not found:", projectId);
      return NextResponse.json({ error: "Project Doesn't Exist" }, { status: 404 });
    }

    const features = (project?.features ?? []) as Feature[];
    const selectedFeatures = features.filter((f) => f.selected);
    const techStackNames = project.ProjectTechStack.map((pts) => pts.techStack.name);

    const targetStep = project.Steps.find((s) => s.index == stepIndex);

    if (!targetStep) {
      console.warn("❌ Step not found:", stepIndex);
      console.log(
        "Available steps:",
        project.Steps.map((s) => s.index)
      );
      return NextResponse.json({ error: "Step doesn't exist" }, { status: 404 });
    }

    await prisma.step.update({
      where: { id: targetStep.id },
      data: { status: "GENERATING" },
    });

    console.log("STARTED GENERATING CONTENT !!");
    const content = await projectStepContentAgent({
      stepTitle: targetStep?.title,
      projectTitle: project.title,
      projectDescription: project.description,
      techStackNames,
      selectedFeatures,
    });

    await prisma.step.update({
      where: { id: targetStep.id },
      data: {
        status: "COMPLETED",
        content,
      },
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Error generating build steps:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
