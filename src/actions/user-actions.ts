"use server";

import { revalidatePath } from "next/cache";
import { UserTechStack } from "@/types/project";
import { getServerUserSession } from "@/utils/get-server-user-session";
import { ExperienceLevel } from "@prisma/client";

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

    return { success: true, data: { userId: user.id } };
  } catch (error) {
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

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    return { success: false, error: "Failed to set up popular stack." };
  }
}

export async function getUserTechStack(userId: string): Promise<any> {
  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const techStacks = await prisma.userTechStack.findMany({
      where: {
        userId,
      },
      select: {
        techStackId: true,
      },
    });
    return { success: true, data: techStacks as UserTechStack[] };
  } catch (error) {
    console.error("Failed to fetch tech stacks:", error);
    return { success: false, error: "Something went wrong" };
  }
}
