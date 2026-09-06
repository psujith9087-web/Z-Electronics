import { getProjects } from "@/lib/actions/projects";
import ProjectsShowcase from "@/components/home/projects-showcase";
import ProjectCTA from "@/components/home/project-cta";
import { Trophy, ArrowLeft, Cpu, Award, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 0; // Always fresh projects

export const metadata = {
  title: "Legacy & Completed Projects | Z-Electronics",
  description:
    "Explore Z-Electronics' completed orders, robotics builds, custom IoT circuits, and engineering achievements by Sujith.",
};

export default async function LegacyPage() {
  const projects = await getProjects();

  return (
    <main className="flex flex-col min-h-screen">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-border/40 bg-muted/20 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold gap-1.5 rounded-full hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Storefront Catalog</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">{projects.length} Verified Projects</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Showcase */}
      <ProjectsShowcase
        projects={projects}
        title="Z-Electronics Completed Projects & Legacy"
        subtitle="Every project represents verified hardware testing, precision bill of materials sourcing, and on-time delivery for students, hobbyists, and industry clients."
      />

      {/* Bottom CTA for custom builds */}
      <ProjectCTA />
    </main>
  );
}
