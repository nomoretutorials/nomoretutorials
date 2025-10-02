import { parseBuildStepsAgent } from "@/actions/ai/parseBuildStepsAgent";
import { BuildStepsList, Feature } from "@/schemas/agentResponseValidation";

import prisma from "@/lib/prisma";
import { inngest } from "../client";

export const generateProjectSteps = inngest.createFunction(
  { id: "generate-project-steps" },
  { event: "project/steps.generate" },
  async ({ step, event }) => {
    const { title, description, projectId, selectedFeatures, selectedTechStack } = event.data;

    const techStacks = await step.run("get-tech-stacks", async () => {
      return await prisma.techStack.findMany({
        where: { id: { in: selectedTechStack } },
      });
    });

    console.log(techStacks);

    const techStackNames = techStacks.map((ts) => ts.name).join(", ");
    console.log(techStackNames);

    const featuresList = selectedFeatures.map((f: Feature) => f.title).join(", ");

    let stepTitles;
    try {
      const response: BuildStepsList = await parseBuildStepsAgent(
        title,
        description,
        techStackNames,
        featuresList
      );
      stepTitles = response.steps;
    } catch {
      throw new Error("Failed to parse features from AI");
    }

    console.log("Generated Step Titles: ", stepTitles);

    await step.run("create-step-records", async () => {
      const stepsToCreate = stepTitles.map((stepTitle: { title: string }, index: number) => ({
        projectId,
        index: index + 2,
        title: stepTitle.title,
        status: "PENDING" as const,
      }));

      return await prisma.step.createMany({
        data: stepsToCreate,
      });
    });

    const firstThreeSteps = stepTitles.slice(0, 3);

    for (let i = 0; i < firstThreeSteps.length; i++) {
      const stepIndex = i + 2;
      const stepTitle = firstThreeSteps[i].title;

      await step.run(`generate-step=${stepIndex}-content`, async () => {
        await prisma.step.updateMany({
          where: { projectId, index: stepIndex },
          data: { status: "GENERATING" },
        });

        let result; // TODO: Implement Content Generating Agent

        return await prisma.step.updateMany({
          where: { projectId, index: stepIndex },
          data: {
            status: "COMPLETED",
            // result,
          },
        });
      });
    }

    return {
      projectId,
      totalSteps: stepTitles.length + 2,
      generatedContent: 3,
    };
  }
);
