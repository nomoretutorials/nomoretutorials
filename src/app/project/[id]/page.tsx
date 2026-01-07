import { notFound, redirect } from "next/navigation";
import { getAllTechStacks, getProject } from "@/actions/project-actions";
import { getUserTechStack } from "@/actions/user-actions";
import { getServerUserSession } from "@/utils/get-server-user-session";

import ProjectPageClient from "../_components/project/ProjectPageClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const user = await getServerUserSession();
  if (!user) redirect("/auth");

  const [projectResult, techStacksResult, userTechStackResult] = await Promise.all([
    getProject(id),
    getAllTechStacks(),
    getUserTechStack(user.id),
  ]);

  if (!projectResult.success) {
    if (projectResult.error === "Unauthorized") {
      redirect("/auth");
    }
    notFound();
  }

  if (!techStacksResult?.success) {
    return (
      <ProjectPageClient project={projectResult.data.project} techStacks={[]} userTechStack={[]} />
    );
  }

  return (
    <ProjectPageClient
      project={projectResult.data.project}
      techStacks={techStacksResult.data || []}
      userTechStack={userTechStackResult.data || []}
    />
  );
}
