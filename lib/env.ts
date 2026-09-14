import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),

  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),

  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_STORAGE_BUCKET: z.string(),

  NVIDIA_API_KEY: z.string(),
  NVIDIA_BASE_URL: z.string().url(),
  NVIDIA_MODEL: z.string().default("nvidia/nemotron-3-super-120b-a12b"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;