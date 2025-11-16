// components/project/FeatureSelection.tsx
"use client";

import { Feature } from "@/types/project";
import { Info, Lock, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  features: Feature[];
  selectedFeatures: string[];
  onToggleFeature: (featureId: string) => void;
};

export default function FeatureSelection({ features, selectedFeatures, onToggleFeature }: Props) {
  console.log(features);
  const grouped = {
    BASIC: features.filter((feature) => feature.category === "BASIC"),
    ENHANCEMENT: features.filter((feature) => feature.category === "ENHANCEMENT"),
    ADVANCED: features.filter((feature) => feature.category === "ADVANCED"),
  };

  const canSelect = (feature: Feature) =>
    !feature.prerequisites.length ||
    feature.prerequisites.every((p) => selectedFeatures.includes(p));

  const missingPrereqs = (feature: Feature) =>
    feature.prerequisites
      .filter((p) => !selectedFeatures.includes(p))
      .map((p) => features.find((ff) => ff.id === p)?.title)
      .filter(Boolean);

  const findDependents = (id: string): string[] => {
    const dependents: string[] = [];
    const checked = new Set<string>();
    const find = (fid: string) => {
      if (checked.has(fid)) return;
      checked.add(fid);
      features.forEach((feature) => {
        if (feature.prerequisites.includes(fid) && selectedFeatures.includes(feature.id)) {
          dependents.push(feature.id);
          find(feature.id);
        }
      });
    };
    find(id);
    return dependents;
  };

  const handleToggle = (id: string) => {
    const selected = selectedFeatures.includes(id);
    if (selected) {
      findDependents(id).forEach(onToggleFeature);
      onToggleFeature(id);
    } else if (canSelect(features.find((feature) => feature.id === id)!)) {
      onToggleFeature(id);
    }
  };

  const FeatureCard = ({ feature }: { feature: Feature }) => {
    const selected = selectedFeatures.includes(feature.id);
    const disabled = !canSelect(feature);
    const missing = missingPrereqs(feature);

    return (
      <div
        onClick={() => !disabled && handleToggle(feature.id)}
        className={cn(
          "group flex items-start gap-2.5 rounded-md border p-2.5 text-xs transition-all",
          selected
            ? "border-primary/50 bg-primary/5"
            : "border-muted hover:border-primary/30 hover:bg-muted/30",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Checkbox
          id={feature.id}
          checked={selected}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{feature.title}</span>
              {feature.isRecommended && <Sparkles className="h-3 w-3 text-amber-500" />}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground hover:text-foreground h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  {feature.learningValue}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-muted-foreground text-xs leading-tight">{feature.description}</p>

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            {feature.difficulty && (
              <span className="capitalize">{feature.difficulty.toLowerCase()}</span>
            )}
            <span>• {feature.estimatedSteps} steps</span>
            {feature.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary" className="h-4 px-1.5 text-[10px]">
                {t}
              </Badge>
            ))}
            {disabled && missing.length > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <Lock className="h-3 w-3" /> Needs {missing.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, desc, list }: { title: string; desc: string; list: Feature[] }) => (
    <div className="space-y-2">
      <div className="border-border/50 border-b pb-1.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
      <div className="space-y-2">
        {list.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-sm">
      <Section title="Basic" desc="Core app functionality" list={grouped.BASIC} />
      <Section title="Enhancement" desc="Polish & usability" list={grouped.ENHANCEMENT} />
      <Section title="Advanced" desc="Complex, powerful list features" list={grouped.ADVANCED} />
    </div>
  );
}
