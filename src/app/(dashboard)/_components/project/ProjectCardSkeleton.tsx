"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectCardSkeleton = () => {
  return (
    <Card className="border-border/70 bg-card relative flex h-68 w-full max-w-sm flex-col overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>

      <div className="mt-auto flex flex-col gap-6">
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-3 w-52 rounded-md" />
          <Skeleton className="h-3 w-44 rounded-md" />
        </CardContent>

        <CardFooter className="border-border flex items-center justify-between border-t pt-3">
          <Skeleton className="h-8 w-20 rounded-md" /> {/* Button */}
          <Skeleton className="h-3 w-24 rounded-md" /> {/* Shortcut */}
        </CardFooter>
      </div>
    </Card>
  );
};

export default ProjectCardSkeleton;
