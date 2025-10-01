"use client";

import { useState } from "react";
import { saveSelectedFeatures } from "@/actions/projectActions";
import { Prisma } from "@prisma/client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ChangeStep from "./ChangeStep";
import Sidebar from "./sidebar/Sidebar";

// TODO: Implement Zustand for State management and avoid prop drilling.

type Project = {
  id: string;
  title: string;
  description: string;
  features: Prisma.JsonValue;
  Steps: Array<{
    id: string;
    index: number;
    title: string;
    status: string;
    content: Prisma.JsonValue;
    isCompleted: boolean;
    projectId: string;
  }>;
};

type Features = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  project: Project;
};

// TODO: Selected step index goes to negative on step change.

export default function ProjectPageClient({ project }: Props) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentStep = project.Steps[selectedStepIndex];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      await saveSelectedFeatures(project.id, selectedFeatures);
      setSelectedStepIndex(1);
    } catch (error) {
      console.error("Failed to save features:", error);
    } finally {
      setIsSaving(false);
    }
  };

  let features: Features[] = [];
  try {
    if (currentStep?.content) {
      if (typeof currentStep.content === "string") {
        // If it's stored as a JSON string
        features = JSON.parse(currentStep.content);
      } else if (Array.isArray(currentStep.content)) {
        // If Prisma stored it as raw JSON array
        features = currentStep.content as Features[];
      } else {
        console.warn("Unexpected step.content format:", currentStep.content);
      }
    }
  } catch (e) {
    console.error("Invalid features JSON:", e);
  }

  return (
    <div className="h-lvh overflow-hidden p-2">
      <div className="bg-background h-full overflow-hidden rounded-2xl border px-0 py-0 shadow-sm">
        <div className="flex h-full">
          <Sidebar
            steps={project.Steps}
            title={project.title}
            currentStepIndex={selectedStepIndex}
            onStepSelect={setSelectedStepIndex}
          />

          <main className="relative flex h-full min-h-full flex-1 flex-col overflow-y-auto">
            <div className="max-w-4xl flex-1 p-8">
              <div className="mt-8 space-y-6">
                {currentStep ? (
                  <div className="space-y-4">
                    <h2 className="mb-4 text-xl font-semibold">{currentStep.title}</h2>

                    {/* Step 1: Features */}
                    {currentStep.index === 0 && (
                      <>
                        {currentStep.status === "PENDING" && (
                          <div className="py-12 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                            <p className="text-muted-foreground">Generating features...</p>
                          </div>
                        )}

                        {currentStep.status === "COMPLETED" && features.length > 0 && (
                          <>
                            <p className="text-muted-foreground mb-4">
                              Select the features you want to include in your project
                            </p>
                            <div className="space-y-3">
                              {features.map((feature) => (
                                <div
                                  key={feature.id}
                                  className="hover:bg-accent flex items-start space-x-3 rounded-lg border p-4"
                                >
                                  <Checkbox
                                    id={feature.id}
                                    checked={selectedFeatures.includes(feature.id)}
                                    onCheckedChange={() => toggleFeature(feature.id)}
                                  />
                                  <div className="flex-1">
                                    <Label
                                      htmlFor={feature.id}
                                      className="cursor-pointer text-sm leading-none font-medium"
                                    >
                                      {feature.name}
                                    </Label>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                      {feature.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {selectedFeatures.length > 0 && (
                              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                                <p className="text-sm text-blue-700">
                                  {selectedFeatures.length} feature(s) selected
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* Step 2: Tech Stack - placeholder for now */}
                    {currentStep.index === 1 && (
                      <div className="py-12 text-center">
                        <p className="text-muted-foreground">Tech stack selection coming next...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No steps available yet</p>
                )}
              </div>
            </div>
            <ChangeStep
              currentStepIndex={selectedStepIndex}
              totalSteps={project.Steps.length}
              selectedFeatures={selectedFeatures}
              onNext={() => setSelectedStepIndex((prev) => prev + 1)}
              onPrev={() => setSelectedStepIndex((prev) => prev - 1)}
              onSaveAndContinue={handleSaveAndContinue}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
