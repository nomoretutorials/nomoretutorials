import { metadataAgentType } from "@/schemas/agent-validation";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";





export async function projectMetadataAgent(projectIdea: string): Promise<metadataAgentType | null> {
  try {
    // 1️⃣ Generate text from model
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
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

✅ Few-shot examples

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

Now, generate the JSON output for this idea: ${projectIdea}`,
    });

    // 2️⃣ Try parsing JSON safely
    const metadata = JSON.parse(text.trim()) as metadataAgentType;

    // 3️⃣ Validate minimal structure
    if (!metadata.title || !metadata.description) {
      console.warn("⚠️ [METADATA AGENT] Invalid metadata fields returned:", metadata);
      return null;
    }

    return metadata;
  } catch (err) {
    console.error("💥 [METADATA AGENT ERROR]", err);
    return null; // Safe fallback — route can handle null gracefully
  }
}