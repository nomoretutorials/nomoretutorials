"use server";

import { metadataAgentType } from "@/schemas/agent-validation";
import { getServerUserSession } from "@/utils/get-server-user-session";
import * as Sentry from "@sentry/nextjs";

import { projectMetadataAgent } from "@/lib/ai/agents/project-metadata-agent";
import { ActionResponse } from "@/hooks/useServerAction";

export async function generateMetadata(
  projectIdea?: string
): Promise<ActionResponse<metadataAgentType>> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    if (!projectIdea) {
      const errorMessage = "Please input a valid project idea.";

      Sentry.captureException(errorMessage, {
        level: "warning",
        tags: { function: "generateMetadata" },
      });
      return { success: false, error: errorMessage };
    }

    const metadata = await projectMetadataAgent(projectIdea);

    if (!metadata) {
      const errorMessage = "Invalid title or description generated";

      Sentry.captureException(errorMessage, {
        level: "warning",
        extra: { projectIdea, metadata },
      });
      return { success: false, error: errorMessage };
    }

    return { success: true, data: metadata };
  } catch (error) {
    Sentry.captureException(error, {
      extra: { projectIdea, userId: user.id },
      tags: { function: "generateMetadata" },
    });
    return { success: false, error: "Failed to generate project metadata" };
  }
}
