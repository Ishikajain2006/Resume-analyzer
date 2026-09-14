"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { uploadFile } from "@/lib/storage/supabase-storage";
import pdfParse from "pdf-parse";

export type UploadResumeResult =
  | {
      success: true;
      text: string;
      resumeId: string;
      fileUrl: string | null;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server action to process an uploaded PDF resume:
 * 1. Validates authentication.
 * 2. Validates PDF format & size (< 5MB).
 * 3. Saves the PDF file to persistent storage (local/Supabase).
 * 4. Extracts text via pdf-parse.
 * 5. Persists the Resume record to the database.
 */
export async function uploadResumeAction(file: File): Promise<UploadResumeResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized: Please sign in to upload resumes" };
    }

    // Validate the file
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Invalid file" };
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file to storage
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${user.id}/${Date.now()}-${sanitizedFileName}`;
    let fileUrl: string | null = null;
    try {
      fileUrl = await uploadFile(buffer, storagePath);
    } catch (storageErr) {
      console.warn("Storage upload notice:", storageErr);
    }

    // Extract text from PDF
    let pdfText = "";
    try {
      const parsedData = await pdfParse(buffer);
      pdfText = (parsedData.text || "").trim();
    } catch (parseError) {
      console.error("PDF parse error:", parseError);
      return { success: false, error: "Failed to parse PDF document. Ensure it is not password-protected." };
    }

    if (!pdfText || pdfText.length < 20) {
      return {
        success: false,
        error: "Extracted PDF text is too short or empty. Please ensure the PDF has selectable text.",
      };
    }

    // Persist resume in database
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        parsedText: pdfText,
        fileUrl: fileUrl,
        atsScore: null,
        matchingKeywords: [],
        missingKeywords: [],
        skillGaps: [],
        strengths: [],
        summary: null,
        jobDescription: null,
      },
    });

    return {
      success: true,
      text: pdfText,
      resumeId: resume.id,
      fileUrl: fileUrl,
    };
  } catch (error) {
    console.error("Upload resume action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during upload",
    };
  }
}

/**
 * Fetch past resumes and analyses for the current user.
 */
export async function getUserResumesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized", resumes: [] };

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, resumes };
  } catch (err) {
    console.error("Error getting user resumes:", err);
    return { success: false, error: "Failed to load history", resumes: [] };
  }
}

/**
 * Delete a user's resume.
 */
export async function deleteResumeAction(resumeId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.userId !== user.id) {
      return { success: false, error: "Resume not found or unauthorized" };
    }

    await prisma.resume.delete({ where: { id: resumeId } });
    return { success: true };
  } catch (err) {
    console.error("Error deleting resume:", err);
    return { success: false, error: "Failed to delete resume" };
  }
}

/**
 * Validate that a file is a PDF and under the 5MB size limit.
 */
function validatePdfFile(
  file: File,
  maxSizeInMB: number = 5
): { valid: boolean; error?: string } {
  const isPdfMime = file.type === "application/pdf";
  const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfExt) {
    return { valid: false, error: "Invalid file type. Only PDF documents are allowed." };
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeInMB}MB limit. Please upload a smaller PDF.`,
    };
  }

  return { valid: true };
}