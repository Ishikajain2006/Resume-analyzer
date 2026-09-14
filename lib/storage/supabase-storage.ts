import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { LocalFileStorage } from "./local-storage";

/**
 * Storage service: uses Supabase Storage if configured with real credentials,
 * otherwise transparently uses LocalFileStorage.
 */
const isRealSupabase =
  env.NEXT_PUBLIC_SUPABASE_URL &&
  !env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
  !env.NEXT_PUBLIC_SUPABASE_URL.includes("localhost") &&
  env.SUPABASE_SERVICE_ROLE_KEY &&
  !env.SUPABASE_SERVICE_ROLE_KEY.includes("your_service_role") &&
  !env.SUPABASE_SERVICE_ROLE_KEY.includes("local_service_role");

const supabase = isRealSupabase
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Upload a file (Buffer or Blob/File) to storage.
 */
export async function uploadFile(
  file: File | Blob | Buffer,
  path: string
): Promise<string> {
  let buffer: Buffer;
  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if ("arrayBuffer" in file) {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } else {
    throw new Error("Unsupported file type for upload");
  }

  if (supabase) {
    const { error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(path, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (error) {
      console.warn("Supabase upload failed, falling back to local:", error.message);
      return LocalFileStorage.uploadBuffer(buffer, path);
    }

    const { data: urlData } = supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  // Local storage mode
  return LocalFileStorage.uploadBuffer(buffer, path);
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(path: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([path]);
    } catch (err) {
      console.warn("Supabase delete failed:", err);
    }
  }
  await LocalFileStorage.deleteFile(path);
}

/**
 * Get the public URL for a stored file.
 */
export function getFileUrl(path: string): string {
  if (supabase) {
    const { data } = supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }
  return path.startsWith("/uploads/resumes/")
    ? path
    : "/uploads/resumes/" + path.replace(/\\/g, "/");
}