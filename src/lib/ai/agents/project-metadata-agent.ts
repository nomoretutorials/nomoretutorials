import { metadataAgentSchema } from "@/schemas/agent-validation";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export async function projectMetadataAgent(projectIdea: string) {
  const result = await generateObject({
    model: openai("gpt-5"),
    schema: metadataAgentSchema,
    prompt: `You are a branding assistant.
Your task: Take a raw project idea and output a JSON object with exactly two fields:

{
    "title": "A short brand-style name (1 word, max 2 words). Looks like a real product/company name.",
    "description": "A concise description (max 25 words) that clearly explains the idea and makes it appealing."
}

Rules:
- Return ONLY valid JSON. No markdown, no commentary.
- Title must be catchy, ≤ 12 characters if single word, ≤ 2 words max.
- Description must be clear, value-driven, and ≤ 25 words.
- Avoid technical jargon unless essential.
- Do not invent features not implied by the idea.
- Be creative but professional.

---

### ✅ Few-shot examples

INPUT: "An AI tool that summarizes YouTube videos."
OUTPUT: {
    "title": "ClipNote",
    "description": "AI tool that condenses YouTube videos into quick, digestible summaries."
}

INPUT: "A mobile app that reminds you to drink water."
OUTPUT: {
    "title": "Hydra",
    "description": "Smart hydration app that reminds users to drink water and stay healthy."
}

INPUT: "An online marketplace for handmade crafts."
OUTPUT: {
    "title": "Craftsy",
    "description": "Marketplace for unique handmade crafts connecting creators with buyers worldwide."
}

INPUT: "AI assistant for students that helps with homework."
OUTPUT: {
    "title": "Studyly",
    "description": "AI-powered homework assistant that explains concepts and helps students learn faster."
}

INPUT: "A task manager with a focus on simplicity."
OUTPUT: {
    "title": "ZenTask",
    "description": "Minimalist task manager designed to keep work organized without distractions."
}

---

### ❌ Negative example
Wrong: {
    "title": "AI Summarization Tool for YouTube",
    "description": "This is a product that summarizes videos."
}
Reason: Title too long, not brand-like. Description is bland.

---

Now, generate the JSON output for this ${projectIdea}.`,
  });

  console.log("Metadata Agent: ", result);
  return result.object;
}
