"use client";

import { useState, useMemo } from "react";
import { ComponentItem, formatPrice } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Cpu,
  Radio,
  SlidersHorizontal,
  Package,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface ComponentCatalogProps {
  components: ComponentItem[];
}

export function ComponentCatalog({ components }: ComponentCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const addItem = useCartStore((state) => state.addItem);

  const tags = ["All", "Microcontrollers", "Sensors", "Displays & Modules", "Motors & Actuators", "Passives & ICs"];

  // Filter & sort logic
  const filteredComponents = useMemo(() => {
    return components
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedTag === "All") return true;
        if (selectedTag === "Microcontrollers") {
          return /arduino|esp32|pico|rp2040|microcontroller/i.test(c.name + " " + c.description);
        }
        if (selectedTag === "Sensors") {
          return /sensor|ultrasonic|humidity|temperature|gyro|accelerometer|dht/i.test(c.name + " " + c.description);
        }
        if (selectedTag === "Displays & Modules") {
          return /oled|lcd|display|relay|charger|tp4056|module/i.test(c.name + " " + c.description);
        }
        if (selectedTag === "Motors & Actuators") {
          return /motor|servo|stepper|driver|l298n|sg90/i.test(c.name + " " + c.description);
        }
        if (selectedTag === "Passives & ICs") {
          return /resistor|capacitor|led|timer|555|diode|ic/i.test(c.name + " " + c.description);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
        if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0; // Default order
      });
  }, [components, search, selectedTag, sortBy]);

  const handleQuantityChange = (id: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(maxStock > 0 ? maxStock : 99, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (component: ComponentItem) => {
    const qty = quantities[component.id] || 1;
    addItem(component, qty);

    // Visual feedback
    setAddedIds((prev) => ({ ...prev, [component.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [component.id]: false }));
    }, 1500);

    toast.success(`Added ${qty}x ${component.name} to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => {
          window.location.href = "/cart";
        },
      },
    });
  };

  return (
    <section id="catalog" className="scroll-mt-20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              <Cpu className="h-4 w-4" />
              <span>Available Inventory</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Electronic Components Catalog
            </h2>
            <p className="mt-1 text-muted-foreground text-sm max-w-xl">
              Browse top grade components for prototyping, student projects, robotics, and commercial production.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5">
                <ShoppingCart className="h-4 w-4" />
                Go to Cart
              </Button>
            </Link>
          </div>
        </div>

        {/* Search, Tag Filters & Sorting Controls */}
        <div className="space-y-4 mb-8 bg-card border rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search components by name (e.g. Arduino, ESP32, Sensor, Resistor)..."
                className="pl-10 h-11 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="featured">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Categories:
            </span>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
          <span>Showing <strong>{filteredComponents.length}</strong> electronic components</span>
          {selectedTag !== "All" && (
            <button
              onClick={() => setSelectedTag("All")}
              className="text-primary hover:underline font-medium"
            >
              Reset category filter
            </button>
          )}
        </div>

        {/* Components Grid */}
        {filteredComponents.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center bg-muted/20">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-semibold text-foreground">No components found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              We couldn't find any components matching "{search}". Try searching for another keyword or check with owner Sujith.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setSelectedTag("All");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredComponents.map((component) => {
              const qty = quantities[component.id] || 1;
              const isAdded = addedIds[component.id];
              const isOutOfStock = component.stock_quantity <= 0;
              const isLowStock = component.stock_quantity > 0 && component.stock_quantity < 10;

              return (
                <Card
                  key={component.id}
                  className="group flex flex-col justify-between overflow-hidden border-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg bg-card"
                >
                  <CardContent className="p-5 flex flex-col flex-1">
                    {/* Top Meta Bar */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                        <Cpu className="h-5 w-5" />
                      </div>
                      
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="text-[11px] font-semibold">
                          Out of Stock
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="text-[11px] font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                          Low Stock ({component.stock_quantity})
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          In Stock ({component.stock_quantity})
                        </Badge>
                      )}
                    </div>

                    {/* Component Name */}
                    <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {component.name}
                    </h3>

                    {/* Component Description */}
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3 flex-1">
                      {component.description || "High quality electronic component certified for DIY projects and commercial circuits."}
                    </p>

                    {/* Price & Actions Area */}
                    <div className="mt-5 pt-4 border-t border-border/50">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground block">Price</span>
                          <span className="text-xl font-black tracking-tight text-foreground">
                            {formatPrice(component.price)}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Per Unit (Incl. GST)
                        </span>
                      </div>

                      {/* Quantity Controller & Add Button */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-input rounded-lg h-10 bg-background overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(component.id, -1, component.stock_quantity)}
                            disabled={qty <= 1 || isOutOfStock}
                            className="px-2.5 h-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(component.id, 1, component.stock_quantity)}
                            disabled={isOutOfStock || qty >= component.stock_quantity}
                            className="px-2.5 h-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleAddToCart(component)}
                          disabled={isOutOfStock}
                          className={`flex-1 h-10 gap-1.5 text-xs font-semibold transition-all ${
                            isAdded
                              ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                              : ""
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-4 w-4" /> Added
                            </>
                          ) : isOutOfStock ? (
                            "Sold Out"
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" /> Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
