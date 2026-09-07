"use server";

import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/lib/actions/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { StatCard, DEFAULT_SITE_STATS } from "@/lib/types";

let inMemorySiteStats: StatCard[] = [...DEFAULT_SITE_STATS];

export async function getSiteStats(): Promise<StatCard[]> {
  try {
    if (!isSupabaseConfigured()) {
      return inMemorySiteStats;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("id", "homepage_stats")
      .maybeSingle();

    if (error || !data || !Array.isArray(data.data) || data.data.length === 0) {
      return inMemorySiteStats;
    }

    inMemorySiteStats = data.data as StatCard[];
    return inMemorySiteStats;
  } catch (err) {
    console.warn("Could not load homepage stats from database, using cached stats:", err);
    return inMemorySiteStats;
  }
}

export async function updateSiteStats(
  stats: StatCard[]
): Promise<{ success: boolean; data?: StatCard[]; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  if (!Array.isArray(stats) || stats.length === 0) {
    return { success: false, error: "Invalid stats configuration provided." };
  }

  try {
    const sanitizedStats: StatCard[] = stats.map((s, index) => ({
      id: s.id || `stat-${index + 1}`,
      icon: s.icon || "Cpu",
      color: s.color || "primary",
      title: (s.title || "").trim(),
      subtitle: (s.subtitle || "").trim(),
    }));

    inMemorySiteStats = sanitizedStats;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            id: "homepage_stats",
            data: sanitizedStats,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) {
        console.warn("Supabase upsert warning for site_settings (using memory cache):", error.message);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, data: inMemorySiteStats };
  } catch (err: any) {
    console.error("Error updating site stats:", err);
    return { success: false, error: err.message || "Failed to update stats" };
  }
}

export async function resetSiteStats(): Promise<{ success: boolean; data?: StatCard[]; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  return updateSiteStats(DEFAULT_SITE_STATS);
}
