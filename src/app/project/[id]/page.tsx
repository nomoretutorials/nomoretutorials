import { notFound, redirect } from "next/navigation";
import { getAllTechStacks, getProject } from "@/actions/project-actions";

import ProjectPageClient from "../_components/project/ProjectPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const [projectResult, techStacksResult] = await Promise.all([getProject(id), getAllTechStacks()]);

  if (!projectResult.success) {
    if (projectResult.message === "Unauthorized") {
      notFound();
      redirect("/auth");
    }
    console.error("Project fetch failed:", projectResult.message);
    notFound();
  }

  if (!techStacksResult?.success) {
    console.error("Tech stack fetch failed:", techStacksResult.message);
    return <ProjectPageClient project={projectResult.data.project} techStacks={[]} />;
  }

  return (
    <ProjectPageClient project={projectResult.data.project} techStacks={techStacksResult.data} />
  );
}
