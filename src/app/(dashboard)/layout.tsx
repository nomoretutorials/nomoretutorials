import { redirect } from "next/navigation";
import React from "react";
import { getServerUserSession } from "@/utils/get-server-user-session";

import prisma from "@/lib/prisma";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUserSession();
  if (!user) redirect("/auth");

  let userExist;

  try {
    userExist = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isOnboarded: true },
    });
  } catch (error) {
    // Error handling
  }

  if (!userExist?.isOnboarded) redirect("/onboarding");
  return <>{children}</>;
}
