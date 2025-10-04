import { Feature } from "@/types/project";

export function parseStepFeatures(content: unknown): Feature[] {
  try {
    if (!content) {
      return [];
    }

    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }

    if (Array.isArray(content)) {
      return content as Feature[];
    }

    console.warn("Unexpected step content format:", typeof content);
    return [];
  } catch (error) {
    console.error("Failed to parse step features:", error);
    return [];
  }
}
