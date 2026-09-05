"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Component, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "sonner";

export default function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const inStock = product.stock_quantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock) {
      addItem(product, quantity);
      toast.success(`${quantity}x ${product.name} added to cart`);
      setQuantity(1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.min(product.stock_quantity, prev + 1));
  };

  return (
    <Link href={`/products/${product.slug}`} className="group h-full">
      <Card className="h-full overflow-hidden flex flex-col transition-all hover:border-primary/50 hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.images.length > 1 && (
                <Image
                  src={product.images[1]}
                  alt={`${product.name} alternate view`}
                  fill
                  className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <Component className="size-16 text-muted-foreground/30" />
          )}
          
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {!inStock && (
              <Badge variant="destructive" className="shadow-sm">Sold Out</Badge>
            )}
            {inStock && product.compare_at_price && product.compare_at_price > product.price && (
              <Badge className="bg-green-600 hover:bg-green-700 shadow-sm">Sale</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="mb-2 text-xs text-muted-foreground">
            {product.categories?.name || 'Component'}
          </div>
          <h3 className="font-medium text-foreground line-clamp-1 mb-2">
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="font-semibold text-lg">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          {inStock ? (
            <>
              <div className="flex items-center border border-input rounded-md h-9 overflow-hidden w-24 shrink-0">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="px-2 h-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="size-3" />
                </button>
                <div className="flex-1 text-center text-sm font-medium">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="px-2 h-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="size-3" />
                </button>
              </div>
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 h-9 gap-2"
                size="sm"
              >
                <ShoppingCart className="size-4" />
                Add
              </Button>
            </>
          ) : (
            <Button disabled className="w-full h-9" variant="secondary">
              Out of Stock
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
