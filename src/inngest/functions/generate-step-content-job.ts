import { Feature } from "@/types/project";

import { projectStepContentAgent } from "@/lib/ai/agents/step-content-agent";
import prisma from "@/lib/prisma";
import { inngest } from "../client";

export const generateBuildStepContentJob = inngest.createFunction(
  { id: "generate-step-content" },
  { event: "app/build-step-content.generate" },
  async ({ event, step }) => {
    const { projectId } = event.data;

    const project = await step.run("Load project content", async () => {
      return prisma.project.findUnique({
        where: { id: projectId },
        include: {
          ProjectTechStack: {
            include: {
              techStack: true,
            },
          },
          Steps: {
            orderBy: { index: "asc" },
          },
        },
      });
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    const firstStep = project.Steps.find((s) => s.index === 2);
    if (!firstStep) throw new Error("No build step found to generate content for");

    const features = project.features as Feature[];
    const selectedFeatures = features.filter((f) => f.selected);

    const techStackNames = project.ProjectTechStack.map((pts) => pts.techStack.name);

    // const previousSteps =

    const content = await step.run(`Generate content for step ${firstStep.index}`, async () => {
      return await projectStepContentAgent({
        stepTitle: firstStep.title,
        projectTitle: project.title,
        projectDescription: project.description,
        techStackNames,
        selectedFeatures,
      });
    });

    return content;
  }
);
