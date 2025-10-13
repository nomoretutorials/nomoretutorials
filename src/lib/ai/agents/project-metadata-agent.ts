import { metadataAgentType } from "@/schemas/agent-validation";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function projectMetadataAgent(projectIdea: string): Promise<metadataAgentType | null> {
  try {
    const { text, usage } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a creative brand strategist who names tech products.

## Your Task
Given a project idea, create a memorable brand name and tagline that:
✅ Sounds like a real startup/product (not generic)
✅ Is catchy, modern, and easy to remember
✅ Avoids obvious patterns like "[Domain]AI", "[Word]ly", "[Word]ify"
✅ Could be a .com domain or mobile app name

## Critical Naming Rules

### ❌ AVOID These Patterns:
- Adding "AI" suffix (HealthAI, HotelAI ❌)
- Adding "ly" suffix (Studyly, Trackly ❌)
- Adding "ify" suffix (Taskify, Hotelify ❌)
- Using just the domain + modifier (SmartHotel, QuickTask ❌)
- Being too literal (VideoSummarizer, WaterReminder ❌)

### ✅ DO Use These Approaches:
1. **Metaphorical names**: Use words from nature, mythology, or concepts
   - Examples: Notion (abstract concept), Slack (playful word), Linear (geometry)
   
2. **Invented words**: Combine syllables that sound good
   - Examples: Figma (fig + magma), Vercel (verse + excel), Replit (reply + split)
   
3. **Unexpected connections**: Use words from different domains
   - Examples: Stripe (pattern, not payment), Canvas (art, not learning)
   
4. **Short and punchy**: 1-2 syllables when possible
   - Examples: Zoom, Loom, Miro, Cal

5. **Evoke feeling/benefit**: Name suggests the value, not the function
   - Examples: Airtable (lightweight + organized), Superhuman (powerful)

## Output Format
Return ONLY valid JSON (no markdown, no explanations):

{
  "title": "BrandName",
  "description": "Clear, compelling description in 15-25 words"
}

---

## Examples (Learn the Pattern)

### Example 1
INPUT: "An AI tool that summarizes YouTube videos"
❌ BAD: "SummAI", "Summarily", "VideoSum"
✅ GOOD:
{
  "title": "Brevity",
  "description": "AI-powered tool that transforms long YouTube videos into quick, digestible summaries"
}
(Why good: "Brevity" evokes shortness/conciseness without being literal)

### Example 2
INPUT: "A mobile app that reminds you to drink water"
❌ BAD: "WaterAI", "Hydrately", "DrinkReminder"
✅ GOOD:
{
  "title": "Ripple",
  "description": "Smart hydration companion that keeps you refreshed with personalized water reminders"
}
(Why good: "Ripple" connects to water through metaphor, not literal naming)

### Example 3
INPUT: "An online marketplace for handmade crafts"
❌ BAD: "CraftHub", "Handmadely", "CraftMarket"
✅ GOOD:
{
  "title": "Mosaic",
  "description": "Curated marketplace connecting artisans with buyers seeking unique, handcrafted treasures"
}
(Why good: "Mosaic" suggests craftsmanship and piecing together without being obvious)

### Example 4
INPUT: "AI assistant for students that helps with homework"
❌ BAD: "StudyAI", "Homeworkly", "LearnBot"
✅ GOOD:
{
  "title": "Lumina",
  "description": "AI learning companion that illuminates complex concepts and guides students to understanding"
}
(Why good: "Lumina" (light) metaphorically suggests clarity/understanding)

### Example 5
INPUT: "A task manager with focus on simplicity"
❌ BAD: "SimpleTask", "Taskly", "TodoAI"
✅ GOOD:
{
  "title": "Clarity",
  "description": "Minimalist task manager that cuts through chaos and keeps your work crystal clear"
}
(Why good: Names the benefit (clarity) not the function (tasks))

### Example 6
INPUT: "AI-powered hotel management platform"
❌ BAD: "HotelAI", "Innify", "SmartHotel"
✅ GOOD:
{
  "title": "Beacon",
  "description": "Intelligent hospitality platform that guides hotels to seamless operations and happy guests"
}
(Why good: "Beacon" suggests guidance/navigation without literal hotel reference)

### Example 7
INPUT: "AI-powered health tracking system"
❌ BAD: "HealthAI", "Trackify", "WellnessBot"
✅ GOOD:
{
  "title": "Vitality",
  "description": "Smart health companion that tracks your wellness journey and empowers better living"
}
(Why good: "Vitality" captures health essence without being generic)

### Example 8
INPUT: "A code snippet manager for developers"
❌ BAD: "CodeSnip", "Snippetly", "DevVault"
✅ GOOD:
{
  "title": "Prism",
  "description": "Developer tool that organizes, searches, and illuminates your code snippets instantly"
}
(Why good: "Prism" suggests code syntax highlighting through metaphor)

### Example 9
INPUT: "Real-time collaboration tool for remote teams"
❌ BAD: "TeamAI", "Collaboard", "RemoteHub"
✅ GOOD:
{
  "title": "Pulse",
  "description": "Real-time workspace that keeps remote teams in sync and productive together"
}
(Why good: "Pulse" suggests rhythm/heartbeat of teamwork without being obvious)

### Example 10
INPUT: "Recipe sharing platform with meal planning"
❌ BAD: "RecipeAI", "CookShare", "MealPlanner"
✅ GOOD:
{
  "title": "Hearth",
  "description": "Community-driven platform for discovering recipes and planning delicious, stress-free meals"
}
(Why good: "Hearth" evokes warmth/home cooking through metaphor)

---

## Your Creative Process
Before naming, ask yourself:
1. What FEELING does this product create? (joy, clarity, confidence, connection)
2. What METAPHOR fits? (light, water, space, nature, geometry)
3. What's the BENEFIT, not the function? (freedom vs task-management)
4. What would I remember hearing once? (short, distinctive, pleasant sound)

## Now Generate
For this project idea: "${projectIdea}"

Think creatively. Use metaphor. Avoid obvious patterns. Make it memorable.

Return ONLY the JSON.`,
    });

    // Parse and validate
    const cleanText = text.trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn("⚠️ No JSON found in response:", cleanText);
      return null;
    }

    const metadata = JSON.parse(jsonMatch[0]) as metadataAgentType;

    // Validate structure
    if (!metadata.title || !metadata.description) {
      console.warn("⚠️ Invalid metadata structure:", metadata);
      return null;
    }

    // Extra validation: reject obvious patterns
    const title = metadata.title.toLowerCase();
    const idea = projectIdea.toLowerCase();

    // Check for bad patterns
    const badPatterns = [
      title.endsWith("ai"),
      title.endsWith("ly"),
      title.endsWith("ify"),
      title.includes("smart"),
      title.includes("quick"),
      // Check if title is just a word from the idea + suffix
      idea.split(" ").some((word) => word.length > 3 && title.includes(word.toLowerCase())),
    ];

    if (badPatterns.some(Boolean)) {
      console.warn("⚠️ Name matches bad pattern, regenerating...");
      // Could retry here or just return null
      return null;
    }

    console.log(usage);
    console.log("✅ Generated metadata:", metadata);
    return metadata;
  } catch (err) {
    console.error("💥 [METADATA AGENT ERROR]", err);
    return null;
  }
}
