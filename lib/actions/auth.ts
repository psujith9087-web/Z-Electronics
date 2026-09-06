"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";
import { signCustomerSession, verifyCustomerSession } from "@/lib/security";

export interface CustomerSession {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  isLoggedIn: boolean;
}

const CUSTOMER_COOKIE = "z_customer_session";

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(CUSTOMER_COOKIE);

    if (sessionCookie?.value) {
      const verified = verifyCustomerSession(sessionCookie.value);
      if (verified) {
        return verified;
      }
    }

    // Check Supabase Auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Customer";
      const phone = user.user_metadata?.phone || "";

      return {
        id: user.id,
        name,
        phone,
        email: user.email || "",
        isLoggedIn: true,
      };
    }

    return null;
  } catch (err) {
    console.error("Error retrieving customer session:", err);
    return null;
  }
}

export async function loginWithPhone(formData: FormData) {
  const name = (formData.get("full_name") as string)?.trim();
  const rawPhone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || "";
  const redirectTo = (formData.get("redirect") as string) || "/orders";

  if (!name) {
    return { error: "Please enter your full name." };
  }

  const cleanPhone = rawPhone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  const customerSession: CustomerSession = {
    id: `cust_${cleanPhone}`,
    name,
    phone: cleanPhone,
    email,
    isLoggedIn: true,
  };

  const signedCookie = signCustomerSession(customerSession);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, signedCookie, {
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(redirectTo);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/orders";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.user) {
    const name =
      data.user.user_metadata?.full_name ||
      email.split("@")[0] ||
      "Customer";
    const phone = data.user.user_metadata?.phone || "";

    const customerSession: CustomerSession = {
      id: data.user.id,
      name,
      phone,
      email,
      isLoggedIn: true,
    };

    const signedCookie = signCustomerSession(customerSession);
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE, signedCookie, {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  redirect(redirectTo);
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim()?.replace(/\D/g, "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Also set cookie if session was created directly
  if (data?.user) {
    const customerSession: CustomerSession = {
      id: data.user.id,
      name: fullName,
      phone: phone || "",
      email,
      isLoggedIn: true,
    };

    const signedCookie = signCustomerSession(customerSession);
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE, signedCookie, {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return { success: "Account created successfully! You can now log in or start tracking your orders." };
}

export async function customerSignOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CUSTOMER_COOKIE);

    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Sign out error:", err);
  }

  redirect("/");
}

export async function signOut() {
  return customerSignOut();
}

export async function getSession() {
  return getCustomerSession();
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === "admin";
}

