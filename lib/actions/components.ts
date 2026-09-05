"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_COMPONENTS } from "@/lib/mock-data";
import { ComponentItem } from "@/lib/types";
import { revalidatePath } from "next/cache";

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

    return data as ComponentItem[];
  } catch (error) {
    console.error("Error fetching components:", error);
    return MOCK_COMPONENTS;
  }
}

export async function createComponent(formData: FormData): Promise<{ success: boolean; data?: ComponentItem; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);

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
        created_at: new Date().toISOString(),
      };
      MOCK_COMPONENTS.unshift(newMock);
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true, data: newMock };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .insert([
        {
          name,
          description,
          price,
          stock_quantity,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: data as ComponentItem };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create component";
    return { success: false, error: message };
  }
}

export async function updateComponent(
  id: string,
  formData: FormData
): Promise<{ success: boolean; data?: ComponentItem; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);

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
        };
      }
      revalidatePath("/");
      revalidatePath("/admin");
      return { success: true };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .update({
        name,
        description,
        price,
        stock_quantity,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: data as ComponentItem };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update component";
    return { success: false, error: message };
  }
}

export async function deleteComponent(id: string): Promise<{ success: boolean; error?: string }> {
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
    const { error } = await supabase.from("components").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete component";
    return { success: false, error: message };
  }
}
