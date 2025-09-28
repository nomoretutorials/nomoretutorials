"use server";

import { projectMetadataAgent } from "@/inngest/agents";

export async function generateProjectMetadata(projectIdea: string) {
  const { output } = await projectMetadataAgent.run(projectIdea);

  let parsed: { title: string; tagline: string };
  try {
    const firstOutput = output[0];
    if (!firstOutput || !("content" in firstOutput)) {
      throw new Error("No content found in agent output");
    }
    const content = firstOutput.content as string;
    parsed = JSON.parse(content);
    console.log("Parsed result:", parsed.title);
  } catch (error) {
    console.error("Failed to parse agent result:", error);
    throw new Error("Agent returned invalid JSON");
  }

  return {
    title: parsed.title,
    description: parsed.tagline,
  };
}
