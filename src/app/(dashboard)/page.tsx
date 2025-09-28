import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getServerUserSession } from "../utils/getServerUserSession";
import Navbar from "./_components/navbar/Navbar";
import NewUserOnboarding from "./_components/NewUserOnboarding";
import ProjectsSection from "./_components/ProjectsSection";

export default async function Home() {
  const user = await getServerUserSession();

  if (!user) {
    redirect("/auth");
  }

  const userExist = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isOnboarded: true },
  });

  const showOnboarding = !userExist?.isOnboarded;

  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
      {showOnboarding && <NewUserOnboarding />}
    </div>
  );
}
