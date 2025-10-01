import { notFound } from "next/navigation";
import { getProject } from "@/actions/projectActions";

import ProjectPageClient from "../_components/ProjectPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

// TODO: Implement try/catch

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const { project } = await getProject(id);

  if (!project) {
    notFound();
  }

  return <ProjectPageClient project={project} />;
}
