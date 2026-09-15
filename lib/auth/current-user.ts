import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";

export interface AppUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get the current authenticated user from Clerk and ensure they exist in our database.
 * Falls back to a local demo candidate in development if not logged in.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  let clerkUserId: string | null = null;

  try {
    const authData = await auth();
    clerkUserId = authData?.userId || null;
  } catch (err) {
    // If called outside of request context or unauthenticated
    clerkUserId = null;
  }

  if (!clerkUserId) {
    // Graceful fallback to persistent guest / demo candidate in development or when unauthenticated
    const demoClerkId = "guest_candidate_local";
    let demoUser = await prisma.user.findUnique({
      where: { clerkId: demoClerkId },
    });
    if (!demoUser) {
      demoUser = await prisma.user.upsert({
        where: { clerkId: demoClerkId },
        update: {},
        create: {
          clerkId: demoClerkId,
          email: "candidate@nemotron-ats.local",
          name: "Guest Candidate",
        },
      });
    }
    return demoUser;
  }

  const targetClerkId = clerkUserId;

  // Try to find the user in our database
  let user = await prisma.user.findUnique({
    where: { clerkId: targetClerkId },
  });

  if (user) {
    return user;
  }

  // If real Clerk user, try to get details from Clerk API
  let email = "candidate@local.dev";
  let name = "Demo Candidate";

  if (clerkUserId && env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.includes("your_secret")) {
    try {
      const res = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        headers: {
          Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
        },
      });
      if (res.ok) {
        const clerkUser = await res.json();
        const primaryEmail = clerkUser.email_addresses?.find(
          (e: any) => e.id === clerkUser.primary_email_address_id
        );
        email = primaryEmail?.email_address || clerkUser.email_addresses?.[0]?.email_address || email;
        const fn = clerkUser.first_name || "";
        const ln = clerkUser.last_name || "";
        name = (fn + " " + ln).trim() || clerkUser.username || "Candidate";
      }
    } catch (e) {
      console.warn("Could not fetch Clerk user profile details, using defaults.");
    }
  }

  // Create user in local database
  user = await prisma.user.create({
    data: {
      clerkId: targetClerkId,
      email,
      name,
    },
  });

  return user;
}