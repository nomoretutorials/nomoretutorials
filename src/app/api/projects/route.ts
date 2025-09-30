import { error, success } from "@/utils/apiResponse";
import { getServerUserSession } from "@/utils/getServerUserSession";

import prisma from "@/lib/prisma";

// TODO: Implement zod validation.

export async function GET() {
  try {
    const user = await getServerUserSession();

    if (!user) return error("Unauthorized", 401);

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return success(projects);
  } catch {
    return error("Internal Server Error", 500);
  }
}
