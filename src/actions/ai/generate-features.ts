"use server";

import { getServerUserSession } from "@/utils/get-server-user-session";

import { projectFeaturesAgent } from "@/lib/ai/agents/features-agent";
import prisma from "@/lib/prisma";
import { emitProjectUpdate } from "@/lib/project-events";

export default async function generateFeatures(projectId: string) {
  const user = await getServerUserSession();
  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      features: true,
      title: true,
      description: true,
    },
  });

  if (!project) {
    return {
      success: false,
      message: "Project Not Found",
    };
  }

  // If features already exist, notify and return
  if (project.features) {
    emitProjectUpdate(projectId, { type: "features-ready" });
    return {
      success: true,
      data: project.features,
    };
  }

  // Generate features with LLM
  const { features } = await projectFeaturesAgent(project.title, project.description);

  // Update database
  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: {
        features,
        status: "CONFIGURING",
      },
    }),
    prisma.step.update({
      where: {
        projectId_index: {
          projectId,
          index: 0,
        },
      },
      data: {
        status: "COMPLETED",
        content: JSON.stringify(features),
      },
    }),
    prisma.step.update({
      where: {
        projectId_index: {
          projectId,
          index: 1,
        },
      },
      data: {
        status: "PENDING",
      },
    }),
  ]);

  console.log("[Events] Features generated, emitting update");

  // Emit update to any listening SSE connections
  emitProjectUpdate(projectId, { type: "features-ready" });

  return {
    success: true,
    data: features,
  };
}
