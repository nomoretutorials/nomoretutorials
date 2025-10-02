"use server";

import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";
import { Feature } from "@/schemas/agentResponseValidation";
import { getServerUserSession } from "@/utils/getServerUserSession";

import prisma from "@/lib/prisma";

// TODO: Input zod validation

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
