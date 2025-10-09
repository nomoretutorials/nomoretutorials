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

export const featureAgentSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  title: z.string().min(1, "Feature title cannot be empty"),
  description: z.string().min(5, "Feature description must be at least 5 characters"),
});

export const featuresListSchema = z.object({
  features: z.array(featureAgentSchema).min(3).max(15),
});

const CATEGORY = ["Setup", "Core", "Polish", "Deployment"] as const;

export const buildStepSchema = z.object({
  index: z.number().min(1).max(25).describe("Sequential step number starting from 1."),
  title: z
    .string()
    .min(1, "Build step title cannot be empty")
    .max(60)
    .describe("A clear, concise step title (max 6 words)"),
  category: z.enum(CATEGORY).describe("Step category defining its phase in the build process."),
});

export const buildStepsListSchema = z.object({
  steps: z.array(buildStepSchema).min(5).max(25),
});

export type buildStepListType = z.infer<typeof buildStepsListSchema>;

export const stepContentAgentSchema = z.object({
  overview: z.string().describe("2-3 sentences explaining what this step accomplishes"),
  instructions: z.array(z.string()).describe("5-8 actionable guidance points (not complete code)"),
  checkpoints: z.array(z.string()).describe("2-3 ways to verify progress"),
});

export type stepContentType = z.infer<typeof stepContentAgentSchema>;
