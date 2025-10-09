"use client";

import { Feature } from "@/types/project";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  features: Feature[];
  selectedFeatures: string[];
  onToggleFeature: (featureId: string) => void;
};

export default function FeatureSelection({ features, selectedFeatures, onToggleFeature }: Props) {
  return (
    <>
      <p className="text-muted-foreground mb-4 text-base font-medium">
        Select the features you want to include in your project
      </p>

      {selectedFeatures.length > 0 && (
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 shadow-sm">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {selectedFeatures.length}
          </span>
          <p className="text-sm font-medium text-blue-800">
            Feature{selectedFeatures.length > 1 ? "s" : ""} selected
          </p>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        {features.map((feature) => {
          const isSelected = selectedFeatures.includes(feature.id);
          return (
            <div
              key={feature.id}
              className={`group hover:border-primary/40 relative flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:shadow-sm ${
                isSelected ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onClick={() => onToggleFeature(feature.id)}
            >
              <Checkbox
                id={feature.id}
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => onToggleFeature(feature.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={feature.id}
                  className="cursor-pointer text-sm leading-tight font-medium"
                >
                  {feature.title}
                </Label>
                <p className="text-muted-foreground mt-1 text-sm leading-snug">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
