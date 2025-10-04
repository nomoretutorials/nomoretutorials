"use client";

import Link from "next/link";
import { Calendar1Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Project } from "./ProjectsSection";

interface ProjectCardProps {
  project: Project;
  isLatest?: boolean;
}

const ProjectCard = ({ project, isLatest }: ProjectCardProps) => {
  return (
    <Card className="group border-border/70 bg-card relative flex h-64 w-full max-w-sm flex-col rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
      {isLatest && (
        <div className="bg-primary/80 text-background absolute -top-2.5 right-4 z-10 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm">
          Last Updated
        </div>
      )}
      {/* Header */}
      <CardHeader className="flex items-start justify-between">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
            <Calendar1Icon className="h-3.5 w-3.5" />
            {new Date(project.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              project.status === "completed"
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {project.status}
          </span>
        </CardTitle>

        <CardAction></CardAction>
      </CardHeader>

      {/* Content */}
      <div className="mt-auto flex flex-col gap-6">
        <CardContent className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-medium">{project.title}</h1>
          <p className="text-xs font-light">{project.description}</p>
        </CardContent>

        <CardFooter className="border-border flex items-center justify-between border-t pt-3">
          <Link href={`/project/${project.id}`}>
            <Button size="sm">Continue</Button>
          </Link>
          <span className="text-muted-foreground text-xs">
            Shortcut:{" "}
            <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
              Ctrl + P
            </kbd>
          </span>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ProjectCard;
