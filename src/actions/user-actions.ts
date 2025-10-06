"use server";

import { revalidatePath } from "next/cache";
import { getServerUserSession } from "@/utils/get-server-user-session";
import * as Sentry from "@sentry/nextjs";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/hooks/useServerAction";

export async function completeOnboarding(): Promise<ActionResponse<{ userId: string }>> {
  try {
    const user = await getServerUserSession();
    if (!user?.id) return { success: false, error: "Unauthorized" };

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isOnboarded: true,
      },
    });

    revalidatePath("/dashboard");

    Sentry.addBreadcrumb({
      category: "server_action",
      message: "User successfully onboarded",
      level: "info",
      data: {
        userId: user.id,
      },
    });

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: "completeOnboarding",
        type: "server_action",
      },
    });
    return { success: false, error: "Failed to complete onboarding." };
  }
}
