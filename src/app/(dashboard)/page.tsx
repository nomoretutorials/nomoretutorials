import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

import prisma from "@/lib/prisma";
import { getServerUserSession } from "../../utils/get-server-user-session";
import Navbar from "./_components/navbar/Navbar";
import ProjectsSection from "./_components/project/ProjectsSection";
import ShowOnboarding from "./_components/user/ShowOnboarding";

export default async function Home() {
  const user = await getServerUserSession();

  if (!user) {
    redirect("/auth");
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });

  let userExist = null;
  let showOnboarding = false;

  try {
    userExist = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isOnboarded: true },
    });

    showOnboarding = !userExist?.isOnboarded;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: "Dashboard",
        operation: "fetch_user_session",
      },
      extra: {
        userId: user.id,
      },
    });

    showOnboarding = false;
  }

  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
      <ShowOnboarding show={showOnboarding} />
    </div>
  );
}
