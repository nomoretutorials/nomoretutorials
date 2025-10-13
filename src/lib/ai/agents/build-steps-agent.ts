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
    const coreFeatures = selectedFeatures.filter((f) => f.priority === "core");
    const essentialFeatures = selectedFeatures.filter((f) => f.priority === "essential");
    const enhancementFeatures = selectedFeatures.filter((f) => f.priority === "enhancement");

    const featureContext = `
CORE Features (must be built first):
${coreFeatures.map((f) => `- [${f.id}] ${f.title}: ${f.description}`).join("\n")}

ESSENTIAL Features (build after core):
${essentialFeatures.map((f) => `- [${f.id}] ${f.title}: ${f.description}`).join("\n")}

ENHANCEMENT Features (build last):
${enhancementFeatures.map((f) => `- [${f.id}] ${f.title}: ${f.description}`).join("\n")}
`;

    const techStackList = techStackNames.join(", ");

    const prompt = `You are a Senior Software Architect creating a learning roadmap for beginner developers.

## Mission
Create a complete, step-by-step build plan that:
1. ✅ Builds ALL selected features (nothing left out)
2. ✅ Orders steps logically with clear dependencies
3. ✅ Teaches progressively (simple → complex)
4. ✅ Results in a WORKING, COMPLETE project
5. ✅ Fits realistically in 10-20 steps

## Project Context
**Title**: ${title}
**Description**: ${description}
**Tech Stack**: ${techStackList}

${featureContext}

---

## Critical Planning Process

### Step 1: Calculate Required Steps
- Count features: ${selectedFeatures.length} total
  - ${coreFeatures.length} CORE (need 1-2 steps each)
  - ${essentialFeatures.length} ESSENTIAL (need 1-3 steps each)
  - ${enhancementFeatures.length} ENHANCEMENT (need 1-2 steps each)
- Add foundational steps: ~3-4 (project setup, database, auth base)
- Add integration steps: ~1-2 (connecting features)
- Add polish/deployment: ~2-3
- **Total estimate**: [Calculate based on above]

### Step 2: Dependency Analysis
Map what must come first:
1. Project initialization (always first)
2. Database setup (before any data features)
3. Authentication base (before user-specific features)
4. Core features (before enhancements that depend on them)
5. Integration/polish (after features work individually)
6. Deployment (always last)

### Step 3: Learning Progression
Order by complexity:
- EASY: Setup, configuration, basic CRUD
- MEDIUM: Relations, validation, business logic
- HARD: Real-time features, complex integrations, optimization

---

## Step Categories & Their Purpose

⚠️ IMPORTANT: Use ONLY these exact category names (case-sensitive):
"SETUP", "FOUNDATION", "FEATURE", "INTEGRATION", "POLISH", "DEPLOYMENT".

### SETUP (2-3 steps)
Project initialization and tooling.
Examples:
- "Initialize Next.js Project with TypeScript"
- "Setup Prisma with PostgreSQL Database"
- "Configure Environment Variables"

### FOUNDATION (2-4 steps)
Core infrastructure needed by all features.
Examples:
- "Build Authentication System"
- "Create Base Database Schema"
- "Setup API Route Structure"
- "Build Layout and Navigation"

### FEATURE (4-12 steps)
Build each selected feature, grouped logically.
MUST INCLUDE ALL FEATURES FROM USER SELECTION.

**For each feature, consider:**
- Does it need database model? (separate step)
- Does it need API endpoints? (separate step)
- Does it need UI components? (separate step)
- Or can it be done in one step? (simple features)

Examples:
- "Build Task Creation API and Database Model"
- "Implement Priority System UI Components"
- "Add Due Date Tracking Logic"

### INTEGRATION (1-2 steps)
Connect features that work together.
Examples:
- "Integrate Search with Filters"
- "Connect Notifications to Task Updates"

### POLISH (1-2 steps)
User experience improvements.
Examples:
- "Add Loading States and Error Handling"
- "Implement Responsive Design"

### DEPLOYMENT (1 step)
Go live.
Example:
- "Deploy to Vercel with Database"

---

## Output Format

Return ONLY valid JSON:

{
  "steps": [
    {
      "index": 1,
      "title": "Initialize Next.js with TypeScript",
      "category": "SETUP",
      "relatedFeatures": [],
      "prerequisiteSteps": [],
      "estimatedComplexity": "EASY",
      "learningFocus": "Project setup, Next.js basics, TypeScript configuration"
    },
    {
      "index": 2,
      "title": "Setup Prisma with PostgreSQL",
      "category": "SETUP",
      "relatedFeatures": [],
      "prerequisiteSteps": [1],
      "estimatedComplexity": "EASY",
      "learningFocus": "ORM concepts, database connections, schema design basics"
    },
    {
      "index": 3,
      "title": "Build Authentication System",
      "category": "FOUNDATION",
      "relatedFeatures": ["2"],
      "prerequisiteSteps": [2],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "Password hashing, JWT tokens, session management, protected routes"
    },
    {
      "index": 4,
      "title": "Create Task Database Schema",
      "category": "FEATURE",
      "relatedFeatures": ["1"],
      "prerequisiteSteps": [2, 3],
      "estimatedComplexity": "EASY",
      "learningFocus": "Database modeling, relations, migrations"
    },
    {
      "index": 5,
      "title": "Build Task CRUD API Endpoints",
      "category": "FEATURE",
      "relatedFeatures": ["1"],
      "prerequisiteSteps": [4],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "REST API design, CRUD operations, validation"
    }
    // ... more steps
  ]
}

---

## Strict Rules

✅ **Completeness**
- Every feature ID from the feature list MUST appear in at least one step's "relatedFeatures"
- CORE features must be built before ESSENTIAL
- ESSENTIAL must be built before ENHANCEMENT

✅ **Ordering**
- Each step's prerequisiteSteps must reference earlier indices
- Can't build UI before API/database
- Can't deploy before features work

✅ **Step Titles**
- Be specific with tech stack: "Setup Prisma" not "Setup Database"
- Action-oriented: "Build X", "Implement Y", "Create Z"
- 3-8 words maximum
- No generic titles like "Backend Setup"

✅ **Learning Focus**
- Specific skills: "JWT tokens, bcrypt hashing" not "security"
- 5-15 words describing concrete learning outcomes

✅ **Complexity**
- EASY: Configuration, basic CRUD, simple UI
- MEDIUM: Relations, validation, API integration
- HARD: Real-time, complex algorithms, optimization

✅ **Total Steps**
- Minimum: 8 (only for very simple projects)
- Sweet spot: 12-16 (most projects)
- Maximum: 25 (complex projects only)

❌ **Never**
- Skip features user selected
- Create steps that can't be done independently
- Use vague categories like "Backend Work"
- Order steps illogically (UI before database)
- Make steps too large (combine 3 features in one)

---

EXAMPLE -

Title: "TaskFlow"
Description: "Personal task manager with priorities, deadlines, and reminders."
Tech Stack: Next.js, Prisma, PostgreSQL, Tailwind CSS
Features:
- [1] Task CRUD Operations (CORE)
- [2] User Authentication (ESSENTIAL)
- [3] Priority Levels (ESSENTIAL)
- [4] Due Date System (ESSENTIAL)
- [5] Search and Filter (ESSENTIAL)
- [6] Email Reminders (ENHANCEMENT)
- [7] Task Categories (ENHANCEMENT)


{
  "steps": [
    {
      "index": 1,
      "title": "Initialize Next.js Project with TypeScript",
      "category": "SETUP",
      "relatedFeatures": [],
      "prerequisiteSteps": [],
      "estimatedComplexity": "EASY",
      "learningFocus": "Next.js structure, TypeScript setup, and initial configuration"
    },
    {
      "index": 2,
      "title": "Configure Prisma and PostgreSQL Database",
      "category": "SETUP",
      "relatedFeatures": [],
      "prerequisiteSteps": [1],
      "estimatedComplexity": "EASY",
      "learningFocus": "ORM setup, database connections, schema configuration"
    },
    {
      "index": 3,
      "title": "Design User and Task Schemas",
      "category": "FOUNDATION",
      "relatedFeatures": ["1", "2", "3", "4", "7"],
      "prerequisiteSteps": [2],
      "estimatedComplexity": "EASY",
      "learningFocus": "Relational modeling, migrations, and foreign keys"
    },
    {
      "index": 4,
      "title": "Implement Authentication System",
      "category": "FOUNDATION",
      "relatedFeatures": ["2"],
      "prerequisiteSteps": [3],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "JWT tokens, password hashing, session management"
    },
    {
      "index": 5,
      "title": "Build Task CRUD API Endpoints",
      "category": "FEATURE",
      "relatedFeatures": ["1"],
      "prerequisiteSteps": [3, 4],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "REST API design, CRUD operations, input validation"
    },
    {
      "index": 6,
      "title": "Create Task Management UI",
      "category": "FEATURE",
      "relatedFeatures": ["1"],
      "prerequisiteSteps": [5],
      "estimatedComplexity": "EASY",
      "learningFocus": "React components, state management, and data fetching"
    },
    {
      "index": 7,
      "title": "Add Priority Level Feature",
      "category": "FEATURE",
      "relatedFeatures": ["3"],
      "prerequisiteSteps": [6],
      "estimatedComplexity": "EASY",
      "learningFocus": "Enum fields, conditional styling, and UI dropdowns"
    },
    {
      "index": 8,
      "title": "Implement Due Date Functionality",
      "category": "FEATURE",
      "relatedFeatures": ["4"],
      "prerequisiteSteps": [7],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "Date pickers, sorting by deadlines, and time-based queries"
    },
    {
      "index": 9,
      "title": "Add Search and Filter Logic",
      "category": "FEATURE",
      "relatedFeatures": ["5"],
      "prerequisiteSteps": [7, 8],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "Database queries, search filtering, and UI state updates"
    },
    {
      "index": 10,
      "title": "Implement Task Categorization",
      "category": "FEATURE",
      "relatedFeatures": ["7"],
      "prerequisiteSteps": [8],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "Many-to-many relations, tag management, category filters"
    },
    {
      "index": 11,
      "title": "Integrate Email Reminder System",
      "category": "INTEGRATION",
      "relatedFeatures": ["6"],
      "prerequisiteSteps": [9],
      "estimatedComplexity": "HARD",
      "learningFocus": "Email APIs, scheduling, background jobs, and cron setup"
    },
    {
      "index": 12,
      "title": "Link Due Dates to Email Reminders",
      "category": "INTEGRATION",
      "relatedFeatures": ["4", "6"],
      "prerequisiteSteps": [8, 11],
      "estimatedComplexity": "HARD",
      "learningFocus": "Dependency management between features, event-based triggers"
    },
    {
      "index": 13,
      "title": "Add UI Enhancements and Loading States",
      "category": "POLISH",
      "relatedFeatures": [],
      "prerequisiteSteps": [12],
      "estimatedComplexity": "EASY",
      "learningFocus": "User experience improvements, skeleton loaders, error handling"
    },
    {
      "index": 14,
      "title": "Deploy Application to Vercel",
      "category": "DEPLOYMENT",
      "relatedFeatures": [],
      "prerequisiteSteps": [13],
      "estimatedComplexity": "MEDIUM",
      "learningFocus": "Environment variables, production configuration, and hosting"
    }
  ]
}


---

Now generate the build steps for this project. Think carefully about dependencies, feature coverage, and learning progression.`;

    const result = await generateObject({
      model: openai("gpt-4o-mini"), // Using GPT-4 for better reasoning
      schema: buildStepsListSchema,
      prompt,
    });

    if (!result?.object?.steps?.length) {
      throw new Error("No steps generated");
    }

    // Validation: Check that all features are covered
    const allRelatedFeatures = new Set(
      result.object.steps.flatMap((step) => step.relatedFeatures || [])
    );

    const uncoveredFeatures = selectedFeatures.filter(
      (feature) => !allRelatedFeatures.has(feature.id)
    );

    if (uncoveredFeatures.length > 0) {
      console.warn("⚠️ Some features not covered in steps:", uncoveredFeatures);
      // You could retry or add steps here
    }

    console.log("BUILD STEP AGENT - Total Tokens:", result.usage);
    console.log(`Generated ${result.object.steps.length} steps`);
    console.log(`Covered ${allRelatedFeatures.size}/${selectedFeatures.length} features`);

    console.log(result.usage);
    return result.object.steps;
  } catch (err) {
    console.error("Error in projectBuildStepsAgent:", err);
    throw err;
  }
}
