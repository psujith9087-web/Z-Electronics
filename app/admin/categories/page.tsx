import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "./categories-client";
import { Category } from "@/lib/types";

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Fetch categories with children
  const { data: categories } = await supabase
    .from("categories")
    .select("*, children:categories(*)")
    .is("parent_id", null)
    .order("name", { ascending: true });

  // Fetch product counts per category manually as an aggregate query or fetch all products
  const { data: products } = await supabase.from("products").select("category_id");
  
  const productCountMap = products?.reduce((acc: any, p: any) => {
    if (p.category_id) {
      acc[p.category_id] = (acc[p.category_id] || 0) + 1;
    }
    return acc;
  }, {});

  const categoriesWithCounts = categories?.map((cat: any) => ({
    ...cat,
    product_count: productCountMap?.[cat.id] || 0,
    children: cat.children?.map((child: any) => ({
      ...child,
      product_count: productCountMap?.[child.id] || 0
    }))
  }));

  // Fetch flat categories for dropdowns
  const { data: flatCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return <CategoriesClient categories={categoriesWithCounts || []} flatCategories={flatCategories || []} />;
}
