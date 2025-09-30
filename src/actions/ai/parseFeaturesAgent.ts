import { featureGeneratorAgent } from "@/inngest/agents/featureGeneratorAgent";

export async function parseFeaturesAgent(title: string, description: string) {
  const { output } = await featureGeneratorAgent.run(
    `Generate a list of features for this project whose title is ${title}, and description is ${description}`
  );

  console.log("Output: ", output[0]);

  let parsed: { features: [] };

  try {
    const firstOutput = output[0];
    if (!firstOutput || !("content" in firstOutput)) {
      throw new Error("No content found in agent output");
    }
    const content = firstOutput.content as string;
    console.log("Content: ", content);
    parsed = JSON.parse(content);
    console.log("Parsed: ", parsed);
  } catch (error) {
    console.error("Failed to parse agent result:", error);
    throw new Error("Agent returned invalid JSON");
  }

  return parsed;
}
