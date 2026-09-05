import { createClient } from "@/lib/supabase/server";
import { ProductsClient } from "./products-client";
import { Product, Category } from "@/lib/types";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories:category_id (*)
    `)
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return <ProductsClient products={products || []} categories={categories || []} />;
}
