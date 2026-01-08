// src/app/api/project/[id]/steps/[index]/route.ts
import { NextResponse } from "next/server";
import { Feature } from "@/types/project";
import { getServerUserSession } from "@/utils/get-server-user-session";

import { projectStepContentAgent } from "@/lib/ai/agents/step-content-agent";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  const internalHeader = request.headers.get("X-Internal-Generation");
  if (!internalHeader) {
    console.warn("🚫 Step generation triggered externally — skipping.");
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  try {
    const { id: projectId, index } = await params;
    const stepIndex = Number(index);

    const [user, project] = await Promise.all([
      getServerUserSession(),
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          ProjectTechStack: { include: { techStack: true } },
          Steps: {
            select: {
              id: true,
              index: true,
              title: true,
              learningFocus: true,
              category: true,
              relatedFeatures: true,
              estimatedComplexity: true,
            },
            orderBy: { index: "asc" },
          },
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

    const features = (project?.features ?? []) as unknown as Feature[];
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
    const { content } = await projectStepContentAgent({
      stepIndex: targetStep?.index,
      stepTitle: targetStep?.title,
      stepCategory: targetStep.category,
      learningFocus: targetStep.learningFocus,
      relatedFeatures: targetStep.relatedFeatures,
      estimatedComplexity: targetStep.estimatedComplexity,
      projectTitle: project.title,
      projectDescription: project.description,
      techStackNames,
      selectedFeatures,
    });

    await prisma.step.update({
      where: { id: targetStep.id },
      data: {
        status: "COMPLETED",
        content: content,
      },
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Error generating build steps:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  const { id: projectId, index } = await params;
  const stepIndex = Number(index);

  if (isNaN(stepIndex)) {
    return NextResponse.json({ error: "Invalid step index." }, { status: 400 });
  }

  try {
    const step = await prisma.step.findUnique({
      where: {
        projectId_index: {
          projectId: projectId,
          index: stepIndex,
        },
      },
      select: {
        id: true,
        index: true,
        title: true,
        status: true,
        category: true,
        isCompleted: true,
        projectId: true,
        content: true,
        summary: true,
      },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found." }, { status: 404 });
    }

    return NextResponse.json({ data: { step } });
  } catch (err) {
    console.error("Failed to load step content:", err);
    return NextResponse.json({ error: "Failed to fetch step." }, { status: 500 });
  }
}
