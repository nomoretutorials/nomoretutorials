"use server";

// TODO: Either title or description will be empty. whatever is generate.
import { projectMetadataAgent } from "@/inngest/agents/projectMetadataAgent";
import { projectMetadata, projectMetadataSchema } from "@/schemas/agentResponseValidation";
import { runAndValidateAgent } from "@/utils/runAndValidateAgent";

export async function parseProjectMetadataAgent(projectIdea: string) {
  const parsed = await runAndValidateAgent<projectMetadata>(
    projectMetadataAgent,
    projectIdea,
    projectMetadataSchema
  );

  return {
    title: parsed.title,
    description: parsed.description,
  };
}
