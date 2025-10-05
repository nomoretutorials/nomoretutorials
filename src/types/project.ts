import { Prisma, StepStatus } from "@prisma/client";

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
  name: string;
  description: string;
};

export interface Step {
  id: string;
  index: number;
  title: string;
  status: StepStatus;
  content: Prisma.JsonValue;
  isCompleted: boolean;
  projectId: string;
  repositoryURL?: string;
}

export interface StepContent {
  // Define your step content structure
  [key: string]: unknown;
}
