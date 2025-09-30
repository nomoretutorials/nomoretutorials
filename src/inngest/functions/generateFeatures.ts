import { parseFeaturesAgent } from "@/actions/ai/parseFeaturesAgent";

import prisma from "@/lib/prisma";
import { inngest } from "../client";

export const generateProjectFeatures = inngest.createFunction(
  { id: "generate-project-features" },
  { event: "project/features.generate" },
  async ({ step, event }) => {
    const { projectId, title, description } = event.data;

    const response = await parseFeaturesAgent(title, description);
    console.log("Response: ", response);

    await step.run("store-features", async () => {
      return await prisma.project.update({
        where: {
          id: projectId,
        },
        data: {
          features: response.features,
        },
      });
    });

    return {
      projectId,
      featuresCount: response.features.length,
    };
  }
);
