"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
  getClientIdentifier,
  timingSafeEqualStr,
  signAdminToken,
  verifyAdminToken,
} from "@/lib/security";

const ADMIN_COOKIE_NAME = "z_admin_session";

export async function adminLogin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = ((formData.get("password") as string) || "").trim();

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // Determine client identifier for rate-limiting
  let clientIp = "unknown-ip";
  try {
    const headerList = await headers();
    clientIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "unknown-ip";
  } catch {
    // ignore
  }
  const rateLimitKey = getClientIdentifier(clientIp, email);

  // Check rate limit
  const rateLimitStatus = checkRateLimit(rateLimitKey);
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      error: `Too many failed login attempts. Locked for security. Please try again in ${rateLimitStatus.waitMinutes} minute(s).`,
    };
  }

  // 1. Master Admin check with timing-safe comparison
  const masterPassword = process.env.ADMIN_PASSWORD || "admin123";
  const isValidAdminEmail =
    email === "admin@z-electronics.com" ||
    email === "admin" ||
    email === "sujith@z-electronics.com";

  const isMasterPassword = isValidAdminEmail && timingSafeEqualStr(password, masterPassword);

  if (isMasterPassword) {
    recordSuccessfulLogin(rateLimitKey);
    const token = await signAdminToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  }

  // 2. If not using master password, attempt Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        recordSuccessfulLogin(rateLimitKey);
        const token = await signAdminToken();
        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return { success: true };
      }
    } catch {
      // Fall through
    }
  }

  // Record failed attempt
  recordFailedAttempt(rateLimitKey);

  return {
    success: false,
    error: "Invalid admin credentials. Please verify your email and password.",
  };
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    if (sessionCookie?.value) {
      if (verifyAdminToken(sessionCookie.value)) {
        return true;
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        return Boolean(user);
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  redirect("/admin/login");
}
