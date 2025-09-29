import { EllipsisVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const SystemProjectCard = () => {
  return (
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
  );
};

export default SystemProjectCard;
