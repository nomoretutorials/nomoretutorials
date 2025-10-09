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
    // Prepare inputs
    const featuresList = selectedFeatures.map((f) => `- ${f.title}: ${f.description}`).join("\n");
    const techStackList = techStackNames.join(", ");

    // Build prompt
    const prompt = `
You are a senior software architect who plans technical projects into clear build steps.

---

### Your Task:
1. Assess project complexity (based on title, description, and features):
   - Small project → 8–12 steps  
   - Medium project → 12–18 steps  
   - Large project → 18–25 steps  

2. Generate a **sequential roadmap** with clearly ordered numeric steps (starting from 1).  
3. The total number of steps must always be between 8 and 25.  

---

### ✅ Output format:
Return **only** valid JSON matching this structure:
{
  "steps": [
    { "index": 1, "title": "Initialize Next.js Project", "category": "SETUP" },
    { "index": 2, "title": "Configure Prisma with PostgreSQL", "category": "SETUP" },
    { "index": 3, "title": "Setup Authentication", "category": "CORE" },
    { "index": 4, "title": "Implement Payment Flow", "category": "CORE" },
    { "index": 5, "title": "Deploy Application on Vercel", "category": "DEPLOYMENT" }
  ]
}

---

### ⚙️ Rules:
- **index**: must be a number, sequential (1, 2, 3, …)
- **title**: concise milestone (2–6 words), context-aware
- **category**: one of "Setup", "Core", "Polish", "Deployment"  
- Order logically: Setup → Core → Polish → Deployment  
- Use specific tech-stack references when relevant  
- Avoid generic names (❌ "Database Setup" → ✅ "Configure Prisma with PostgreSQL")  
- Return **ONLY** JSON — no comments, markdown, or explanations.

---

### 🔍 Few-shot Example:

INPUT:  
Title: "CraftHub"  
Description: "An online marketplace where people can buy and sell handmade crafts."  
Tech Stack: Next.js, PostgreSQL, Prisma, Stripe  
Features: User Authentication, Product Catalog, Shopping Cart, Coupon System

OUTPUT:
{
  "steps": [
    { "index": 1, "title": "Initialize Next.js Project", "category": "Setup" },
    { "index": 2, "title": "Configure Prisma with PostgreSQL", "category": "Setup" },
    { "index": 3, "title": "Setup Authentication with BetterAuth", "category": "Core" },
    { "index": 4, "title": "Design Product Catalog Schema", "category": "Core" },
    { "index": 5, "title": "Implement Shopping Cart Logic", "category": "Core" },
    { "index": 6, "title": "Integrate Stripe Payments", "category": "Core" },
    { "index": 7, "title": "Add Coupon System", "category": "Core" },
    { "index": 8, "title": "Setup Email Notifications", "category": "Polish" },
    { "index": 9, "title": "Deploy on Vercel", "category": "Deployment" }
  ]
}

---

### 🧱 Project Context:
Title: ${title}  
Description: ${description}  
Tech Stack: ${techStackList}  
Features:  
${featuresList}
`;

    // Call the model
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: buildStepsListSchema,
      prompt,
    });

    // Validate and return
    if (!result?.object?.steps?.length) {
      return [];
    }

    console.log("BUILD STEP AGENT - Total Token Used", result.usage);
    return result.object.steps;
  } catch (err) {
    console.error("Error in projectBuildStepsAgent:", err);
    throw err;
  }
}
