"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { Product } from "@/lib/types";
import { toast } from "sonner";

export default function AddToCartSection({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stock_quantity > 0;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock_quantity, prev + 1));
  };

  const handleAddToCart = () => {
    if (inStock) {
      addItem(product, quantity);
      toast.success(`${quantity}x ${product.name} added to cart`);
      setQuantity(1);
    }
  };

  if (!inStock) {
    return (
      <Button disabled className="w-full sm:w-auto h-12 px-8" variant="secondary">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-1">
      <div className="flex items-center border border-input rounded-md h-12 overflow-hidden w-full sm:w-32 shrink-0 bg-background">
        <button
          type="button"
          onClick={handleDecrease}
          className="px-4 h-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          disabled={quantity <= 1}
        >
          <Minus className="size-4" />
        </button>
        <div className="flex-1 text-center font-medium">
          {quantity}
        </div>
        <button
          type="button"
          onClick={handleIncrease}
          className="px-4 h-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          disabled={quantity >= product.stock_quantity}
        >
          <Plus className="size-4" />
        </button>
      </div>
      
      <Button 
        onClick={handleAddToCart} 
        className="flex-1 h-12 gap-2 text-base shadow-md"
      >
        <ShoppingCart className="size-5" />
        Add to Cart
      </Button>
    </div>
  );
}
