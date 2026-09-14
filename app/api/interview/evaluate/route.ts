/**
 * @endpoint /api/interview/evaluate
 * @watermark Made by PookieStudios
 * @author PookieStudios
 * @copyright (c) PookieStudios. All rights reserved.
 */

import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswerAction } from "@/actions/interview-actions";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await evaluateAnswerAction(
      body.question,
      body.candidateAnswer,
      body.keyPoints || [],
      body.rubric
    );

    if (result.success) {
      return NextResponse.json(
        { success: true, evaluation: result.evaluation },
        { headers: { "X-Engineered-By": "PookieStudios" } }
      );
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Evaluate route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during evaluation" },
      { status: 500 }
    );
  }
}
