/**
 * Utility functions for the application
 */
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with clsx and resolve Tailwind CSS conflicts with tailwind-merge
 * @param inputs - Class names to combine
 * @returns string - Combined class names
 */
export function cn(...inputs: (string | undefined | false | null | Record<string, boolean>)[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Convert an ATS score (0-100) to a human-readable label.
 * @param score - The ATS score (0-100)
 * @returns string - The label (e.g., "Excellent Match")
 */
export function getAtsScoreLabel(score: number | null): string {
  if (score === null) {
    return "Not analyzed";
  }

  if (score < 40) {
    return "Poor Match";
  } else if (score < 60) {
    return "Needs Improvement";
  } else if (score < 75) {
    return "Fair Match";
  } else if (score < 90) {
    return "Strong Match";
  } else {
    return "Excellent Match";
  }
}

/**
 * Truncate a string to a maximum length and add ellipsis if truncated.
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @returns string - The truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
}

/**
 * Generate a unique file name for uploads.
 * @param originalName - The original file name
 * @returns string - A unique file name (timestamp + random string + original extension)
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalName.split(".").pop() ?? "";
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Validate that a file is a PDF and under the size limit.
 * @param file - The file to validate
 * @param maxSizeInMB - The maximum size in megabytes (default 5)
 * @returns { valid: boolean; error?: string }
 */
export function validatePdfFile(
  file: File,
  maxSizeInMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== "application/pdf") {
    return { valid: false, error: "File must be a PDF" };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeInMB} MB` };
  }

  return { valid: true };
}