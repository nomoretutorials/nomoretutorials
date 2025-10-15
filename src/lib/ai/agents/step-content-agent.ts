// lib/ai/agents/stepContentAgent.ts
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function projectStepContentAgent({
  stepTitle,
  learningFocus,
  relatedFeatures,
  projectTitle,
  projectDescription,
  techStackNames,
  selectedFeatures,
  previousSteps,
  estimatedComplexity,
}: {
  stepTitle: string;
  learningFocus: string;
  relatedFeatures?: string[];
  projectTitle: string;
  projectDescription: string;
  techStackNames: string[];
  selectedFeatures: Array<{ id: string; title: string; description: string }>;
  previousSteps?: Array<{ index: number; title: string; summary: string }>;
  estimatedComplexity: "EASY" | "MEDIUM" | "HARD";
  apiKey?: string;
}) {
  const techStack = techStackNames.join(", ");

  const previousContext =
    previousSteps && previousSteps.length > 0
      ? previousSteps.map((s) => `- **Step ${s.index}**: ${s.title} (${s.summary})`).join("\n")
      : "None - this is your first step.";

  const stepFeatures = selectedFeatures.filter((f) => relatedFeatures?.includes(f.id));
  const featuresContext =
    stepFeatures.length > 0 ? stepFeatures.map((f) => `- ${f.title}`).join("\n") : "General setup";

  const prompt = `You are a coding mentor creating a **learning guide** (NOT a tutorial) for: "${stepTitle}"

## Context
Project: ${projectTitle} (${projectDescription})
Tech Stack: ${techStack}
Features to build: ${featuresContext}
Complexity: ${estimatedComplexity}
Learning goal: ${learningFocus}

Previous steps completed:
${previousContext}

## Your Output Must Be:
1. **Concise** - No fluff, no repetition. Every sentence must add value.
2. **Action-focused** - Tell them WHAT to build, WHERE to look, WHAT success looks like.
3. **Smart about detail** - More detail for complex parts, less for obvious parts.
4. **No hand-holding** - Guide to resources, don't give solutions.

## Format (in markdown):

### What You're Building
(1-2 sentences max. Be specific. Reference previous work if relevant.)

### Your Tasks
(3-5 bullet points. Each is a clear, actionable task. No explanations unless necessary.)

Example:
- Create a \`User\` model in \`prisma/schema.prisma\` with id, email, name, and password fields
- Set up password hashing using bcrypt before storing
- Create a POST /api/signup endpoint that validates input and creates users

### Key Resources
(2-4 most important links ONLY. Format: **[Title](url)** - one-line context)

### Hints
(2-3 practical tips ONLY when they'd actually get stuck. Skip if obvious.)

Format as:
> 💡 **Tip name**: Brief tip in one sentence

### Verify Your Work
(2-3 specific, testable checkpoints. Be concrete.)

Example:
- [ ] Running \`npx prisma studio\` shows your User table with correct fields
- [ ] POST request to /api/signup returns 201 and creates a user in database
- [ ] Passwords are hashed (never stored as plain text)

---

## Critical Rules:

**BE CONCISE**:
- Overview: 1-2 sentences max
- Tasks: 3-5 bullet points (one line each unless complex)
- No redundant explanations
- Skip obvious things (e.g., don't explain what a file is)

**BE SMART ABOUT DETAIL**:
${
  estimatedComplexity === "EASY"
    ? "This is EASY - be brief, they can figure it out. Only add detail for tricky parts."
    : estimatedComplexity === "MEDIUM"
      ? "This is MEDIUM - give direction but no solutions. Point to docs, describe patterns."
      : "This is HARD - they need to research. Give conceptual direction and point to multiple resources."
}

**BE CONTEXT-AWARE**:
${
  previousSteps && previousSteps.length > 0
    ? `They've completed: ${previousSteps.map((s) => s.title).join(", ")}. Don't re-explain those concepts. Build on them.`
    : "This is their first step. Be slightly more explicit but still concise."
}

**NO FLUFF**:
❌ "In this exciting step, we'll embark on a journey to..."
✅ "Set up Prisma to connect to PostgreSQL."

❌ "Let's think about how we might approach this problem..."
✅ "Create an API route that handles user signup."

❌ Long explanations of WHY before HOW
✅ Quick WHAT, then WHERE to learn more

**SHOW PATTERNS, NOT SOLUTIONS**:
When showing code, use:
- Placeholders: \`yourFieldName\`, \`YourModel\`
- Incomplete snippets with comments: \`// Your validation logic here\`
- Structure only: Show the shape, not the implementation

Example of GOOD pattern:
\`\`\`typescript
// Pattern for API route
export async function POST(request: Request) {
  const body = await request.json();
  // 1. Validate input
  // 2. Process data
  // 3. Return response
}
\`\`\`

Example of BAD (too complete):
\`\`\`typescript
export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) return Response.json({ error: "Invalid" });
  const user = await prisma.user.create({ data: { email, password } });
  return Response.json(user);
}
\`\`\`

---

Now generate concise, action-focused content for "${stepTitle}".

Remember:
- Be brief and direct
- Skip obvious explanations
- More detail only where complexity demands it
- Guide to resources, don't give solutions
- Every word must earn its place`;

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
    temperature: 0.6,
  });

  console.log(result.usage);
  return result;
}
