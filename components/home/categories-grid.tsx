import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Cpu, CircuitBoard, Microchip, Zap, Radio, Battery, Wifi, Cable, Component } from "lucide-react";

// Mapping category names to lucide icons (fallback to Component icon)
const getIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('microcontroller') || lower.includes('arduino')) return Cpu;
  if (lower.includes('sensor')) return Radio;
  if (lower.includes('power') || lower.includes('battery')) return Battery;
  if (lower.includes('wireless') || lower.includes('rf')) return Wifi;
  if (lower.includes('cable') || lower.includes('wire')) return Cable;
  if (lower.includes('circuit') || lower.includes('pcb')) return CircuitBoard;
  if (lower.includes('ic') || lower.includes('chip')) return Microchip;
  if (lower.includes('active') || lower.includes('transistor')) return Zap;
  return Component;
};

export default async function CategoriesGrid() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("name");

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Find the right components for your next project
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = getIcon(category.name);
            return (
              <Link key={category.id} href={`/collections/${category.slug}`}>
                <Card className="group relative overflow-hidden border-border/50 bg-background transition-all hover:border-primary/50 hover:shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
