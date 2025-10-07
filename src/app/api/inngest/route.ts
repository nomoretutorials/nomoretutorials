import { generateFeatureJob } from "@/inngest/functions/generate-features-job";
import { serve } from "inngest/next";

import { inngest } from "../../../inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateFeatureJob],
});
