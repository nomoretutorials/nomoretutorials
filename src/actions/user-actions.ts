"use server";

import { getServerUserSession } from "@/utils/get-server-user-session";

import prisma from "@/lib/prisma";

export async function completeOnboarding() {
  try {
    const user = await getServerUserSession();
    if (!user) return { success: false, message: "Unauthorized" };

    const userId = user.id;

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isOnboarded: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Something went wrong" };
  }
}
