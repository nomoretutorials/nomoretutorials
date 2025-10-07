"use server";

import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";
import { Feature, Project, TechStack } from "@/types/project";
import { getServerUserSession } from "@/utils/get-server-user-session";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/hooks/useServerAction";
import { generateFeatures } from "./ai/generate-features";

export async function createNewProject({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<ActionResponse<{ projectId: string }>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

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

    generateFeatures(project.id).catch((error) => {
      console.error("Failed to generate features:", error);
    });

    return { success: true, data: { projectId: project.id } };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, error: "Error creating project." };
  }
}

export async function getProject(projectId: string): Promise<ActionResponse<{ project: Project }>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

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

    if (!project) return { success: false, error: "Project not found" };

    return { success: true, data: { project } };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, error: "Error getting projects." };
  }
}

export async function saveSelectedFeatures(
  projectId: string,
  featureIds: string[]
): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project?.features) {
      return { success: false, error: "No features found" };
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
    return { success: false, error: "Something went wrong" };
  }
}

export async function getAllTechStacks(): Promise<ActionResponse<TechStack[]>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const techStacks = await prisma.techStack.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return { success: true, data: techStacks };
  } catch (error) {
    console.error("Failed to fetch tech stacks:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function saveProjectConfiguration(
  projectId: string,
  featureIds: string[],
  techStackIds: string[]
): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { ProjectTechStack: { include: { techStack: true } } },
    });

    if (!project) return { success: false, error: "Cannot find project" };
    if (project.userId !== user.id)
      return { success: false, error: "Project does not belongs to the user." };

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

    const features = project.features as Feature[];
    const selectedFeatures = features.filter((f) => f.selected);
    const techStackNames = project.ProjectTechStack.map((pts) => pts.techStack.name);

    await inngest.send({
      name: "app/build-steps.generate",
      data: {
        projectId,
        title: project.title,
        description: project.description,
        selectedFeatures,
        techStackNames,
      },
    });

    revalidatePath(`/project/${projectId}`);
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to save project configuration:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function deleteProject(projectId: string): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delele project." };
  }
}

export async function addGithubRepoURL(
  projectId: string,
  repositoryUrl: string
): Promise<ActionResponse<null>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { repositoryUrl },
    });
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delele project." };
  }
}
