import { notFound, redirect } from "next/navigation";
import { getAllTechStacks, getProject } from "@/actions/project-actions";
import * as Sentry from "@sentry/nextjs";

import ProjectPageClient from "../_components/project/ProjectPageClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    Sentry.captureMessage("Invalid project ID parameter", {
      level: "warning",
      extra: { id },
    });
    notFound();
  }

  Sentry.addBreadcrumb({
    category: "project",
    message: "Fetching project and tech stacks",
    level: "info",
    data: {
      projectId: id,
    },
  });

  const [projectResult, techStacksResult] = await Promise.all([getProject(id), getAllTechStacks()]);

  if (!projectResult.success) {
    if (projectResult.error === "Unauthorized") {
      Sentry.captureException(new Error("Unauthorized project access"), {
        tags: {
          component: "ProjectPage",
          operation: "fetch_project",
          auth_status: "unauthorized",
        },
        extra: {
          projectId: id,
        },
      });
      redirect("/auth");
    }

    Sentry.captureException(new Error(projectResult.error || "Failed to fetch project"), {
      tags: {
        component: "ProjectPage",
        operation: "fetch_project",
      },
      extra: {
        projectId: id,
        result: projectResult,
      },
    });
    notFound();
  }

  if (!techStacksResult?.success) {
    Sentry.captureException(new Error(techStacksResult.error || "Failed to fetch tech stacks"), {
      tags: {
        component: "ProjectPage",
        operation: "fetch_tech_stacks",
      },
      level: "warning",
      extra: {
        projectId: id,
        result: techStacksResult,
      },
    });

    Sentry.addBreadcrumb({
      category: "project",
      message: "Rendering project page without tech stacks",
      level: "warning",
      data: {
        projectId: id,
      },
    });
    return <ProjectPageClient project={projectResult.data.project} techStacks={[]} />;
  }

  Sentry.addBreadcrumb({
    category: "project",
    message: "Project page loaded successfully",
    level: "info",
    data: {
      projectId: id,
      techStacksCount: techStacksResult.data?.length || 0,
    },
  });

  return (
    <ProjectPageClient project={projectResult.data.project} techStacks={techStacksResult.data} />
  );
}
