"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { generateInterviewQuestions } from "@/lib/ai/interview-generator";
import { InterviewQuestion } from "@/lib/types";
import { z } from "zod";

export type GenerateInterviewActionResult =
  | {
      success: true;
      interviewSession: {
        id: string;
        targetRole: string;
        questions: InterviewQuestion[];
        createdAt: Date;
      };
    }
  | {
      success: false;
      error: string;
    };

const requestSchema = z.object({
  skillGaps: z.array(z.string()).default([]),
  targetRole: z.string().min(2, "Target role is required").max(100),
  resumeId: z.string().optional(),
  model: z.string().optional(),
});

export async function generateInterviewQuestionsAction(
  skillGaps: string[],
  targetRole: string,
  resumeId?: string,
  model?: string
): Promise<GenerateInterviewActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized: Please sign in to generate questions" };
    }

    const validation = requestSchema.safeParse({ skillGaps, targetRole, resumeId, model });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || "Invalid input data" };
    }

    // Locate the resume record
    let targetResume = null;
    if (resumeId) {
      targetResume = await prisma.resume.findUnique({ where: { id: resumeId } });
    }

    if (!targetResume) {
      targetResume = await prisma.resume.findFirst({
        where: {
          userId: user.id,
          atsScore: { not: null },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    // If still no resume, fallback to most recent resume of the user
    if (!targetResume) {
      targetResume = await prisma.resume.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    // If no resume exists at all, create an initial placeholder resume
    if (!targetResume) {
      targetResume = await prisma.resume.create({
        data: {
          userId: user.id,
          parsedText: "Interview preparation session initialized",
          jobDescription: targetRole,
          atsScore: 70,
          matchingKeywords: [],
          missingKeywords: skillGaps,
          skillGaps: skillGaps,
          strengths: [],
          summary: "Initial interview session created for role: " + targetRole,
        },
      });
    }

    // Generate questions with selected model
    const questions = await generateInterviewQuestions(skillGaps, targetRole, model);

    // Persist interview session
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        resumeId: targetResume.id,
        targetRole,
        questions,
      },
    });

    return {
      success: true,
      interviewSession: {
        id: session.id,
        targetRole: session.targetRole,
        questions: session.questions as InterviewQuestion[],
        createdAt: session.createdAt,
      },
    };
  } catch (error) {
    console.error("Generate interview questions action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate interview questions",
    };
  }
}

export type AnswerEvaluationResult = {
  score: number;
  feedback: string;
  coveredPoints: string[];
  missedPoints: string[];
  recommendations: string[];
};

export async function evaluateAnswerAction(
  question: string,
  candidateAnswer: string,
  keyPoints: string[] = [],
  rubric?: { mustCover?: string[]; tradeoffs?: string[]; pitfalls?: string[] }
): Promise<{ success: boolean; evaluation?: AnswerEvaluationResult; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please sign in to evaluate answers." };
    }

    const trimmed = candidateAnswer.trim();
    if (!trimmed || trimmed.length < 5) {
      return { success: false, error: "Candidate answer is too brief to evaluate. Provide at least a sentence." };
    }

    // Heuristic baseline calculation
    const answerLower = trimmed.toLowerCase();
    const covered: string[] = [];
    const missed: string[] = [];

    keyPoints.forEach((kp) => {
      const words = kp.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matches = words.filter((w) => answerLower.includes(w)).length;
      if (matches >= Math.ceil(words.length * 0.4)) {
        covered.push(kp);
      } else {
        missed.push(kp);
      }
    });

    // Attempt evaluation with Nemotron Lightning
    const { OpenAI } = await import("openai");
    const { env } = await import("@/lib/env");
    const { extractJsonFromResponse } = await import("@/lib/ai/utils");

    const openai = new OpenAI({
      apiKey: env.NVIDIA_API_KEY,
      baseURL: env.NVIDIA_BASE_URL,
    });

    const prompt = `You are a Principal Engineering Bar Raiser. Evaluate the candidate's spoken interview response.
Question: ${question}
Expected Concepts: ${keyPoints.join("; ")}
Must Cover: ${(rubric?.mustCover || []).join("; ")}
Candidate Answer: "${trimmed}"

Return ONLY valid JSON:
{
  "score": number (0-100),
  "feedback": "2-3 objective, encouraging coaching sentences highlighting strength and key gap",
  "coveredPoints": string[],
  "missedPoints": string[],
  "recommendations": string[]
}`;

    try {
      const res = await openai.chat.completions.create(
        {
          model: "nvidia/nemotron-3.5-lightning-30b-a3b",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 800,
        },
        { signal: AbortSignal.timeout(12000) }
      );

      const content = res.choices[0]?.message?.content || "";
      const cleaned = extractJsonFromResponse(content);
      const parsed = JSON.parse(cleaned);

      return {
        success: true,
        evaluation: {
          score: Math.min(100, Math.max(20, Math.round(Number(parsed.score) || 75))),
          feedback: parsed.feedback || "Good structure and technical communication.",
          coveredPoints: Array.isArray(parsed.coveredPoints) && parsed.coveredPoints.length > 0 ? parsed.coveredPoints : covered,
          missedPoints: Array.isArray(parsed.missedPoints) ? parsed.missedPoints : missed,
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Deepen concrete failure recovery examples."],
        },
      };
    } catch {
      // Heuristic fallback
      const ratio = keyPoints.length > 0 ? covered.length / keyPoints.length : 0.7;
      const score = Math.round(Math.min(95, Math.max(50, ratio * 100)));

      return {
        success: true,
        evaluation: {
          score,
          feedback: `Good technical answer addressing ${covered.length} essential concepts. Focus on elaborating on edge cases and failure modes.`,
          coveredPoints: covered.length > 0 ? covered : keyPoints.slice(0, 1),
          missedPoints: missed.length > 0 ? missed : keyPoints.slice(1),
          recommendations: ["Explicitly mention latency, concurrency, and observability tradeoffs."],
        },
      };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Evaluation failed" };
  }
}