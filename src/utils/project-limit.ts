import prisma from "@/lib/prisma";

export const projectLimit = async (userId: string) => {
  try {
    return await prisma.project.count({ where: { userId } });
  } catch (error) {
    return null;
  }
};
