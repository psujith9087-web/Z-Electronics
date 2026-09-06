"use server";

import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_COMPONENTS } from "@/lib/mock-data";
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

export async function getComponents(): Promise<ComponentItem[]> {
  try {
    if (!isSupabaseConfigured()) {
      return MOCK_COMPONENTS;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_COMPONENTS;
    }

    const localMap = getLocalImageMap();

    return data
      .filter((item: any) => {
        const desc = item.description || "";
        const name = item.name || "";
        return (
          !desc.includes("__DELETED__") &&
          !desc.includes("__PROJECT__") &&
          !name.startsWith("[PROJECT]")
        );
      })
      .map((item: any) => {
        const decoded = decodeDescriptionAndImage(item.description);
        const imageUrl = item.image_url || decoded.imageUrl || localMap[item.id] || "";
        return {
          ...item,
          description: decoded.description,
          image_url: imageUrl,
        };
      }) as ComponentItem[];
  } catch (error) {
    console.error("Error fetching components:", error);
    return MOCK_COMPONENTS;
  }
}

export async function createComponent(formData: FormData): Promise<{ success: boolean; data?: ComponentItem; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
    const image_url = ((formData.get("image_url") as string) || "").trim();

    if (!name || isNaN(price) || isNaN(stock_quantity)) {
      return { success: false, error: "Name, valid price, and stock quantity are required." };
    }

    if (!isSupabaseConfigured()) {
      const newMock: ComponentItem = {
        id: `comp-${Date.now()}`,
        name,
        description,
        price,
        stock_quantity,
        image_url,
        created_at: new Date().toISOString(),
      };
      MOCK_COMPONENTS.unshift(newMock);
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true, data: newMock };
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

    // If table doesn't have image_url column yet, insert with encoded description
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
      return { success: false, error: error?.message || "Failed to create component" };
    }

    if (image_url && data.id) {
      saveLocalImageMap(data.id, image_url);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return {
      success: true,
      data: {
        ...data,
        description,
        image_url,
      } as ComponentItem,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create component";
    return { success: false, error: message };
  }
}

export async function updateComponent(
  id: string,
  formData: FormData
): Promise<{ success: boolean; data?: ComponentItem; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
    const image_url = ((formData.get("image_url") as string) || "").trim();

    if (!name || isNaN(price) || isNaN(stock_quantity)) {
      return { success: false, error: "Invalid data provided." };
    }

    if (!isSupabaseConfigured()) {
      const index = MOCK_COMPONENTS.findIndex((c) => c.id === id);
      if (index !== -1) {
        MOCK_COMPONENTS[index] = {
          ...MOCK_COMPONENTS[index],
          name,
          description,
          price,
          stock_quantity,
          image_url,
        };
      }
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true };
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
    revalidatePath("/admin");
    return {
      success: true,
      data: {
        ...(data || {}),
        description,
        image_url,
      } as ComponentItem,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update component";
    return { success: false, error: message };
  }
}

export async function deleteComponent(id: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    if (!isSupabaseConfigured()) {
      const idx = MOCK_COMPONENTS.findIndex((c) => c.id === id);
      if (idx !== -1) {
        MOCK_COMPONENTS.splice(idx, 1);
      }
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true };
    }

    const supabase = await createClient();

    // 1. First attempt a standard direct delete
    const { error: directError } = await supabase.from("components").delete().eq("id", id);

    if (!directError) {
      deleteLocalImageMap(id);
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true };
    }

    // 2. If it violates foreign key constraint (code 23503 because component is referenced in past customer orders)
    if (
      directError.code === "23503" ||
      directError.message.includes("violates foreign key constraint") ||
      directError.message.includes("order_items")
    ) {
      // Safely archive/soft-delete it by marking it as __DELETED__
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
      revalidatePath("/admin");
      return { success: true };
    }

    return { success: false, error: directError.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete component";
    return { success: false, error: message };
  }
}
