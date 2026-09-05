"use client";

import { useState, useEffect } from "react";
import { Product, Category, generateSlug } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createProduct, updateProduct, uploadProductImage, createCategory } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, Upload, Plus } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  mode: 'create' | 'edit';
}

export function ProductForm({ initialData, categories: initialCategories, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compare_at_price?.toString() || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [stockQuantity, setStockQuantity] = useState(initialData?.stock_quantity?.toString() || "0");
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);

  // Auto-generate slug
  useEffect(() => {
    if (mode === 'create' && name && !slug) {
      setSlug(generateSlug(name));
    }
  }, [name, mode, slug]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    try {
      const newImages = [...images];
      for (const file of Array.from(e.target.files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadProductImage(formData);
        if (res.success && res.url) {
          newImages.push(res.url);
        } else {
          toast.error(res.error || "Failed to upload image");
        }
      }
      setImages(newImages);
      toast.success("Images uploaded successfully");
    } catch (err) {
      toast.error("Error uploading images");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    
    const formData = new FormData();
    formData.append("name", newCatName);
    formData.append("slug", newCatSlug);
    
    const res = await createCategory(formData);
    if (res.success && res.category) {
      setCategories([...categories, res.category]);
      setCategoryId(res.category.id);
      setIsCatDialogOpen(false);
      setNewCatName("");
      setNewCatSlug("");
      toast.success("Category added");
    } else {
      toast.error(res.error || "Failed to create category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    if (categoryId) formData.append("category_id", categoryId);
    formData.append("price", price);
    if (compareAtPrice) formData.append("compare_at_price", compareAtPrice);
    formData.append("sku", sku);
    formData.append("stock_quantity", stockQuantity);
    formData.append("is_featured", isFeatured.toString());
    formData.append("is_active", isActive.toString());
    formData.append("images", JSON.stringify(images));

    try {
      if (mode === 'create') {
        const res = await createProduct(formData);
        if (res.success) {
          toast.success("Product created successfully");
          router.push("/admin/products");
        } else {
          toast.error(res.error || "Failed to create product");
        }
      } else {
        const res = await updateProduct(initialData!.id, formData);
        if (res.success) {
          toast.success("Product updated successfully");
          router.push("/admin/products");
        } else {
          toast.error(res.error || "Failed to update product");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" required value={slug} onChange={e => setSlug(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={5} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                {images.map((url, i) => (
                  <div key={i} className="relative h-24 w-24 rounded-md border overflow-hidden">
                    <Image src={url} alt="Product image" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-destructive hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center h-24 w-24 rounded-md border-2 border-dashed cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input id="price" type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="compare_at_price">Compare at Price (₹)</Label>
                <Input id="compare_at_price" type="number" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input id="stock" type="number" required value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                  <DialogTrigger render={
                    <Button type="button" variant="link" className="p-0 h-auto justify-start text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add new category
                    </Button>
                  } />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input value={newCatName} onChange={e => {
                          setNewCatName(e.target.value);
                          setNewCatSlug(generateSlug(e.target.value));
                        }} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Slug</Label>
                        <Input value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} />
                      </div>
                    </div>
                    <Button onClick={handleAddCategory} type="button">Save Category</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300" 
                />
                <span className="text-sm font-medium">Active (visible to customers)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isFeatured} 
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300" 
                />
                <span className="text-sm font-medium">Featured (shows on homepage)</span>
              </label>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Saving..." : (mode === 'create' ? 'Create Product' : 'Save Changes')}
          </Button>
        </div>
      </div>
    </form>
  );
}
