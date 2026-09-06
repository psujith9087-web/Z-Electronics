"use client";

import { useState, useRef } from "react";
import {
  ProjectItem,
  ProjectCategory,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/actions/projects";
import { compressImageFile } from "@/lib/image-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
  Trophy,
  Star,
  ExternalLink,
  Calendar,
  Building,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectsManagerProps {
  initialProjects: ProjectItem[];
}

const CATEGORIES: ProjectCategory[] = [
  "Completed Order",
  "Robotics & IoT",
  "Custom Circuit",
  "Milestone",
  "Student Project",
  "Other",
];

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Add Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addCategory, setAddCategory] = useState<ProjectCategory>("Completed Order");
  const [addDate, setAddDate] = useState("");
  const [addClient, setAddClient] = useState("");
  const [addImageUrl, setAddImageUrl] = useState("");
  const [addFeatured, setAddFeatured] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAddPhoto, setIsUploadingAddPhoto] = useState(false);

  // Edit Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<ProjectCategory>("Completed Order");
  const [editDate, setEditDate] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);

  // Delete Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle Photo Upload via Files
  const handleAddPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAddPhoto(true);
      toast.loading("Compressing and preparing photograph...", { id: "photo-upload" });
      const compressedDataUrl = await compressImageFile(file, 1024, 1024, 0.82);
      setAddImageUrl(compressedDataUrl);
      toast.success("Photograph ready!", { id: "photo-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load photograph. Please try another image.", { id: "photo-upload" });
    } finally {
      setIsUploadingAddPhoto(false);
      if (addFileInputRef.current) addFileInputRef.current.value = "";
    }
  };

  const handleEditPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingEditPhoto(true);
      toast.loading("Compressing and preparing photograph...", { id: "photo-edit-upload" });
      const compressedDataUrl = await compressImageFile(file, 1024, 1024, 0.82);
      setEditImageUrl(compressedDataUrl);
      toast.success("Photograph updated!", { id: "photo-edit-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load photograph.", { id: "photo-edit-upload" });
    } finally {
      setIsUploadingEditPhoto(false);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    }
  };

  // Submit Add Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) {
      toast.error("Please enter a project title.");
      return;
    }
    if (!addImageUrl.trim()) {
      toast.error("Please choose or upload a project photograph.");
      return;
    }

    try {
      setIsSubmittingAdd(true);
      const res = await createProject({
        title: addTitle,
        description: addDescription,
        category: addCategory,
        date: addDate,
        clientOrInstitution: addClient,
        imageUrl: addImageUrl,
        featured: addFeatured,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to create project");
      }

      setProjects((prev) => [res.data!, ...prev]);
      toast.success("Project added to Z-Electronics Legacy showcase!");
      setIsAddOpen(false);

      // Reset form
      setAddTitle("");
      setAddDescription("");
      setAddCategory("Completed Order");
      setAddDate("");
      setAddClient("");
      setAddImageUrl("");
      setAddFeatured(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error creating project.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit Dialog
  const openEditModal = (item: ProjectItem) => {
    setEditingProject(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditDate(item.date || "");
    setEditClient(item.clientOrInstitution || "");
    setEditImageUrl(item.imageUrl);
    setEditFeatured(Boolean(item.featured));
    setIsEditOpen(true);
  };

  // Submit Edit Project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editTitle.trim()) {
      toast.error("Project title cannot be empty.");
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const res = await updateProject(editingProject.id, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        date: editDate,
        clientOrInstitution: editClient,
        imageUrl: editImageUrl,
        featured: editFeatured,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to update project");
      }

      setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? res.data! : p)));
      toast.success("Project updated successfully!");
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating project.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Submit Delete Project
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      setIsSubmittingDelete(true);
      const res = await deleteProject(deletingId);

      if (!res.success) {
        throw new Error(res.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== deletingId));
      toast.success("Project removed from showcase.");
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting project.");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.clientOrInstitution && p.clientOrInstitution.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (cat: ProjectCategory) => {
    switch (cat) {
      case "Completed Order":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "Robotics & IoT":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "Custom Circuit":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "Milestone":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "Student Project":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-600 border-zinc-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Completed Projects & Legacy Showcase
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload photographs of completed client orders, robotics builds, and achievements displayed to customers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl font-semibold gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project Photo</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-border h-10 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full py-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({projects.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-foreground text-base">No projects found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search || selectedCategory !== "all"
              ? "Try clearing your search or filter to see all projects."
              : "Start by clicking 'Add Project Photo' to showcase your first completed order."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col justify-between group hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold border backdrop-blur-md px-2.5 py-0.5 rounded-full ${getCategoryBadgeClass(
                        project.category
                      )}`}
                    >
                      {project.category}
                    </Badge>
                  </div>
                  {project.featured && (
                    <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white rounded-full p-1 shadow-md">
                      <Star className="h-3 w-3 fill-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    {project.date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.date}
                      </span>
                    )}
                    {project.clientOrInstitution && (
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {project.clientOrInstitution}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 border-t border-border/40 mt-3 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(project)}
                  className="h-8 rounded-lg text-xs gap-1.5 hover:bg-muted"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDeletingId(project.id);
                    setIsDeleteOpen(true);
                  }}
                  className="h-8 rounded-lg text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD PROJECT DIALOG                                            */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Add Completed Project or Achievement
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add photographs of your custom builds or completed customer orders to showcase Z-Electronics legacy.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4 mt-2">
            {/* Photograph Upload from Files */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Project Photograph *</Label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={addFileInputRef}
                accept="image/*"
                onChange={handleAddPhotoChange}
                className="hidden"
              />

              {addImageUrl ? (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={addImageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => addFileInputRef.current?.click()}
                      className="h-7 text-[11px] rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-md gap-1"
                    >
                      <UploadCloud className="h-3 w-3" />
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => setAddImageUrl("")}
                      className="h-7 w-7 rounded-lg shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => addFileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/60 transition-colors rounded-xl p-6 text-center cursor-pointer bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center"
                >
                  {isUploadingAddPhoto ? (
                    <div className="flex flex-col items-center py-2">
                      <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Compressing photograph...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        Click to select photo from Files / Device
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Supports camera photos, PNG, JPG, WebP (auto-optimized)
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Or paste direct URL */}
              <div className="pt-1">
                <Input
                  placeholder="Or paste external image URL..."
                  value={addImageUrl.startsWith("data:") ? "" : addImageUrl}
                  onChange={(e) => setAddImageUrl(e.target.value)}
                  className="text-xs h-8 rounded-lg"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Project Title *</Label>
              <Input
                placeholder="e.g., Autonomous 4WD Rover with ESP32"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                required
                className="rounded-xl text-xs h-9"
              />
            </div>

            {/* Category and Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={addCategory}
                  onValueChange={(val) => {
                    if (val) setAddCategory(val as ProjectCategory);
                  }}
                >
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Completion Date</Label>
                <Input
                  placeholder="e.g. September 2026"
                  value={addDate}
                  onChange={(e) => setAddDate(e.target.value)}
                  className="rounded-xl text-xs h-9"
                />
              </div>
            </div>

            {/* Client / Institution */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Client / Institution / College</Label>
              <Input
                placeholder="e.g. Engineering Robotics Club, Industrial Client, etc."
                value={addClient}
                onChange={(e) => setAddClient(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Project Story / Description</Label>
              <Textarea
                placeholder="Briefly describe the components supplied, challenge solved, or order milestone..."
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                rows={3}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="addFeatured"
                checked={addFeatured}
                onChange={(e) => setAddFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="addFeatured" className="text-xs font-medium cursor-pointer">
                Feature prominently at the top of the Legacy Showcase
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingAdd || !addTitle.trim() || !addImageUrl.trim()}
                className="rounded-xl text-xs font-semibold h-9 px-5 gap-1.5"
              >
                {isSubmittingAdd && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Project</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* EDIT PROJECT DIALOG                                           */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Project Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateProject} className="space-y-4 mt-2">
            {/* Photograph */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Project Photograph</Label>

              <input
                type="file"
                ref={editFileInputRef}
                accept="image/*"
                onChange={handleEditPhotoChange}
                className="hidden"
              />

              {editImageUrl && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={editImageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => editFileInputRef.current?.click()}
                      className="h-7 text-[11px] rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-md gap-1"
                    >
                      <UploadCloud className="h-3 w-3" />
                      Replace Photo
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <Input
                  placeholder="Or paste image URL..."
                  value={editImageUrl.startsWith("data:") ? "" : editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="text-xs h-8 rounded-lg"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Project Title *</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="rounded-xl text-xs h-9"
              />
            </div>

            {/* Category and Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={editCategory}
                  onValueChange={(val) => {
                    if (val) setEditCategory(val as ProjectCategory);
                  }}
                >
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Completion Date</Label>
                <Input
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="rounded-xl text-xs h-9"
                />
              </div>
            </div>

            {/* Client / Institution */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Client / Institution</Label>
              <Input
                value={editClient}
                onChange={(e) => setEditClient(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editFeatured"
                checked={editFeatured}
                onChange={(e) => setEditFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="editFeatured" className="text-xs font-medium cursor-pointer">
                Feature prominently at the top of the Legacy Showcase
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingEdit || !editTitle.trim()}
                className="rounded-xl text-xs font-semibold h-9 px-5 gap-1.5"
              >
                {isSubmittingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Update Project</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION DIALOG                                    */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Remove Project?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to remove this project from the customer showcase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isSubmittingDelete}
              className="rounded-xl text-xs font-semibold h-9 gap-1.5"
            >
              {isSubmittingDelete && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Yes, Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
