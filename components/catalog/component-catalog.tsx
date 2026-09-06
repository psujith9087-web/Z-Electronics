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
    <section id="catalog" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              <span>Available Inventory</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl leading-tight">
              Electronic Components Catalog
            </h2>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl font-normal leading-relaxed">
              Browse top grade silicon and modules for prototyping, engineering projects, robotics, and production.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="outline" className="gap-2 h-11 px-5 rounded-full border-border/80 text-foreground font-semibold text-xs transition-all hover:border-primary/50 hover:shadow-sm active:scale-95">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span>Go to Cart</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search, Tag Filters & Sorting Controls (Apple Style Pill Container) */}
        <div className="space-y-4 mb-10 rounded-3xl border border-border/80 bg-card/70 p-4 sm:p-6 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input with Focus Glow */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search components by name (e.g. ESP32, Arduino, Ultrasonic, Resistor)..."
                className="pl-11 pr-16 h-12 bg-background/80 rounded-2xl border-border/70 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary text-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
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
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
              >
                <option value="featured">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Apple Segmented Bar Style) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 text-xs no-scrollbar">
            <span className="text-muted-foreground font-semibold shrink-0 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Filter:
            </span>
            {tags.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 shrink-0 text-xs active:scale-95 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border/60"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count & Reset */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 px-1">
          <span className="font-medium">
            Showing <strong className="text-foreground font-bold">{filteredComponents.length}</strong> electronic components
          </span>
          {selectedTag !== "All" && (
            <button
              onClick={() => setSelectedTag("All")}
              className="text-primary hover:underline font-semibold transition-colors"
            >
              Reset category filter
            </button>
          )}
        </div>

        {/* Components Grid */}
        {filteredComponents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 p-16 text-center bg-card/30 backdrop-blur-md">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40 animate-pulse" />
            <h3 className="text-lg font-bold text-foreground">No components found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              We couldn't find any components matching "{search}". Try another keyword or message Sujith for custom procurement.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 rounded-full px-5 h-10 text-xs font-semibold"
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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-border/70 bg-card/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                >
                  <CardContent className="p-5 flex flex-col flex-1">
                    {/* Component Photo Showcase (Customer Visual) */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted/30 mb-4 border border-border/60 shadow-inner group/img">
                      {component.image_url ? (
                        <img
                          src={component.image_url}
                          alt={component.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                            const fallback = e.currentTarget.parentElement?.querySelector(".fallback-tech-icon");
                            if (fallback) fallback.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      
                      <div className={`fallback-tech-icon h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-muted/40 to-muted/80 p-4 text-center ${component.image_url ? "hidden" : "flex"}`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner mb-1.5 transition-transform duration-300 group-hover:scale-110">
                          <Cpu className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Silicon & Hardware
                        </span>
                      </div>

                      {/* Stock Status Badge Overlay */}
                      <div className="absolute top-2.5 right-2.5 z-10 backdrop-blur-md">
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="text-[10px] font-bold rounded-full px-2.5 py-0.5 shadow-sm">
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="outline" className="text-[10px] font-bold rounded-full px-2.5 py-0.5 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-background/90 shadow-sm flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Low Stock ({component.stock_quantity})
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] font-bold rounded-full px-2.5 py-0.5 bg-background/90 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-sm flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            In Stock ({component.stock_quantity})
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Component Name */}
                    <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug tracking-tight">
                      {component.name}
                    </h3>

                    {/* Component Description */}
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3 flex-1 font-normal">
                      {component.description || "Bench-tested electronic component certified for maker projects, circuit builds, and prototyping."}
                    </p>

                    {/* Price & Actions Area */}
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <div className="flex items-baseline justify-between mb-3.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                            Direct Price
                          </span>
                          <span className="text-2xl font-extrabold tracking-tight text-foreground">
                            {formatPrice(component.price)}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Per Unit (GST Inc.)
                        </span>
                      </div>

                      {/* Quantity Controller & Add Button */}
                      <div className="flex items-center gap-2">
                        {/* Stepper with tactile scale */}
                        <div className="flex items-center border border-border/80 rounded-full h-10 bg-background/80 overflow-hidden shrink-0 shadow-inner">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(component.id, -1, component.stock_quantity)}
                            disabled={qty <= 1 || isOutOfStock}
                            className="px-3 h-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-all active:scale-75"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-foreground select-none">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(component.id, 1, component.stock_quantity)}
                            disabled={isOutOfStock || qty >= component.stock_quantity}
                            className="px-3 h-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-all active:scale-75"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          type="button"
                          onClick={() => handleAddToCart(component)}
                          disabled={isOutOfStock}
                          className={`flex-1 h-10 rounded-full gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm ${
                            isAdded
                              ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-600/20"
                              : "hover:shadow-md"
                          }`}
                        >
                          {isAdded ? (
                            <span className="animate-pop flex items-center gap-1.5">
                              <Check className="h-4 w-4 stroke-[3]" /> Added!
                            </span>
                          ) : isOutOfStock ? (
                            "Sold Out"
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
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
