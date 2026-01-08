import z from "zod";

export const metadataAgentSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(12, "Title must be short.")
    .refine((t) => t.split(" ").length <= 2, "Title must be 1 or 2 words.")
    .describe("A short brand-style name (1-2 words, max 12 characters"),
  description: z.string().describe("A brief description ( max 120 characters )"),
});

export type metadataAgentType = z.infer<typeof metadataAgentSchema>;

const featureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["BASIC", "ENHANCEMENT", "ADVANCED"]),

  learningValue: z.string(),
  userValue: z.string(),
  estimatedSteps: z.number().min(1).max(3),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  isRecommended: z.boolean(),

  prerequisites: z.array(z.string()).default([]),
  enablesFeatures: z.array(z.string()).default([]),
  requiresTools: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

// const recommendedSelectionSchema = z.object({
//   basic: z.array(z.string()),
//   enhancement: z.array(z.string()),
//   advanced: z.array(z.string()),
//   reasoning: z.string(),
// });

export const featuresListSchema = z.object({
  features: z.array(featureSchema).min(8).max(12),
  // recommendedSelection: recommendedSelectionSchema,
});

export type Feature = z.infer<typeof featureSchema>;
export type FeaturesListResponse = z.infer<typeof featuresListSchema>;

const buildStepSchema = z.object({
  index: z.number().int().positive(),
  title: z.string().min(5).max(100),
  category: z.enum(["SETUP", "FOUNDATION", "FEATURE", "INTEGRATION", "POLISH", "DEPLOYMENT"]),
  relatedFeatures: z.array(z.string()).default([]),
  prerequisiteSteps: z.array(z.number().int()).default([]),
  estimatedComplexity: z.enum(["EASY", "MEDIUM", "HARD"]),
  learningFocus: z.string().min(10).max(200),
});

export const buildStepsListSchema = z.object({
  steps: z.array(buildStepSchema).min(5).max(20),
});

export type BuildStep = z.infer<typeof buildStepSchema>;
export type BuildStepsList = z.infer<typeof buildStepsListSchema>;

export const stepContentAgentSchema = z.object({
  overview: z.string().describe("2-3 sentences explaining what this step accomplishes"),
  instructions: z.array(z.string()).describe("5-8 actionable guidance points (not complete code)"),
  checkpoints: z.array(z.string()).describe("2-3 ways to verify progress"),
});

export type stepContentType = z.infer<typeof stepContentAgentSchema>;
