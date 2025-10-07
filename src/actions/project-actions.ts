"use server";

import { revalidatePath } from "next/cache";
import { Feature, Project, TechStack } from "@/types/project";
import { getServerUserSession } from "@/utils/get-server-user-session";

import prisma from "@/lib/prisma";
import { generateFeatures } from "./ai/generate-features";

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

    console.log("Started generating features");

    generateFeatures(project.id).catch((error) => {
      console.error("Failed to generate features:", error);
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

    // Inngest removed: previously sent event "project/steps.generate" with { projectId, selectedFeatures, selectedTechStack }

    revalidatePath(`/project/${projectId}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to save project configuration:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function deleteProject(projectId: string): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, message: "Failed to delele project." };
  }
}

export async function addGithubRepoURL(
  projectId: string,
  repositoryUrl: string
): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { repositoryUrl },
    });
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, message: "Failed to delele project." };
  }
}
