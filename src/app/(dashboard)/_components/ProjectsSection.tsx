import ProjectCard from "./ProjectCard";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, EllipsisVerticalIcon, MapIcon } from "lucide-react";
import NewProjectCard from "./NewProjectComponent";

const ProjectsSection = () => {
  return (
    <div className="h-[calc(100vh-4rem)] px-2 overflow-hidden pb-2">
      <div className="h-full rounded-2xl bg-gradient-to-b from-white/1 to-transparent border bg-background shadow-sm px-9 pt-8 space-y-10 overflow-y-auto pb-1">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <div className="border p-2 rounded-lg bg-card">
                <MapIcon className="size-4" />
              </div>
              <span>Quick Action</span>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button>New</Button>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          <NewProjectCard />
          <Card className="bg-card border border-border h-full relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="flex items-center justify-between">
              <Button
                size="sm"
                variant={"link"}
                className="rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 text-[10px] font-medium"
              >
                Auto Generated
              </Button>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                A pre-built example to explore features without setup.
              </p>
            </CardContent>
            <CardFooter className="border-t border-border flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="text-lg" aria-hidden>
                  🧪
                </span>
                Auto project
              </span>
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize bg-neutral-100 text-neutral-900 dark:bg-neutral-900/40 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800">
                nextjs
              </span>
            </CardFooter>
          </Card>
        </div>

        <div
          id="all-projects"
          className="flex items-center justify-between border-b border-border pb-4"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <div className="border p-2 rounded-lg bg-card">
                <BookmarkIcon className="size-4" />
              </div>
              <span>All Projects</span>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline">Sort</Button>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProjectCard />
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
