"use server";

import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { ComponentItem } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/lib/actions/admin-auth";

const COMPONENT_IMAGES_FILE = path.join(process.cwd(), "public", "component-images.json");

function getLocalImageMap(): Record<string, string> {
  try {
    if (fs.existsSync(COMPONENT_IMAGES_FILE)) {
      const raw = fs.readFileSync(COMPONENT_IMAGES_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading component-images.json:", e);
  }
  return {};
}

function saveLocalImageMap(id: string, imageUrl: string) {
  try {
    const map = getLocalImageMap();
    map[id] = imageUrl;
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(COMPONENT_IMAGES_FILE, JSON.stringify(map, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving component image to local map:", e);
  }
}

function deleteLocalImageMap(id: string) {
  try {
    const map = getLocalImageMap();
    delete map[id];
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(COMPONENT_IMAGES_FILE, JSON.stringify(map, null, 2), "utf8");
  } catch (e) {
    console.error("Error deleting component image from local map:", e);
  }
}

function encodeDescriptionWithImage(description: string, imageUrl?: string): string {
  const clean = description.replace(/__IMG__[\s\S]*?__IMG__/g, "").trim();
  if (!imageUrl || !imageUrl.trim()) return clean;
  return `${clean}\n\n__IMG__${imageUrl.trim()}__IMG__`.trim();
}

function decodeDescriptionAndImage(rawDescription: string | null | undefined): { description: string; imageUrl: string } {
  if (!rawDescription) return { description: "", imageUrl: "" };
  const match = rawDescription.match(/__IMG__([\s\S]*?)__IMG__/);
  const imageUrl = match ? match[1].trim() : "";
  const description = rawDescription.replace(/__IMG__[\s\S]*?__IMG__/g, "").trim();
  return { description, imageUrl };
}

/**
 * Fetch all components directly from the Supabase database.
 * Never falls back to mock presets so user deletions and additions are 100% real.
 */
export async function getComponents(): Promise<ComponentItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching components:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const localMap = getLocalImageMap();

    return data
      .filter((item: any) => {
        const desc = item.description || "";
        const name = item.name || "";
        return (
          !desc.includes("__DELETED__") &&
          !desc.includes("__PROJECT__") &&
          !desc.includes("__SITE_SETTINGS__") &&
          !desc.includes("__PAYMENT_CONFIG__") &&
          !desc.includes("__REVIEW__") &&
          !name.startsWith("[PROJECT]") &&
          !name.startsWith("[SITE_SETTINGS]") &&
          !name.startsWith("[REVIEW]")
        );
      })
      .map((item: any) => {
        const decoded = decodeDescriptionAndImage(item.description);
        const imageUrl = item.image_url || decoded.imageUrl || localMap[item.id] || "";
        return {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          stock_quantity: Number(item.stock_quantity),
          description: decoded.description,
          image_url: imageUrl,
          created_at: item.created_at,
        };
      }) as ComponentItem[];
  } catch (error) {
    console.error("Error fetching components from database:", error);
    return [];
  }
}

/**
 * Fetch a single component by ID from the Supabase database.
 */
export async function getComponentById(id: string): Promise<ComponentItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    const localMap = getLocalImageMap();
    const decoded = decodeDescriptionAndImage(data.description);
    const imageUrl = data.image_url || decoded.imageUrl || localMap[data.id] || "";

    return {
      id: data.id,
      name: data.name,
      price: Number(data.price),
      stock_quantity: Number(data.stock_quantity),
      description: decoded.description,
      image_url: imageUrl,
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Add a new component permanently into Supabase database.
 */
export async function createComponent(formData: FormData): Promise<{ success: boolean; data?: ComponentItem; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const name = (formData.get("name") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
    const image_url = ((formData.get("image_url") as string) || "").trim();

    if (!name || isNaN(price) || isNaN(stock_quantity)) {
      return { success: false, error: "Name, valid price, and stock quantity are required." };
    }

    const supabase = await createClient();
    const encodedDescription = encodeDescriptionWithImage(description, image_url);
    const payload: Record<string, any> = {
      name,
      description: encodedDescription,
      price,
      stock_quantity,
      image_url,
    };

    let { data, error } = await supabase
      .from("components")
      .insert([payload])
      .select()
      .single();

    // If table doesn't have image_url column yet, insert without it (stored inside encoded description)
    if (error && (error.message.includes("image_url") || error.code === "PGRST204")) {
      delete payload.image_url;
      const retry = await supabase
        .from("components")
        .insert([payload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to create component in database." };
    }

    if (image_url && data.id) {
      saveLocalImageMap(data.id, image_url);
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin");
    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        description,
        price: Number(data.price),
        stock_quantity: Number(data.stock_quantity),
        image_url,
        created_at: data.created_at,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create component";
    return { success: false, error: message };
  }
}

/**
 * Update an existing component in Supabase database.
 */
export async function updateComponent(
  id: string,
  formData: FormData
): Promise<{ success: boolean; data?: ComponentItem; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const name = (formData.get("name") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
    const image_url = ((formData.get("image_url") as string) || "").trim();

    if (!name || isNaN(price) || isNaN(stock_quantity)) {
      return { success: false, error: "Invalid data provided." };
    }

    const supabase = await createClient();
    const encodedDescription = encodeDescriptionWithImage(description, image_url);
    const payload: Record<string, any> = {
      name,
      description: encodedDescription,
      price,
      stock_quantity,
      image_url,
    };

    let { data, error } = await supabase
      .from("components")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    // If table doesn't have image_url column yet, update with encoded description
    if (error && (error.message.includes("image_url") || error.code === "PGRST204")) {
      delete payload.image_url;
      const retry = await supabase
        .from("components")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    if (image_url) {
      saveLocalImageMap(id, image_url);
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin");
    return {
      success: true,
      data: {
        id,
        name,
        description,
        price: Number(price),
        stock_quantity: Number(stock_quantity),
        image_url,
        created_at: data?.created_at || new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update component";
    return { success: false, error: message };
  }
}

/**
 * Permanently delete a component from Supabase database.
 * If referenced in past customer orders, archives it as __DELETED__ so order integrity is maintained.
 */
export async function deleteComponent(id: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const supabase = await createClient();

    // 1. Attempt direct delete from database
    const { error: directError } = await supabase.from("components").delete().eq("id", id);

    if (!directError) {
      deleteLocalImageMap(id);
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin");
      return { success: true };
    }

    // 2. If it violates foreign key constraint (referenced in past order_items)
    if (
      directError.code === "23503" ||
      directError.message.includes("violates foreign key constraint") ||
      directError.message.includes("order_items")
    ) {
      // Archive it cleanly as __DELETED__ with 0 stock
      const { error: archiveError } = await supabase
        .from("components")
        .update({
          description: "__DELETED__",
          stock_quantity: 0,
        })
        .eq("id", id);

      if (archiveError) {
        return { success: false, error: archiveError.message };
      }

      deleteLocalImageMap(id);
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin");
      return { success: true };
    }

    return { success: false, error: directError.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete component";
    return { success: false, error: message };
  }
}

/**
 * Delete all standard inventory components from Supabase database (admin reset).
 */
export async function deleteAllComponents(): Promise<{ success: boolean; count?: number; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const supabase = await createClient();
    const { data: allComps, error: fetchError } = await supabase
      .from("components")
      .select("id, description, name");

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    let deletedCount = 0;
    for (const comp of allComps || []) {
      const name = comp.name || "";
      const desc = comp.description || "";
      // Don't delete projects or site settings
      if (
        name.startsWith("[PROJECT]") ||
        name.startsWith("[SITE_SETTINGS]") ||
        desc.includes("__PROJECT__") ||
        desc.includes("__SITE_SETTINGS__")
      ) {
        continue;
      }

      await deleteComponent(comp.id);
      deletedCount++;
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin");
    return { success: true, count: deletedCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete all components";
    return { success: false, error: message };
  }
}
