"use client";

import { useState, useRef } from "react";
import { ComponentItem, formatPrice } from "@/lib/types";
import { createComponent, updateComponent, deleteComponent } from "@/lib/actions/components";
import { compressImageFile } from "@/lib/image-upload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Edit2, Trash2, Cpu, Loader2, Package, UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ComponentsClientProps {
  initialComponents: ComponentItem[];
}

export function ComponentsClient({ initialComponents }: ComponentsClientProps) {
  const [components, setComponents] = useState<ComponentItem[]>(initialComponents);
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "low" | "out">("all");

  // File input refs for uploading photos from local files app
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAddImage, setIsUploadingAddImage] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);

  // Add Component Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addStock, setAddStock] = useState("");
  const [addImageUrl, setAddImageUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Edit Component Dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Component Dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick preset images for admin convenience
  const PRESET_IMAGES = [
    { label: "Arduino", url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80" },
    { label: "ESP32", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { label: "Sensor", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { label: "Display", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { label: "Motor", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80" },
    { label: "IC & Chip", url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&auto=format&fit=crop&q=80" },
  ];

  // Filter components
  const filtered = components.filter((c) => {
    const matches =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    if (!matches) return false;

    if (filterStock === "low") return c.stock_quantity > 0 && c.stock_quantity < 10;
    if (filterStock === "out") return c.stock_quantity <= 0;
    return true;
  });

  // Handle local file picking from files app
  const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAddImage(true);
    try {
      const base64 = await compressImageFile(file);
      setAddImageUrl(base64);
      toast.success("Component photo loaded from files!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process photo.";
      toast.error(msg);
    } finally {
      setIsUploadingAddImage(false);
      if (addFileInputRef.current) addFileInputRef.current.value = "";
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditImage(true);
    try {
      const base64 = await compressImageFile(file);
      setEditImageUrl(base64);
      toast.success("Component photo loaded from files!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process photo.";
      toast.error(msg);
    } finally {
      setIsUploadingEditImage(false);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    }
  };

  // Handle Add Component
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addPrice || !addStock) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.set("name", addName.trim());
      formData.set("description", addDescription.trim());
      formData.set("price", addPrice);
      formData.set("stock_quantity", addStock);
      formData.set("image_url", addImageUrl.trim());

      const res = await createComponent(formData);
      if (res.success && res.data) {
        toast.success(`Component "${res.data.name}" added successfully!`);
        setComponents((prev) => [res.data!, ...prev]);
        setIsAddOpen(false);
        setAddName("");
        setAddDescription("");
        setAddPrice("");
        setAddStock("");
        setAddImageUrl("");
      } else {
        toast.error(res.error || "Failed to add component.");
      }
    } catch {
      toast.error("Error adding component.");
    } finally {
      setIsAdding(false);
    }
  };

  // Open Edit Dialog
  const openEditModal = (comp: ComponentItem) => {
    setEditingComponent(comp);
    setEditName(comp.name);
    setEditDescription(comp.description);
    setEditPrice(comp.price.toString());
    setEditStock(comp.stock_quantity.toString());
    setEditImageUrl(comp.image_url || "");
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComponent) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.set("name", editName.trim());
      formData.set("description", editDescription.trim());
      formData.set("price", editPrice);
      formData.set("stock_quantity", editStock);
      formData.set("image_url", editImageUrl.trim());

      const res = await updateComponent(editingComponent.id, formData);
      if (res.success) {
        toast.success("Component updated successfully!");
        setComponents((prev) =>
          prev.map((c) =>
            c.id === editingComponent.id
              ? {
                  ...c,
                  name: editName.trim(),
                  description: editDescription.trim(),
                  price: parseFloat(editPrice),
                  stock_quantity: parseInt(editStock, 10),
                  image_url: editImageUrl.trim(),
                }
              : c
          )
        );
        setIsEditOpen(false);
        setEditingComponent(null);
      } else {
        toast.error(res.error || "Failed to update component.");
      }
    } catch {
      toast.error("Error updating component.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const res = await deleteComponent(deletingId);
      if (res.success) {
        toast.success("Component deleted from inventory.");
        setComponents((prev) => prev.filter((c) => c.id !== deletingId));
        setIsDeleteOpen(false);
        setDeletingId(null);
      } else {
        toast.error(res.error || "Failed to delete component.");
      }
    } catch {
      toast.error("Error deleting component.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Inventory Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, update pricing, monitor stock, and manage electronic components.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 font-semibold">
          <Plus className="h-4 w-4" />
          Add New Component
        </Button>
      </div>

      {/* Search & Stock Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by component name..."
            className="pl-9 h-10 bg-background text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium shrink-0">Filter Stock:</span>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Components ({components.length})</option>
            <option value="low">Low Stock (&lt; 10)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Components Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <tr className="border-b bg-muted/40 text-xs font-bold text-muted-foreground">
              <TableHead className="py-3.5 px-3 w-16 text-center">Photo</TableHead>
              <TableHead className="py-3.5 px-4">Component Name & Details</TableHead>
              <TableHead className="py-3.5 px-4 text-right">Unit Price</TableHead>
              <TableHead className="py-3.5 px-4 text-center">Stock Quantity</TableHead>
              <TableHead className="py-3.5 px-4 text-center">Status</TableHead>
              <TableHead className="py-3.5 px-4 text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filtered.map((comp) => {
              const isOut = comp.stock_quantity <= 0;
              const isLow = comp.stock_quantity > 0 && comp.stock_quantity < 10;

              return (
                <TableRow key={comp.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3 px-3 text-center">
                    <div className="h-11 w-11 rounded-xl border border-border/80 bg-muted/40 overflow-hidden flex items-center justify-center mx-auto shadow-inner">
                      {comp.image_url ? (
                        <img
                          src={comp.image_url}
                          alt={comp.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Cpu className="h-5 w-5 text-muted-foreground/60" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-4">
                    <div className="flex items-start gap-2.5">
                      <div>
                        <span className="font-bold text-foreground text-sm block leading-snug">
                          {comp.name}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                          {comp.description || "No description provided."}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-4 text-right font-bold text-foreground text-sm">
                    {formatPrice(comp.price)}
                  </TableCell>

                  <TableCell className="py-4 px-4 text-center font-mono font-bold text-sm">
                    {comp.stock_quantity}
                  </TableCell>

                  <TableCell className="py-4 px-4 text-center">
                    {isOut ? (
                      <Badge variant="destructive" className="text-[10px] font-semibold">
                        Out of Stock
                      </Badge>
                    ) : isLow ? (
                      <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/40 text-amber-600 bg-amber-500/10">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(comp)}
                        title="Edit component"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setDeletingId(comp.id);
                          setIsDeleteOpen(true);
                        }}
                        title="Delete component"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No electronic components found.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* -- ADD COMPONENT MODAL ------------------------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Electronic Component</DialogTitle>
            <DialogDescription className="text-xs">
              Insert a new component into the Supabase inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name" className="text-xs font-semibold">
                Component Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-name"
                required
                placeholder="e.g. ESP32 DevKit V1 (Dual Core Wi-Fi)"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-desc" className="text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="add-desc"
                rows={3}
                placeholder="Key specs, pinout, voltage, pin configuration..."
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-price" className="text-xs font-semibold">
                  Price in INR (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="249.00"
                  value={addPrice}
                  onChange={(e) => setAddPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-stock" className="text-xs font-semibold">
                  Stock Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-stock"
                  type="number"
                  min="0"
                  required
                  placeholder="50"
                  value={addStock}
                  onChange={(e) => setAddStock(e.target.value)}
                />
              </div>
            </div>

            {/* Component Photo Upload / Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Component Photo (Upload from Device / Files)
                </Label>
                {addImageUrl && (
                  <button
                    type="button"
                    onClick={() => setAddImageUrl("")}
                    className="text-[10px] text-destructive hover:underline font-semibold flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Remove Photo
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={addFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAddFileChange}
              />

              {/* Photo Preview or File Picker Target */}
              {addImageUrl ? (
                <div className="relative rounded-2xl border-2 border-primary/30 bg-muted/20 p-2.5 overflow-hidden flex items-center gap-3">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border bg-background shrink-0 shadow-sm">
                    <img
                      src={addImageUrl}
                      alt="Component Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">Photo Selected</p>
                    <p className="text-[11px] text-muted-foreground">
                      Will be visualised in the customer portal catalog.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFileInputRef.current?.click()}
                      disabled={isUploadingAddImage}
                      className="h-7 text-[11px] gap-1 px-2.5 rounded-lg"
                    >
                      <UploadCloud className="h-3 w-3" />
                      {isUploadingAddImage ? "Processing..." : "Change Photo"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => addFileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isUploadingAddImage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Click to choose photo from your Files App / Device
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      JPG, PNG, WebP supported • Automatically optimized
                    </p>
                  </div>
                </div>
              )}

              {/* Or Direct URL / Presets */}
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    id="add-image"
                    type="url"
                    placeholder="Or paste an image web link (optional)..."
                    value={addImageUrl.startsWith("data:") ? "" : addImageUrl}
                    onChange={(e) => setAddImageUrl(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">Quick Presets:</span>
                  {PRESET_IMAGES.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAddImageUrl(p.url)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted/70 hover:bg-muted text-foreground font-medium transition-colors border border-border/60"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding} className="font-semibold">
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Adding...
                  </>
                ) : (
                  "Save Component"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -- EDIT COMPONENT MODAL ------------------------------------------ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
            <DialogDescription className="text-xs">
              Update pricing, specifications, or stock quantity.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold">
                Component Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc" className="text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-price" className="text-xs font-semibold">
                  Price in INR (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-stock" className="text-xs font-semibold">
                  Stock Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  required
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Component Photo</Label>
                {editImageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditImageUrl("")}
                    className="text-[10px] text-destructive hover:underline font-semibold flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Remove Photo
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleEditFileChange}
              />

              {/* Photo Preview or File Picker Target */}
              {editImageUrl ? (
                <div className="relative rounded-2xl border-2 border-primary/30 bg-muted/20 p-2.5 overflow-hidden flex items-center gap-3">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border bg-background shrink-0 shadow-sm">
                    <img
                      src={editImageUrl}
                      alt="Component Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">Photo Selected</p>
                    <p className="text-[11px] text-muted-foreground">
                      Will be visualised in the customer portal catalog.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={isUploadingEditImage}
                      className="h-7 text-[11px] gap-1 px-2.5 rounded-lg"
                    >
                      <UploadCloud className="h-3 w-3" />
                      {isUploadingEditImage ? "Processing..." : "Change Photo"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isUploadingEditImage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Click to choose photo from your Files App / Device
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      JPG, PNG, WebP supported • Automatically optimized
                    </p>
                  </div>
                </div>
              )}

              {/* Or Direct URL / Presets */}
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-image"
                    type="url"
                    placeholder="Or paste an image web link (optional)..."
                    value={editImageUrl.startsWith("data:") ? "" : editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">Quick Presets:</span>
                  {PRESET_IMAGES.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setEditImageUrl(p.url)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted/70 hover:bg-muted text-foreground font-medium transition-colors border border-border/60"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="font-semibold">
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -- DELETE CONFIRMATION MODAL ------------------------------------- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Component?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this component? This action will remove it from the public catalog.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
