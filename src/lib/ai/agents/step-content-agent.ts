import { stepContentAgentSchema } from "@/schemas/agent-validation";
import { Feature, StepContent } from "@/types/project";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

type Props = {
  stepTitle: string;
  projectTitle: string;
  projectDescription: string;
  techStackNames: string[];
  selectedFeatures: Feature[];
  previousSteps?: Array<{ index: number; title: string; content: StepContent }>;
};

export async function projectStepContentAgent({
  stepTitle,
  projectTitle,
  projectDescription,
  techStackNames,
  selectedFeatures,
  previousSteps,
}: Props) {
  const featuresList = selectedFeatures.map((f) => f.title).join(", ");
  const techStackList = techStackNames.join(", ");

  let contextSection = "";
  if (previousSteps && previousSteps.length > 0) {
    const previousContext = previousSteps
      .map((step) => {
        const overview = step.content.overview || "No overview available";
        return `Step ${step.index}: ${step.title}\n Summary: ${overview}`;
      })
      .join("\n\n");

    contextSection = `
        ### CONTEXT: Prior Learning Path
The learner has already completed the following steps in this project:

${previousContext}

### CONTINUITY OBJECTIVE
You are continuing from this foundation. Treat the previous steps as context you **must build upon**, not restart.  
When generating content for the next step:

1. **Reference prior progress explicitly**
   - Mention previous configurations, components, or files where relevant.  
   - Show how this step *extends* or *connects* with them.  
   - Use phrases like “Continuing from the last step…” or “Building upon the earlier setup…”.

2. **Preserve narrative and conceptual flow**
   - Maintain naming conventions, terminology, and architectural decisions from prior steps.  
   - Avoid introducing new abstractions or libraries unless necessary.

3. **Depth over repetition**
   - Do not restate what’s already been explained.  
   - Instead, deepen understanding by explaining *why* this next step follows naturally.  
   - If reusing old code, summarize it in one line, not by re-explaining.

4. **Smooth transitions**
   - Open the step with a short contextual bridge (1–2 sentences) linking this step to the last one.  
   - End the step with a clear indicator of what the learner has now achieved and what the next logical step might be.

5. **Recency Bias**
   - Prioritize the last 2–3 steps as the most relevant context.  
   - Use older steps only for major dependencies (e.g., project setup, core architecture).

Output should be concise, structured, and written in a mentoring tone (encouraging, confident, guiding).

      `;
  }

  const result = await generateObject({
    model: openai("gpt-5-nano"),
    schema: stepContentAgentSchema,
    prompt: `
        You are a coding mentor creating educational content for developers learning to build real projects.

Project: ${projectTitle}
Description: ${projectDescription}
Tech Stack: ${techStackList}
Features: ${featuresList}

Current Step: ${stepTitle}
${contextSection}

Generate learning content for this step that:

1. **Overview**: Explain what the learner will accomplish (2-3 sentences)

2. **Instructions**: Provide 5-8 guidance points that:
   - Are actionable but not spoon-feeding
   - Point to documentation/resources
   - Encourage exploration and problem-solving
   - Guide toward the solution without giving complete code
   - Example: "Install Express.js and set up a basic server. Check the Express docs for the minimal setup needed."

3. **Hints**: Share 2-3 tips like:
   - Common mistakes beginners make
   - Best practices to follow
   - Links to relevant documentation
   - Debugging suggestions

4. **Checkpoints**: Give 2-3 ways to verify they're on track:
   - "Your server should respond on port 3000"
   - "Running the test suite should show 5 passing tests"
   - "Check the Network tab - you should see API calls"

Tone: Encouraging, mentor-like, assumes the learner wants to learn (not just copy-paste).
    `,
  });

  return result.object;
}
