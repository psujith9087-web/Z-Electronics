"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export interface PaymentConfig {
  upiId: string;
  payeeName: string;
  qrImageUrl: string;
  phone: string;
  note?: string;
}

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  upiId: "8072726924@upi",
  payeeName: "Z-Electronics (Sujith)",
  qrImageUrl: "",
  phone: "8072726924",
  note: "Scan to pay using Google Pay, PhonePe, Paytm, or any UPI app",
};

const CONFIG_FILE_PATH = path.join(process.cwd(), "public", "payment-config.json");

export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PAYMENT_CONFIG,
        ...parsed,
      };
    }
  } catch (err) {
    console.error("Error reading payment config file:", err);
  }
  return DEFAULT_PAYMENT_CONFIG;
}

export async function updatePaymentConfig(
  config: Partial<PaymentConfig>
): Promise<{ success: boolean; data?: PaymentConfig; error?: string }> {
  try {
    const current = await getPaymentConfig();
    const updated: PaymentConfig = {
      ...current,
      ...config,
      upiId: config.upiId?.trim() || current.upiId,
      payeeName: config.payeeName?.trim() || current.payeeName,
      qrImageUrl: config.qrImageUrl !== undefined ? config.qrImageUrl.trim() : current.qrImageUrl,
      phone: config.phone?.trim() || current.phone,
    };

    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(updated, null, 2), "utf8");

    revalidatePath("/admin");
    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update payment QR settings.";
    return { success: false, error: msg };
  }
}
