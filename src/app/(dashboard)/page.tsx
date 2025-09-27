import { auth } from "@/lib/auth";
import Navbar from "./_components/Navbar";
import NewUserOnboarding from "./_components/NewUserOnboarding";
import ProjectsSection from "./_components/ProjectsSection";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
      <NewUserOnboarding />
    </div>
  );
}
