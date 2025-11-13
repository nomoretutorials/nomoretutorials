"use client";

import { Feature } from "@/types/project";
import { Info, Lock, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  features: Feature[];
  selectedFeatures: string[];
  onToggleFeature: (featureId: string) => void;
};

export default function FeatureSelection({ features, selectedFeatures, onToggleFeature }: Props) {
  // console.log(features)
  const grouped = {
    BASIC: features.filter((f) => f.category === "BASIC"),
    ENHANCEMENT: features.filter((f) => f.category === "ENHANCEMENT"),
    ADVANCED: features.filter((f) => f.category === "ADVANCED"),
  };

  const canSelect = (f: Feature) =>
    !f.prerequisites.length || f.prerequisites.every((p) => selectedFeatures.includes(p));

  const missingPrereqs = (f: Feature) =>
    f.prerequisites
      .filter((p) => !selectedFeatures.includes(p))
      .map((p) => features.find((ff) => ff.id === p)?.title)
      .filter(Boolean);

  const findDependentFeatures = (featureId: string): string[] => {
    const dependents: string[] = [];
    const checked = new Set<string>();

    const findDependents = (id: string) => {
      if (checked.has(id)) return;
      checked.add(id);

      features.forEach((f) => {
        if (f.prerequisites.includes(id) && selectedFeatures.includes(f.id)) {
          dependents.push(f.id);
          findDependents(f.id);
        }
      });
    };

    findDependents(featureId);
    return dependents;
  };

  const handleToggle = (featureId: string) => {
    const isCurrentlySelected = selectedFeatures.includes(featureId);

    if (isCurrentlySelected) {
      // Deselect: also remove dependent features
      const dependents = findDependentFeatures(featureId);

      // Deselect dependents first
      dependents.forEach((id) => onToggleFeature(id));

      // Then deselect this one
      onToggleFeature(featureId);
    } else {
      // Select (only if prerequisites are satisfied)
      onToggleFeature(featureId);
    }
  };

  const FeatureCard = ({ feature }: { feature: Feature }) => {
    const isSelected = selectedFeatures.includes(feature.id);
    const disabled = !canSelect(feature);
    const missing = missingPrereqs(feature);

    return (
      <div
        key={feature.id}
        onClick={() => !disabled && handleToggle(feature.id)}
        className={`group bg-background relative flex items-start gap-3 rounded-lg border p-4 transition-all ${
          isSelected
            ? "border-primary/40 bg-primary/5"
            : "border-muted hover:border-primary/30 hover:bg-muted/40"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:shadow-sm"} `}
      >
        <Checkbox
          id={feature.id}
          checked={isSelected}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1">
          {/* Title & Description */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-foreground text-sm leading-tight font-semibold">
                  {feature.title}
                </p>
                {feature.isRecommended && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {feature.description}
              </p>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground hover:text-foreground mt-0.5 h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs leading-snug">
                  <p>{feature.learningValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Meta info */}
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
            {feature.difficulty && (
              <span className="capitalize">{feature.difficulty.toLowerCase()} difficulty</span>
            )}
            <span>• {feature.estimatedSteps} steps</span>
            {feature.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-md px-1.5 py-0.5 text-[10px]">
                {tag}
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

  const Section = ({
    title,
    desc,
    features,
  }: {
    title: string;
    desc: string;
    features: Feature[];
  }) => (
    <div className="space-y-3">
      <div className="border-border/60 mb-2 border-b pb-2">
        <h3 className="text-foreground text-base font-semibold">{title}</h3>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
      <div className="space-y-3">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <Section
        title="Basic Features"
        desc="Core essentials that power your app."
        features={grouped.BASIC}
      />
      <Section
        title="Enhancement Features"
        desc="Make your app more polished and functional."
        features={grouped.ENHANCEMENT}
      />
      <Section
        title="Advanced Features"
        desc="Complex, impressive capabilities for advanced users."
        features={grouped.ADVANCED}
      />
    </div>
  );
}
