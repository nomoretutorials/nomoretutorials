import * as z from "zod";

// TODO: Make the function retry if json is not valid.
// TODO: Verify agent types

export async function runAndValidateAgent<T>(
  agent: any,
  input: string,
  schema: z.ZodType<T>
): Promise<T> {
  const { output } = await agent.run(input);

  try {
    const firstOutput = output[0];
    if (!firstOutput || !("content" in firstOutput)) {
      throw new Error("No content found in agent output");
    }

    const content = firstOutput.content as string;
    const parsed = JSON.parse(content);

    return schema.parse(parsed);
  } catch (error) {
    console.error("Agent validation failed:", error);
    throw new Error("Agent returned invalid or malformed JSON");
  }
}
