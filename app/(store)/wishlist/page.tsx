import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWishlist } from "@/lib/actions/wishlist";
import ProductCard from "@/components/catalog/product-card";
import { Heart, PackageX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/wishlist");
  }

  const wishlistItems = await getWishlist();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="size-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
      </div>

      {!wishlistItems || wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed">
          <PackageX className="size-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Save items you like to your wishlist so you can easily find them later.
          </p>
          <Button render={<Link href="/shop" />}>
            Explore Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((item: any) => (
            item.products && (
              <ProductCard key={item.id} product={item.products as any} />
            )
          ))}
        </div>
      )}
    </div>
  );
}
