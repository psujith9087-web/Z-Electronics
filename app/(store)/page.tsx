import { getComponents } from "@/lib/actions/components";
import { getProjects } from "@/lib/actions/projects";
import HeroSection from "@/components/home/hero-section";
import { ComponentCatalog } from "@/components/catalog/component-catalog";
import ProjectsShowcase from "@/components/home/projects-showcase";
import ProjectCTA from "@/components/home/project-cta";
import { Cpu, Truck, CheckCircle2, Headphones } from "lucide-react";

export const revalidate = 0; // Fresh inventory

export default async function HomePage() {
  const [components, projects] = await Promise.all([
    getComponents(),
    getProjects(),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      {/* -- 1. Hero Section ------------------------------------------ */}
      <HeroSection />

      {/* -- 2. Value Proposition Stats Bar --------------------------- */}
      <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60">
            <div className="flex flex-col items-center text-center px-2 pt-2 md:pt-0">
              <Cpu className="h-6 w-6 text-primary mb-2" />
              <span className="text-xl font-bold text-foreground">500+</span>
              <span className="text-xs text-muted-foreground">Components in Stock</span>
            </div>
            <div className="flex flex-col items-center text-center px-2 pt-4 md:pt-0">
              <Truck className="h-6 w-6 text-emerald-500 mb-2" />
              <span className="text-xl font-bold text-foreground">Same Day</span>
              <span className="text-xs text-muted-foreground">Dispatch Available</span>
            </div>
            <div className="flex flex-col items-center text-center px-2 pt-4 md:pt-0">
              <CheckCircle2 className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-xl font-bold text-foreground">100% Tested</span>
              <span className="text-xs text-muted-foreground">Verified Hardware</span>
            </div>
            <div className="flex flex-col items-center text-center px-2 pt-4 md:pt-0">
              <Headphones className="h-6 w-6 text-indigo-500 mb-2" />
              <span className="text-xl font-bold text-foreground">Direct Support</span>
              <span className="text-xs text-muted-foreground">Owner Sujith</span>
            </div>
          </div>
        </div>
      </section>

      {/* -- 3. Component Catalog Grid ------------------------------- */}
      <ComponentCatalog components={components} />

      {/* -- 4. Completed Projects & Legacy Showcase ------------------ */}
      <ProjectsShowcase projects={projects} />

      {/* -- 5. Custom Project CTA ----------------------------------- */}
      <ProjectCTA />
    </main>
  );
}
