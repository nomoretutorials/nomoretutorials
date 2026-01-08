// lib/ai/agents/featureAgent.ts
import { featuresAgentPrompt } from "@/prompts/features-agent-prompt";
import { featuresListSchema } from "@/schemas/agent-validation";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function projectFeaturesAgent(title: string, description: string) {
  const result = await generateText({
    model: openai("gpt-4.1-nano"),
    prompt: featuresAgentPrompt(title, description),
  });

  console.log(result.usage);
  return parseFeatures(result.text);
}

export function parseFeatures(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    console.log(text);
    const parsed = JSON.parse(jsonMatch[0]);
    const { success, data, error } = featuresListSchema.safeParse(parsed);

    if (!success) {
      console.error("Validation errors:", error);
      throw new Error("AI response doesn't match expected schema");
    }

    return data;
  } catch (error) {
    console.error("Failed to parse features:", error);
    throw new Error("Failed to parse AI response into features");
  }
}
