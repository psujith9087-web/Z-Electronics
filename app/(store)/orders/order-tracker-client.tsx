"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice, Order } from "@/lib/types";
import { CustomerSession } from "@/lib/actions/auth";
import { searchOrders } from "@/lib/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Phone,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface OrderTrackerClientProps {
  session: CustomerSession | null;
  initialOrders: Order[];
}

export function OrderTrackerClient({ session, initialOrders }: OrderTrackerClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      toast.error("Please enter a mobile number or Order ID");
      return;
    }

    setIsSearching(true);
    setSearched(true);
    try {
      const results = await searchOrders(q);
      setOrders(results);
      if (results.length === 0) {
        toast.info("No orders found matching this search.");
      } else {
        toast.success(`Found ${results.length} order(s).`);
      }
    } catch {
      toast.error("Error searching orders.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSearched(false);
    setOrders(initialOrders);
  };

  return (
    <div className="space-y-8">
      {/* Session Welcome Banner (if logged in) */}
      {session ? (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Welcome back, {session.name}!</h2>
                <Badge variant="outline" className="text-[10px] font-bold border-primary/40 text-primary">
                  Verified Customer
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>+91 {session.phone}</span>
                {session.email && (
                  <>
                    <span>•</span>
                    <span>{session.email}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold">
                Browse Components
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-muted/30 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Have a Customer Account?</h2>
            <p className="text-xs text-muted-foreground">
              Sign in with your mobile number or email to automatically sync and access all your orders.
            </p>
          </div>
          <Link href="/login?redirect=/orders">
            <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
              <User className="h-3.5 w-3.5" />
              Customer Sign In
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Search & Track Form */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Instant Order Tracking
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter your 10-digit mobile number or Order ID to track real-time fulfillment status.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter mobile number (e.g. 8072726924) or Order ID..."
              className="pl-10 h-11 bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSearching} className="h-11 px-6 font-bold text-xs gap-2">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track Order
            </Button>
            {searched && (
              <Button type="button" variant="ghost" onClick={handleReset} className="h-11 px-4 text-xs font-semibold">
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Orders List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span>
              {searched ? "Search Results" : session ? "Your Order History" : "Recent Orders"}
            </span>
            <Badge variant="secondary" className="text-xs font-mono">
              {orders.length}
            </Badge>
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center bg-muted/20 space-y-4">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">No orders found</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {searched
                  ? `No orders matching "${searchQuery}". Please check the phone number or order ID.`
                  : "You haven't placed any component orders yet with this account."}
              </p>
            </div>
            <div className="pt-2">
              <Link href="/">
                <Button size="sm" className="font-semibold text-xs">
                  Start Component Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const orderDate = new Date(order.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              });
              const isCompleted = order.status === "Completed";
              const itemCount = order.order_items?.length || 0;

              const cleanPhone = order.customer_phone.replace(/\D/g, "");
              const waText = encodeURIComponent(
                `Hello Sujith, I am inquiring about my Z-Electronics order #${order.id.slice(0, 8)} (${formatPrice(order.total_amount)}). Current status: ${order.status}.`
              );

              return (
                <Card
                  key={order.id}
                  className="border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left: Metadata & Status */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-mono font-extrabold text-sm text-foreground">
                            #{order.id.slice(0, 10).toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{orderDate}</span>
                          <Badge
                            variant={isCompleted ? "default" : "outline"}
                            className={`text-xs px-2.5 py-0.5 font-bold flex items-center gap-1.5 ${
                              isCompleted
                                ? "bg-emerald-600 text-white"
                                : "border-amber-500 text-amber-600 bg-amber-500/10"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 animate-pulse text-amber-600" />
                            )}
                            <span>{order.status.toUpperCase()}</span>
                          </Badge>
                        </div>

                        {/* Status Description banner */}
                        <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                          <span>
                            {isCompleted
                              ? "Order verified, inspected and fulfilled by proprietor Sujith."
                              : "Order placed. Proprietor Sujith is currently verifying component specs and inventory."}
                          </span>
                        </div>

                        {/* Customer & Component count info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {order.customer_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {order.customer_phone}
                          </span>
                          {itemCount > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {itemCount} component type{itemCount > 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div className="lg:text-right">
                          <span className="text-xs text-muted-foreground block">Order Total</span>
                          <span className="text-2xl font-black text-primary">
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <a
                            href={`https://wa.me/918072726924?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span> Sujith
                            </Button>
                          </a>

                          <Link href={`/orders/${order.id}`}>
                            <Button size="sm" className="gap-1.5 text-xs font-bold shadow-sm">
                              <span>Track Status</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
