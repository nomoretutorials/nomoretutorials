import { BookmarkIcon, EllipsisVerticalIcon, MapIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import NewProjectCard from "./NewProjectComponent";
import ProjectCard from "./ProjectCard";

const ProjectsSection = () => {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden px-2 pb-2">
      <div className="bg-background h-full space-y-10 overflow-y-auto rounded-2xl border bg-gradient-to-b from-white/1 to-transparent px-9 pt-8 pb-1 shadow-sm">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
              <div className="bg-card rounded-lg border p-2">
                <MapIcon className="size-4" />
              </div>
              <span>Quick Action</span>
            </h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button>New</Button>
          </div>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <NewProjectCard />
          <Card className="bg-card border-border relative h-full overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex items-center justify-between">
              <Button
                size="sm"
                variant={"link"}
                className="rounded border border-amber-400/30 bg-amber-500/20 px-2 text-[10px] font-medium text-amber-300"
              >
                Auto Generated
              </Button>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3 text-sm">
                A pre-built example to explore features without setup.
              </p>
            </CardContent>
            <CardFooter className="border-border flex items-center justify-between border-t">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="text-lg" aria-hidden>
                  🧪
                </span>
                Auto project
              </span>
              <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-900 capitalize dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-100">
                nextjs
              </span>
            </CardFooter>
          </Card>
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProjectCard />
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
