import { z } from "zod";

/**
 * Schema for validating the resume upload request (file validation is done in the route handler).
 * We'll validate the form data fields if any, but for now we only have the file.
 * We can use this to validate any additional metadata if needed.
 */
export const uploadResumeSchema = z.object({
  // We can add any additional fields if needed, but for now just the file is handled separately.
});

/**
 * Schema for the ATS analysis request.
 */
export const atsAnalysisSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required").max(50000, "Resume text is too long"),
  jobDescription: z.string().min(1, "Job description is required").max(50000, "Job description is too long"),
});

/**
 * Schema for the interview generation request.
 */
export const interviewGenerationSchema = z.object({
  skillGaps: z.array(z.string()).min(1, "At least one skill gap is required").max(20, "Too many skill gaps"),
  targetRole: z.string().min(1, "Target role is required").max(100, "Target role is too long"),
});

/**
 * Schema for the ATS analysis response from the AI.
 */
export const atsAnalysisResponseSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  matchingKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  skillGaps: z.array(z.string()),
  strengths: z.array(z.string()),
  summary: z.string(),
});

/**
 * Schema for the interview question object.
 */
export const interviewQuestionSchema = z.object({
  id: z.number().int().positive(),
  question: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  sampleAnswerKeyPoints: z.array(z.string()),
});

/**
 * Schema for the interview generation response (array of 5 questions).
 */
export const interviewGenerationResponseSchema = z.array(interviewQuestionSchema).length(5);

/**
 * Schema for validating environment variables (duplicate of lib/env.ts for reference, but we use the one in lib/env.ts).
 * We keep it here for completeness.
 */
export const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),

  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),

  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_STORAGE_BUCKET: z.string(),

  NVIDIA_API_KEY: z.string(),
  NVIDIA_BASE_URL: z.string().url(),
  NVIDIA_MODEL: z.string().default("nvidia/nemotron-3-super-120b-a12b"),
});