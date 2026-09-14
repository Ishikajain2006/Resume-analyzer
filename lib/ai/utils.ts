/**
 * Extract JSON from a string that might contain markdown code fences, thought tokens, or other text.
 */
function findBalancedJson(str: string): string | null {
  const startIdx = str.indexOf("{");
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < str.length; i++) {
    const char = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{") {
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0) {
          return str.slice(startIdx, i + 1);
        }
      }
    }
  }

  return null;
}

/**
 * Extract JSON from a string that might contain markdown code fences, thought tokens, or other text.
 */
export function extractJsonFromResponse(raw: string): string {
  if (!raw) return "{}";

  // 1. Remove reasoning / thought tags or thinking process preamble if present
  let text = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/Here'?s a thinking process:[\s\S]*?(?=\{)/i, "")
    .trim();

  // 2. Try markdown code fences (flexible with \r?\n and whitespace)
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeFenceMatch && codeFenceMatch[1]) {
    const fromFence = codeFenceMatch[1].trim();
    const balancedFence = findBalancedJson(fromFence);
    if (balancedFence) return balancedFence.replace(/,\s*([\}\]])/g, "$1").trim();
    text = fromFence;
  }

  // 3. Try balanced brace extraction for clean JSON object
  const balanced = findBalancedJson(text);
  if (balanced) {
    return balanced.replace(/,\s*([\}\]])/g, "$1").trim();
  }

  // 4. Find outermost JSON object or array by finding first { or [ and matching to last } or ]
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  } else {
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      text = text.substring(firstBracket, lastBracket + 1);
    }
  }

  // 5. Remove common syntax traps: trailing commas before closing braces/brackets
  text = text.replace(/,\s*([\}\]])/g, "$1");

  return text.trim();
}

/**
 * Safely parse JSON with automatic cleanup and fallback.
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = extractJsonFromResponse(text);
    return JSON.parse(cleaned) as T;
  } catch (err) {
    try {
      // Second attempt: aggressive cleanup of trailing commas, control characters
      const sanitized = text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/,\s*([\}\]])/g, "$1");
      const cleaned = extractJsonFromResponse(sanitized);
      return JSON.parse(cleaned) as T;
    } catch {
      console.warn("safeJsonParse failed, using fallback:", err);
      return fallback;
    }
  }
}