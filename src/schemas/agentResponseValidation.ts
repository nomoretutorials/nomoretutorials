import * as z from "zod";

export const projectMetadataSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(12, "Title must be short.")
    .refine((t) => t.split(" ").length <= 2, "Title must be 1 or 2 words."),
  description: z.string().max(120, "Description must be concise."),
});

export type projectMetadata = z.infer<typeof projectMetadataSchema>;

export const FeatureSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  title: z.string().min(1, "Feature title cannot be empty"),
  description: z.string().min(5, "Feature description must be at least 5 characters"),
});

export const FeatureListSchema = z.object({
  features: z.array(FeatureSchema).min(3).max(15),
});

export type Feature = z.infer<typeof FeatureSchema>;
export type FeaturesList = z.infer<typeof FeatureListSchema>;
