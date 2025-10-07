import { projectFeaturesAgent } from "@/lib/ai/agents/features-agent";
import prisma from "@/lib/prisma";
import { inngest } from "../client";

export const generateFeatureJob = inngest.createFunction(
  { id: "generate-features" },
  { event: "app/features.generate" },
  async ({ event, step }) => {
    const result = await step.run("Generate features", async () => {
      const { title, description, projectId } = event.data;
      const output = await projectFeaturesAgent(title, description);

      await prisma.project.update({
        where: { id: projectId },
        data: {
          features: output.features,
          status: "CONFIGURING",
        },
      });

      await prisma.step.upsert({
        where: {
          projectId_index: {
            projectId,
            index: 0,
          },
        },
        update: {
          status: "COMPLETED",
          content: output.features,
        },
        create: {
          projectId,
          index: 0,
          title: "Choose Features",
          status: "COMPLETED",
          content: output.features,
        },
      });

      await prisma.step.upsert({
        where: {
          projectId_index: {
            projectId,
            index: 1,
          },
        },
        update: {},
        create: {
          projectId,
          index: 1,
          title: "Select Tech Stack",
          status: "PENDING",
        },
      });

      return output;
    });
    return result.features;
  }
);
