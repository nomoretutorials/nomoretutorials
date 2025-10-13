import { Prisma, StepStatus, StepCategory, StepComplexity } from "@prisma/client";

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

export type Feature = {
  id: string;
  title: string;
  description: string;
  priority: string;
  learningValue: string;
  selected?: boolean;
};

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

