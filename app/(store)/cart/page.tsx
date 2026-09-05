"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Minus, Plus, Cpu, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/types";

// Hydration-safe store reader
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function CartPage() {
  const isClient = useIsClient();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  if (!isClient) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading your cart...</div>
      </div>
    );
  }

  const subtotal = totalPrice();
  const total = subtotal;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="h-20 w-20 rounded-full bg-muted/60 flex items-center justify-center mb-6">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Your project cart is empty
        </h1>
        <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
          You haven&apos;t added any electronic components to your project order yet. Browse our catalog for microcontrollers, sensors, and ICs.
        </p>
        <Link href="/">
          <Button size="lg" className="h-12 px-8 gap-2 font-semibold">
            <Cpu className="h-4 w-4" />
            Explore Component Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Project Order Cart
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your selected electronics components before generating your project invoice.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => clearCart()}
          className="text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Cart
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
            {/* Table Header for desktop */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:grid">
              <div className="col-span-6">Component</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <ul className="divide-y divide-border/60">
              {items.map(({ component, quantity }) => (
                <li
                  key={component.id}
                  className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 hover:bg-muted/20 transition-colors"
                >
                  {/* Component Info */}
                  <div className="col-span-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug">
                        {component.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {component.description || "Certified electronics component"}
                      </p>
                      <span className="text-xs font-semibold text-primary sm:hidden mt-2 inline-block">
                        {formatPrice(component.price)} each
                      </span>
                    </div>
                  </div>

                  {/* Unit Price (desktop) */}
                  <div className="col-span-2 text-center hidden sm:block text-sm font-semibold text-foreground">
                    {formatPrice(component.price)}
                  </div>

                  {/* Quantity controls */}
                  <div className="col-span-2 flex items-center justify-between sm:justify-center w-full">
                    <div className="flex items-center border border-input rounded-lg h-9 bg-background overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(component.id, quantity - 1)}
                        className="px-2.5 h-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(component.id, quantity + 1)}
                        className="px-2.5 h-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        disabled={quantity >= component.stock_quantity}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Total & Delete Action */}
                  <div className="col-span-2 flex items-center justify-between sm:justify-end gap-3 w-full">
                    <span className="text-sm font-bold text-foreground sm:text-base">
                      {formatPrice(Number(component.price) * quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(component.id)}
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="border rounded-2xl bg-card p-6 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-foreground border-b pb-4">
              Project Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST / Taxes</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Included</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Order Processing</span>
                <span className="font-medium text-foreground">Direct Handover / Dispatch</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total Payable</span>
                <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Visual Invoice / Bill generated immediately upon checkout.
              </p>
            </div>

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full h-12 gap-2 text-base font-bold shadow-md hover:shadow-lg">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="rounded-xl bg-muted/40 p-4 border text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Ordering for College/Business?</p>
              <p>
                Owner Sujith will verify stock availability and prepare your items immediately upon order placement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
