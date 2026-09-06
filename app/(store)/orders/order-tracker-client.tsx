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
  CreditCard,
  Truck,
  Cpu,
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
        <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xl shadow">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-foreground">Welcome back, {session.name}!</h2>
                <Badge className="text-[10px] font-extrabold bg-primary text-primary-foreground">
                  Logged In Customer
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 font-medium">
                <Phone className="h-3.5 w-3.5 text-emerald-500" />
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
            <Link href="/shop" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full text-xs font-bold rounded-xl hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
                Browse Components
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-border/80 bg-muted/30 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-black text-foreground">Track via Your Account or Phone</h2>
            <p className="text-xs text-muted-foreground font-medium">
              Log into your account to automatically load your hardware order history, or enter your phone number below.
            </p>
          </div>
          <Link href="/login?redirect=/orders">
            <Button size="sm" className="font-extrabold text-xs gap-1.5 shadow rounded-xl hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
              <User className="h-3.5 w-3.5" />
              Sign In to Account
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Search & Track Form */}
      <div className="bg-card border-2 rounded-3xl p-6 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            Live Package & Order Lookup
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Enter your 10-digit mobile number or Order ID to inspect component testing and dispatch progress.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter mobile number (e.g. 8072726924) or Order ID..."
              className="pl-10 h-11 bg-background text-sm rounded-2xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isSearching}
              className="h-11 px-6 font-extrabold text-xs gap-2 rounded-2xl shadow hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track Order
            </Button>
            {searched && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="h-11 px-4 text-xs font-bold rounded-2xl"
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Orders List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span>
              {searched ? "Search Results" : session ? "Your Order History" : "Recent Orders"}
            </span>
            <Badge variant="secondary" className="text-xs font-mono font-bold">
              {orders.length}
            </Badge>
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed p-12 text-center bg-muted/10 space-y-4">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">No orders found</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 font-medium">
                {searched
                  ? `No orders matching "${searchQuery}". Please verify your phone number or Order ID.`
                  : "You haven't placed any electronic component orders yet with this account."}
              </p>
            </div>
            <div className="pt-2">
              <Link href="/shop">
                <Button size="sm" className="font-bold text-xs rounded-xl shadow hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
                  Browse Components Catalog
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
              const isCompleted = order.status === "Completed" || order.status === "delivered";
              const isPaid =
                order.payment_status === "paid" ||
                order.status === "Completed" ||
                order.status === "paid";

              const itemCount = order.order_items?.length || 0;

              const cleanPhone = order.customer_phone.replace(/\D/g, "");
              const waText = encodeURIComponent(
                `Hello Sujith, I am inquiring about my Z-Electronics order #${order.id.slice(0, 8)} (${formatPrice(order.total_amount)}). Current status: ${order.status}.`
              );

              return (
                <Card
                  key={order.id}
                  className="border-2 rounded-3xl shadow-xs hover:shadow-md transition-all overflow-hidden bg-card"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left: Metadata & Status */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-mono font-black text-sm text-foreground">
                            #{order.id.slice(0, 10).toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground font-medium">{orderDate}</span>
                          <Badge
                            className={`text-xs px-2.5 py-0.5 font-extrabold flex items-center gap-1.5 ${
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

                          {/* Payment tag */}
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              isPaid
                                ? "text-emerald-600 bg-emerald-500/10"
                                : "text-amber-600 bg-amber-500/10"
                            }`}
                          >
                            {order.payment_method === "razorpay" ? (
                              <>
                                <CreditCard className="w-3 h-3" /> Razorpay ({isPaid ? "Paid" : "Pending"})
                              </>
                            ) : (
                              <>
                                <Truck className="w-3 h-3" /> {isPaid ? "COD (Paid)" : "COD (Payment Pending)"}
                              </>
                            )}
                          </span>
                        </div>

                        {/* Item previews (Thumbnails & descriptions) */}
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {order.order_items.slice(0, 4).map((item, idx) => {
                              const name = item.components?.name || "Component";
                              return (
                                <div
                                  key={item.id || idx}
                                  className="flex items-center gap-2 bg-muted/40 rounded-xl px-2.5 py-1 text-xs border"
                                  title={name}
                                >
                                  {item.components?.image_url ? (
                                    <img
                                      src={item.components.image_url}
                                      alt={name}
                                      className="h-5 w-5 rounded object-cover"
                                    />
                                  ) : (
                                    <Cpu className="h-3.5 w-3.5 text-primary" />
                                  )}
                                  <span className="font-semibold text-foreground truncate max-w-[130px]">
                                    {name}
                                  </span>
                                  <span className="text-[10px] font-bold text-muted-foreground">
                                    ×{item.quantity}
                                  </span>
                                </div>
                              );
                            })}
                            {order.order_items.length > 4 && (
                              <span className="text-xs text-muted-foreground font-bold pl-1">
                                +{order.order_items.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Customer info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5 font-medium">
                          <span className="flex items-center gap-1 text-foreground font-bold">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {order.customer_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="h-3.5 w-3.5 text-emerald-500" />
                            +91 {order.customer_phone}
                          </span>
                        </div>
                      </div>

                      {/* Right: Amount & Action button */}
                      <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div className="lg:text-right">
                          <span className="text-xs text-muted-foreground block font-bold">Order Total</span>
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
                              className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-bold rounded-xl hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span> Sujith
                            </Button>
                          </a>

                          <Link href={`/orders/${order.id}`}>
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs font-black shadow rounded-xl hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                            >
                              <span>View &amp; Track</span>
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
