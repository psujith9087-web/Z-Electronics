"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProjectCategory =
  | "Completed Order"
  | "Robotics & IoT"
  | "Custom Circuit"
  | "Milestone"
  | "Student Project"
  | "Other";

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  imageUrl: string;
  date?: string;
  clientOrInstitution?: string;
  featured?: boolean;
  createdAt: string;
}

const PROJECTS_FILE = path.join(process.cwd(), "public", "projects-legacy.json");

function readLocalProjects(): ProjectItem[] {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const raw = fs.readFileSync(PROJECTS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading local projects file:", err);
  }
  return [];
}

function writeLocalProjects(projects: ProjectItem[]): void {
  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing local projects cache:", err);
  }
}

function parseProjectRow(row: any): ProjectItem | null {
  try {
    const desc = row.description || "";
    if (!desc.startsWith("__PROJECT__")) return null;

    const jsonStr = desc.substring("__PROJECT__".length);
    const parsed = JSON.parse(jsonStr);

    return {
      id: row.id,
      title: parsed.title || row.name?.replace("[PROJECT] ", "") || "Untitled Project",
      description: parsed.description || "",
      category: parsed.category || "Completed Order",
      imageUrl: parsed.imageUrl || "",
      date: parsed.date || "",
      clientOrInstitution: parsed.clientOrInstitution || "",
      featured: Boolean(parsed.featured),
      createdAt: row.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Error parsing project row:", row.id, err);
    return null;
  }
}

/**
 * Fetch all projects from Supabase database.
 * If empty in database, returns [] (never recreates deleted items).
 */
export async function getProjects(): Promise<ProjectItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .ilike("description", "__PROJECT__%")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching projects:", error.message);
      return readLocalProjects();
    }

    if (data && Array.isArray(data)) {
      const projects: ProjectItem[] = [];
      for (const row of data) {
        const parsed = parseProjectRow(row);
        if (parsed) projects.push(parsed);
      }

      // Sync local cache with current database state
      writeLocalProjects(projects);

      // Sort featured projects to the top, then newest first
      return projects.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return readLocalProjects();
  } catch (err) {
    console.error("Unexpected error in getProjects:", err);
    return readLocalProjects();
  }
}

/**
 * Add a new project photograph and details permanently into Supabase database.
 */
export async function createProject(
  input: Omit<ProjectItem, "id" | "createdAt">
): Promise<{ success: boolean; data?: ProjectItem; error?: string }> {
  try {
    if (!input.title?.trim()) {
      return { success: false, error: "Project title is required." };
    }
    if (!input.imageUrl?.trim()) {
      return { success: false, error: "Project photograph is required." };
    }

    const title = input.title.trim();
    const payload = JSON.stringify({
      title,
      description: input.description?.trim() || "",
      category: input.category || "Completed Order",
      imageUrl: input.imageUrl.trim(),
      date: input.date?.trim() || "",
      clientOrInstitution: input.clientOrInstitution?.trim() || "",
      featured: Boolean(input.featured),
    });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .insert({
        name: `[PROJECT] ${title}`,
        description: `__PROJECT__${payload}`,
        price: 0,
        stock_quantity: 0,
      })
      .select();

    if (error || !data || !data[0]) {
      throw new Error(error?.message || "Database insert failed");
    }

    const newProject: ProjectItem = {
      id: data[0].id,
      title,
      description: input.description?.trim() || "",
      category: input.category || "Completed Order",
      imageUrl: input.imageUrl.trim(),
      date: input.date?.trim() || "",
      clientOrInstitution: input.clientOrInstitution?.trim() || "",
      featured: Boolean(input.featured),
      createdAt: data[0].created_at,
    };

    // Update local cache
    const current = readLocalProjects();
    writeLocalProjects([newProject, ...current]);

    revalidatePath("/");
    revalidatePath("/legacy");
    revalidatePath("/admin");

    return { success: true, data: newProject };
  } catch (err) {
    console.error("Error creating project in database:", err);
    const message = err instanceof Error ? err.message : "Failed to create project in database.";
    return { success: false, error: message };
  }
}

/**
 * Update project details and photograph in Supabase database.
 */
