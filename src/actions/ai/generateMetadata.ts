"use server";

import { getServerUserSession } from "@/utils/get-server-user-session";

import { projectMetadataAgent } from "@/lib/ai/agents/projectMetadataAgent";

export async function generateMetadata(projectIdea: string) {
  const user = await getServerUserSession();
  if (!user) return { success: "false", error: "Unauthorized" };

  const metadata = await projectMetadataAgent(projectIdea);

  return { success: true, data: metadata };
}
