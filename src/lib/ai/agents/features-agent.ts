// lib/ai/agents/featureAgent.ts
import { featuresListSchema } from "@/schemas/agent-validation";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

// Updated schema

export async function projectFeaturesAgent(title: string, description: string) {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `You are a Senior Software Architect designing a learning roadmap for beginner developers.

## Your Mission
Analyze this project idea and generate 6-8 features that will:
1. Result in a COMPLETE, working project
2. Teach fundamental development concepts
3. Progress from simple to advanced
4. Be realistically achievable in 10-15 coding steps

## Project Details
Title: "${title}"
Description: "${description}"

## Critical Thinking Process
Before generating features, think through:

### 1. Core Identity
- What is the ONE primary function this project MUST do?
- What makes this project unique?
- What's the simplest working version (MVP)?

### 2. Essential Foundations
- What technical foundations are needed? (auth, database, API, etc.)
- What's the minimal data model?
- What are the critical user flows?

### 3. Learning Progression
- What should beginners learn first? (setup, CRUD, etc.)
- What builds on previous knowledge?
- What introduces new concepts gradually?

### 4. Realistic Scope
- Can each feature be built in 1-2 steps?
- Are dependencies clear?
- Will this feel accomplishable, not overwhelming?

## Feature Categories & Guidelines

### CORE Features (1-2 features)
The absolute minimum for the project to exist.
Examples:
- For a blog: "Create and View Posts"
- For a todo app: "Add and Complete Tasks"
- For a chat app: "Send and Receive Messages"

### ESSENTIAL Features (3-4 features)
Make the project actually useful and teach key concepts.
Examples:
- User authentication (teach security basics)
- Data persistence (teach database operations)
- Search/filter (teach querying)
- Basic UI (teach component structure)

### ENHANCEMENT Features (2-3 features)
Polish and real-world touches, introduce advanced concepts.
Examples:
- Real-time updates (teach WebSockets/polling)
- File uploads (teach blob storage)
- Email notifications (teach background jobs)
- Responsive design (teach CSS frameworks)

## Output Format
Return ONLY valid JSON in this exact structure:

{
  "features": [
    {
      "id": "1",
      "title": "Core Feature Name",
      "description": "What it does in simple terms (max 15 words)",
      "priority": "core",
      "learningValue": "What they'll learn building this (e.g., 'CRUD operations, database design')"
    },
    {
      "id": "2",
      "title": "Another Feature",
      "description": "Clear, specific description",
      "priority": "essential",
      "learningValue": "Specific skills gained"
    }
  ]
}

## Rules
✅ Generate exactly 6-8 features total
✅ 1-2 CORE, 3-4 ESSENTIAL, 2-3 ENHANCEMENT
✅ Title: 2-4 words, specific to THIS project
✅ Description: One clear sentence, max 15 words
✅ Learning value: Specific technical skills, not vague
✅ Each feature should map to 1-2 build steps
✅ Features should have clear dependencies (auth before user profiles, etc.)
✅ Avoid generic features - personalize to the project idea
✅ Think: "Can a beginner actually build this in 10-15 steps?"

❌ DON'T include features that:
- Are too vague ("User Dashboard")
- Require external APIs without clear purpose
- Are cosmetic only ("Dark Mode")
- Won't teach fundamental concepts
- Make the scope unrealistic

## Examples

### Example 1: Task Management App
Title: "TaskFlow"
Description: "A personal task manager with priorities and deadlines"

THINK:
- Core: Must create/complete tasks
- Essential: Need to organize (priorities), set deadlines, persist data
- Enhancement: Reminders, collaboration
- Learning: CRUD → filtering → dates → notifications

OUTPUT:
{
  "features": [
    {
      "id": "1",
      "title": "Task CRUD Operations",
      "description": "Create, read, update, and delete tasks",
      "priority": "core",
      "learningValue": "Database operations, REST API design, form handling"
    },
    {
      "id": "2",
      "title": "User Authentication",
      "description": "Secure signup and login system",
      "priority": "essential",
      "learningValue": "Password hashing, JWT tokens, session management"
    },
    {
      "id": "3",
      "title": "Priority Levels",
      "description": "Assign high, medium, or low priority to tasks",
      "priority": "essential",
      "learningValue": "Enums, filtering, conditional rendering"
    },
    {
      "id": "4",
      "title": "Due Date System",
      "description": "Set and track task deadlines",
      "priority": "essential",
      "learningValue": "Date handling, sorting, time-based logic"
    },
    {
      "id": "5",
      "title": "Search and Filter",
      "description": "Find tasks by keyword or status",
      "priority": "essential",
      "learningValue": "Database queries, search algorithms, UI state"
    },
    {
      "id": "6",
      "title": "Email Reminders",
      "description": "Get notified when tasks are due",
      "priority": "enhancement",
      "learningValue": "Background jobs, email integration, scheduling"
    },
    {
      "id": "7",
      "title": "Task Categories",
      "description": "Organize tasks into custom categories",
      "priority": "enhancement",
      "learningValue": "Many-to-many relationships, tagging systems"
    }
  ]
}

### Example 2: Recipe Sharing Platform
Title: "CookShare"
Description: "Share and discover recipes with cooking instructions"

THINK:
- Core: Must create/view recipes
- Essential: Need ingredients list, steps, user accounts, search
- Enhancement: Ratings, save favorites, shopping list
- Learning: Nested data → relations → aggregations

OUTPUT:
{
  "features": [
    {
      "id": "1",
      "title": "Recipe Creation",
      "description": "Post recipes with title, ingredients, and steps",
      "priority": "core",
      "learningValue": "Nested forms, array handling, rich text input"
    },
    {
      "id": "2",
      "title": "Recipe Discovery",
      "description": "Browse and view all published recipes",
      "priority": "core",
      "learningValue": "List rendering, routing, data fetching"
    },
    {
      "id": "3",
      "title": "User Accounts",
      "description": "Sign up and manage personal recipe collection",
      "priority": "essential",
      "learningValue": "Authentication, user-data relationships, authorization"
    },
    {
      "id": "4",
      "title": "Ingredient Search",
      "description": "Find recipes by available ingredients",
      "priority": "essential",
      "learningValue": "Advanced queries, array matching, search optimization"
    },
    {
      "id": "5",
      "title": "Recipe Categories",
      "description": "Organize by cuisine type or meal category",
      "priority": "essential",
      "learningValue": "Categorization, filtering, navigation patterns"
    },
    {
      "id": "6",
      "title": "Rating System",
      "description": "Rate recipes and see average ratings",
      "priority": "enhancement",
      "learningValue": "Aggregations, user interactions, computed values"
    },
    {
      "id": "7",
      "title": "Save Favorites",
      "description": "Bookmark recipes to personal collection",
      "priority": "enhancement",
      "learningValue": "Many-to-many relations, toggle states, user preferences"
    },
    {
      "id": "8",
      "title": "Print Recipe",
      "description": "Generate printer-friendly recipe format",
      "priority": "enhancement",
      "learningValue": "PDF generation, styling for print, data transformation"
    }
  ]
}

### Example 3: Habit Tracker
Title: "StreakMaster"
Description: "Track daily habits and build streaks"

THINK:
- Core: Log habits daily, view streak
- Essential: Multiple habits, calendar view, persistence
- Enhancement: Reminders, stats, social
- Learning: Time-series data → aggregations → visualization

OUTPUT:
{
  "features": [
    {
      "id": "1",
      "title": "Daily Check-in",
      "description": "Mark habits as completed for today",
      "priority": "core",
      "learningValue": "Date handling, boolean states, daily records"
    },
    {
      "id": "2",
      "title": "Streak Tracking",
      "description": "Count consecutive days of habit completion",
      "priority": "core",
      "learningValue": "Date calculations, conditional logic, counters"
    },
    {
      "id": "3",
      "title": "User Authentication",
      "description": "Personal accounts to save habit data",
      "priority": "essential",
      "learningValue": "Auth flows, data isolation, secure sessions"
    },
    {
      "id": "4",
      "title": "Multiple Habits",
      "description": "Create and track multiple different habits",
      "priority": "essential",
      "learningValue": "One-to-many relationships, dynamic lists"
    },
    {
      "id": "5",
      "title": "Calendar View",
      "description": "Visual calendar showing completion history",
      "priority": "essential",
      "learningValue": "Data visualization, calendar UI, date grids"
    },
    {
      "id": "6",
      "title": "Progress Statistics",
      "description": "Charts showing completion rates over time",
      "priority": "enhancement",
      "learningValue": "Data aggregation, charting libraries, percentages"
    },
    {
      "id": "7",
      "title": "Daily Reminders",
      "description": "Get notified to complete habits",
      "priority": "enhancement",
      "learningValue": "Notifications, scheduling, background tasks"
    }
  ]
}

---

Now analyze the user's project and generate features:

Title: "${title}"
Description: "${description}"

Remember: Think deeply about what makes THIS project unique, what beginners can realistically build, and what they'll learn. Return ONLY the JSON.`,
  });

  console.log(result.usage);
  return result;
}

// Updated parser
export function parseFeatures(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const { success, data, error } = featuresListSchema.safeParse(parsed);

    if (!success) {
      console.error("Validation errors:", error);
      throw new Error("AI response doesn't match expected schema");
    }

    return data.features;
  } catch (error) {
    console.error("Failed to parse features:", error);
    throw new Error("Failed to parse AI response into features");
  }
}
