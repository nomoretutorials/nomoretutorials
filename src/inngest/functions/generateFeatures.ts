import { parseFeaturesAgent } from "@/actions/ai/parseFeaturesAgent";
import { FeaturesList } from "@/schemas/agentResponseValidation";

import prisma from "@/lib/prisma";
import { inngest } from "../client";

export const generateProjectFeatures = inngest.createFunction(
  { id: "generate-project-features" },
  { event: "project/features.generate" },
  async ({ step, event }) => {
    try {
      const { projectId, title, description } = event.data;

      let response: FeaturesList;
      try {
        response = await parseFeaturesAgent(title, description);
      } catch {
        throw new Error("Failed to parse features from AI");
      }

      await step.run("store-features-and-create-step", async () => {
        try {
          await prisma.project.update({
            where: { id: projectId },
            data: {
              features: response.features,
              status: "CONFIGURING",
            },
          });

          await prisma.step.create({
            data: {
              index: 0,
              title: "Choose Features",
              status: "COMPLETED",
              content: response.features,
              projectId,
            },
          });

          await prisma.step.create({
            data: {
              index: 1,
              title: "Select Tech Stack",
              status: "PENDING",
              projectId,
            },
          });
        } catch {
          throw new Error();
        }
      });

      return {
        projectId,
        featuresCount: response.features.length,
      };
    } catch (err) {
      console.error("generateProjectFeatures failed", err);
      return { error: (err as Error).message };
    }
  }
);
