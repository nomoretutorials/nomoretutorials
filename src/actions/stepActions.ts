"use server";

import { getServerUserSession } from "@/utils/getServerUserSession";

import prisma from "@/lib/prisma";

export async function getStepContent(stepId: string) {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    console.log(stepId);
    const data = await prisma.step.findFirst({
      where: {
        id: stepId,
      },
      select: {
        id: true,
        index: true,
        title: true,
        status: true,
        content: true,
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error ", error);
    return { error: "Error Fetching Features" };
  }
}

export async function getProjectSteps(projectId: string) {
  const user = await getServerUserSession();
  if (!user) return { success: false, message: "Unauthorized" };

  try {
    console.log(projectId);
    const data = await prisma.step.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        index: true,
        title: true,
        status: true,
        content: true,
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error ", error);
    return { error: "Error Fetching Features" };
  }
}
