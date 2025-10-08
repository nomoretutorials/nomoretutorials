import { projectBuildStepsAgent } from "@/lib/ai/agents/build-steps-agent";
import prisma from "@/lib/prisma";
import { inngest } from "../client";

export const generateBuildStepsJob = inngest.createFunction(
  { id: "generate-build-steps" },
  { event: "app/build-steps.generate" },
  async ({ event, step }) => {
    const { projectId, title, description, selectedFeatures, techStackNames } = event.data;

    const buildSteps = await step.run("Generate Build Steps with AI", async () => {
      return await projectBuildStepsAgent(title, description, selectedFeatures, techStackNames);
    });

    await step.run("Create steps in DB", async () => {
      const stepsToCreate = buildSteps.map((step) => ({
        projectId,
        index: step.index + 1,
        title: step.title,
        status: "PENDING" as const,
      }));

      await prisma.$transaction([
        prisma.step.deleteMany({
          where: {
            projectId,
            index: { gte: 2 },
          },
        }),

        prisma.step.createMany({
          data: stepsToCreate,
        }),
      ]);

      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "ACTIVE",
        },
      });
    });

    return { stepsGenerated: buildSteps.length };
  }
);
