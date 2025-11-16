import { buildStepsListSchema } from "@/schemas/agent-validation";
import { Feature } from "@/types/project";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export async function projectBuildStepsAgent(
  title: string,
  description: string,
  selectedFeatures: Feature[],
  techStackNames: string[]
) {
  try {
    // Group features by category
    const basicFeatures = selectedFeatures.filter((f) => f.category === "BASIC");
    const enhancementFeatures = selectedFeatures.filter((f) => f.category === "ENHANCEMENT");
    const advancedFeatures = selectedFeatures.filter((f) => f.category === "ADVANCED");

    // Calculate project size and target step count
    const totalFeatures = selectedFeatures.length;
    const projectSize = totalFeatures <= 5 ? "small" : totalFeatures <= 8 ? "medium" : "large";

    // Calculate expected steps based on feature estimations
    const featureSteps = selectedFeatures.reduce((sum, f) => sum + f.estimatedSteps, 0);
    const infrastructureSteps = 4; // Setup (2) + Polish (1) + Deployment (1)
    const targetStepCount = featureSteps + infrastructureSteps;

    // Ensure within bounds (10-18 steps total)
    const minSteps = Math.max(10, targetStepCount - 2);
    const maxSteps = Math.min(18, targetStepCount + 2);

    console.log(`Project Size: ${projectSize}`);
    console.log(`Target Steps: ${targetStepCount} (range: ${minSteps}-${maxSteps})`);

    // Build feature context (WITHOUT requiresTools since it doesn't exist)
    const featureContext = `
BASIC Features (${basicFeatures.length} - must be built first):
${basicFeatures
  .map(
    (f) =>
      `- [${f.id}] ${f.title} (${f.estimatedSteps} step${f.estimatedSteps > 1 ? "s" : ""}, ${f.difficulty})
  Description: ${f.description}
  Learning focus: ${f.learningValue}
  Prerequisites: ${f.prerequisites.length ? f.prerequisites.join(", ") : "None"}`
  )
  .join("\n\n")}

ENHANCEMENT Features (${enhancementFeatures.length} - build after BASIC):
${enhancementFeatures
  .map(
    (f) =>
      `- [${f.id}] ${f.title} (${f.estimatedSteps} step${f.estimatedSteps > 1 ? "s" : ""}, ${f.difficulty})
  Description: ${f.description}
  Learning focus: ${f.learningValue}
  Prerequisites: ${f.prerequisites.length ? f.prerequisites.join(", ") : "None"}`
  )
  .join("\n\n")}

ADVANCED Features (${advancedFeatures.length} - build last):
${advancedFeatures
  .map(
    (f) =>
      `- [${f.id}] ${f.title} (${f.estimatedSteps} step${f.estimatedSteps > 1 ? "s" : ""}, ${f.difficulty})
  Description: ${f.description}
  Learning focus: ${f.learningValue}
  Prerequisites: ${f.prerequisites.length ? f.prerequisites.join(", ") : "None"}`
  )
  .join("\n\n")}
`;

    const techStackList = techStackNames.join(", ");

    // Parse tech stack components
    const frontend =
      techStackNames.find((t) =>
        ["next", "react", "vue", "svelte"].some((fw) => t.toLowerCase().includes(fw))
      ) || "";

    const backend =
      techStackNames.find((t) =>
        ["express", "fastapi", "django", "nest"].some((be) => t.toLowerCase().includes(be))
      ) || "";

    const database =
      techStackNames.find((t) =>
        ["postgres", "mysql", "mongodb", "sqlite"].some((db) => t.toLowerCase().includes(db))
      ) || "";

    const orm =
      techStackNames.find((t) =>
        ["prisma", "drizzle", "mongoose", "typeorm"].some((o) => t.toLowerCase().includes(o))
      ) || "";

    const auth =
      techStackNames.find((t) =>
        ["nextauth", "clerk", "auth0", "better-auth", "supabase"].some((a) =>
          t.toLowerCase().includes(a)
        )
      ) || "";

    const isFullStack = frontend.toLowerCase().includes("next"); // Next.js is full-stack

    const prompt = `You are a Senior Software Architect creating a step-by-step build plan.

## Project Context
**Title**: ${title}
**Description**: ${description}
**Tech Stack**: ${techStackList}
**Project Size**: ${projectSize}

${featureContext}

---

## Your Mission

Create EXACTLY ${targetStepCount} steps (acceptable range: ${minSteps}-${maxSteps}) that translate the abstract features above into concrete implementation steps using the selected tech stack.

---

## Tech Stack Translation Guide

Your selected tech stack is:
- **Frontend**: ${frontend || "Not specified"}
- **Backend**: ${backend || isFullStack ? frontend : "Not specified"}
- **Database**: ${database || "Not specified"}
- **ORM**: ${orm || "Not specified"}
- **Auth**: ${auth || "Not specified"}

Use EXACTLY these technologies in your steps. Do not suggest alternatives.

**Implementation Patterns:**

${
  frontend.toLowerCase().includes("next")
    ? `
**Next.js:**
- API Routes → Use App Router: /app/api/[route]/route.ts
- Server Actions → Use 'use server' for mutations
- Data Fetching → Server Components with async/await
- Forms → useFormState with Server Actions
`
    : ""
}

${
  frontend.toLowerCase().includes("react") && !isFullStack
    ? `
**React (SPA):**
- Routing → React Router
- State Management → useState, useContext, or Zustand
- API Calls → fetch/axios in useEffect or React Query
- Forms → Controlled components with useState
`
    : ""
}

${
  backend.toLowerCase().includes("express")
    ? `
**Express:**
- Routes → app.get/post/put/delete()
- Middleware → Use express.json(), authentication middleware
- Error Handling → Error handling middleware
`
    : ""
}

${
  backend.toLowerCase().includes("fastapi")
    ? `
**FastAPI:**
- Routes → @app.get/@app.post decorators
- Validation → Pydantic models
- Async → Use async def for routes
`
    : ""
}

${
  orm.toLowerCase().includes("prisma")
    ? `
**Prisma:**
- Schema → Define models in schema.prisma
- Migrations → npx prisma migrate dev
- Queries → prisma.model.findMany/create/update
- Relations → @relation, include/select
`
    : ""
}

${
  orm.toLowerCase().includes("drizzle")
    ? `
**Drizzle:**
- Schema → Define using drizzle-orm schema builders
- Queries → Type-safe query builder
- Migrations → drizzle-kit generate/push
`
    : ""
}

${
  auth.toLowerCase().includes("nextauth")
    ? `
**NextAuth.js:**
- Setup → Configure in /app/api/auth/[...nextauth]/route.ts
- Providers → Email, OAuth (Google, GitHub)
- Session → getServerSession() in Server Components
- Database Adapter → Use ${orm || database} adapter
`
    : ""
}

${
  auth.toLowerCase().includes("clerk")
    ? `
**Clerk:**
- Setup → Wrap app with ClerkProvider
- Components → <SignIn />, <SignUp />, <UserButton />
- Protection → Use middleware.ts for route protection
- User Data → useUser() hook
`
    : ""
}

${
  auth.toLowerCase().includes("better-auth")
    ? `
**Better Auth:**
- Setup → Configure in lib/auth.ts
- Routes → Built-in API routes
- Session → getSession() helper
`
    : ""
}

---

## Tool Introduction Logic

When features need capabilities beyond the core stack, introduce tools in the step that needs them:

**Email/Notifications:**
- "Email reminders/notifications" → Add Resend setup step
- "Scheduled emails" → Add BullMQ or Inngest for background jobs

**AI Features:**
- "AI suggestions/generation" → Add OpenAI or Anthropic API setup
- "Semantic search" → Add vector database (Pinecone)

**Payments:**
- "Payment processing" → Add Stripe setup with webhooks
- "Subscriptions" → Add Stripe Billing

**File Storage:**
- "Image/file uploads" → Add Cloudinary or AWS S3 setup

**Real-time Features:**
${
  frontend.toLowerCase().includes("next")
    ? "- Use Server-Sent Events (built into Next.js) or Vercel AI SDK streaming"
    : "- Add Pusher or Ably for WebSocket functionality"
}

**Analytics/Charts:**
- "Dashboard/analytics" → Add Recharts or Chart.js

Choose the SIMPLEST tool suitable for beginners. Avoid over-engineering.

---

## Step Generation Rules

### Critical Requirements:
1. ✅ Every feature ID must appear in at least one step's relatedFeatures
2. ✅ Generate ${minSteps}-${maxSteps} steps total
3. ✅ Use ONLY these categories: "SETUP", "FOUNDATION", "FEATURE", "INTEGRATION", "POLISH", "DEPLOYMENT"
4. ✅ Respect feature prerequisites - build dependencies first
5. ✅ Features with estimatedSteps=2 should span 2 steps (e.g., backend + frontend)
6. ✅ Features with estimatedSteps=1 can be combined if they're related

### Step Structure:
- **index**: 1, 2, 3... (sequential)
- **title**: Action verb + specific implementation
  - Good: "Build Task CRUD API with Prisma"
  - Bad: "Setup Backend" (too vague)
- **category**: SETUP, FOUNDATION, FEATURE, INTEGRATION, POLISH, or DEPLOYMENT
- **relatedFeatures**: Feature IDs implemented in this step
- **prerequisiteSteps**: Step indices that must come before this
- **estimatedComplexity**: EASY, MEDIUM, or HARD
- **learningFocus**: 10-30 words on specific skills learned

### Step Breakdown Target:
- **SETUP** (2 steps): Project init + Database setup
- **FOUNDATION** (2-3 steps): Auth system, base schemas, core infrastructure
- **FEATURE** (${featureSteps} steps): One step per feature, or split complex ones
- **INTEGRATION** (0-2 steps): Connect features that work together
- **POLISH** (1 step): Error handling, loading states, responsive design
- **DEPLOYMENT** (1 step): Deploy to production

### Ordering Rules:
1. SETUP → FOUNDATION → FEATURE → INTEGRATION → POLISH → DEPLOYMENT
2. BASIC features → ENHANCEMENT features → ADVANCED features
3. Features with prerequisites → after their dependencies
4. Database/API implementation → before UI that uses it
5. Auth setup → before features requiring authentication

### Feature Coverage Strategy:
- If feature.estimatedSteps = 1: Implement in one step
- If feature.estimatedSteps = 2: Split into backend + frontend (or setup + implementation)
- If feature.estimatedSteps = 3: Split into 3 logical parts (e.g., setup + backend + frontend)

---

## Output Format

Return valid JSON:

{
  "steps": [
    {
      "index": 1,
      "title": "Initialize ${frontend || "Project"} with TypeScript",
      "category": "SETUP",
      "relatedFeatures": [],
      "prerequisiteSteps": [],
      "estimatedComplexity": "EASY",
      "learningFocus": "Project scaffolding, TypeScript configuration, folder structure"
    },
    {
      "index": 2,
      "title": "Setup ${orm || "Database Connection"} with ${database || "Database"}",
      "category": "SETUP",
      "relatedFeatures": [],
      "prerequisiteSteps": [1],
      "estimatedComplexity": "EASY",
      "learningFocus": "${orm ? `${orm} schema design, migrations, database connection` : "Database setup and configuration"}"
    }
    // ... continue to step ${targetStepCount}
  ]
}

---

## Pre-Submission Checklist

Verify these before returning:
✅ Total steps = ${targetStepCount} (±2 acceptable)
✅ All ${selectedFeatures.length} feature IDs appear in relatedFeatures arrays
✅ Every step uses correct category spelling
✅ prerequisiteSteps only reference earlier step indices
✅ Features with prerequisites are built after their dependencies
✅ Step titles mention specific technologies from tech stack
✅ Tools are introduced in steps that need them (not in SETUP unless necessary)

Now generate the complete build plan.`;

    const result = await generateObject({
      model: openai("gpt-4.1-nano"), 
      schema: buildStepsListSchema,
      prompt,
    });

    if (!result?.object?.steps?.length) {
      throw new Error("No steps generated");
    }

    const generatedStepCount = result.object.steps.length;

    // Validation 1: Check step count
    if (generatedStepCount < minSteps || generatedStepCount > maxSteps) {
      console.warn(
        `⚠️ Step count out of range: ${generatedStepCount} (target: ${minSteps}-${maxSteps})`
      );
    }

    // Validation 2: Check feature coverage
    const allRelatedFeatures = new Set(
      result.object.steps.flatMap((step) => step.relatedFeatures || [])
    );

    const uncoveredFeatures = selectedFeatures.filter(
      (feature) => !allRelatedFeatures.has(feature.id)
    );

    if (uncoveredFeatures.length > 0) {
      console.error("❌ CRITICAL: Some features not covered in steps!");
      console.error(
        "Missing features:",
        uncoveredFeatures.map((f) => `${f.id}: ${f.title}`)
      );
      throw new Error(`${uncoveredFeatures.length} features not covered in build steps`);
    }

    // Validation 3: Check prerequisite integrity
    const invalidPrereqs = result.object.steps.filter((step) =>
      step.prerequisiteSteps.some((prereqIndex) => prereqIndex >= step.index || prereqIndex < 1)
    );

    if (invalidPrereqs.length > 0) {
      console.error("❌ Invalid prerequisite steps detected!");
      console.error(invalidPrereqs);
      throw new Error("Some steps have invalid prerequisite references");
    }

    console.log("✅ BUILD STEP AGENT SUCCESS");
    console.log(`Generated: ${generatedStepCount} steps (target: ${targetStepCount})`);
    console.log(`Covered: ${allRelatedFeatures.size}/${selectedFeatures.length} features`);
    console.log("Token usage:", result.usage);

    return result.object.steps;
  } catch (err) {
    console.error("❌ Error in projectBuildStepsAgent:", err);
    throw err;
  }
}
