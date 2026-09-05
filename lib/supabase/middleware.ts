import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(
    url &&
    url.startsWith("http") &&
    !url.includes("placeholder") &&
    key &&
    !key.includes("placeholder")
  );

  const supabase = createServerClient(
    isConfigured ? url! : "https://placeholder-project.supabase.co",
    isConfigured ? key! : "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (isConfigured) {
    try {
      await supabase.auth.getUser();
    } catch {
      // Ignored
    }
  }

  return supabaseResponse;
}
