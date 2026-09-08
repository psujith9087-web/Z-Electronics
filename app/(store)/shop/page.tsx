import { getComponents } from "@/lib/actions/components";
import { ComponentCatalog } from "@/components/catalog/component-catalog";

export const revalidate = 0; // Fresh inventory

export default async function ShopPage() {
  const components = await getComponents();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[70vh]">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Electronics Component Catalog
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Explore our certified stock of microcontrollers, sensors, modules, and hardware.
        </p>
      </div>
      <ComponentCatalog components={components} />
    </div>
  );
}
