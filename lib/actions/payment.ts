"use server";

import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/lib/actions/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { PaymentConfig } from "@/lib/types";

const PAYMENT_SETTINGS_ROW_NAME = "[SITE_SETTINGS] payment_config";
const PAYMENT_SETTINGS_PREFIX = "__PAYMENT_CONFIG__";

let inMemoryPaymentConfig: PaymentConfig = {
  upiId: process.env.NEXT_PUBLIC_DEFAULT_UPI_ID || "psujith9087-1@okicici",
  payeeName: process.env.NEXT_PUBLIC_SHOP_NAME || "Z-Electronics (Sujith)",
  qrImageUrl: "",
  phone: process.env.NEXT_PUBLIC_SHOP_PHONE || "8072726924",
  note: "Scan to pay using Google Pay, PhonePe, Paytm, or any UPI app",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayEnabled: true,
  codEnabled: true,
};

export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    if (!isSupabaseConfigured()) {
      return inMemoryPaymentConfig;
    }

    const supabase = await createClient();

    // 1. Try dedicated payment_settings table first
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (!error && data) {
        const dbConfig: PaymentConfig = {
          upiId: data.upi_id || inMemoryPaymentConfig.upiId,
          payeeName: data.payee_name || inMemoryPaymentConfig.payeeName,
          qrImageUrl: data.qr_image_url || inMemoryPaymentConfig.qrImageUrl,
          phone: data.phone || inMemoryPaymentConfig.phone,
          note: data.note || inMemoryPaymentConfig.note,
          razorpayKeyId: data.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || inMemoryPaymentConfig.razorpayKeyId,
          razorpayKeySecret: data.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || inMemoryPaymentConfig.razorpayKeySecret,
          razorpayEnabled: data.razorpay_enabled !== undefined ? data.razorpay_enabled : true,
          codEnabled: data.cod_enabled !== undefined ? data.cod_enabled : true,
        };

        inMemoryPaymentConfig = dbConfig;
        return dbConfig;
      }
    } catch {
      // payment_settings table not created, check components table fallback
    }

    // 2. Guaranteed fallback: check settings row in components table
    const { data: row } = await supabase
      .from("components")
      .select("id, description")
      .eq("name", PAYMENT_SETTINGS_ROW_NAME)
      .maybeSingle();

    if (row && row.description && row.description.startsWith(PAYMENT_SETTINGS_PREFIX)) {
      const jsonStr = row.description.substring(PAYMENT_SETTINGS_PREFIX.length);
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === "object") {
        inMemoryPaymentConfig = {
          ...inMemoryPaymentConfig,
          ...parsed,
        };
        return inMemoryPaymentConfig;
      }
    }

    return inMemoryPaymentConfig;
  } catch (err) {
    console.warn("Could not load payment settings from database, using cached config:", err);
    return inMemoryPaymentConfig;
  }
}

export async function updatePaymentConfig(
  config: Partial<PaymentConfig>
): Promise<{ success: boolean; data?: PaymentConfig; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const current = await getPaymentConfig();
    const updated: PaymentConfig = {
      ...current,
      ...config,
      upiId: config.upiId !== undefined ? config.upiId.trim() : current.upiId,
      payeeName: config.payeeName !== undefined ? config.payeeName.trim() : current.payeeName,
      qrImageUrl: config.qrImageUrl !== undefined ? config.qrImageUrl.trim() : current.qrImageUrl,
      phone: config.phone !== undefined ? config.phone.trim() : current.phone,
      note: config.note !== undefined ? config.note.trim() : current.note,
      razorpayKeyId: config.razorpayKeyId !== undefined ? config.razorpayKeyId.trim() : current.razorpayKeyId,
      razorpayKeySecret: config.razorpayKeySecret !== undefined ? config.razorpayKeySecret.trim() : current.razorpayKeySecret,
      razorpayEnabled: config.razorpayEnabled !== undefined ? config.razorpayEnabled : current.razorpayEnabled,
      codEnabled: config.codEnabled !== undefined ? config.codEnabled : current.codEnabled,
    };

    // Update in-memory cache
    inMemoryPaymentConfig = updated;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      // 1. Try upserting to payment_settings table
      try {
        await supabase
          .from("payment_settings")
          .upsert(
            {
              id: "default",
              upi_id: updated.upiId,
              payee_name: updated.payeeName,
              phone: updated.phone,
              note: updated.note,
              qr_image_url: updated.qrImageUrl,
              razorpay_key_id: updated.razorpayKeyId,
              razorpay_key_secret: updated.razorpayKeySecret,
              razorpay_enabled: updated.razorpayEnabled,
              cod_enabled: updated.codEnabled,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
      } catch {
        // Silently continue to guarantee persistence in existing components table
      }

      // 2. Always persist in components table (guaranteed present in database)
      const { data: existing } = await supabase
        .from("components")
        .select("id")
        .eq("name", PAYMENT_SETTINGS_ROW_NAME)
        .maybeSingle();

      const encodedDescription = `${PAYMENT_SETTINGS_PREFIX}${JSON.stringify(updated)}`;

      if (existing && existing.id) {
        await supabase
          .from("components")
          .update({ description: encodedDescription })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("components")
          .insert({
            name: PAYMENT_SETTINGS_ROW_NAME,
            description: encodedDescription,
            price: 0,
            stock_quantity: 0,
          });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update payment settings.";
    return { success: false, error: msg };
  }
}
