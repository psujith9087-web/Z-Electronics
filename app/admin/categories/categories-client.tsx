"use client";

import React, { useState, Fragment } from "react";
import { Category, generateSlug } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { createCategory } from "@/lib/actions/admin";
import { updateCategory, deleteCategory } from "@/lib/actions/admin-categories";
import { toast } from "sonner";

export function CategoriesClient({ categories, flatCategories }: { categories: any[], flatCategories: Category[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [imageUrl, setImageUrl] = useState("");

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openNewDialog = () => {
    setEditingCat(null);
    setName("");
    setSlug("");
    setParentId("none");
    setImageUrl("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parent_id || "none");
    setImageUrl(cat.image_url || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    if (parentId !== "none") formData.append("parent_id", parentId);
    if (imageUrl) formData.append("image_url", imageUrl);

    try {
      if (editingCat) {
        const res = await updateCategory(editingCat.id, formData);
        if (res.success) {
          toast.success("Category updated");
          setIsDialogOpen(false);
        } else {
          toast.error(res.error || "Failed to update category");
        }
      } else {
        const res = await createCategory(formData);
        if (res.success) {
          toast.success("Category created");
          setIsDialogOpen(false);
        } else {
          toast.error(res.error || "Failed to create category");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await deleteCategory(deletingId);
      if (res.success) {
        toast.success("Category deleted");
      } else {
        toast.error(res.error || "Failed to delete category");
      }
    } catch (err) {
      toast.error("Error deleting category");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const renderRow = (cat: any, depth = 0) => {
    const isExpanded = expanded[cat.id] || false;
    const hasChildren = cat.children && cat.children.length > 0;

    return (
      <Fragment key={cat.id}>
        <TableRow className={depth > 0 ? "bg-muted/20" : ""}>
          <TableCell>
            <div 
              className="flex items-center gap-2" 
              style={{ paddingLeft: `${depth * 1.5}rem` }}
            >
              {hasChildren ? (
                <button onClick={() => toggleExpand(cat.id)} className="p-1 hover:bg-muted rounded-md transition-colors">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <span className="w-6" /> // spacer
              )}
              {hasChildren ? (
                isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">{cat.name}</span>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
          <TableCell>{cat.product_count || 0}</TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                setDeletingId(cat.id);
                setIsDeleteDialogOpen(true);
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && cat.children.map((child: any) => renderRow(child, depth + 1))}
      </Fragment>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => renderRow(cat, 0))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                required 
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  if (!editingCat) setSlug(generateSlug(e.target.value));
                }} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                required 
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select value={parentId} onValueChange={(val) => setParentId(val || "none")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {flatCategories.filter(c => c.id !== editingCat?.id).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input 
                id="image_url" 
                value={imageUrl} 
                onChange={e => setImageUrl(e.target.value)} 
                placeholder="https://..."
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? 
              This will fail if it contains any subcategories or products.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
