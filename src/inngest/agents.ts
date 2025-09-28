import { createAgent, openai } from "@inngest/agent-kit";

// TODO: Improve the quality of response later.

export const projectMetadataAgent = createAgent({
  name: "Project Metadata Generator",
  description: "Takes a raw project idea and outputs a concise title and description.",
  system: `You are a branding assistant.
        Generate a JSON object with exactly two fields:

        {
        "title": "A short brand-style name (1 word, max 2 words). Should look like a company or product name.",
        "tagline": "A catchy tagline (max 6 words) that describes the idea"
        }

        Rules:
        - Return ONLY valid JSON.
        - Title must be exactly 1 word OR 2 words maximum.
        - Title must not be more than 12 characters if single word.
        - Tagline must be descriptive but no longer than 6 words.
        - Do not include any text outside JSON.`,
  model: openai({
    model: "gpt-4-turbo",
    defaultParameters: {
      temperature: 0.5,
      max_completion_tokens: 150,
    },
  }),
});
