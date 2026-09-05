"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import Link from "next/link";
import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FiltersSidebarProps {
  categories: Category[];
  isMobile?: boolean;
}

export function FiltersSidebar({ categories, isMobile = false }: FiltersSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page when filters change
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const applyPriceFilter = () => {
    let params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");
    
    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");
    
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const FilterContent = (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filters</h3>
          {searchParams.toString() && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs"
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                router.push(pathname);
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-3">Availability</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              checked={searchParams.get("in_stock") === "true"}
              onChange={(e) => {
                router.push(
                  `${pathname}?${createQueryString("in_stock", e.target.checked ? "true" : "")}`
                );
              }}
            />
            In Stock Only
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-3">Price Range (₹)</h4>
        <div className="flex items-center gap-2">
          <div className="grid gap-1.5 flex-1">
            <Input
              type="number"
              placeholder="Min"
              className="h-8 text-sm"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            />
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="grid gap-1.5 flex-1">
            <Input
              type="number"
              placeholder="Max"
              className="h-8 text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            />
          </div>
        </div>
        <Button 
          onClick={applyPriceFilter} 
          variant="secondary" 
          size="sm" 
          className="w-full mt-2"
        >
          Apply
        </Button>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-3">Categories</h4>
        <div className="space-y-1">
          <Link
            href="/shop"
            className={cn(
              "block text-sm py-1 transition-colors hover:text-primary",
              pathname === "/shop" ? "font-semibold text-primary" : "text-muted-foreground"
            )}
          >
            All Products
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className={cn(
                "block text-sm py-1 transition-colors hover:text-primary",
                pathname === `/collections/${category.slug}`
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger render={
          <Button variant="outline" size="sm" className="gap-2 lg:hidden">
            <Filter className="size-4" />
            Filters
          </Button>
        } />
        <SheetContent side="left" className="w-[300px] sm:w-[350px]">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {FilterContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden lg:block w-64 shrink-0 pr-8">
      <div className="sticky top-24">
        {FilterContent}
      </div>
    </div>
  );
}
