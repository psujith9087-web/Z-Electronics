"use server";

import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/lib/actions/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { StatCard, DEFAULT_SITE_STATS } from "@/lib/types";

const SETTINGS_ROW_NAME = "[SITE_SETTINGS] homepage_stats";
const SETTINGS_PREFIX = "__SITE_SETTINGS__";

let inMemorySiteStats: StatCard[] = [...DEFAULT_SITE_STATS];

export async function getSiteStats(): Promise<StatCard[]> {
  try {
    if (!isSupabaseConfigured()) {
      return inMemorySiteStats;
    }

    const supabase = await createClient();

    // 1. First attempt: check dedicated site_settings table (if user ran the SQL migration)
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("data")
        .eq("id", "homepage_stats")
        .maybeSingle();

      if (!error && data && Array.isArray(data.data) && data.data.length > 0) {
        inMemorySiteStats = data.data as StatCard[];
        return inMemorySiteStats;
      }
    } catch {
      // site_settings table not in schema cache, fallback to existing components table
    }

    // 2. Guaranteed fallback: check settings row in components table (which is 100% present in Supabase)
    const { data: row, error: rowError } = await supabase
      .from("components")
      .select("id, description")
      .eq("name", SETTINGS_ROW_NAME)
      .maybeSingle();

    if (!rowError && row && row.description && row.description.startsWith(SETTINGS_PREFIX)) {
      const jsonStr = row.description.substring(SETTINGS_PREFIX.length);
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemorySiteStats = parsed as StatCard[];
        return inMemorySiteStats;
      }
    }

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

      // 1. Try upserting to site_settings table if it exists
      try {
        await supabase
          .from("site_settings")
          .upsert(
            {
              id: "homepage_stats",
              data: sanitizedStats,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
      } catch {
        // Silently continue to guarantee persistence in existing components table
      }

      // 2. Always persist to components table (guaranteed present in database)
      const { data: existing } = await supabase
        .from("components")
        .select("id")
        .eq("name", SETTINGS_ROW_NAME)
        .maybeSingle();

      const encodedDescription = `${SETTINGS_PREFIX}${JSON.stringify(sanitizedStats)}`;

      if (existing && existing.id) {
        const { error: updateError } = await supabase
          .from("components")
          .update({
            description: encodedDescription,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating stats in components table:", updateError.message);
          return { success: false, error: updateError.message };
        }
      } else {
        const { error: insertError } = await supabase
          .from("components")
          .insert({
            name: SETTINGS_ROW_NAME,
            description: encodedDescription,
            price: 0,
            stock_quantity: 0,
          });

        if (insertError) {
          console.error("Error inserting stats into components table:", insertError.message);
          return { success: false, error: insertError.message };
        }
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
