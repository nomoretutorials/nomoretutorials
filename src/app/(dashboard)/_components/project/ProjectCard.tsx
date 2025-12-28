"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Project } from "@/types/project";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar1Icon, EllipsisVerticalIcon, Github, Trash2, XIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteProject } from "@/hooks/useProjectQueries";

interface ProjectCardProps {
  project: Project;
  isLatest?: boolean;
  onDelete: (id: string, opts?: { rollback?: boolean; project?: Project }) => void;
}

const ProjectCard = ({ project, isLatest }: ProjectCardProps) => {
  const [open, setOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      Promise.resolve(router.push(`/project/${project.id}`)).finally(() => setIsNavigating(false));
    }, 2500);
  };

  return (
    <Card className="group border-border/70 bg-card relative flex h-68 w-full max-w-sm flex-col rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
      {/* --- Latest Tag --- */}
      {isLatest && (
        <div className="bg-primary/80 text-background absolute -top-2.5 right-4 z-10 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm">
          Last Updated
        </div>
      )}

      {/* --- Header --- */}
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

        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="transition-transform hover:scale-105"
          >
            {open ? (
              <XIcon className="text-muted-foreground h-5 w-5" />
            ) : (
              <EllipsisVerticalIcon className="text-muted-foreground h-5 w-5" />
            )}
          </Button>
        </CardAction>
      </CardHeader>

      {/* --- Content --- */}
      <div className="mt-auto flex flex-col gap-6">
        <CardContent className="flex flex-col gap-2 px-5 pt-1">
          {/* Title */}
          <h1 className="text-foreground group-hover:text-primary line-clamp-1 text-xl font-semibold tracking-tight transition-colors">
            {project.title}
          </h1>
          {/* Description */}
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {project.description || "No description available."}
          </p>
        </CardContent>

        <CardFooter className="border-border flex items-center justify-between border-t pt-3">
          <Button size="sm" onClick={handleClick} disabled={isNavigating}>
            {isNavigating ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <p>Continue</p>
            )}
          </Button>
        </CardFooter>
      </div>

      {/* --- Subtle Bottom Drawer --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "25vh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-border/40 bg-card/95 absolute right-0 bottom-0 left-0 z-20 overflow-hidden rounded-2xl border-t shadow-2xl backdrop-blur-md"
          >
            <div className="flex h-full flex-col justify-between p-5">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Project Details</h3>
              </div>

              {/* Details */}
              <div className="text-muted-foreground space-y-2 text-xs">
                <p>
                  <span className="text-foreground font-medium">Tech Stack:</span> Next.js,
                  TailwindCSS, Prisma
                </p>
                <p>
                  <span className="text-foreground font-medium">Last Updated:</span>{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* GitHub Link */}
              {project.repositoryUrl && (
                <div className="border-border mt-3 flex items-center gap-2 border-t pt-3">
                  <Github className="text-muted-foreground h-4 w-4" />
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-xs underline underline-offset-2 transition-colors"
                  >
                    {project.repositoryUrl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
                <DeleteAlertDialog project={project}/>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

interface DeleteAlertDialogProps {
  project: Project;
}

const DeleteAlertDialog = ({ project }: DeleteAlertDialogProps) => {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useDeleteProject();

  const handleDelete = async () => {
    mutate(project.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete Project
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action <span className="text-foreground font-semibold">cannot</span> be undone. It
            will permanently delete <span className="font-medium">{project.title}</span> and all its
            data from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProjectCard;
