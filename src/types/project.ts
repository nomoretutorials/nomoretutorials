import { Prisma, StepCategory, StepComplexity, StepStatus } from "@prisma/client";

export interface Project {
  id: string;
  title: string;
  description: string;
  techStacks: string[];
  createdAt: Date;
  updatedAt: Date;
  status: string;
  repositoryUrl?: string | null;
  features?: Prisma.JsonValue;
  currentStepIndex: number;
  Steps?: Step[];
}

export type TechStack = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
};

export type UserTechStack = {
  techStackId: string;
};

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: "BASIC" | "ENHANCEMENT" | "ADVANCED";
  selected?: boolean;

  learningValue: string;
  userValue: string;
  estimatedSteps: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isRecommended: boolean;

  prerequisites: string[];
  enablesFeatures: string[];
  requiresTools: string[];
  tags: string[];
}

export interface FeaturesResponse {
  features: Feature[];
  recommendedSelection: {
    basic: string[];
    enhancement: string[];
    advanced: string[];
    reasoning: string;
  };
}

export interface Step {
  id: string;
  index: number;
  title: string;
  status: StepStatus;
  category: StepCategory;
  estimatedComplexity: StepComplexity;
  learningFocus: string;
  relatedFeatures: string[];
  content: string | null;
  summary: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}
