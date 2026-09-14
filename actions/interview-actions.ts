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