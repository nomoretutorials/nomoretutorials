"use server";

import { revalidatePath } from "next/cache";
import { Project, TechStack } from "@/app/project/_components/ProjectPageClient";
import { inngest } from "@/inngest/client";
import { Feature } from "@/schemas/agent-response-validation";
import { getServerUserSession } from "@/utils/get-server-user-session";

import prisma from "@/lib/prisma";

type ActionResponse<T> = { success: true; data: T } | { success: false; message: string };

export async function createNewProject({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<ActionResponse<{ projectId: string }>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        userId: user.id,
        status: "DRAFT",
      },
      select: {
        id: true,
      },
    });

    await inngest.send({
      name: "project/features.generate",
      data: {
        projectId: project.id,
        title,
        description,
      },
    });

    return { success: true, data: { projectId: project.id } };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, message: "Error creating project." };
  }
}

export async function getProject(projectId: string): Promise<ActionResponse<{ project: Project }>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        Steps: {
          orderBy: { index: "asc" },
        },
      },
    });

    if (!project) return { success: false, message: "Project not found" };

    return { success: true, data: { project } };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, message: "Error getting projects." };
  }
}

export async function saveSelectedFeatures(
  projectId: string,
  featureIds: string[]
): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project?.features) {
      return { success: false, message: "No features found" };
    }

    const allFeatures = project.features as Feature[];
    const updatedFeatures = allFeatures.map((f) => ({
      ...f,
      selected: featureIds.includes(f.id),
    }));

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: { features: updatedFeatures },
      }),
      prisma.step.updateMany({
        where: { projectId, index: 0 },
        data: { content: updatedFeatures },
      }),
    ]);

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to save features:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getAllTechStacks(): Promise<ActionResponse<TechStack[]>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    const techStacks = await prisma.techStack.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return { success: true, data: techStacks };
  } catch (error) {
    console.error("Failed to fetch tech stacks:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function saveProjectConfiguration(
  projectId: string,
  featureIds: string[],
  techStackIds: string[]
): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return { success: false, message: "Project not found" };

    const allFeatures = project.features as Feature[];
    const selectedFeatures = allFeatures.filter((f) => featureIds.includes(f.id));

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: {
          techStacks: techStackIds,
          status: "ACTIVE",
        },
      }),
      prisma.projectTechStack.createMany({
        data: techStackIds.map((stackId, index) => ({
          projectId,
          techStackId: stackId,
          isPrimary: index === 0,
        })),
        skipDuplicates: true,
      }),
    ]);

    await inngest.send({
      name: "project/steps.generate",
      data: { projectId, selectedFeatures, selectedTechStack: techStackIds },
    });

    revalidatePath(`/project/${projectId}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to save project configuration:", error);
    return { success: false, message: "Something went wrong" };
  }
}
