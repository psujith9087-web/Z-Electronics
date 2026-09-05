import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ProductCard from "@/components/catalog/product-card";

export default async function FeaturedProducts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(8);

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row mb-10">
          <div>
            <Badge variant="outline" className="mb-2 text-primary border-primary/30">Featured</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Top Selling Components
            </h2>
          </div>
          <Button render={<Link href="/shop" />} variant="outline">
            View All Products
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
