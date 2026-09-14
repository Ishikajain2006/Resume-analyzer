import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestionsAction } from "@/actions/interview-actions";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await generateInterviewQuestionsAction(
      body.skillGaps || [],
      body.targetRole,
      body.resumeId,
      body.model
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        interviewSession: {
          id: result.interviewSession.id,
          targetRole: result.interviewSession.targetRole,
          questions: result.interviewSession.questions,
          createdAt: result.interviewSession.createdAt,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Interview route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during interview generation" },
      { status: 500 }
    );
  }
}