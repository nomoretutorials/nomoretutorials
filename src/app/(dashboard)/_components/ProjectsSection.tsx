import ProjectCard from "./ProjectCard";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EllipsisVerticalIcon, Plus } from "lucide-react";

const NewProjectCard = () => {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* subtle gradient top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/15 to-transparent"
      />
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Plus className="size-5" />
          </span>
          Start a new project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Spin up a blank project. You can add stacks and integrations any time.
        </p>
      </CardContent>
      <CardFooter className="border-t border-border flex items-center justify-between">
        <Button size="sm" asChild>
          <Link href="#">Create</Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          Shortcut: <kbd className="rounded bg-muted px-1 py-0.5">Ctrl + P</kbd>
        </span>
      </CardFooter>
    </Card>
  );
};

const ProjectsSection = () => {
  return (
    <div className="h-[calc(100vh-4rem)] px-2 overflow-hidden pb-2">
      <div className="h-full rounded-2xl border bg-background shadow-sm px-8 py-6 space-y-10 overflow-y-auto pb-1">
        {/* Quick actions header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              ⚡ Quick actions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start something new or explore an auto-generated project
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline">Import</Button>
            <Button>New</Button>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <NewProjectCard />
          {/* Dummy Project */}
          <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-neutral-900/10 to-neutral-900/0 dark:from-neutral-100/10 dark:to-neutral-100/0"
            />
            <CardHeader className="flex items-center justify-between">
              <Button
                size="sm"
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

        {/* Recent projects header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              📂 Recent projects
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your latest workspaces
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline">Sort</Button>
          </div>
        </div>

        {/* Recent projects grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProjectCard />
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
