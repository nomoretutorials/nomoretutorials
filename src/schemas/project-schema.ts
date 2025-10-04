import * as z from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(20, "Title too long."),
  description: z.string().min(1, "Description is required").max(100, "Description is too long."),
});

export const featureSelectionSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  selectedFeatures: z.array(z.string()).min(1, "Please select at least one feature"),
});

export const techStackSelectionSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  selectedFeatures: z.array(z.string()).min(1, "Please select at least one feature"),
  selectedTechStacks: z.array(z.string()).min(1, "Please select at least one tech stack"),
});
