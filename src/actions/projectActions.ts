"use server";

import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";
import { Feature } from "@/schemas/agentResponseValidation";
import { getServerUserSession } from "@/utils/getServerUserSession";

import prisma from "@/lib/prisma";

export async function createNewProject({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
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

    return { success: true, project };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Something went wrong" };
  }
}

export async function getProject(projectId: string) {
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

    return { success: true, project };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Something went wrong" };
  }
}

export async function saveSelectedFeatures(projectId: string, featureIds: string[]) {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project?.features) {
    throw new Error("No features found");
  }

  const allFeatures = project.features as Feature[];

  console.log(allFeatures);

  const updatedFeatures = allFeatures.map((feature) => ({
    ...feature,
    selected: featureIds.includes(feature.id),
  }));

  console.log(updatedFeatures);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      features: updatedFeatures,
    },
  });

  await prisma.step.updateMany({
    where: {
      projectId,
      index: 0,
    },
    data: {
      content: updatedFeatures,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: "true" };
}

export async function getAllTechStacks() {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    return await prisma.techStack.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  } catch {
    console.error("Something Went Wrong");
    return [];
  }
}

export async function saveProjectConfiguration(
  projectId: string,
  featureIds: string[],
  techStackIds: string[]
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const allFeatures = project.features as Feature[];
  const selectedFeatures = allFeatures.filter((f) => featureIds.includes(f.id));

  await prisma.project.update({
    where: { id: projectId },
    data: {
      techStacks: techStackIds,
      status: "ACTIVE",
    },
  });

  await prisma.projectTechStack.createMany({
    data: techStackIds.map((stackId, index) => ({
      projectId,
      techStackId: stackId,
      isPrimary: index == 0,
    })),
    skipDuplicates: true,
  });

  await inngest.send({
    name: "project/steps.generate",
    data: {
      projectId,
      selectedFeatures,
      selectedTechStack: techStackIds,
    },
  });

  revalidatePath(`/project/${projectId}`);

  return { success: "true" };
}
