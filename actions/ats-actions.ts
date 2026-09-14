"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { analyzeResumeAgainstJob } from "@/lib/ai/ats-analyzer";
import { z } from "zod";

export type AnalyzeResumeActionResult =
  | {
      success: true;
      resumeId: string;
      atsScore: number;
      matchingKeywords: string[];
      missingKeywords: string[];
      skillGaps: string[];
      strengths: string[];
      summary: string;
      subScores?: {
        keywordCoverage: number;
        experienceAlignment: number;
        technicalDepth: number;
      };
      categorizedKeywords?: Array<{
        category: string;
        matching: string[];
        missing: string[];
      }>;
    }
  | {
      success: false;
      error: string;
    };

const requestSchema = z.object({
  resumeText: z.string().min(10, "Resume content is too short").max(50000),
  jobDescription: z.string().min(10, "Job description is too short").max(50000),
  resumeId: z.string().optional(),
  model: z.string().optional(),
});

export async function analyzeResumeAction(
  resumeText: string,
  jobDescription: string,
  resumeId?: string,
  model?: string
): Promise<AnalyzeResumeActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized: Please sign in to analyze resumes" };
    }

    const validation = requestSchema.safeParse({ resumeText, jobDescription, resumeId, model });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || "Invalid input data" };
    }

    // Run AI ATS analysis with selected model
    const analysisResult = await analyzeResumeAgainstJob(resumeText, jobDescription, model);

    // If resumeId provided, find and update that specific resume, otherwise find recent or create
    let targetResume = null;
    if (resumeId) {
      targetResume = await prisma.resume.findUnique({ where: { id: resumeId } });
    }

    if (!targetResume) {
      targetResume = await prisma.resume.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    let savedResumeId: string;

    if (targetResume) {
      const updated = await prisma.resume.update({
        where: { id: targetResume.id },
        data: {
          parsedText: resumeText,
          jobDescription: jobDescription,
          atsScore: analysisResult.atsScore,
          matchingKeywords: analysisResult.matchingKeywords,
          missingKeywords: analysisResult.missingKeywords,
          skillGaps: analysisResult.skillGaps,
          strengths: analysisResult.strengths,
          summary: analysisResult.summary,
        },
      });
      savedResumeId = updated.id;
    } else {
      const created = await prisma.resume.create({
        data: {
          userId: user.id,
          parsedText: resumeText,
          jobDescription: jobDescription,
          atsScore: analysisResult.atsScore,
          matchingKeywords: analysisResult.matchingKeywords,
          missingKeywords: analysisResult.missingKeywords,
          skillGaps: analysisResult.skillGaps,
          strengths: analysisResult.strengths,
          summary: analysisResult.summary,
        },
      });
      savedResumeId = created.id;
    }

    return {
      success: true,
      resumeId: savedResumeId,
      ...analysisResult,
    };
  } catch (error) {
    console.error("ATS analysis action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal error during ATS analysis",
    };
  }
}