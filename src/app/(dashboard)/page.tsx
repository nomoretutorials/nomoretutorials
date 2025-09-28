import { auth } from "@/lib/auth";
import Navbar from "./_components/Navbar";
import NewUserOnboarding from "./_components/NewUserOnboarding";
import ProjectsSection from "./_components/ProjectsSection";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOnboarded: true },
  });

  const showOnboarding = !user?.isOnboarded;

  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
      {showOnboarding && <NewUserOnboarding />}
    </div>
  );
}
