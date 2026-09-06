"use server";

import crypto from "crypto";
import Razorpay from "razorpay";
import { getPaymentConfig } from "@/lib/actions/payment";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";

/**
 * Creates a Razorpay Order on the backend.
 * Amount is passed in standard INR (e.g. 549) and converted to paise (54900).
 */
export async function createRazorpayOrder(
  amount: number,
  receiptId: string
): Promise<{
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
  isNotConfigured?: boolean;
}> {
  try {
    const config = await getPaymentConfig();
    const keyId = config.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = config.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        success: false,
        error: "Razorpay API keys are not configured. Please add them in the Admin Portal or .env.local",
        isNotConfigured: true,
      };
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // in paise
      currency: "INR",
      receipt: `rcpt_${receiptId.slice(0, 30)}`,
      payment_capture: 1,
    };

    const razorpayOrder = await instance.orders.create(options);

    return {
      success: true,
      orderId: razorpayOrder.id,
      amount: Number(razorpayOrder.amount),
      currency: razorpayOrder.currency,
      keyId: keyId,
    };
  } catch (err: unknown) {
    console.error("Razorpay order creation error:", err);
    const msg = err instanceof Error ? err.message : "Failed to initialize Razorpay payment";
    return { success: false, error: msg };
  }
}

/**
 * Cryptographically verifies the Razorpay payment signature using HMAC SHA256.
 * Once verified, updates the order status in Supabase database to 'Completed' / 'paid'.
 */
export async function verifyRazorpayPayment(data: {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { success: false, error: "Missing required payment verification parameters." };
    }

    const config = await getPaymentConfig();
    const keySecret = config.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return { success: false, error: "Razorpay secret key not found for verification." };
    }

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return { success: false, error: "Payment signature verification failed! Transaction not authentic." };
    }

    // Update order status in database
    if (!isSupabaseConfigured()) {
      const mockOrder = MOCK_ORDERS.find((o) => o.id === orderId);
      if (mockOrder) {
        mockOrder.status = "Completed";
        mockOrder.payment_status = "paid";
        mockOrder.payment_id = razorpay_payment_id;
        mockOrder.payment_method = "razorpay";
      }
    } else {
      const supabase = await createClient();
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "Completed",
          payment_status: "paid",
          payment_id: razorpay_payment_id,
          payment_method: "razorpay",
        })
        .eq("id", orderId);

      if (updateError) {
        if (
          updateError.message?.includes("schema cache") ||
          updateError.message?.includes("column")
        ) {
          const { error: fallbackErr } = await supabase
            .from("orders")
            .update({ status: "Completed" })
            .eq("id", orderId);
          if (fallbackErr) {
            console.error("Failed fallback order status update in database:", fallbackErr);
            return { success: false, error: fallbackErr.message };
          }
        } else {
          console.error("Failed to update order payment status in database:", updateError);
          return { success: false, error: updateError.message };
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/checkout");

    return { success: true };
  } catch (err: unknown) {
    console.error("Razorpay verification error:", err);
    const msg = err instanceof Error ? err.message : "Error verifying payment signature";
    return { success: false, error: msg };
  }
}
