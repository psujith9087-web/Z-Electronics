"use server";

import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/lib/actions/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { PaymentConfig } from "@/lib/types";

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
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      // If table is not queried or empty, return in-memory / env fallback
      return inMemoryPaymentConfig;
    }

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
      const { error } = await supabase
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

      if (error) {
        console.warn("Supabase payment_settings upsert warning:", error.message);
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
