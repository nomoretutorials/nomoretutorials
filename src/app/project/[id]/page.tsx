import { notFound } from "next/navigation";
import { getProject } from "@/actions/projectActions";

import SpecificProjectPageClient from "../_components/SpecificProjectPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

// TODO: Implement try/catch

export default async function SpecificProjectPage({ params }: Props) {
  const { id } = await params;
  const { project } = await getProject(id);

  if (!project) {
    notFound();
  }

  return <SpecificProjectPageClient project={project} />;
}
