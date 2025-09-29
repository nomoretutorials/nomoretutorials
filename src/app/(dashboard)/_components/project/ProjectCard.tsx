"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar1Icon, EllipsisVerticalIcon, XIcon } from "lucide-react";

// TODO: Create Shortcut for Each Project Card alt + 1 ...

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Project {
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

const ProjectCard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.data))
      .catch((error) => console.error("Fetch error:", error));
  }, []);

  const toggleDrawer = (projectId: string) => {
    setOpenProjectId((prev) => (prev === projectId ? null : projectId));
  };

  return (
    <>
      {projects?.map((item) => {
        const isOpen = openProjectId === item.id;

        return (
          <Card
            key={item.id}
            className="group border-border/70 bg-card relative flex h-64 w-full max-w-sm flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
          >
            {/* Card Header */}
            <CardHeader className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
                    isOpen
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <Calendar1Icon className="h-3.5 w-3.5" />
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "completed"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {item.status}
                </span>
              </CardTitle>

              <CardAction>
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition"
                  onClick={() => toggleDrawer(item.id)}
                >
                  {isOpen ? (
                    <XIcon className="text-muted-foreground h-5 w-5" />
                  ) : (
                    <EllipsisVerticalIcon className="text-muted-foreground h-5 w-5" />
                  )}
                </Button>
              </CardAction>
            </CardHeader>

            <div className="mt-auto flex flex-col gap-6">
              <CardContent className="flex flex-col items-start gap-1">
                <h1 className="text-xl font-medium">TodoGPT</h1>
                <p className="text-xs font-light">Organize your life with TodoGPT, Your AI Powered task manager.</p>
              </CardContent>

              <CardFooter className="border-border flex items-center justify-between border-t pt-3">
                <Link href={`/project/${item.id}`}>
                  <Button size={"sm"} className="cursor-pointer">
                    Continue
                  </Button>
                </Link>
                <span className="text-muted-foreground text-xs">
                  Shortcut:{" "}
                  <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
                    Ctrl + P
                  </kbd>
                </span>
              </CardFooter>
            </div>

            <div
              className={`border-border/40 bg-background/95 absolute inset-0 z-20 transform rounded-xl border-t backdrop-blur-md transition-transform duration-500 ease-out ${
                isOpen ? "translate-y-0" : "translate-y-full"
              }`}
            >
              {/* Close button */}
              <button
                onClick={() => setOpenProjectId(null)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-3 right-3 rounded-full p-2 transition"
              >
                <XIcon className="h-4 w-4" />
              </button>

              {/* Scrollable drawer content */}
              <div className="flex h-full flex-col pt-10">
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {/* Tech Stacks */}
                  <p className="mb-2 text-sm font-medium">Tech Stacks:</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {["Next.js", "TailwindCSS", "PostgreSQL"].map((stack, i) => (
                      <span
                        key={i}
                        className="from-primary/10 to-primary/20 text-muted-foreground rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] shadow-sm"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <p className="mb-2 text-sm font-medium">Key Features:</p>
                  <ul className="text-muted-foreground mb-3 list-inside list-disc space-y-1 text-xs">
                    <li>User authentication & sessions</li>
                    <li>Task management with CRUD operations</li>
                    <li>Responsive dashboard UI</li>
                    <li>Deployed with CI/CD</li>
                  </ul>
                </div>

                {/* Repository (sticky bottom) */}
                <div className="border-border bg-background/80 border-t px-4 py-2">
                  <p className="text-sm font-medium">Repository:</p>
                  <a
                    href="https://github.com/example/repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-xs underline"
                  >
                    github.com/example/repo
                  </a>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
};

export default ProjectCard;
