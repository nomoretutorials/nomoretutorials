import { featureGeneratorAgent } from "@/inngest/agents/featureGeneratorAgent";
import { FeatureListSchema, FeaturesList } from "@/schemas/agent-response-validation";
import { runAndValidateAgent } from "@/utils/run-and-validate-agent";

export async function parseFeaturesAgent(title: string, description: string) {
  const parsed = await runAndValidateAgent<FeaturesList>(
    featureGeneratorAgent,
    `Generate a list of features for the tool with title: ${title} and description: ${description}`,
    FeatureListSchema
  );

  return parsed;
}
