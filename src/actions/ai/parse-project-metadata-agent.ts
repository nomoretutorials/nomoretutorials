"use server";

// TODO: Either title or description will be empty. whatever is generate.
import { projectMetadataAgent } from "@/inngest/agents/projectMetadataAgent";
import { projectMetadata, projectMetadataSchema } from "@/schemas/agent-response-validation";
import { runAndValidateAgent } from "@/utils/run-and-validate-agent";

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
