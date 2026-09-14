/**
 * Extract JSON from a string that might contain markdown code fences or other text.
 * This is a utility function to handle cases where the AI might return JSON wrapped in markdown.
 */
export function extractJsonFromResponse(text: string): string {
  // Try to find JSON wrapped in markdown code fences
  const codeFenceMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (codeFenceMatch) {
    return codeFenceMatch[1].trim();
  }

  // Try to find JSON object (starting with { and ending with })
  const jsonObjectMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[1].trim();
  }

  // Try to find JSON array (starting with [ and ending with ])
  const jsonArrayMatch = text.match(/(\[[\s\S]*\])/);
  if (jsonArrayMatch) {
    return jsonArrayMatch[1].trim();
  }

  // If no special formatting found, return the original text trimmed
  return text.trim();
}