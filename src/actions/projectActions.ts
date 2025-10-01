"use server";

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
