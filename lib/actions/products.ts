"use server";

import { createClient } from "@/lib/supabase/server";
import type { Product, ProductFilters, PaginatedResult } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getUserProfile } from "./auth";

export async function getProducts(
  filters?: ProductFilters
): Promise<PaginatedResult<Product>> {
  const supabase = await createClient();

  let query = supabase.from("products").select("*, categories(*)", { count: "exact" });

  // Only return active products for non-admin queries
  const profile = await getUserProfile();
  if (profile?.role !== "admin") {
    query = query.eq("is_active", true);
  }

  // Filters
  if (filters?.category_slug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category_slug)
      .single();

    if (category) {
      query = query.eq("category_id", category.id);
    } else {
      // If category not found, return empty results
      return { data: [], total: 0, page: 1, per_page: 24, total_pages: 0 };
    }
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.min_price !== undefined) {
    query = query.gte("price", filters.min_price);
  }

  if (filters?.max_price !== undefined) {
    query = query.lte("price", filters.max_price);
  }

  if (filters?.in_stock) {
    query = query.gt("stock_quantity", 0);
  }

  // Sorting
  switch (filters?.sort) {
    case "featured":
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "name-desc":
      query = query.order("name", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  const page = filters?.page || 1;
  const per_page = filters?.per_page || 24;
  const start = (page - 1) * per_page;
  const end = start + per_page - 1;

  query = query.range(start, end);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { data: [], total: 0, page, per_page, total_pages: 0 };
  }

  const total = count || 0;
  const total_pages = Math.ceil(total / per_page);

  return {
    data: data as Product[],
    total,
    page,
    per_page,
    total_pages,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as Product[];
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit: number = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeProductId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as Product[];
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as Product[];
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const price = parseFloat(formData.get("price") as string);
  const compare_at_price = formData.get("compare_at_price") ? parseFloat(formData.get("compare_at_price") as string) : null;
  const sku = formData.get("sku") as string;
  const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
  const is_featured = formData.get("is_featured") === "true";
  const is_active = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  
  const imagesJson = formData.get("images") as string;
  let images: string[] = [];
  try {
    if (imagesJson) {
      images = JSON.parse(imagesJson);
    }
  } catch (e) {
    // Ignore parse error
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description,
      category_id,
      price,
      compare_at_price,
      sku,
      stock_quantity,
      is_featured,
      is_active,
      images,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { data };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const price = parseFloat(formData.get("price") as string);
  const compare_at_price = formData.get("compare_at_price") ? parseFloat(formData.get("compare_at_price") as string) : null;
  const sku = formData.get("sku") as string;
  const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
  const is_featured = formData.get("is_featured") === "true";
  const is_active = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  
  const imagesJson = formData.get("images") as string;
  let images: string[] | undefined = undefined;
  try {
    if (imagesJson) {
      images = JSON.parse(imagesJson);
    }
  } catch (e) {
    // Ignore
  }

  const updateData: any = {
    name,
    slug,
    description,
    category_id,
    price,
    compare_at_price,
    sku,
    stock_quantity,
    is_featured,
    is_active,
    updated_at: new Date().toISOString(),
  };

  if (images !== undefined) {
    updateData.images = images;
  }

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function uploadProductImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  
  if (!file) return { error: "No file provided" };
  
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);
    
  if (error) return { error: error.message };
  
  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);
    
  return { url: publicUrl };
}

export async function searchProducts(query: string, limit: number = 10): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_active", true)
    .ilike("name", `%${query}%`)
    .limit(limit);

  if (error) return [];
  return data as Product[];
}
