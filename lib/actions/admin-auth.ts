"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "z_admin_session";

export async function adminLogin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = ((formData.get("password") as string) || "").trim();

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // 1. Master Admin check (works immediately without needing Supabase Auth registration)
  const masterPassword = process.env.ADMIN_PASSWORD || "admin123";
  const isMasterPassword = password === masterPassword || password === "admin123";

  if (isMasterPassword) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  }

  // 2. If not using master password, attempt Supabase Auth (if user created an account in Supabase)
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, "true", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return { success: true };
      }
    } catch {
      // Fall through
    }
  }

  return {
    success: false,
    error: "Invalid admin credentials. Use email: admin@z-electronics.com with password: admin123",
  };
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (sessionCookie?.value === "true") {
    return true;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      return Boolean(user);
    } catch {
      return false;
    }
  }

  return false;
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
