import { redirect } from "next/navigation";
import React from "react";
import { getServerUserSession } from "@/utils/get-server-user-session";
import * as Sentry from "@sentry/nextjs";

import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUserSession();
  if (!user) redirect("/auth");

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });

  let userExist;

  try {
    userExist = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isOnboarded: true },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: "Dashboard",
        operation: "fetch_user_onboarding_status",
      },
      extra: {
        userId: user.id,
      },
    });
  }

  if (!userExist?.isOnboarded) redirect("/onboarding");
  return <>{children}</>;
}
