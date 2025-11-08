import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

import prisma from "@/lib/prisma";
import { getServerUserSession } from "../../utils/get-server-user-session";
import Navbar from "./_components/navbar/Navbar";
import ProjectsSection from "./_components/project/ProjectsSection";

export default async function Home() {
  const user = await getServerUserSession();

  if (!user) {
    redirect("/auth");
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });

  // Check if user is onboarded (this is the only DB call needed)
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

  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
    </div>
  );
}
