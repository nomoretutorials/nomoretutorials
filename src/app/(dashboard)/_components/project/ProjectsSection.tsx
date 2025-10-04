"use client";

import { useEffect, useState } from "react";
import { BookmarkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyProject from "./EmptyProject";
import NewProjectCard from "./NewProjectCard";
import ProjectCard from "./ProjectCard";
import ProjectCardSkeleton from "./ProjectCardSkeleton";

export interface Project {
  id: string;
  title: string;
  description: string;
  techStacks: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
  repositoryUrl?: string;
  features?: Record<string, unknown>;
}

const ProjectsSection = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.data);
      })
      .catch((error) => console.error("Fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden px-2">
      <div className="bg-background h-full space-y-8 overflow-y-auto rounded-2xl border bg-gradient-to-b from-white/1 to-transparent px-9 py-8 shadow-sm">
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

          {loading ? (
            <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyProject />
          )}
        </section>

        <div className="h-[600px]" />
      </div>
    </div>
  );
};

export default ProjectsSection;
