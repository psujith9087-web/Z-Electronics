"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "z_admin_session";

export async function adminLogin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // If Supabase is configured, use Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || "Invalid admin credentials." };
      }

      // Also set the admin cookie flag
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      return { success: false, error: msg };
    }
  }

  // Fallback demo admin authentication (for local setup prior to Supabase keys)
  if (
    (email === "admin@z-electronics.com" && password === "admin123") ||
    (email === "sujith@z-electronics.com" && password === "admin123") ||
    (password === "admin123")
  ) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true };
  }

  return {
    success: false,
    error: "Invalid credentials. Use 'admin@z-electronics.com' with password 'admin123' or configure Supabase Auth.",
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
