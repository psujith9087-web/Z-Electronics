"use server";

import fs from "fs";
import path from "path";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkAdminSession } from "@/lib/actions/admin-auth";
import { ReviewItem } from "@/lib/types";
import {
  checkReviewRateLimit,
  recordReviewSubmission,
  sanitizeInputText,
} from "@/lib/security";

const REVIEWS_CACHE_FILE = path.join(process.cwd(), "public", "reviews-cache.json");
const REVIEW_ROW_PREFIX = "[REVIEW]";
const REVIEW_DESC_PREFIX = "__REVIEW__";

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-seed-1",
    customer_name: "Arun K.",
    rating: 5,
    title: "Flawless Prototyping Hardware",
    comment:
      "Sourced ESP32 DevKits and SG90 servos for our university robotics project. Zero defect rate, fast campus dispatch, and immediate GST invoice!",
    role_or_college: "Robotics Club Lead, PSG Tech",
    is_verified: true,
    created_at: "2026-08-15T10:30:00.000Z",
  },
  {
    id: "rev-seed-2",
    customer_name: "Karthik R.",
    rating: 5,
    title: "100% Tested Silicon & Genuine ICs",
    comment:
      "The HC-SR04 ultrasonic sensors and Arduino Uno boards were factory tested. Sujith provides genuine parts without the fake clones you get elsewhere.",
    role_or_college: "IoT Embedded Systems Engineer",
    is_verified: true,
    created_at: "2026-08-22T14:15:00.000Z",
  },
  {
    id: "rev-seed-3",
    customer_name: "Divya M.",
    rating: 5,
    title: "Outstanding WhatsApp Tech Support",
    comment:
      "Ordered 0.96 inch I2C OLED displays and L298N motor drivers. Sujith guided us directly on WhatsApp for pinouts and I2C address debugging. Super helpful!",
    role_or_college: "ECE Final Year, Anna University",
    is_verified: true,
    created_at: "2026-09-01T09:45:00.000Z",
  },
  {
    id: "rev-seed-4",
    customer_name: "Sanjay V.",
    rating: 5,
    title: "Direct Silicon Supply You Can Trust",
    comment:
      "Metal film resistor kits and Li-Ion battery charger modules arrived impeccably packed with protective static bags. Highly recommended for makers.",
    role_or_college: "Aeromodelling Tech Team",
    is_verified: true,
    created_at: "2026-09-05T16:20:00.000Z",
  },
];

