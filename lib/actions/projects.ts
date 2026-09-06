"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

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
    id: "proj-1",
    title: "Autonomous Quad-Wheel Obstacle Avoidance Rover",
    category: "Robotics & IoT",
    description:
      "Custom engineered 4WD robotics chassis powered by ESP32 microcontrollers, HC-SR04 ultrasonic arrays, and dual L298N high-power motor drivers. Built for collegiate robotics competition with real-time Bluetooth telemetry.",
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
    date: "August 2026",
    clientOrInstitution: "Engineering TechFest Robotics Team",
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-2",
    title: "50-Node Industrial RS-485 Sensor Telemetry Order",
    category: "Completed Order",
    description:
      "Full turnkey component sourcing and batch verification of 50 industrial telemetry units featuring STM32 microcontrollers, optocoupled relays, and precision temperature/humidity sensing modules delivered with zero defect rate.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    date: "July 2026",
    clientOrInstitution: "Precision Agro-Tech Solutions",
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-3",
    title: "Custom Drone PDB & High-Amperage ESC Power Harness",
    category: "Custom Circuit",
    description:
      "High-current Power Distribution Board (PDB) designed for carbon-fiber multi-rotor drones, delivering stable 5V/12V dual BEC rails and 60A surge capacity across 4 brushless ESC channels.",
    imageUrl:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80",
    date: "June 2026",
    clientOrInstitution: "Aeronautics Research Project",
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-4",
    title: "Z-Electronics 1000+ Hardware Orders Milestone",
    category: "Milestone",
    description:
      "Proud achievement celebrating over 1,000 verified electronics components and development kits supplied directly to aspiring student engineers, hobbyists, and lab makers across the region.",
    imageUrl:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1000&q=80",
    date: "May 2026",
    clientOrInstitution: "Z-Electronics Foundation",
    featured: false,
    createdAt: new Date().toISOString(),
  },
];

function readProjectsFile(): ProjectItem[] {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const raw = fs.readFileSync(PROJECTS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading projects-legacy.json:", err);
  }
  return INITIAL_PROJECTS;
}

function writeProjectsFile(projects: ProjectItem[]): void {
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
}

export async function getProjects(): Promise<ProjectItem[]> {
  const projects = readProjectsFile();
  return projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

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

    const current = readProjectsFile();
    const newProject: ProjectItem = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      category: input.category || "Completed Order",
      imageUrl: input.imageUrl.trim(),
      date: input.date?.trim() || "",
      clientOrInstitution: input.clientOrInstitution?.trim() || "",
      featured: Boolean(input.featured),
      createdAt: new Date().toISOString(),
    };

    const updated = [newProject, ...current];
    writeProjectsFile(updated);

    revalidatePath("/");
    revalidatePath("/legacy");
    revalidatePath("/admin");

    return { success: true, data: newProject };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create project.";
    return { success: false, error: message };
  }
}

export async function updateProject(
  id: string,
  input: Partial<Omit<ProjectItem, "id" | "createdAt">>
): Promise<{ success: boolean; data?: ProjectItem; error?: string }> {
  try {
    const current = readProjectsFile();
    const index = current.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, error: "Project not found." };
    }

    const updatedProject: ProjectItem = {
      ...current[index],
      ...input,
      title: input.title !== undefined ? input.title.trim() : current[index].title,
      description: input.description !== undefined ? input.description.trim() : current[index].description,
      category: input.category !== undefined ? input.category : current[index].category,
      imageUrl: input.imageUrl !== undefined ? input.imageUrl.trim() : current[index].imageUrl,
      date: input.date !== undefined ? input.date.trim() : current[index].date,
      clientOrInstitution:
        input.clientOrInstitution !== undefined
          ? input.clientOrInstitution.trim()
          : current[index].clientOrInstitution,
      featured: input.featured !== undefined ? Boolean(input.featured) : current[index].featured,
    };

    current[index] = updatedProject;
    writeProjectsFile(current);

    revalidatePath("/");
    revalidatePath("/legacy");
    revalidatePath("/admin");

    return { success: true, data: updatedProject };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update project.";
    return { success: false, error: message };
  }
}

export async function deleteProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = readProjectsFile();
    const filtered = current.filter((p) => p.id !== id);

    writeProjectsFile(filtered);

    revalidatePath("/");
    revalidatePath("/legacy");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete project.";
    return { success: false, error: message };
  }
}
