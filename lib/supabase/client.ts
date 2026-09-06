import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://cuidsmnsmouudbgodtcj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1aWRzbW5zbW91dWRiZ29kdGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjIxNDQsImV4cCI6MjEwNDE5ODE0NH0.kgecwVQPQdy3i5kHFp75reC4RJsmJZheJYxrzdBLTsA";

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    url.startsWith("http") &&
    !url.includes("placeholder") &&
    key &&
    key.length > 20
  );
}

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