export async function updateProject(
  id: string,
  input: Partial<Omit<ProjectItem, "id" | "createdAt">> & { oldTitle?: string }
): Promise<{ success: boolean; data?: ProjectItem; error?: string }> {
  try {
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let targetId = id;

    if (!isUuid) {
      // Find row by old title or current title
      const titleToFind = input.oldTitle || input.title;
      const { data } = await supabase
        .from("components")
        .select("id, name, description")
        .ilike("description", "__PROJECT__%");

      if (data && data.length > 0) {
        const found = data.find(
          (r) =>
            (titleToFind && r.name.toLowerCase().includes(titleToFind.toLowerCase())) ||
            r.description.includes(id)
        );
        if (found) targetId = found.id;
      }
    }

    // Fetch existing row to merge
    const { data: existingRow } = await supabase
      .from("components")
      .select("*")
      .eq("id", targetId)
      .single();

    let existingParsed: Partial<ProjectItem> = {};
    if (existingRow) {
      const parsed = parseProjectRow(existingRow);
      if (parsed) existingParsed = parsed;
    }

    const updatedTitle =
      input.title !== undefined ? input.title.trim() : existingParsed.title || "Project";
    const updatedDescription =
      input.description !== undefined ? input.description.trim() : existingParsed.description || "";
    const updatedCategory = input.category !== undefined ? input.category : existingParsed.category || "Completed Order";
    const updatedImageUrl =
      input.imageUrl !== undefined ? input.imageUrl.trim() : existingParsed.imageUrl || "";
    const updatedDate = input.date !== undefined ? input.date.trim() : existingParsed.date || "";
    const updatedClient =
      input.clientOrInstitution !== undefined
        ? input.clientOrInstitution.trim()
        : existingParsed.clientOrInstitution || "";
    const updatedFeatured =
      input.featured !== undefined ? Boolean(input.featured) : Boolean(existingParsed.featured);

    const payload = JSON.stringify({
      title: updatedTitle,
      description: updatedDescription,
      category: updatedCategory,
      imageUrl: updatedImageUrl,
      date: updatedDate,
      clientOrInstitution: updatedClient,
      featured: updatedFeatured,
    });

    const { data: updatedData, error: updateErr } = await supabase
      .from("components")
      .update({
        name: `[PROJECT] ${updatedTitle}`,
        description: `__PROJECT__${payload}`,
        price: 0,
        stock_quantity: 0,
      })
      .eq("id", targetId)
      .select();

    if (updateErr || !updatedData || !updatedData[0]) {
      throw new Error(updateErr?.message || "Database update failed");
    }

    const updatedProject: ProjectItem = {
      id: targetId,
      title: updatedTitle,
      description: updatedDescription,
      category: updatedCategory,
      imageUrl: updatedImageUrl,
      date: updatedDate,
      clientOrInstitution: updatedClient,
      featured: updatedFeatured,
      createdAt: updatedData[0].created_at,
    };

    // Update local cache
    const current = readLocalProjects();
    const updatedList = current.map((p) => (p.id === id || p.id === targetId ? updatedProject : p));
    writeLocalProjects(updatedList);

    revalidatePath("/");
    revalidatePath("/legacy");
    revalidatePath("/admin");

    return { success: true, data: updatedProject };
  } catch (err) {
    console.error("Error updating project in database:", err);
    const message = err instanceof Error ? err.message : "Failed to update project in database.";
    return { success: false, error: message };
  }
}

/**
 * Delete project from Supabase database safely with UUID and legacy ID fallbacks.
 */
export async function deleteProject(
  id: string,
  title?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      const { error } = await supabase.from("components").delete().eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      // If legacy ID like "proj-1", "proj-2", match by title or description
      if (title?.trim()) {
        await supabase
          .from("components")
          .delete()
          .ilike("name", `%${title.trim()}%`);
      }
      if (id === "proj-1") {
        await supabase.from("components").delete().ilike("name", "%Autonomous Quad-Wheel%");
      } else if (id === "proj-2") {
        await supabase.from("components").delete().ilike("name", "%50-Node Industrial%");
      } else if (id === "proj-3") {
        await supabase.from("components").delete().ilike("name", "%Custom Drone PDB%");
      } else if (id === "proj-4") {
        await supabase.from("components").delete().ilike("name", "%1000+ Hardware Orders%");
      }
    }

    // Update local cache
    const current = readLocalProjects();
    const filtered = current.filter(
      (p) => p.id !== id && (!title || !p.title.toLowerCase().includes(title.toLowerCase()))
    );
    writeLocalProjects(filtered);

    revalidatePath("/");
    revalidatePath("/legacy");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("Error deleting project from database:", err);
    const message = err instanceof Error ? err.message : "Failed to delete project from database.";
    return { success: false, error: message };
  }
}

/**
 * Delete ALL projects from database to start fresh.
 */
export async function clearAllProjects(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("components")
      .delete()
      .ilike("description", "__PROJECT__%");

    if (error) throw new Error(error.message);

    writeLocalProjects([]);

    revalidatePath("/");
    revalidatePath("/legacy");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("Error clearing all projects from database:", err);
    const message = err instanceof Error ? err.message : "Failed to clear all projects.";
    return { success: false, error: message };
  }
}
