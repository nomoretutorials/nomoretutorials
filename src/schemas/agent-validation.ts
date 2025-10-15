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

const FeatureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["core", "essential", "enhancement"]),
  learningValue: z.string(), // What will they learn building this?
});

export const featuresListSchema = z.object({
  features: z.array(FeatureSchema),
});

const BuildStepSchema = z.object({
  index: z.number().int().positive(),
  title: z.string().min(3).max(60),
  category: z.enum(["SETUP", "FOUNDATION", "FEATURE", "INTEGRATION", "POLISH", "DEPLOYMENT"]),
  relatedFeatures: z.array(z.string()).optional(), // Feature IDs this step builds
  prerequisiteSteps: z.array(z.number()).optional(), // Which steps must come before
  estimatedComplexity: z.enum(["EASY", "MEDIUM", "HARD"]),
  learningFocus: z.string(), // What they'll learn in this step
});

export const buildStepsListSchema = z.object({
  steps: z.array(BuildStepSchema).min(8).max(25),
});

export type buildStepListType = z.infer<typeof buildStepsListSchema>;

export const stepContentAgentSchema = z.object({
  overview: z.string().describe("2-3 sentences explaining what this step accomplishes"),
  instructions: z.array(z.string()).describe("5-8 actionable guidance points (not complete code)"),
  checkpoints: z.array(z.string()).describe("2-3 ways to verify progress"),
});

export type stepContentType = z.infer<typeof stepContentAgentSchema>;
