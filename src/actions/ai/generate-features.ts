"use server";

import { inngest } from "@/inngest/client";
import { getServerUserSession } from "@/utils/get-server-user-session";

import prisma from "@/lib/prisma";

export async function generateFeatures(projectId: string) {
  const user = await getServerUserSession();
  if (!user) return { success: "false", error: "Unauthorized" };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) return { success: false, error: "Cannot find project" };
  if (project.userId !== user.id)
    return { success: false, error: "Project does not belongs to the user." };

  await inngest.send({
    name: "app/features.generate",
    data: {
      projectId,
      userId: user.id,
      title: project.title,
      description: project.description,
    },
  });

  return {
    success: true,
    data: null,
  };
}
