import { getComponents } from "@/lib/actions/components";
import { getProjects } from "@/lib/actions/projects";
import { getSiteStats } from "@/lib/actions/site-stats";
import HeroSection from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { ComponentCatalog } from "@/components/catalog/component-catalog";
import ProjectsShowcase from "@/components/home/projects-showcase";
import ProjectCTA from "@/components/home/project-cta";

export const revalidate = 0; // Fresh inventory

export default async function HomePage() {
  const [components, projects, siteStats] = await Promise.all([
    getComponents(),
    getProjects(),
    getSiteStats(),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      {/* -- 1. Hero Section ------------------------------------------ */}
      <HeroSection />

      {/* -- 2. Dynamic Value Proposition Stats Bar (Admin Editable) -- */}
      <StatsBar stats={siteStats} />

      {/* -- 3. Component Catalog Grid ------------------------------- */}
      <ComponentCatalog components={components} />

      {/* -- 4. Completed Projects & Legacy Showcase ------------------ */}
      <ProjectsShowcase projects={projects} />

      {/* -- 5. Custom Project CTA ----------------------------------- */}
      <ProjectCTA />
    </main>
  );
}
