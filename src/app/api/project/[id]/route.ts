// src/app/api/project/[id]/route.ts
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        features: true,
        status: true,
        updatedAt: true,
        Steps: {
          orderBy: { index: "asc" },
        },
      },
    });

    if (!project) return NextResponse.json("Project Not Found");

    return NextResponse.json({ data: { project } });
  } catch (err) {
    console.error("Failed to load project:", err);
    return NextResponse.json("Project Not Found");
  }
}
