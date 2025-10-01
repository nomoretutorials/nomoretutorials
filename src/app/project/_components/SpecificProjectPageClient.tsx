"use client";

import { useState } from "react";
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

export default function SpecificProjectPageClient({ project }: Props) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const currentStep = project.Steps[selectedStepIndex];
  console.log("Select Step Index: ", selectedStepIndex);

  // toggle checkbox
  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  // make sure content is parsed safely
  let features: Features[] = [];
  try {
    if (currentStep?.content) {
      features = currentStep.content as Features[];
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
              <h1 className="text-2xl font-bold">
                {project.title}
                <span className="text-muted-foreground ml-2 text-sm">{project.description}</span>
              </h1>

              <div className="mt-8 space-y-6">
                {currentStep ? (
                  <div className="space-y-4">
                    <h2 className="mb-4 text-xl font-semibold">{currentStep.title}</h2>

                    {currentStep.status === "PENDING" && (
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                        <p className="text-muted-foreground">Generating content...</p>
                      </div>
                    )}

                    {currentStep.status === "COMPLETED" && features.length > 0 && (
                      <div className="space-y-3">
                        {features.map((feature) => (
                          <div
                            key={feature.id}
                            className="hover:bg-accent flex items-start space-x-3 rounded-lg border p-3"
                          >
                            <Checkbox
                              id={feature.id}
                              checked={selectedFeatures.includes(feature.id)}
                              onCheckedChange={() => toggleFeature(feature.id)}
                            />
                            <div>
                              <Label
                                htmlFor={feature.id}
                                className="text-sm leading-none font-medium"
                              >
                                {feature.name}
                              </Label>
                              <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Select a step from the sidebar to view details
                  </p>
                )}
              </div>
            </div>
            <ChangeStep
              onNext={() => setSelectedStepIndex((prev) => prev + 1)}
              onPrev={() => setSelectedStepIndex((prev) => prev - 1)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
