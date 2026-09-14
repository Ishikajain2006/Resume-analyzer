import { OpenAI } from "openai";
import { env } from "@/lib/env";
import { z } from "zod";
import { AtsAnalysisResult } from "@/lib/types";
import { extractJsonFromResponse } from "./utils";

const openai = new OpenAI({
  apiKey: env.NVIDIA_API_KEY,
  baseURL: env.NVIDIA_BASE_URL,
});

const ATS_ANALYSIS_SYSTEM_PROMPT = `You are a Principal Engineering Recruiter and ATS Compliance Diagnostic Engine.
Evaluate the candidate's resume strictly against the target job requirements without hallucination.

You must return ONLY a valid JSON object strictly matching this schema:
{
  "atsScore": number (0-100, integer),
  "matchingKeywords": string[],
  "missingKeywords": string[],
  "skillGaps": string[],
  "strengths": string[],
  "summary": string,
  "subScores": {
    "keywordCoverage": number (0-100),
    "experienceAlignment": number (0-100),
    "technicalDepth": number (0-100)
  },
  "categorizedKeywords": [
    {
      "category": "Languages & Runtimes" | "Frameworks & Libraries" | "Cloud, DevOps & Infra" | "Databases & Storage" | "Architecture & Systems",
      "matching": string[],
      "missing": string[]
    }
  ]
}

Rules:
1. Compare only verified technical skills present in the resume text against the job description.
2. "atsScore": Strictly between 0 and 100 representing realistic ATS match probability.
3. "subScores": Realistic breakdown between 0 and 100.
4. "categorizedKeywords": Group matching and missing keywords across standard engineering categories.
5. "summary": 2-3 objective, professional sentences summarizing technical candidate fit and key gap areas.
6. Do not include conversational markdown, introductory text, or explanations outside the JSON object.`;

const categorizedGroupSchema = z.object({
  category: z.string().default("General"),
  matching: z.array(z.string()).default([]),
  missing: z.array(z.string()).default([]),
});

const atsAnalysisSchema = z.object({
  atsScore: z.coerce.number().int().min(0).max(100),
  matchingKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  skillGaps: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  summary: z.string().default("ATS diagnostic evaluation completed."),
  subScores: z
    .object({
      keywordCoverage: z.coerce.number().int().min(0).max(100).default(70),
      experienceAlignment: z.coerce.number().int().min(0).max(100).default(70),
      technicalDepth: z.coerce.number().int().min(0).max(100).default(70),
    })
    .optional(),
  categorizedKeywords: z.array(categorizedGroupSchema).optional(),
});

function validateAtsAnalysisResponse(rawContent: string): AtsAnalysisResult {
  const cleaned = extractJsonFromResponse(rawContent);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse ATS response JSON. Raw content:", rawContent);
    throw new Error("AI engine returned malformed JSON response. Please retry.");
  }

  const result = atsAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    console.error("Zod schema validation failed on ATS output:", result.error.format());
    throw new Error("Diagnostic output did not conform to expected ATS specification schema.");
  }

  const data = result.data;
  data.atsScore = Math.max(0, Math.min(100, data.atsScore));

  // Ensure default subScores if not generated
  if (!data.subScores) {
    const totalKw = data.matchingKeywords.length + data.missingKeywords.length;
    const kwRatio = totalKw > 0 ? Math.round((data.matchingKeywords.length / totalKw) * 100) : data.atsScore;
    data.subScores = {
      keywordCoverage: kwRatio,
      experienceAlignment: Math.min(100, Math.round(data.atsScore * 1.05)),
      technicalDepth: Math.max(40, Math.round(data.atsScore * 0.95)),
    };
  }

  return data;
}

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string,
  modelName?: string
): Promise<AtsAnalysisResult> {
  const trimmedResume = resumeText?.trim();
  const trimmedJd = jobDescription?.trim();

  if (!trimmedResume || trimmedResume.length < 10) {
    throw new Error("Resume text must contain at least 10 characters.");
  }
  if (!trimmedJd || trimmedJd.length < 10) {
    throw new Error("Job description must contain at least 10 characters.");
  }

  // Sanitized length limits to prevent runaway tokens
  const sanitizedResume = trimmedResume.slice(0, 15000);
  const sanitizedJd = trimmedJd.slice(0, 8000);

  const selectedModel = modelName?.trim() || env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";

  try {
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: ATS_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `RESUME SOURCE TEXT:\n${sanitizedResume}\n\nTARGET JOB SPECIFICATION:\n${sanitizedJd}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 1600,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response returned from NVIDIA Nemotron diagnostic service.");
    }

    return validateAtsAnalysisResponse(content);
  } catch (error) {
    console.error("ATS Analyzer Service Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Internal error communicating with inference engine"
    );
  }
}