import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FiltersSidebar } from "@/components/catalog/filters-sidebar";
import { SortDropdown } from "@/components/catalog/sort-dropdown";
import ProductCard from "@/components/catalog/product-card";
import { ProductFilters, SortOption } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Component } from "lucide-react";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const sort = (params.sort as SortOption) || "featured";
  const minPrice = params.min_price ? Number(params.min_price) : undefined;
  const maxPrice = params.max_price ? Number(params.max_price) : undefined;
  const inStock = params.in_stock === "true";
  const search = params.search as string | undefined;
  const page = params.page ? Number(params.page) : 1;
  const perPage = 24;
  
  const supabase = await createClient();
  
  // Fetch categories for sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch products
  let query = supabase
    .from("products")
    .select("*, categories(*)", { count: "exact" })
    .eq("is_active", true);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }
  if (inStock) {
    query = query.gt("stock_quantity", 0);
  }

  // Apply sorting
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "name-desc":
      query = query.order("name", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "featured":
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      break;
  }

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data: products, count } = await query;
  
  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <FiltersSidebar categories={categories || []} />
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
              <p className="text-muted-foreground mt-1">
                Showing {products?.length || 0} of {count || 0} products
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <FiltersSidebar categories={categories || []} isMobile />
              </div>
              <SortDropdown />
            </div>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border rounded-xl bg-muted/20">
              <Component className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Try adjusting your filters or search query.
              </p>
              <Button render={<Link href="/shop" />} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination (Simplified) */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const newParams = new URLSearchParams();
                if (search) newParams.set("search", search);
                if (minPrice) newParams.set("min_price", minPrice.toString());
                if (maxPrice) newParams.set("max_price", maxPrice.toString());
                if (inStock) newParams.set("in_stock", "true");
                if (sort !== "featured") newParams.set("sort", sort);
                newParams.set("page", p.toString());
                
                return (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    render={<Link href={`/shop?${newParams.toString()}`} />}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
