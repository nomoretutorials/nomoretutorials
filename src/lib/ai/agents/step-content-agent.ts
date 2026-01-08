import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

interface StepContentParams {
  stepIndex: number;
  stepTitle: string;
  stepCategory: string;
  learningFocus: string;
  estimatedComplexity: "EASY" | "MEDIUM" | "HARD";
  relatedFeatures?: string[];

  projectTitle: string;
  projectDescription: string;
  techStackNames: string[];

  selectedFeatures: Array<{
    id: string;
    title: string;
    description: string;
  }>;

  previousSteps?: Array<{
    index: number;
    title: string;
    filesCreated?: string[];
    modelsCreated?: string[];
  }>;
}

export async function projectStepContentAgent(params: StepContentParams) {
  const {
    stepIndex,
    stepTitle,
    learningFocus,
    techStackNames,
    previousSteps = [],
    projectTitle,
  } = params;

  // --- This logic is still perfect ---
  const frontend =
    techStackNames.find((t) =>
      ["next", "react", "vue"].some((fw) => t.toLowerCase().includes(fw))
    ) || "";

  const orm =
    techStackNames.find((t) =>
      ["prisma", "drizzle", "mongoose"].some((o) => t.toLowerCase().includes(o))
    ) || "";

  const database =
    techStackNames.find((t) =>
      ["postgres", "mysql", "mongodb"].some((db) => t.toLowerCase().includes(db))
    ) || "";

  const auth =
    techStackNames.find((t) =>
      ["nextauth", "clerk", "better-auth"].some((a) => t.toLowerCase().includes(a))
    ) || "";

  // Detect what needs documentation
  const needsDocs: string[] = [];
  const stepLower = stepTitle.toLowerCase();

  // Smart-detection for docs
  if (
    auth &&
    (stepLower.includes(auth.toLowerCase()) ||
      stepLower.includes("auth") ||
      stepLower.includes("session"))
  )
    needsDocs.push(`${auth} installation and setup`);
  if (
    orm &&
    (stepLower.includes(orm.toLowerCase()) ||
      stepLower.includes("schema") ||
      stepLower.includes("model"))
  )
    needsDocs.push(`${orm} setup guide`);
  if (
    frontend &&
    (stepLower.includes("api") ||
      stepLower.includes("route") ||
      stepLower.includes("server action"))
  )
    needsDocs.push(`${frontend} ${learningFocus}`);
  if (stepLower.includes("email") || stepLower.includes("resend"))
    needsDocs.push("Resend email API docs");
  if (stepLower.includes("ai") || stepLower.includes("gpt") || stepLower.includes("summarize"))
    needsDocs.push("Gemini API docs");
  if (stepLower.includes("payment") || stepLower.includes("stripe"))
    needsDocs.push("Stripe docs setup");
  if (stepLower.includes("upload") || stepLower.includes("s3"))
    needsDocs.push("AWS S3 file upload with nodejs");

  const previousContext =
    previousSteps.length > 0
      ? `The user has already completed these steps: ${previousSteps.map((s) => `[${s.index}: ${s.title}]`).join(", ")}.`
      : "This is the very first step.";

  // --- THIS IS THE NEW v4.1 (OPTIMIZED) SOCRATIC MENTOR PROMPT ---
  const prompt = `You are a "Senior Developer Mentor" for "NoMoreTutorials."
Your persona is a friendly, encouraging, and highly practical pair-programmer.
Your mission is to generate a guide for the *current project step* that forces the user to *learn* and *problem-solve*, not just copy-paste.

## Project & Step Context
- Project: "${projectTitle}"
- Current Step (${stepIndex}): "${stepTitle}"
- Key Learning Goal: "${learningFocus}"
- Tech Stack: ${techStackNames.join(", ")}
- Previous Steps: ${previousContext}

## Critical Rules: The "Socratic Mentor" Mandate
1.  ✅ **Context is King**: You MUST obey the \`stepTitle\`, \`techStackNames\`, and \`previousSteps\` context. Do NOT repeat steps. Do NOT use the wrong tech (e.g., if title says "Better Auth", do NOT use "NextAuth.js").
2.  ✅ **Mentor Persona**: Act as a friendly, practical mentor. Be conversational. Always explain the 'Why' in 1-2 sentences after every code block. NO filler steps (\`ls\`, default configs).
3.  ✅ **Interactive Commands**: Prefer *interactive* base commands (e.g., \`npx create-next-app@latest\`) and guide the user on what to select from the prompts.
4.  ✅ **"Teach to Fish" (Docs)**: Use your web search to find *real, official doc links*. Give boilerplate code, then link to the docs with a *specific goal* for the user to complete (e.g., "Your Turn: Read [doc link] and find the 'GoogleProvider'").
5.  ✅ **"Deep Dive" Prompts**: Include 1-2 optional \`🧠 Deep Dive\` blocks with copy-pasteable prompts for other LLMs to explain complex topics.

## Output Format (Abridged Template)

You must follow this general structure.

## ${stepTitle}

(A short, encouraging intro on *what* we're building and *why*.)

---

### 1. (First Action Title)

(Brief explanation of the action.)

\`\`\`bash
(command to run)
\`\`\`

**Why we're doing this:** (Your 1-2 sentence explanation.)

### 2. (Second Action Title)

(Brief explanation.)

\`\`\`typescript
// path/to/file.ts
(Minimal boilerplate code)
\`\`\`

**Why we're doing this:** (Your 1-2 sentence explanation.)

### 3. (Your Turn: (Goal Title))

**Your Goal:** (A clear, specific goal, e.g., "Read the official docs and add the 'Google' provider to our config.")

**Here's the doc I found for you:** [Official Doc: (Title from search)]((Real URL from web search))

**Hint:** (A small, helpful hint.)

> **🧠 Deep Dive: (Topic Title)**
> \`"(Copy-pasteable prompt for the user, e.g., "Explain what a 'catch-all' API route is in Next.js and why auth tools use it.")"\`

---

### Step Complete!

(A 1-2 sentence summary and look ahead.)

---

Now, generate the complete, high-quality mentor guide for the user's current step:
**Step ${stepIndex}: ${stepTitle}**
(Remember all 5 rules. Be a mentor, not a manual.)`;

  try {
    const result = await generateText({
      // Task 4: Update model
      model: openai.responses("gpt-4o-mini"),
      prompt,
      temperature: 0.3,
      tools: {
        web_search_preview: openai.tools.webSearch(),
      },
    });

    console.log(`✅ Step ${stepIndex} content generated (v4.1-Optimized)`);
    console.log(`Sources found: ${result.sources?.length || 0}`);
    if (result.sources?.length) {
      result.sources.forEach((source: any) => {
        console.log(`   ${source.url}`);
      });
    }
    console.log("Token usage:", result.usage);

    // --- This metadata logic is still genius, keep it ---
    const content = result.text;
    const filesCreated: string[] = [];
    const fileMatches = content.matchAll(/`([^`]+\.(ts|js|tsx|jsx|prisma|json|css))`?/g);
    for (const match of fileMatches) {
      if (match[1].includes("/")) filesCreated.push(match[1]);
    }

    const modelsCreated: string[] = [];
    const modelMatches = content.matchAll(/model\s+(\w+)\s*\{/g);
    for (const match of modelMatches) {
      modelsCreated.push(match[1]);
    }

    return {
      content: result.text,
      metadata: {
        filesCreated: [...new Set(filesCreated)],
        modelsCreated: [...new Set(modelsCreated)],
        sourcesUsed: result.sources?.map((s: any) => s.url) || [],
      },
      usage: result.usage,
    };
  } catch (error) {
    console.error("❌ Error in projectStepContentAgent (v4):", error);
    throw new Error("Failed to generate project step content");
  }
}
