import { BookmarkIcon, MapIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import NewProjectCard from "./NewProjectCard";
import ProjectCard from "./ProjectCard";

// TODO: Sort the last updated project and show beside create new proj.

const ProjectsSection = () => {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden px-2 pb-2">
      <div className="bg-background h-full space-y-10 overflow-y-auto rounded-2xl border bg-gradient-to-b from-white/1 to-transparent px-9 py-8 shadow-sm">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
              <div className="bg-card rounded-lg border p-2">
                <MapIcon className="size-4" />
              </div>
              <span>Quick Action</span>
            </h2>
          </div>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <NewProjectCard />
        </div>

        <div
          id="all-projects"
          className="border-border flex items-center justify-between border-b pb-4"
        >
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ProjectCard />
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
