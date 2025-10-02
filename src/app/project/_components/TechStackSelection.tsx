"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// TODO: Fix Active State

type TechStack = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
};

type Props = {
  techStacks: TechStack[];
  selectedTechStacks: string[];
  onToggleTechStack: (stackId: string) => void;
};

export default function TechStackSelection({
  techStacks,
  selectedTechStacks,
  onToggleTechStack,
}: Props) {
  // Group by category
  const groupedStacks = techStacks.reduce(
    (acc, stack) => {
      if (!acc[stack.category]) {
        acc[stack.category] = [];
      }
      acc[stack.category].push(stack);
      return acc;
    },
    {} as Record<string, TechStack[]>
  );

  const categories = Object.keys(groupedStacks);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-4">
          Select the technologies you want to use for your project
        </p>

        {selectedTechStacks.length > 0 && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <p className="mb-2 text-sm font-medium text-blue-900">
              Selected Tech Stack ({selectedTechStacks.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTechStacks.map((stackId) => {
                const stack = techStacks.find((s) => s.id === stackId);
                return stack ? (
                  <Badge key={stackId} variant="secondary">
                    {stack.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold capitalize">
            {category.toLowerCase().replace("_", " ")}
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {groupedStacks[category].map((stack) => (
              <div
                key={stack.id}
                className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                  selectedTechStacks.includes(stack.id)
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-accent"
                }`}
              >
                <Checkbox
                  id={stack.id}
                  checked={selectedTechStacks.includes(stack.id)}
                  onCheckedChange={() => onToggleTechStack(stack.id)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={stack.id}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {stack.name}
                  </Label>
                  {stack.description && (
                    <p className="text-muted-foreground mt-1 text-xs">{stack.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
