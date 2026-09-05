"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Package, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/types";
import type { Product } from "@/lib/types";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import Link from "next/link";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    async function searchProducts() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .ilike("name", `%${debouncedQuery}%`)
        .eq("is_active", true)
        .limit(8);

      setResults((data as Product[]) || []);
      setIsLoading(false);
    }

    searchProducts();
  }, [debouncedQuery, supabase]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="container mx-auto max-w-3xl pt-8 px-4 flex-1 flex flex-col">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for components, boards, sensors..."
            className="flex-1 bg-transparent text-xl outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : query.trim() !== "" && results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products found for "{query}"
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted shrink-0">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-medium">{product.name}</h4>
                    {product.categories && (
                      <p className="text-xs text-muted-foreground">{product.categories.name}</p>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap font-medium">
                    {formatPrice(product.price)}
                  </div>
                </Link>
              ))}
              
              {results.length > 0 && (
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-center py-4 text-sm font-medium text-primary hover:underline"
                >
                  View all results
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
