import { buildStepsAgent } from "@/inngest/agents/buildStepsAgent";
import { BuildStepListSchema, BuildStepsList } from "@/schemas/agentResponseValidation";
import { runAndValidateAgent } from "@/utils/run-and-validate-agent";

export async function parseBuildStepsAgent(
  title: string,
  description: string,
  techStackNames: string,
  featuresList: string
) {
  const parsed = await runAndValidateAgent<BuildStepsList>(
    buildStepsAgent,
    `Generate step titles for building this project:
        Title: ${title},
        Description: ${description},
        Tech Stack: ${techStackNames},
        Features: ${featuresList}       
    `,
    BuildStepListSchema
  );

  return parsed;
}
