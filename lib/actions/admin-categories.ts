"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return supabase;
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await checkAdmin();
  const categoryData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    parent_id: (formData.get("parent_id") as string) || null,
    image_url: formData.get("image_url") as string || null,
  };

  const { error } = await supabase.from("categories").update(categoryData).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await checkAdmin();
  
  // check children
  const { data: children } = await supabase.from("categories").select("id").eq("parent_id", id);
  if (children && children.length > 0) return { success: false, error: "Cannot delete category with subcategories" };
  
  // check products
  const { data: products } = await supabase.from("products").select("id").eq("category_id", id);
  if (products && products.length > 0) return { success: false, error: "Cannot delete category with products" };

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}
