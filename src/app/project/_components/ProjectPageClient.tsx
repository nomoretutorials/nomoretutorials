"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProjectConfiguration, saveSelectedFeatures } from "@/actions/project-actions";
import { Prisma } from "@prisma/client";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ChangeStep from "./ChangeStep";
import Sidebar from "./sidebar/Sidebar";
import StepContentView, { StepContent } from "./StepContentView";
import TechStackSelection from "./TechStackSelection";

// TODO: Implement Zustand for State management
export type Project = {
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

export type TechStack = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
};

type Features = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  project: Project;
  techStacks: TechStack[];
};

// TODO: Selected step index goes to negative on step change.

export default function ProjectPageClient({ project, techStacks }: Props) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([]);
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  const currentStep = project.Steps[selectedStepIndex];
  console.log(currentStep);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  const toggleTechStack = (stackId: string) => {
    setSelectedTechStacks((prev) => {
      const newValue = prev.includes(stackId)
        ? prev.filter((id) => id !== stackId)
        : [...prev, stackId];
      console.log("Tech Stack toggled:", stackId);
      console.log("New selected tech stacks:", newValue);
      return newValue;
    });
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      if (selectedStepIndex === 0) {
        await saveSelectedFeatures(project.id, selectedFeatures);
        setSelectedStepIndex(1);
      } else if (selectedStepIndex === 1) {
        await saveProjectConfiguration(project.id, selectedFeatures, selectedTechStacks);
        setSelectedStepIndex(2);
      }
    } catch (error) {
      console.error("Failed to save :", error);
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

  const handleClick = () => {
    // TODO: Ensure everything is saved
    router.push("/");
  };

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
            <div className="mx-auto ml-10 w-4xl flex-1 p-8">
              <div className="space-y-6">
                {currentStep ? (
                  <div className="space-y-4">
                    <h2 className="mb-6 h-10 border-b text-2xl font-bold">
                      Step {currentStep.index} - {currentStep.title}
                    </h2>

                    {/* TODO: select all button */}
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
                            <p className="text-muted-foreground mb-4 text-base font-medium">
                              Select the features you want to include in your project
                            </p>

                            {selectedFeatures.length > 0 && (
                              <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 shadow-sm">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                  {selectedFeatures.length}
                                </span>
                                <p className="text-sm font-medium text-blue-800">
                                  Feature
                                  {selectedFeatures.length > 1 ? "s" : ""} selected
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col space-y-3">
                              {features.map((feature) => {
                                const isSelected = selectedFeatures.includes(feature.id);
                                return (
                                  <div
                                    key={feature.id}
                                    className={`group hover:border-primary/40 relative flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:shadow-sm ${isSelected ? "border-primary bg-primary/5" : "border-muted"}`}
                                    onClick={() => toggleFeature(feature.id)}
                                  >
                                    <Checkbox
                                      id={feature.id}
                                      checked={isSelected}
                                      onCheckedChange={() => toggleFeature(feature.id)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor={feature.id}
                                        className="cursor-pointer text-base leading-tight font-semibold"
                                      >
                                        {feature.name}
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
                        )}
                      </>
                    )}

                    {currentStep.index === 1 && (
                      <TechStackSelection
                        techStacks={techStacks}
                        selectedTechStacks={selectedTechStacks}
                        onToggleTechStack={toggleTechStack}
                      />
                    )}

                    {currentStep.index >= 2 && (
                      <>
                        {currentStep.status === "PENDING" && (
                          <div className="py-12 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                            <p className="text-muted-foreground">Loading step content...</p>
                          </div>
                        )}

                        {currentStep.status === "GENERATING" && (
                          <div className="py-12 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                            <p className="text-muted-foreground">
                              AI is generating content for this step...
                            </p>
                          </div>
                        )}

                        {currentStep.status === "COMPLETED" && currentStep.content && (
                          <StepContentView content={currentStep.content as StepContent} />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No steps available yet</p>
                )}
              </div>
            </div>
            <Button
              onClick={handleClick}
              className="text-muted-foreground absolute top-3 right-3 hover:text-foreground"
              size={"sm"}
              variant={"link"}
            >
              <ArrowLeft />
              Back to Dashboard
            </Button>
            <ChangeStep
              currentStepIndex={selectedStepIndex}
              totalSteps={project.Steps.length}
              selectedFeatures={selectedFeatures}
              selectedTechStacks={selectedTechStacks}
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
