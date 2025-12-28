// app/project/[id]/page.tsx
import { notFound } from "next/navigation";
import { getAllTechStacks, getUserTechStack } from "@/actions/project-actions";
import { getServerUserSession } from "@/utils/get-server-user-session";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import ProjectPageClient from "../_components/project/ProjectPageClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  const user = await getServerUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
      },
    },
  });

  const fetchProjectInline = async (projectId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/project/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Cookies sent automatically
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    return result.data.project; // Your API returns { features: [...] 
  };

  try {
    await queryClient.prefetchQuery({
      queryKey: ["project", id],
      queryFn: () => fetchProjectInline(id),
    });
  } catch (error) {
    notFound();
  }

  if (!id || typeof id !== "string") {
    notFound();
  }

  const { data: techStacks } = await getAllTechStacks();
  const { data: userTechStack } = await getUserTechStack(user.id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectPageClient projectId={id} techStacks={techStacks} userTechStack={userTechStack} />
    </HydrationBoundary>
  );
}
