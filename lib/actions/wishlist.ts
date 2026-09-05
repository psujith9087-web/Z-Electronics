"use server";

import { createClient } from "@/lib/supabase/server";
import type { WishlistItem } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getWishlist(): Promise<WishlistItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlist")
    .select("*, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as WishlistItem[];
}

export async function addToWishlist(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to add to wishlist." };

  const { error } = await supabase
    .from("wishlist")
    .insert({
      user_id: user.id,
      product_id: productId,
    });

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { success: true }; // Already in wishlist
    }
    return { error: error.message };
  }

  revalidatePath("/wishlist");
  return { success: true };
}

export async function removeFromWishlist(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to remove from wishlist." };

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) return { error: error.message };

  revalidatePath("/wishlist");
  return { success: true };
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (error || !data) return false;
  return true;
}

export async function checkWishlistStatus(productId: string): Promise<boolean> {
  return isInWishlist(productId);
}

export async function toggleWishlist(productId: string) {
  const inWishlist = await isInWishlist(productId);
  if (inWishlist) {
    const res = await removeFromWishlist(productId);
    if (res.error) return { success: false, added: true, error: res.error };
    return { success: true, added: false };
  } else {
    const res = await addToWishlist(productId);
    if (res.error) return { success: false, added: false, error: res.error };
    return { success: true, added: true };
  }
}
