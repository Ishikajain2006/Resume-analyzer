import fs from "fs";
import path from "path";

/**
 * Local file storage service that writes uploaded resume PDFs to the public directory
 * so they can be viewed or downloaded in the browser.
 */
export class LocalFileStorage {
  private static getUploadDir(subPath?: string): string {
    const baseDir = path.join(process.cwd(), "public", "uploads", "resumes");
    const targetDir = subPath ? path.join(baseDir, subPath) : baseDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    return targetDir;
  }

  /**
   * Save a buffer or blob to the local uploads directory.
   * @param buffer - File content buffer
   * @param relativePath - e.g. "userId/filename.pdf"
   * @returns Public URL path (e.g. "/uploads/resumes/userId/filename.pdf")
   */
  static async uploadBuffer(buffer: Buffer, relativePath: string): Promise<string> {
    const fullPath = path.join(process.cwd(), "public", "uploads", "resumes", relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, buffer);
    // Return relative URL for browser access
    const normalizedUrl = "/uploads/resumes/" + relativePath.replace(/\\/g, "/");
    return normalizedUrl;
  }

  /**
   * Delete a locally stored file.
   */
  static async deleteFile(relativePath: string): Promise<void> {
    const cleanPath = relativePath.startsWith("/uploads/resumes/")
      ? relativePath.replace("/uploads/resumes/", "")
      : relativePath;
    const fullPath = path.join(process.cwd(), "public", "uploads", "resumes", cleanPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}