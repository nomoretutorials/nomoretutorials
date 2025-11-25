"use client";

import { BookmarkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjectQueries";
import EmptyProject from "./EmptyProject";
import NewProjectCard from "./NewProjectCard";
import ProjectCard from "./ProjectCard";
import ProjectCardSkeleton from "./ProjectCardSkeleton";

const ProjectsSection = () => {
  const { data: projects = [], isPending } = useProjects();

  const latestProject = projects.length > 1 ? projects[0] : null;
  const restProjects = projects.length > 1 ? projects.slice(1) : projects;

  const handleDelete = () => {};

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden px-2">
      <div className="bg-background h-full space-y-8 overflow-y-auto rounded-2xl border bg-linear-to-b from-white/1 to-transparent px-9 py-8 shadow-sm">
        <section
          aria-labelledby="quick-actions-title"
          id="dashboard"
          className="border-border flex items-center justify-between border-b pb-4"
        >
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
              <div className="bg-card rounded-lg border p-2">
                <BookmarkIcon className="size-4" aria-hidden="true" />
              </div>
              <span>Quick Action</span>
            </h2>
          </div>
        </section>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <NewProjectCard />
          {isPending ? (
            <ProjectCardSkeleton />
          ) : (
            latestProject && (
              <ProjectCard
                key={latestProject.id}
                project={latestProject}
                isLatest
                onDelete={handleDelete}
              />
            )
          )}
        </div>

        <section id="all-projects">
          <div className="border-border flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                <div className="bg-card rounded-lg border p-2">
                  <BookmarkIcon className="size-4" />
                </div>
                <span>All Projects</span>
              </h2>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="outline">Sort</Button>
            </div>
          </div>

          {isPending ? (
            <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {restProjects.map((p) => (
                <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <EmptyProject />
          )}
        </section>

        <div className="h-150" />
      </div>
    </div>
  );
};

export default ProjectsSection;
