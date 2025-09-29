"use server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { onboardingPayload } from "@/app/(dashboard)/_components/user/NewUserOnboarding";
import { ExperienceLevel } from "@/generated/prisma";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function completeOnboarding({
  experienceLevel,
  frontend,
  backend,
}: onboardingPayload) {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = data.user.id;

    const selectedStacks = [...(frontend || []), ...(backend || [])];

    const techStacks = await prisma.techStack.findMany({
      where: {
        slug: {
          in: selectedStacks.map((s) => s.toLowerCase()),
        },
      },
    });

    const userTechStacks = techStacks.map((stack) => ({
      userId,
      techStackId: stack.id,
    }));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          experienceLevel: {
            set: experienceLevel as ExperienceLevel,
          }, // update global level
          isOnboarded: true,
        },
      }),
      prisma.userTechStack.createMany({
        data: userTechStacks,
        skipDuplicates: true,
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Something went wrong" };
  }
}
