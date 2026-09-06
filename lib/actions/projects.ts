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

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "c043b3f2-39e4-45f2-b3ca-d2fb894127c5",
    title: "Autonomous Quad-Wheel Obstacle Avoidance Rover",
    category: "Robotics & IoT",
    description:
      "Custom engineered 4WD robotics chassis powered by ESP32 microcontrollers, HC-SR04 ultrasonic arrays, and dual L298N high-power motor drivers. Built for collegiate robotics competition with real-time Bluetooth telemetry.",
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
    date: "August 2026",
    clientOrInstitution: "Engineering TechFest Robotics Team",
    featured: true,
    createdAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "00f9492b-2e4b-41f2-a311-fc19f2dd9ac4",
    title: "50-Node Industrial RS-485 Sensor Telemetry Order",
    category: "Completed Order",
    description:
      "Full turnkey component sourcing and batch verification of 50 industrial telemetry units featuring STM32 microcontrollers, optocoupled relays, and precision temperature/humidity sensing modules delivered with zero defect rate.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    date: "July 2026",
    clientOrInstitution: "Precision Agro-Tech Solutions",
    featured: true,
    createdAt: "2026-07-20T10:00:00.000Z",
  },
  {
    id: "81270bf3-a520-4356-992a-33720ceb6290",
    title: "Custom Drone PDB & High-Amperage ESC Power Harness",
    category: "Custom Circuit",
    description:
      "High-current Power Distribution Board (PDB) designed for carbon-fiber multi-rotor drones, delivering stable 5V/12V dual BEC rails and 60A surge capacity across 4 brushless ESC channels.",
    imageUrl:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80",
    date: "June 2026",
    clientOrInstitution: "Aeronautics Research Project",
    featured: true,
    createdAt: "2026-06-10T10:00:00.000Z",
  },
  {
    id: "893736ea-bf2d-43c4-a423-7c57e98f4aa5",
    title: "Z-Electronics 1000+ Hardware Orders Milestone",
    category: "Milestone",
    description:
      "Proud achievement celebrating over 1,000 verified electronics components and development kits supplied directly to aspiring student engineers, hobbyists, and lab makers across the region.",
    imageUrl:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1000&q=80",
    date: "May 2026",
    clientOrInstitution: "Z-Electronics Foundation",
    featured: false,
    createdAt: "2026-05-01T10:00:00.000Z",
  },
];

function readLocalProjects(): ProjectItem[] {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const raw = fs.readFileSync(PROJECTS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading local projects file:", err);
  }
  return INITIAL_PROJECTS;
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
 * Falls back to local cache if database is unreachable.
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

    if (data && data.length > 0) {
      const projects: ProjectItem[] = [];
      for (const row of data) {
        const parsed = parseProjectRow(row);
        if (parsed) projects.push(parsed);
      }

      // Sync local cache with database
      if (projects.length > 0) {
        writeLocalProjects(projects);
      }

      // Sort featured projects to the top, then newest first
      return projects.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // If database returned 0 projects, seed initial projects into Supabase
    return await seedInitialProjectsToDatabase();
  } catch (err) {
    console.error("Unexpected error in getProjects:", err);
    return readLocalProjects();
  }
}

async function seedInitialProjectsToDatabase(): Promise<ProjectItem[]> {
  try {
    const supabase = await createClient();
    const seeded: ProjectItem[] = [];

    for (const p of INITIAL_PROJECTS) {
      const payload = JSON.stringify({
        title: p.title,
        description: p.description,
        category: p.category,
        imageUrl: p.imageUrl,
        date: p.date,
        clientOrInstitution: p.clientOrInstitution,
        featured: p.featured,
      });

      const { data, error } = await supabase
        .from("components")
        .insert({
          name: `[PROJECT] ${p.title}`,
          description: `__PROJECT__${payload}`,
          price: 0,
          stock_quantity: 0,
        })
        .select();

      if (!error && data && data[0]) {
        seeded.push({
          ...p,
          id: data[0].id,
          createdAt: data[0].created_at,
        });
      }
    }

    if (seeded.length > 0) {
      writeLocalProjects(seeded);
      return seeded;
    }
  } catch (err) {
    console.error("Error seeding initial projects:", err);
  }
  return INITIAL_PROJECTS;
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
  input: Partial<Omit<ProjectItem, "id" | "createdAt">>
): Promise<{ success: boolean; data?: ProjectItem; error?: string }> {
  try {
    const supabase = await createClient();

    // Fetch existing row to merge
    const { data: existingRow, error: fetchErr } = await supabase
      .from("components")
      .select("*")
      .eq("id", id)
      .single();

    let existingParsed: Partial<ProjectItem> = {};
    if (!fetchErr && existingRow) {
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
      .eq("id", id)
      .select();

    if (updateErr || !updatedData || !updatedData[0]) {
      throw new Error(updateErr?.message || "Database update failed");
    }

    const updatedProject: ProjectItem = {
      id,
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
    const updatedList = current.map((p) => (p.id === id ? updatedProject : p));
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
 * Delete project from Supabase database.
 */
export async function deleteProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("components").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    // Update local cache
    const current = readLocalProjects();
    const filtered = current.filter((p) => p.id !== id);
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
