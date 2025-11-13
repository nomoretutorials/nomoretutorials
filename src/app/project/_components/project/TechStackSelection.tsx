"use client";

import { useEffect, useMemo } from "react";
import { TechStack } from "@/types/project";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  techStacks: TechStack[];
  userTechStack: any;
  selectedTechStacks: string[];
  onToggleTechStack: (stackId: string) => void;
};

export default function TechStackSelection({
  techStacks,
  userTechStack,
  selectedTechStacks,
  onToggleTechStack,
}: Props) {
  // 🧠 Extract user tech stack IDs
  const userTechStackIds = useMemo(
    () => userTechStack?.map((u: any) => u.techStackId) ?? [],
    [userTechStack]
  );

  // 🧩 Group stacks by category
  const groupedStacks = techStacks.reduce(
    (acc, stack) => {
      if (!acc[stack.category]) acc[stack.category] = [];
      acc[stack.category].push(stack);
      return acc;
    },
    {} as Record<string, TechStack[]>
  );

  // 💡 Define category priority
  const categoryOrder = ["FULLSTACK", "FRONTEND", "BACKEND", "DATABASE", "ORM", "AUTHENTICATION"];

  // 🔢 Sort categories according to priority
  const categories = Object.keys(groupedStacks).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  const formatCategory = (c: string) => {
    const s = c.replace(/_/g, " ").toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  useEffect(() => {
    if (!userTechStack?.length) return;
    const userIds = userTechStack.map((u: any) => u.techStackId);
    console.log("User Tech Stack IDs:", userIds);
  }, [userTechStack]);

  return (
    <div className="space-y-8 rounded-xl">
      <div>
        <p className="text-muted-foreground mb-4 text-sm">
          Select the technologies you want to use for your project
        </p>

        {selectedTechStacks.length > 0 && (
          <div className="border-border bg-muted/20 mb-6 max-h-28 overflow-y-auto rounded-lg border p-4">
            <p className="text-foreground mb-2 text-sm font-semibold">
              Selected Tech Stack ({selectedTechStacks.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTechStacks.map((stackId) => {
                const stack = techStacks.find((s) => s.id === stackId);
                const isUserStack = userTechStackIds.includes(stackId);

                return stack ? (
                  <Badge
                    key={stackId}
                    variant="secondary"
                    className={`shadow-sm ${
                      isUserStack
                        ? "border border-amber-400 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {stack.name}
                    {isUserStack && (
                      <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                        (profile)
                      </span>
                    )}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Render sorted categories */}
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <div>
            <div className="text-muted-foreground/80 mb-1 font-mono text-xs tracking-tight uppercase">
              {category}
            </div>
            <h3 className="text-foreground relative pl-3 text-base font-semibold">
              <span className="bg-primary/80 absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded" />
              {formatCategory(category)}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {groupedStacks[category].map((stack) => {
              const active = selectedTechStacks.includes(stack.id);
              const isUserStack = userTechStackIds.includes(stack.id);

              return (
                <label
                  key={stack.id}
                  htmlFor={stack.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all duration-200 ${
                    active
                      ? isUserStack
                        ? "border-amber-500 bg-amber-50 ring-amber-400/40 dark:border-amber-700 dark:bg-amber-950/30"
                        : "border-primary bg-primary/10 ring-primary/40 hover:bg-primary/15 shadow-[0_0_6px_1px_var(--primary)/25] ring-1"
                      : "border-border bg-card hover:border-primary/40 hover:bg-accent/10 hover:shadow-sm"
                  }`}
                  style={{ transform: active ? "translateY(-1px)" : "none" }}
                >
                  <div className="mt-1">
                    <Checkbox
                      id={stack.id}
                      checked={active}
                      onCheckedChange={() => onToggleTechStack(stack.id)}
                    />
                  </div>

                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        active ? "text-foreground" : "text-foreground/90"
                      }`}
                    >
                      {stack.name}
                    </div>
                    {stack.description && (
                      <p className="text-muted-foreground mt-1 text-xs">{stack.description}</p>
                    )}
                    {isUserStack && (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        (From your profile)
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
