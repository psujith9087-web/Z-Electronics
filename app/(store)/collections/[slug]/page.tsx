import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FiltersSidebar } from "@/components/catalog/filters-sidebar";
import { SortDropdown } from "@/components/catalog/sort-dropdown";
import ProductCard from "@/components/catalog/product-card";
import { ProductFilters, SortOption } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Component, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase.from("categories").select("name").eq("slug", slug).single();
  
  if (!category) return { title: "Category Not Found" };
  
  return {
    title: `${category.name} | Z-Electronics`,
    description: `Shop for ${category.name} components at Z-Electronics.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  
  const sort = (searchParamsResolved.sort as SortOption) || "featured";
  const minPrice = searchParamsResolved.min_price ? Number(searchParamsResolved.min_price) : undefined;
  const maxPrice = searchParamsResolved.max_price ? Number(searchParamsResolved.max_price) : undefined;
  const inStock = searchParamsResolved.in_stock === "true";
  const search = searchParamsResolved.search as string | undefined;
  const page = searchParamsResolved.page ? Number(searchParamsResolved.page) : 1;
  const perPage = 24;
  
  const supabase = await createClient();
  
  // Fetch current category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }
  
  // Fetch categories for sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch products
  let query = supabase
    .from("products")
    .select("*, categories(*)", { count: "exact" })
    .eq("is_active", true)
    .eq("category_id", category.id);

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
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="mx-2 size-4" />
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="mx-2 size-4" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <FiltersSidebar categories={categories || []} />
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
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
              <Button render={<Link href={`/collections/${category.slug}`} />} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
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
                    render={<Link href={`/collections/${category.slug}?${newParams.toString()}`} />}
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
