import { getComponents } from "@/lib/actions/components";
import { getProjects } from "@/lib/actions/projects";
import { getSiteStats } from "@/lib/actions/site-stats";
import { getPublicReviews } from "@/lib/actions/reviews";
import HeroSection from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { ComponentCatalog } from "@/components/catalog/component-catalog";
import ProjectsShowcase from "@/components/home/projects-showcase";
import ReviewsSection from "@/components/home/reviews-section";
import ProjectCTA from "@/components/home/project-cta";

export const revalidate = 0; // Fresh inventory & reviews

export default async function HomePage() {
  const [components, projects, siteStats, reviews] = await Promise.all([
    getComponents(),
    getProjects(),
    getSiteStats(),
    getPublicReviews(),
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

      {/* -- 5. Customer Reviews & 5-Star Ratings -------------------- */}
      <ReviewsSection initialReviews={reviews} />

      {/* -- 6. Custom Project CTA ----------------------------------- */}
      <ProjectCTA />
    </main>
  );
}

