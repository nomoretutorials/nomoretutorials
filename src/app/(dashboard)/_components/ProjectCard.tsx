import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar1Icon, EllipsisVerticalIcon } from "lucide-react";
import React from "react";

const projects = [
  {
    id: 1,
    title: "inngest agent",
    icon: "⚙️",
    description:
      "Python service collecting application metrics and pushing to Prometheus.",
    primaryStack: "nextjs",
  },
  {
    id: 2,
    title: "marketing site",
    icon: "🪄",
    description:
      "A fast, content-driven Next.js site with MDX, analytics, and image optimization.",
    primaryStack: "nextjs",
  },
  {
    id: 3,
    title: "customer portal",
    icon: "👤",
    description:
      "React SPA for account management, billing history, and usage insights.",
    primaryStack: "react",
  },
  {
    id: 4,
    title: "workflow service",
    icon: "🧩",
    description:
      "Node-based job runner orchestrating queues, retries, and scheduled tasks.",
    primaryStack: "node",
  },
  {
    id: 5,
    title: "metrics exporter",
    icon: "📊",
    description:
      "Python service collecting application metrics and pushing to Prometheus.",
    primaryStack: "python",
  },
];

const stackStyles: Record<string, string> = {
  nextjs:
    "bg-neutral-100 text-neutral-900 dark:bg-neutral-900/40 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800",
  react:
    "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100 border border-sky-200 dark:border-sky-800",
  node: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800",
  python:
    "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 border border-amber-200 dark:border-amber-800",
};

const stackGradients: Record<string, string> = {
  nextjs:
    "from-neutral-900/10 to-neutral-900/0 dark:from-neutral-100/10 dark:to-neutral-100/0",
  react: "from-sky-500/15 to-sky-500/0",
  node: "from-emerald-500/15 to-emerald-500/0",
  python: "from-amber-500/15 to-amber-500/0",
};

const stackBackgrounds: Record<string, string> = {
  nextjs:
    "bg-gradient-to-br from-neutral-500/5 to-transparent dark:from-neutral-400/5",
  react: "bg-gradient-to-br from-sky-500/5 to-transparent",
  node: "bg-gradient-to-br from-emerald-500/5 to-transparent",
  python: "bg-gradient-to-br from-amber-500/5 to-transparent",
};

const ProjectCard = () => {
  return (
    <>
      {projects.map((item) => (
        <Card
          key={item.id}
          className={
            "relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 " +
            (stackBackgrounds[item.primaryStack] ?? "")
          }
        >
          <div
            aria-hidden
            className={
              "pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b " +
              (stackGradients[item.primaryStack] ??
                "from-primary/10 to-transparent")
            }
          />
          <CardHeader className="">
            <Button
              variant={"secondary"}
              size={"sm"}
              className="z-10 justify-self-start"
            >
              <Calendar1Icon /> Sep 09, 2024
            </Button>
            <CardAction>
              <Button variant={"ghost"}>
                <EllipsisVerticalIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground line-clamp-3">
              {item.description}
            </div>
          </CardContent>
          <CardFooter className="border-t border-border flex items-center justify-between">
            <CardTitle className="capitalize tracking-tighter text-xl flex items-center gap-2">
              {item.icon ? (
                <span className="text-xl" aria-hidden>
                  {item.icon}
                </span>
              ) : null}
              <span>{item.title}</span>
            </CardTitle>
            <span
              className={
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize " +
                (stackStyles[item.primaryStack] ??
                  "bg-secondary text-secondary-foreground border border-border")
              }
            >
              {item.primaryStack}
            </span>
          </CardFooter>
        </Card>
      ))}
    </>
  );
};

export default ProjectCard;
