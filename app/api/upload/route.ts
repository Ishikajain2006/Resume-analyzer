import { NextRequest, NextResponse } from "next/server";
import { uploadResumeAction } from "@/actions/resume-actions";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Invalid request type, expected multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No resume file was uploaded" },
        { status: 400 }
      );
    }

    const result = await uploadResumeAction(file);

    if (result.success) {
      return NextResponse.json({
        success: true,
        text: result.text,
        resumeId: result.resumeId,
        fileUrl: result.fileUrl,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during upload" },
      { status: 500 }
    );
  }
}