import { generateBuildStepsJob } from "@/inngest/functions/generate-build-steps-job";
import { generateFeatureJob } from "@/inngest/functions/generate-features-job";
import { serve } from "inngest/next";



import { inngest } from "../../../inngest/client";
import { generateBuildStepContentJob } from "@/inngest/functions/generate-step-content-job";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateFeatureJob, generateBuildStepsJob, generateBuildStepContentJob],
});