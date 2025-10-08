import { featuresListSchema } from "@/schemas/agent-validation";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function projectFeaturesAgent(title: string, description: string) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `
        You are a Product Planning Assistant.

      Your task:
      1. First, carefully read the project title and description to understand what the tool is about.  
      2. Based on this understanding, generate a beginner-friendly list of 12–14 realistic features.  

      Return ONLY valid JSON in this exact format:
      {
        "features": [
          {"id": "1", "title": "User Authentication", "description": "Secure login and signup system"},
          {"id": "2", "title": "User Dashboard", "description": "Main page showing user stats and progress"}
        ]
      }

      Rules:
      - Generate between 12 and 14 features.
      - Each feature must have:
        - "id": a unique string number starting from "1".
        - "title": exactly 2–3 words, never one word.
        - "description": clear, 1 simple sentence (≤ 20 words).
      - Use easy, beginner-friendly language.
      - Features should be realistic and implementable, not overly complex.
      - Return ONLY valid JSON, no explanations or text outside the JSON.

      ---

      ### ✅ Few-shot examples:

      INPUT: 
      Title: "NoteMate"
      Description: "An AI-powered note-taking app that organizes study material automatically."

      THINK: The tool is an AI-based note-taking assistant for students. It helps organize, search, and manage study notes.  

      OUTPUT:
      {
        "features": [
          {"id": "1", "title": "User Authentication", "description": "Secure login and signup system"},
          {"id": "2", "title": "Smart Notes", "description": "Automatically organizes notes by topic"},
          {"id": "3", "title": "Quick Search", "description": "Find notes instantly with a search bar"},
          {"id": "4", "title": "Cloud Sync", "description": "Access notes across devices"},
          {"id": "5", "title": "Highlight Tool", "description": "Highlight important text easily"},
          {"id": "6", "title": "Offline Mode", "description": "Use notes without internet"},
          {"id": "7", "title": "Voice Notes", "description": "Record and save spoken notes"},
          {"id": "8", "title": "Study Planner", "description": "Plan and track study sessions"},
          {"id": "9", "title": "Flashcard Generator", "description": "Turn notes into simple flashcards"},
          {"id": "10", "title": "Team Collaboration", "description": "Share notes with classmates"},
          {"id": "11", "title": "Reminder Alerts", "description": "Set alerts for study sessions"},
          {"id": "12", "title": "Export Options", "description": "Download notes as PDF or Word"}
        ]
      }

      INPUT: 
      Title: "CraftHub"
      Description: "An online marketplace where people can buy and sell handmade crafts."

      THINK: The tool is a marketplace platform connecting craft makers with buyers. It needs shopping, selling, and browsing features.  

      OUTPUT:
      {
        "features": [
          {"id": "1", "title": "User Authentication", "description": "Secure signup and login"},
          {"id": "2", "title": "Seller Profiles", "description": "Pages where sellers display their products"},
          {"id": "3", "title": "Shopping Cart", "description": "Add items and check out easily"},
          {"id": "4", "title": "Search Bar", "description": "Find crafts by category or keyword"},
          {"id": "5", "title": "Product Reviews", "description": "Buyers leave ratings and feedback"},
          {"id": "6", "title": "Secure Payments", "description": "Pay safely using credit card or PayPal"},
          {"id": "7", "title": "Wishlist Feature", "description": "Save favorite products for later"},
          {"id": "8", "title": "Order Tracking", "description": "Track orders from purchase to delivery"},
          {"id": "9", "title": "Category Filters", "description": "Filter crafts by type or material"},
          {"id": "10", "title": "Discount Codes", "description": "Apply coupons at checkout"},
          {"id": "11", "title": "Mobile Friendly", "description": "Shop easily on any device"},
          {"id": "12", "title": "Customer Support", "description": "Chat or email support for issues"},
          {"id": "13", "title": "Favorites List", "description": "Bookmark sellers you like"},
          {"id": "14", "title": "Email Notifications", "description": "Get updates about new crafts"}
        ]
      }

      Now generate features for this project:
      Title: ${title},
      Description: ${description}
        `,
  });

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  const { success, data: content } = featuresListSchema.safeParse(json);

  if (!success) throw new Error("AI Generated Invalid Response");

  return content.features;
}
