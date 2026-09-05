"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus, Product, Category } from "@/lib/types";

// Helper to check admin
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return supabase;
}

export async function createProduct(formData: FormData) {
  const supabase = await checkAdmin();
  
  const productData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    category_id: (formData.get("category_id") as string) || null,
    price: Number(formData.get("price")),
    compare_at_price: formData.get("compare_at_price") ? Number(formData.get("compare_at_price")) : null,
    sku: formData.get("sku") as string,
    stock_quantity: Number(formData.get("stock_quantity")),
    is_featured: formData.get("is_featured") === "true",
    is_active: formData.get("is_active") === "true",
    images: JSON.parse((formData.get("images") as string) || "[]"),
  };

  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true, product: data };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await checkAdmin();
  
  const productData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    category_id: (formData.get("category_id") as string) || null,
    price: Number(formData.get("price")),
    compare_at_price: formData.get("compare_at_price") ? Number(formData.get("compare_at_price")) : null,
    sku: formData.get("sku") as string,
    stock_quantity: Number(formData.get("stock_quantity")),
    is_featured: formData.get("is_featured") === "true",
    is_active: formData.get("is_active") === "true",
    images: JSON.parse((formData.get("images") as string) || "[]"),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id);

  if (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${productData.slug}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function createCategory(formData: FormData) {
  const supabase = await checkAdmin();
  
  const categoryData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    parent_id: (formData.get("parent_id") as string) || null,
    image_url: formData.get("image_url") as string || null,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true, category: data };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating order:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function uploadProductImage(formData: FormData) {
  const supabase = await checkAdmin();
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    return { success: false, error: error.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return { success: true, url: publicUrl };
}
