"use server";

import prisma from "@/lib/prisma";

export async function projectFeatures(projectId: string) {
  try {
    const data = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      select: {
        features: true,
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error ", error);
    return { error: "Error Fetching Features" };
  }
}
