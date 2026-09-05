"use server";

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) return [];
  return data as Category[];
}

export async function getCategoryTree(): Promise<Category[]> {
  const categories = await getCategories();
  
  // Build tree
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id);
    if (node) {
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    }
  });

  return rootCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Category;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Category;
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parent_id = formData.get("parent_id") as string | null;
  let image_url = formData.get("image_url") as string | null;

  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("category-images")
      .upload(fileName, imageFile);
      
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(fileName);
      image_url = publicUrl;
    }
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      parent_id: parent_id || null,
      image_url,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { data };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parent_id = formData.get("parent_id") as string | null;
  let image_url = formData.get("image_url") as string | null;

  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("category-images")
      .upload(fileName, imageFile);
      
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(fileName);
      image_url = publicUrl;
    }
  }

  const updateData: any = {
    name,
    slug,
    parent_id: parent_id || null,
  };

  if (image_url !== null) {
    updateData.image_url = image_url;
  }

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}
