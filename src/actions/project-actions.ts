"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Feature, Project, TechStack } from "@/types/project";
import { getServerUserSession } from "@/utils/get-server-user-session";
import { projectLimit } from "@/utils/project-limit";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/hooks/useServerAction";

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
    const existingCount = await projectLimit(user.id);

    if (existingCount === null || existingCount === undefined) {
      return { success: false, error: "Error creating project. Please try again later." };
    }

    if (existingCount >= 2) {
      return { success: false, error: "Project limit reached (max 2 projects per user)." };
    }
    const project = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          title,
          description,
          userId: user.id,
          status: "DRAFT",
        },
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
        },
      });

      await tx.step.createMany({
        data: [
          {
            index: 0,
            title: "Choose Features",
            projectId: project.id,
            category: "SETUP",
            estimatedComplexity: "EASY",
            learningFocus: "Understanding project requirements and feature selection",
            relatedFeatures: [],
          },
          {
            index: 1,
            title: "Select Tech Stack",
            projectId: project.id,
            category: "SETUP",
            estimatedComplexity: "EASY",
            learningFocus: "Technology stack selection and project setup",
            relatedFeatures: [],
          },
        ],
      });

      return project;
    });

    if (project.userId !== user.id)
      return { success: false, error: "Project does not belongs to the user." };

    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/project/${project.id}/features`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("cookie") || "",
      },
    }).catch((err) => {
      console.error("Failed to trigger feature generation: ", err);
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

    const allFeatures = project.features as Feature[];
    const updatedFeatures = allFeatures.map((f) => ({
      ...f,
      selected: featureIds.includes(f.id),
    }));

    await prisma.$transaction([
      prisma.project.updateMany({
        where: { id: projectId },
        data: { features: updatedFeatures, techStacks: techStackIds, status: "ACTIVE" },
      }),
      prisma.step.updateMany({
        where: { projectId, index: 0 },
        data: { content: JSON.stringify(updatedFeatures) },
      }),
      prisma.step.update({
        where: {
          projectId_index: {
            projectId,
            index: 1,
          },
        },
        data: {
          status: "COMPLETED",
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

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/project/${project.id}/steps`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await headers()).get("cookie") || "",
      },
    }).catch((err) => {
      console.error("Failed to trigger build step generation: ", err);
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