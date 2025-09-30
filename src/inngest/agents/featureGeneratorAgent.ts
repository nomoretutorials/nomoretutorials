import { createAgent, openai } from "@inngest/agent-kit";

// TODO: First comprehend what the tool is about from the title and description.
// TODO: list too complex, not suitable for beginner, should be in easy langauge.

const PROMPT = `
    You are a Product Planning Assistant.

    Given a project title and tagline, generate 5-10 core features.
    
    Return ONLY valid JSON in this format:
    {
      "features": [
        {"id": "1", "name": "User Authentication", "description": "Email/password login system"},
        {"id": "2", "name": "Dashboard", "description": "Main user dashboard with stats"}
      ]
    }
    
    Rules:
    - Generate 5-10 features
    - Each feature must have: id, name (short), description (1 sentence)
    - Features should be realistic and implementable
    - Return ONLY valid JSON, no additional text`;

export const featureGeneratorAgent = createAgent({
  name: "Features List Generator",
  description: "Generates a list of features for a project based on its title and description",
  system: PROMPT,
  model: openai({
    model: "gpt-4-turbo",
    defaultParameters: {
      temperature: 0.7,
      max_completion_tokens: 800,
    },
  }),
});
