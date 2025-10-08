import { projectFeaturesAgent } from "@/lib/ai/agents/features-agent";
import prisma from "@/lib/prisma";
import { inngest } from "../client";

export const generateFeatureJob = inngest.createFunction(
  { id: "generate-features" },
  { event: "app/features.generate" },
  async ({ event, step }) => {
    const { title, description, projectId } = event.data;

    const features = await step.run("Generate features with AI", async () => {
      return await projectFeaturesAgent(title, description);
    });

    await step.run("Update project record", async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          features: features,
          status: "CONFIGURING",
        },
      });
    });

    await step.run("Upsert setup steps", async () => {
      await prisma.step.upsert({
        where: {
          projectId_index: {
            projectId,
            index: 0,
          },
        },
        update: {
          status: "COMPLETED",
          content: features,
        },
        create: {
          projectId,
          index: 0,
          title: "Choose Features",
          status: "COMPLETED",
          content: features,
        },
      });

      await prisma.step.upsert({
        where: {
          projectId_index: {
            projectId,
            index: 1,
          },
        },
        update: {
          status: "PENDING",
        },
        create: {
          projectId,
          index: 1,
          title: "Select Tech Stack",
          status: "PENDING",
        },
      });
    });

    return features;
  }
);
