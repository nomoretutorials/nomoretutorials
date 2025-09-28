"use client";

import React, { useEffect, useState } from "react";
import { Calendar1Icon, EllipsisVerticalIcon } from "lucide-react";

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

const stackStyles: Record<string, string> = {
  nextjs:
    "bg-neutral-100 text-neutral-900 dark:bg-neutral-900/40 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800",
  react:
    "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100 border border-sky-200 dark:border-sky-800",
  node: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800",
  python:
    "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 border border-amber-200 dark:border-amber-800",
  typescript:
    "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100 border border-blue-200 dark:border-blue-800",
  javascript:
    "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-800",
};

// Helper function to get primary stack from techStacks array
const getPrimaryStack = (techStacks: string[]): string => {
  if (!techStacks || techStacks.length === 0) return "unknown";
  return techStacks[0].toLowerCase();
};

const ProjectCard = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => {
        console.log("Fetch response status:", res.status);
        console.log("Fetch response ok:", res.ok);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);
        setProjects(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }, []);

  console.log(projects);

  return (
    <>
      {projects.map((item) => {
        const primaryStack = getPrimaryStack(item.techStacks);

        return (
          <Card
            key={item.id}
            className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #d1d5db 1px, transparent 1px),
                  linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
                maskImage: "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
              }}
            />
            <CardHeader className="">
              <Button variant={"secondary"} size={"sm"} className="z-10 justify-self-start">
                <Calendar1Icon style={{ color: "#6b7280" }} />{" "}
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </Button>
              <CardAction>
                <Button variant={"ghost"}>
                  <EllipsisVerticalIcon style={{ color: "#6b7280" }} />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground line-clamp-3 text-sm">{item.description}</div>
            </CardContent>
            <CardFooter className="border-border flex items-center justify-between border-t">
              <CardTitle className="flex items-center gap-2 text-xl tracking-tighter capitalize">
                <span className="text-xl" aria-hidden></span>
                <span>{item.title}</span>
              </CardTitle>
              <span
                className={
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize " +
                  (stackStyles[primaryStack] ??
                    "bg-secondary text-secondary-foreground border-border border")
                }
              >
                {primaryStack}
              </span>
            </CardFooter>
          </Card>
        );
      })}
    </>
  );
};

export default ProjectCard;
