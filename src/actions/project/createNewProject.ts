"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// TODO: Input zod validation

export async function createNewProject({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (!data?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        userId: data.user.id,
      },
      select: {
        id: true,
      },
    });

    return { success: true, project };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Something went wrong" };
  }
}
