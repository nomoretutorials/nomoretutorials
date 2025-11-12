"use server";

import { revalidatePath } from "next/cache";
import { getServerUserSession } from "@/utils/get-server-user-session";
import { ExperienceLevel } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/hooks/useServerAction";

// Complete onboarding with tech stack selection
export async function completeTechStackSelection(data: {
  primaryTechStackIds: string[]; // Full-stack OR Frontend + Backend
  additionalToolIds?: string[]; // Database, ORM, Auth (optional)
  experienceLevel: ExperienceLevel;
}): Promise<ActionResponse<{ userId: string }>> {
  try {
    const user = await getServerUserSession();
    if (!user?.id) return { success: false, error: "Unauthorized" };

    // Validate: At least one primary tech stack is required
    if (!data.primaryTechStackIds || data.primaryTechStackIds.length === 0) {
      return { success: false, error: "Please select at least one tech stack" };
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      await tx.userTechStack.deleteMany({
        where: { userId: user.id },
      });

      const primaryStacks = data.primaryTechStackIds.map((techStackId) => ({
        userId: user.id,
        techStackId,
        isPrimary: true,
      }));

      const additionalTools = (data.additionalToolIds || []).map((techStackId) => ({
        userId: user.id,
        techStackId,
        isPrimary: false,
      }));

      // Bulk insert all tech stacks
      await tx.userTechStack.createMany({
        data: [...primaryStacks, ...additionalTools],
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          experienceLevel: data.experienceLevel,
          isOnboarded: true,
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    Sentry.addBreadcrumb({
      category: "server_action",
      message: "User completed tech stack selection and onboarding",
      level: "info",
      data: {
        userId: user.id,
        primaryCount: data.primaryTechStackIds.length,
        additionalCount: data.additionalToolIds?.length || 0,
        experienceLevel: data.experienceLevel,
      },
    });

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: "completeTechStackSelection",
        type: "server_action",
      },
    });
    return { success: false, error: "Failed to save tech stack selection." };
  }
}

export async function usePopularStack(data: {
  experienceLevel: ExperienceLevel;
}): Promise<ActionResponse<{ userId: string }>> {
  try {
    const user = await getServerUserSession();
    if (!user?.id) return { success: false, error: "Unauthorized" };

    const techStacks = await prisma.techStack.findMany({
      where: {
        slug: {
          in: ["nextjs", "postgresql", "prisma", "better-auth"],
        },
      },
    });

    const nextjs = techStacks.find((t) => t.slug === "nextjs");
    const postgresql = techStacks.find((t) => t.slug === "postgresql");
    const prismaStack = techStacks.find((t) => t.slug === "prisma");
    const betterAuth = techStacks.find((t) => t.slug === "better-auth");

    if (!nextjs || !postgresql || !prismaStack || !betterAuth) {
      return { success: false, error: "Popular stack configuration not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.userTechStack.deleteMany({
        where: { userId: user.id },
      });

      await tx.userTechStack.createMany({
        data: [
          {
            userId: user.id,
            techStackId: nextjs.id,
            isPrimary: true,
          },
          {
            userId: user.id,
            techStackId: postgresql.id,
            isPrimary: false,
          },
          {
            userId: user.id,
            techStackId: prismaStack.id, // ✅ fixed
            isPrimary: false,
          },
          {
            userId: user.id,
            techStackId: betterAuth.id,
            isPrimary: false,
          },
        ],
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          experienceLevel: data.experienceLevel,
          isOnboarded: true,
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    Sentry.addBreadcrumb({
      category: "server_action",
      message: "User selected popular stack",
      level: "info",
      data: {
        userId: user.id,
        experienceLevel: data.experienceLevel,
      },
    });

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: "usePopularStack",
        type: "server_action",
      },
    });
    return { success: false, error: "Failed to set up popular stack." };
  }
}

// Legacy: Keep for backward compatibility
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
      message: "User completed onboarding (legacy)",
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
