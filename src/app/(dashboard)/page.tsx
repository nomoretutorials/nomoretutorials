import { redirect } from "next/navigation";

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

  const userExist = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isOnboarded: true },
  });

  const showOnboarding = !userExist?.isOnboarded;

  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
      <ShowOnboarding show={showOnboarding} />
    </div>
  );
}
