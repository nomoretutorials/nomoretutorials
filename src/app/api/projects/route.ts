import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: data.user.id },
    orderBy: { updatedAt: "desc" },
  });

  console.log("Projects:", projects);

  return NextResponse.json(projects);
}