function readLocalReviewsCache(): ReviewItem[] {
  try {
    if (fs.existsSync(REVIEWS_CACHE_FILE)) {
      const raw = fs.readFileSync(REVIEWS_CACHE_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read local reviews cache:", err);
  }
  return [...DEFAULT_REVIEWS];
}

function writeLocalReviewsCache(reviews: ReviewItem[]): void {
  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(REVIEWS_CACHE_FILE, JSON.stringify(reviews, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write local reviews cache:", err);
  }
}

function parseReviewFromRow(row: any): ReviewItem | null {
  try {
    if (row.rating !== undefined && row.customer_name) {
      // From dedicated public.reviews table
      return {
        id: row.id,
        customer_name: row.customer_name,
        rating: Number(row.rating) || 5,
        title: row.title || "",
        comment: row.comment || "",
        role_or_college: row.role_or_college || "",
        is_verified: Boolean(row.is_verified),
        created_at: row.created_at || new Date().toISOString(),
      };
    }

    // From fallback components table with __REVIEW__ description
    const desc = row.description || "";
    if (!desc.startsWith(REVIEW_DESC_PREFIX)) return null;

    const jsonStr = desc.substring(REVIEW_DESC_PREFIX.length);
    const parsed = JSON.parse(jsonStr);

    return {
      id: row.id,
      customer_name: parsed.customer_name || row.name?.replace(`${REVIEW_ROW_PREFIX} `, "") || "Customer",
      rating: Number(parsed.rating) || 5,
      title: parsed.title || "",
      comment: parsed.comment || "",
      role_or_college: parsed.role_or_college || "",
      is_verified: Boolean(parsed.is_verified),
      created_at: row.created_at || parsed.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Error parsing review row:", row.id, err);
    return null;
  }
}

/**
 * Fetch all reviews from Supabase (checking public.reviews first, then fallback adapter).
 */
async function fetchAllReviewsFromDb(): Promise<ReviewItem[]> {
  try {
    if (!isSupabaseConfigured()) {
      return readLocalReviewsCache();
    }

    const supabase = await createClient();

    // 1. Try dedicated public.reviews table
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        if (data.length === 0) {
          return readLocalReviewsCache();
        }
        const reviews = data.map(parseReviewFromRow).filter(Boolean) as ReviewItem[];
        writeLocalReviewsCache(reviews);
        return reviews;
      }
    } catch {
      // reviews table not in schema cache, proceed to resilient adapter
    }

    // 2. Resilient fallback: components table
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("components")
      .select("*")
      .ilike("description", `${REVIEW_DESC_PREFIX}%`)
      .order("created_at", { ascending: false });

    if (!fallbackError && Array.isArray(fallbackData) && fallbackData.length > 0) {
      const reviews = fallbackData
        .map(parseReviewFromRow)
        .filter(Boolean) as ReviewItem[];
      writeLocalReviewsCache(reviews);
      return reviews;
    }

    return readLocalReviewsCache();
  } catch (err) {
    console.warn("Error fetching reviews from DB, using cache:", err);
    return readLocalReviewsCache();
  }
}

/**
 * Get verified reviews for public visitors on the storefront.
 */
export async function getPublicReviews(): Promise<ReviewItem[]> {
  const all = await fetchAllReviewsFromDb();
  const verified = all.filter((r) => r.is_verified);
  if (verified.length === 0) {
    return DEFAULT_REVIEWS;
  }
  return verified;
}

/**
 * Get all reviews (including pending) for Admin management with summary stats.
 */
export async function getAllReviewsAdmin(): Promise<{
  reviews: ReviewItem[];
  stats: {
    total: number;
    verifiedCount: number;
    pendingCount: number;
    averageRating: number;
  };
}> {
  const all = await fetchAllReviewsFromDb();

  const verifiedCount = all.filter((r) => r.is_verified).length;
  const pendingCount = all.filter((r) => !r.is_verified).length;
  const sumRating = all.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
  const averageRating = all.length > 0 ? Number((sumRating / all.length).toFixed(1)) : 5.0;

  return {
    reviews: all,
    stats: {
      total: all.length,
      verifiedCount,
      pendingCount,
      averageRating,
    },
  };
}

/**
 * Customer submits a 5-star review.
 * Protected with rate limiting and strict XSS sanitization.
 * Saves with is_verified: false by default for admin moderation.
 */
export async function submitCustomerReview(input: {
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  role_or_college?: string;
}): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // 1. IP & rate limiting check
    let clientIp = "anonymous";
    try {
      const headersList = await headers();
      clientIp =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        "anonymous";
    } catch {
      // ignore
    }

    const rateCheck = checkReviewRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Too many submissions. Please wait ${rateCheck.waitMinutes || 5} minutes before submitting another review.`,
        error: "RATE_LIMITED",
      };
    }

    // 2. Validate & sanitize inputs
    const customer_name = sanitizeInputText(input.customer_name, 60);
    const comment = sanitizeInputText(input.comment, 1000);
    const title = sanitizeInputText(input.title || "", 120);
    const role_or_college = sanitizeInputText(input.role_or_college || "", 80);
    const rawRating = Math.round(Number(input.rating));
    const rating = Math.max(1, Math.min(5, isNaN(rawRating) ? 5 : rawRating));

    if (!customer_name || customer_name.length < 2) {
      return { success: false, message: "Please enter your name.", error: "INVALID_NAME" };
    }
    if (!comment || comment.length < 5) {
      return {
        success: false,
        message: "Please enter a detailed review comment (minimum 5 characters).",
        error: "INVALID_COMMENT",
      };
    }

    const newReviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newReview: ReviewItem = {
      id: newReviewId,
      customer_name,
      rating,
      title,
      comment,
      role_or_college,
      is_verified: false, // requires admin verification
      created_at: nowIso,
    };

    // 3. Persist to database
    let savedToDb = false;
    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      // Try dedicated public.reviews table
      try {
        const { data, error } = await supabase.from("reviews").insert({
          customer_name,
          rating,
          title,
          comment,
          role_or_college,
          is_verified: false,
        }).select();

        if (!error && data && data[0]) {
          newReview.id = data[0].id;
          savedToDb = true;
        }
      } catch {
        // Fallback below
      }

      // If dedicated table failed or wasn't present, save in components table
      if (!savedToDb) {
        const payload = JSON.stringify({
          customer_name,
          rating,
          title,
          comment,
          role_or_college,
          is_verified: false,
          created_at: nowIso,
        });

        const { data: fallbackData } = await supabase.from("components").insert({
          name: `${REVIEW_ROW_PREFIX} ${customer_name}`,
          description: `${REVIEW_DESC_PREFIX}${payload}`,
          price: 0,
          stock_quantity: 0,
        }).select();

        if (fallbackData && fallbackData[0]) {
          newReview.id = fallbackData[0].id;
          savedToDb = true;
        }
      }
    }

    // 4. Update local cache
    const current = readLocalReviewsCache();
    writeLocalReviewsCache([newReview, ...current]);

    // Record submission for rate limiter
    recordReviewSubmission(clientIp);

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message:
        "Thank you! Your 5-star review has been submitted and will appear on the storefront upon admin verification.",
    };
  } catch (err: any) {
    console.error("Error submitting review:", err);
    return {
      success: false,
      message: "An unexpected error occurred while submitting your review.",
      error: err.message,
    };
  }
}

/**
 * Admin action: Verify or unverify a review.
 */
export async function verifyReview(
  id: string,
  is_verified: boolean
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      // Try updating public.reviews table
      try {
        const { data, error } = await supabase
          .from("reviews")
          .update({ is_verified })
          .eq("id", id)
          .select();

        if (!error && data && data.length > 0) {
          // updated in reviews table
        } else {
          // Try fallback components table
          const { data: compRow } = await supabase
            .from("components")
            .select("id, description")
            .eq("id", id)
            .maybeSingle();

          if (compRow && compRow.description?.startsWith(REVIEW_DESC_PREFIX)) {
            const jsonStr = compRow.description.substring(REVIEW_DESC_PREFIX.length);
            const parsed = JSON.parse(jsonStr);
            parsed.is_verified = is_verified;

            await supabase
              .from("components")
              .update({
                description: `${REVIEW_DESC_PREFIX}${JSON.stringify(parsed)}`,
              })
              .eq("id", id);
          }
        }
      } catch (e) {
        console.warn("Error updating in Supabase:", e);
      }
    }

    // Update local cache
    const current = readLocalReviewsCache();
    const updated = current.map((r) => (r.id === id ? { ...r, is_verified } : r));
    writeLocalReviewsCache(updated);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("Error verifying review:", err);
    return { success: false, error: err.message || "Failed to update review status" };
  }
}

/**
 * Admin action: Permanently delete a review.
 */
export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      // Try deleting from public.reviews table
      try {
        await supabase.from("reviews").delete().eq("id", id);
      } catch {
        // ignore
      }

      // Try deleting from fallback components table
      try {
        await supabase.from("components").delete().eq("id", id);
      } catch {
        // ignore
      }
    }

    // Update local cache
    const current = readLocalReviewsCache();
    const updated = current.filter((r) => r.id !== id);
    writeLocalReviewsCache(updated);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting review:", err);
    return { success: false, error: err.message || "Failed to delete review" };
  }
}

/**
 * Admin action: Create an official verified review directly.
 */
export async function createAdminReview(input: {
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  role_or_college?: string;
  is_verified?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const customer_name = sanitizeInputText(input.customer_name, 60);
    const comment = sanitizeInputText(input.comment, 1000);
    const title = sanitizeInputText(input.title || "", 120);
    const role_or_college = sanitizeInputText(input.role_or_college || "", 80);
    const rating = Math.max(1, Math.min(5, Math.round(Number(input.rating) || 5)));
    const is_verified = input.is_verified !== undefined ? Boolean(input.is_verified) : true;
    const nowIso = new Date().toISOString();

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customer_name,
      rating,
      title,
      comment,
      role_or_college,
      is_verified,
      created_at: nowIso,
    };

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      let saved = false;
      try {
        const { data, error } = await supabase.from("reviews").insert({
          customer_name,
          rating,
          title,
          comment,
          role_or_college,
          is_verified,
        }).select();

        if (!error && data && data[0]) {
          newReview.id = data[0].id;
          saved = true;
        }
      } catch {
        // fallback
      }

      if (!saved) {
        const payload = JSON.stringify({
          customer_name,
          rating,
          title,
          comment,
          role_or_college,
          is_verified,
          created_at: nowIso,
        });

        const { data: fallbackData } = await supabase.from("components").insert({
          name: `${REVIEW_ROW_PREFIX} ${customer_name}`,
          description: `${REVIEW_DESC_PREFIX}${payload}`,
          price: 0,
          stock_quantity: 0,
        }).select();

        if (fallbackData && fallbackData[0]) {
          newReview.id = fallbackData[0].id;
        }
      }
    }

    const current = readLocalReviewsCache();
    writeLocalReviewsCache([newReview, ...current]);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("Error creating admin review:", err);
    return { success: false, error: err.message || "Failed to create review" };
  }
}
