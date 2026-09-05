"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleWishlist, checkWishlistStatus } from "@/lib/actions/wishlist";

export default function WishlistButton({ productId }: { productId: string }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const status = await checkWishlistStatus(productId);
          setIsInWishlist(status);
        } catch (error) {
          console.error("Failed to check wishlist status", error);
        }
      }
      setIsLoading(false);
    };
    checkStatus();
  }, [productId, supabase.auth]);

  const handleToggle = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.info("Please login to add to wishlist");
      router.push(`/login?redirect=/products`); // Simplified redirect handling
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleWishlist(productId);
      setIsInWishlist(result.added);
      if (result.added) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-12 w-12 shrink-0 bg-background"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`size-5 transition-colors ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}
