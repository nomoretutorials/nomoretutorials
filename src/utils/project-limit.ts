import * as Sentry from "@sentry/nextjs";

import prisma from "@/lib/prisma";

export const projectLimit = async (userId: string) => {
  try {
    return await prisma.project.count({ where: { userId } });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { module: "ProjectLimit", operation: "count_user_projects" },
      extra: { userId },
      level: "error",
    });

    return null;
  }
};
