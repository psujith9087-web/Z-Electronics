import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Component } from "lucide-react";
import { formatPrice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import AddToCartSection from "./add-to-cart-section";
import WishlistButton from "./wishlist-button";
import ProductCard from "@/components/catalog/product-card";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("name, description").eq("slug", slug).single();
  
  if (!product) return { title: "Product Not Found" };
  
  return {
    title: `${product.name} | Z-Electronics`,
    description: product.description || `Buy ${product.name} at Z-Electronics.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("is_active", true)
    .limit(4);

  const inStock = product.stock_quantity > 0;
  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="mx-2 size-4" />
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="mx-2 size-4" />
        {product.categories && (
          <>
            <Link href={`/collections/${product.categories.slug}`} className="hover:text-primary">
              {product.categories.name}
            </Link>
            <ChevronRight className="mx-2 size-4" />
          </>
        )}
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted flex items-center justify-center border">
            {hasImages ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                <Component className="size-24 mb-4" />
                <span>No image available</span>
              </div>
            )}
            
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {!inStock && (
                <Badge variant="destructive" className="shadow-md text-sm px-3 py-1">Sold Out</Badge>
              )}
              {inStock && product.compare_at_price && product.compare_at_price > product.price && (
                <Badge className="bg-green-600 shadow-md text-sm px-3 py-1">Sale</Badge>
              )}
            </div>
          </div>
          
          {hasImages && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <div key={idx} className="relative size-24 rounded-lg overflow-hidden border bg-muted shrink-0 cursor-pointer hover:border-primary">
                  <Image src={img} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {product.categories && (
            <div className="mb-2">
              <Link href={`/collections/${product.categories.slug}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {product.categories.name}
                </Badge>
              </Link>
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <div className="prose prose-sm sm:prose-base dark:prose-invert mb-8 text-muted-foreground">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>No description provided for this component.</p>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className={`size-3 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {inStock ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <AddToCartSection product={product as any} />
              <WishlistButton productId={product.id} />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground border-t pt-6 mt-auto">
            <p className="mb-1"><span className="font-medium text-foreground">SKU:</span> {product.sku || 'N/A'}</p>
            <p><span className="font-medium text-foreground">Category:</span> {product.categories?.name || 'Uncategorized'}</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-16 border-t">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Related Components</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
