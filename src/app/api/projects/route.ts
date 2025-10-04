import { error, success } from "@/utils/api-response";
import { getServerUserSession } from "@/utils/get-server-user-session";

import prisma from "@/lib/prisma";

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
