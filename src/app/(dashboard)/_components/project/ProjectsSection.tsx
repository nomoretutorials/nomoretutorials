import { BookmarkIcon, MapIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import NewProjectCard from "./NewProjectCard";
import ProjectCard from "./ProjectCard";

// TODO: Sort the last updated project and show beside create new proj.

const ProjectsSection = () => {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden px-2">
      <div className="bg-background h-full space-y-10 overflow-y-auto rounded-2xl border bg-gradient-to-b from-white/1 to-transparent px-9 py-8 shadow-sm">
        {/* Quick Action */}
        <section id="dashboard" className="border-border flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
              <div className="bg-card rounded-lg border p-2">
                <MapIcon className="size-4" />
              </div>
              <span>Quick Action</span>
            </h2>
          </div>
        </section>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <NewProjectCard />
        </div>

        {/* All Projects */}
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

          <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Example project card, replace with your project mapping */}
            <ProjectCard />
          </div>
        </section>

        {/* Spacer so it's always scrollable */}
        <div className="h-[600px]" />
      </div>
    </div>
  );
};

export default ProjectsSection;
