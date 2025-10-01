import { notFound } from "next/navigation";
import { getProject } from "@/actions/projectActions";

import SpecificProjectPageClient from "../_components/SpecificProjectPageClient";

type Props = {
  params: { id: string };
};

// TODO: Implement try/catch

export default async function SpecificProjectPage({ params }: Props) {
  const { project } = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return <SpecificProjectPageClient project={project} />;
}
