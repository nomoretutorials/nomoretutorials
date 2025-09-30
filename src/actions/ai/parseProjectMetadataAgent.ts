"use server";

import { projectMetadataAgent } from "@/inngest/agents/projectMetadataAgent";

// TODO: Either title or description will be empty. whatever is generate.

export async function parseProjectMetadataAgent(projectIdea: string) {
  const { output } = await projectMetadataAgent.run(projectIdea);

  let parsed: { title: string; tagline: string };

  try {
    const firstOutput = output[0];
    if (!firstOutput || !("content" in firstOutput)) {
      throw new Error("No content found in agent output");
    }
    const content = firstOutput.content as string;
    parsed = JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse agent result:", error);
    throw new Error("Agent returned invalid JSON");
  }

  return {
    title: parsed.title,
    description: parsed.tagline,
  };
}
