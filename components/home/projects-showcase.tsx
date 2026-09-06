"use client";

import { useState } from "react";
import { ProjectItem, ProjectCategory } from "@/lib/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Trophy,
  Sparkles,
  Calendar,
  Building,
  Maximize2,
  MessageSquare,
  Phone,
  ArrowRight,
  CheckCircle2,
  Layers,
  Star,
  X,
} from "lucide-react";

interface ProjectsShowcaseProps {
  projects: ProjectItem[];
  title?: string;
  subtitle?: string;
}

const FILTER_CATEGORIES: { label: string; value: string }[] = [
  { label: "All Projects", value: "all" },
  { label: "Completed Orders", value: "Completed Order" },
  { label: "Robotics & IoT", value: "Robotics & IoT" },
  { label: "Custom Circuits", value: "Custom Circuit" },
  { label: "Milestones", value: "Milestone" },
  { label: "Student Builds", value: "Student Project" },
];

export default function ProjectsShowcase({
  projects,
  title = "The Z-Electronics Legacy",
  subtitle = "Explore our completed client orders, collegiate robotics builds, custom power circuits, and hardware achievements engineered and supplied by Z-Electronics.",
}: ProjectsShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  const getCategoryBadgeClass = (cat: ProjectCategory) => {
    switch (cat) {
      case "Completed Order":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Robotics & IoT":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Custom Circuit":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Milestone":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Student Project":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30";
    }
  };

  const createWhatsAppLink = (proj: ProjectItem) => {
    const text = encodeURIComponent(
      `Hi Sujith! I saw your completed project "${proj.title}" on the Z-Electronics website. I would like to discuss a similar build or order components for my project.`
    );
    return `https://wa.me/918072726924?text=${text}`;
  };

  return (
    <section id="legacy" className="py-16 sm:py-24 bg-gradient-to-b from-background via-muted/15 to-background relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -right-40 w-[400px] h-[400px] bg-amber-500/5 blur-[140px] rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-md shadow-sm">
            <Trophy className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
            <span>Proven Track Record & Client Success</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {subtitle}
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {FILTER_CATEGORIES.map((filter) => {
              const count =
                filter.value === "all"
                  ? projects.length
                  : projects.filter((p) => p.category === filter.value).length;

              if (count === 0 && filter.value !== "all") return null;

              const isActive = activeCategory === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveCategory(filter.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                      : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-bold text-foreground text-base">New Projects Coming Soon</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              We are currently preparing photographs of our latest completed client orders and collegiate robotics builds. Check back soon or contact Sujith directly on WhatsApp for Bill of Materials (BOM) quotations.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <a
                href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="rounded-full text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp Sujith</span>
                </Button>
              </a>
              <a href="tel:8072726924">
                <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold gap-1.5 border-border">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>Call 8072726924</span>
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-black border backdrop-blur-md px-3 py-1 rounded-full shadow-sm ${getCategoryBadgeClass(
                          project.category
                        )}`}
                      >
                        {project.category}
                      </Badge>
                    </div>

                    {project.featured && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-2.5 py-1 text-[10px] font-black shadow-lg flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        <span>Featured</span>
                      </div>
                    )}

                    {/* Quick Expand Icon on Hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 hover:bg-black/90 text-white p-2 rounded-xl backdrop-blur-md shadow-lg">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      {project.date && (
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3 text-primary" />
                          {project.date}
                        </span>
                      )}
                      {project.clientOrInstitution && (
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Building className="h-3 w-3 text-amber-500" />
                          {project.clientOrInstitution}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-border/40 pt-4 text-xs font-bold text-primary group-hover:text-primary/90">
                  <span className="inline-flex items-center gap-1.5">
                    <span>View Project Details</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Click to inspect
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* LIGHTBOX / PROJECT DETAILS DIALOG                           */}
        {/* ----------------------------------------------------------- */}
        <Dialog
          open={Boolean(selectedProject)}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        >
          {selectedProject && (
            <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border border-border bg-card shadow-2xl">
              {/* Full-width photograph */}
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="h-full w-full object-contain sm:object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold border backdrop-blur-md px-3 py-1 rounded-full shadow-lg ${getCategoryBadgeClass(
                      selectedProject.category
                    )}`}
                  >
                    {selectedProject.category}
                  </Badge>
                </div>

                {selectedProject.featured && (
                  <div className="absolute top-4 right-14 bg-amber-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-md flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-white" />
                    <span>Featured Build</span>
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-5 max-h-[50vh] overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {selectedProject.date && (
                      <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Completed: {selectedProject.date}
                      </span>
                    )}
                    {selectedProject.clientOrInstitution && (
                      <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg">
                        <Building className="h-3.5 w-3.5 text-amber-500" />
                        Client / College: {selectedProject.clientOrInstitution}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {selectedProject.title}
                  </h2>
                </div>

                <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Project Story & Technical Specifications
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {selectedProject.description || "No additional description provided."}
                  </p>
                </div>

                {/* Call to action & Enquiry buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-muted-foreground text-center sm:text-left">
                    <span>Need components or assistance for a similar build?</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <a
                      href={createWhatsAppLink(selectedProject)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="sm"
                        className="w-full h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-2 shadow-md shadow-emerald-950/30"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp Sujith About This</span>
                      </Button>
                    </a>

                    <a href="tel:8072726924" className="w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-10 px-4 rounded-xl border-border font-semibold text-xs gap-2"
                      >
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        <span>Call</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </section>
  );
}
