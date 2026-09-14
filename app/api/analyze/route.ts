import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeAction } from "@/actions/ats-actions";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await analyzeResumeAction(
      body.resumeText,
      body.jobDescription,
      body.resumeId,
      body.model
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        resumeId: result.resumeId,
        atsScore: result.atsScore,
        matchingKeywords: result.matchingKeywords,
        missingKeywords: result.missingKeywords,
        skillGaps: result.skillGaps,
        strengths: result.strengths,
        summary: result.summary,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Analyze route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during analysis" },
      { status: 500 }
    );
  }
}