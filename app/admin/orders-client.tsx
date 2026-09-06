"use client";

import { useState } from "react";
import { Order, OrderStatus, formatPrice } from "@/lib/types";
import {
  updateOrderStatus,
  deleteOrder,
  resetAllOrders,
  confirmCodPayment,
  updateOrderTracking,
} from "@/lib/actions/orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Phone,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  Loader2,
  ExternalLink,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CreditCard,
  Truck,
  Check,
  Send,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrdersClientProps {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // View items modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Tracking state in details dialog
  const [courierInput, setCourierInput] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  // Reset All Orders Dialog state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Delete Single Order Dialog state
  const [isSingleDeleteOpen, setIsSingleDeleteOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    return true;
  });

  const handleStatusToggle = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus: OrderStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    setUpdatingId(orderId);

    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        toast.success(`Order #${orderId.slice(0, 8)} status updated to ${nextStatus}!`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      } else {
        toast.error(res.error || "Failed to update order status.");
      }
    } catch {
      toast.error("Error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmCod = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await confirmCodPayment(orderId);
      if (res.success) {
        toast.success(`Payment confirmed for Order #${orderId.slice(0, 8)}! Marked as Completed.`);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "Completed", payment_status: "paid" }
              : o
          )
        );
      } else {
        toast.error(res.error || "Failed to confirm payment.");
      }
    } catch {
      toast.error("Error confirming payment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    if (!courierInput.trim() || !trackingInput.trim()) {
      toast.error("Please enter both courier name and tracking number.");
      return;
    }

    setIsSavingTracking(true);
    try {
      const res = await updateOrderTracking(selectedOrder.id, courierInput, trackingInput);
      if (res.success) {
        toast.success("Shipment tracking details saved! Customer can now track their parcel.");
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  status: "shipped",
                  courier_name: courierInput.trim(),
                  tracking_number: trackingInput.trim(),
                }
              : o
          )
        );
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: "shipped",
                courier_name: courierInput.trim(),
                tracking_number: trackingInput.trim(),
              }
            : null
        );
      } else {
        toast.error(res.error || "Failed to save tracking.");
      }
    } catch {
      toast.error("Error saving tracking.");
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleResetAllOrders = async () => {
    setIsResetting(true);
    try {
      const res = await resetAllOrders();
      if (res.success) {
        setOrders([]);
        setIsResetOpen(false);
        toast.success("All previous orders have been cleared. You are ready to start fresh!");
      } else {
        toast.error(res.error || "Failed to reset orders.");
      }
    } catch {
      toast.error("Error resetting orders.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteSingleOrder = async () => {
    if (!deletingOrderId) return;
    setIsDeletingSingle(true);
    try {
      const res = await deleteOrder(deletingOrderId);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== deletingOrderId));
        setIsSingleDeleteOpen(false);
        setDeletingOrderId(null);
        toast.success("Order removed from system.");
      } else {
        toast.error(res.error || "Failed to delete order.");
      }
    } catch {
      toast.error("Error deleting order.");
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setCourierInput(order.courier_name || "");
    setTrackingInput(order.tracking_number || "");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Customer Orders & Fulfillment
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage incoming hardware orders, confirm COD cash payments, and provide live dispatch tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 text-xs border">
            {(["All", "Pending", "Completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-background text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsResetOpen(true)}
            className="text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 h-8.5"
            title="Clear all previous orders and start fresh"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-2xl border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, phone, or order ID..."
            className="pl-9 h-10 bg-background text-sm rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <tr className="border-b bg-muted/40 text-xs font-extrabold uppercase text-muted-foreground">
              <TableHead className="py-3.5 px-4">Order ID & Date</TableHead>
              <TableHead className="py-3.5 px-4">Customer & Contact</TableHead>
              <TableHead className="py-3.5 px-4 text-right">Amount & Payment</TableHead>
              <TableHead className="py-3.5 px-4 text-center">Status</TableHead>
              <TableHead className="py-3.5 px-4 text-center">Payment Action</TableHead>
              <TableHead className="py-3.5 px-4 text-right">Details</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                  No orders found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const isUpdating = updatingId === order.id;
                const formattedDate = new Date(order.created_at).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                });

                const isPaid =
                  order.payment_status === "paid" ||
                  order.status === "Completed" ||
                  order.status === "paid";

                const isCod = order.payment_method === "cod" || !order.payment_method;

                const cleanPhone = order.customer_phone.replace(/\D/g, "");
                const waText = encodeURIComponent(
                  `Hello ${order.customer_name}, this is Sujith from Z-Electronics regarding your order #${order.id.slice(0, 8)} for ${formatPrice(order.total_amount)}.`
                );

                return (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4 px-4">
                      <span className="font-mono font-extrabold text-foreground text-xs block">
                        #{order.id.slice(0, 10).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{formattedDate}</span>
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      <span className="font-bold text-foreground text-sm block">
                        {order.customer_name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                        >
                          <Phone className="h-3 w-3" />
                          {order.customer_phone}
                        </a>
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold"
                        >
                          <MessageSquare className="h-3 w-3" />
                          WhatsApp
                        </a>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4 text-right">
                      <span className="font-extrabold text-foreground text-sm block">
                        {formatPrice(order.total_amount)}
                      </span>
                      <div className="pt-0.5">
                        {order.payment_method === "razorpay" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            <CreditCard className="w-3 h-3" /> Razorpay ({isPaid ? "Paid" : "Pending"})
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isPaid
                                ? "text-emerald-600 bg-emerald-500/10"
                                : "text-amber-600 bg-amber-500/10"
                            }`}
                          >
                            <Truck className="w-3 h-3" /> {isPaid ? "COD (Paid & Verified)" : "COD (Unpaid)"}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4 text-center">
                      <Badge
                        className={`text-[11px] font-extrabold ${
                          isPaid
                            ? "bg-emerald-600 text-white"
                            : "border-amber-500 text-amber-600 bg-amber-500/10"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 px-4 text-center">
                      {isCod && !isPaid ? (
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleConfirmCod(order.id)}
                          className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 rounded-xl hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                              Confirm Payment & Complete
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => handleStatusToggle(order.id, order.status)}
                          className="h-8 text-xs font-semibold rounded-xl"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : order.status === "Pending" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                              Mark Completed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1 text-amber-600" />
                              Revert to Pending
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>

                    <TableCell className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="h-8 gap-1 text-[11px] font-bold rounded-xl"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>

                        <Link href={`/orders/${order.id}`} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-[11px] font-bold rounded-xl text-primary"
                            title="View customer tracking page"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingOrderId(order.id);
                            setIsSingleDeleteOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-xl"
                          title="Delete Order"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* -- ORDER DETAILS MODAL ----------------------------------------- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black">
              Order #{selectedOrder?.id.slice(0, 10).toUpperCase()} Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review customer information, payment verification, and update shipment tracking.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 pt-2">
              {/* Customer & Payment summary card */}
              <div className="p-4 rounded-2xl bg-muted/40 border text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <strong className="text-foreground">{selectedOrder.customer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <strong className="text-foreground">{selectedOrder.customer_phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <strong className="text-foreground uppercase">{selectedOrder.payment_method || "COD"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <strong className={selectedOrder.payment_status === "paid" || selectedOrder.status === "Completed" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                    {selectedOrder.payment_status === "paid" || selectedOrder.status === "Completed" ? "PAID & CONFIRMED" : "PAYMENT PENDING"}
                  </strong>
                </div>
                {selectedOrder.payment_id && (
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground font-sans">Payment Ref ID:</span>
                    <strong className="text-foreground">{selectedOrder.payment_id}</strong>
                  </div>
                )}
                {selectedOrder.shipping_address?.address_line && (
                  <div className="pt-1 border-t flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      {selectedOrder.shipping_address.address_line}, {selectedOrder.shipping_address.city} ({selectedOrder.shipping_address.pincode})
                    </span>
                  </div>
                )}
              </div>

              {/* Shipment Tracking Updater */}
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Update Shipment Tracking</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Courier (e.g. DTDC, India Post)"
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    className="h-9 text-xs bg-background rounded-xl"
                  />
                  <Input
                    placeholder="Tracking No. / AWB"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="h-9 text-xs bg-background rounded-xl font-mono"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={isSavingTracking}
                  onClick={handleSaveTracking}
                  className="w-full h-8 text-xs font-bold rounded-xl gap-1.5"
                >
                  {isSavingTracking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Save Tracking & Mark Shipped
                </Button>
              </div>

              {/* Itemized Table */}
              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Component</th>
                      <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                      <th className="py-2.5 px-3 text-right font-bold">Price</th>
                      <th className="py-2.5 px-3 text-right font-bold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      selectedOrder.order_items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            {item.components?.name || `Component (${item.component_id.slice(0, 8)})`}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">
                            {formatPrice(Number(item.price_at_purchase))}
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-foreground">
                            {formatPrice(Number(item.price_at_purchase) * item.quantity)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground text-xs">
                          No items recorded for this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center px-1 text-sm border-t pt-3">
                <span className="text-muted-foreground font-bold">Order Total:</span>
                <span className="text-xl font-black text-primary">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* -- RESET ALL ORDERS CONFIRMATION DIALOG ------------------------ */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-1">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-lg font-black">Reset All Orders & Start Fresh?</DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed pt-2">
              This action will permanently delete <strong>all previous orders</strong> and line items from the database. 
              <br /><br />
              Use this option when you want a clean slate for new incoming customer orders. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetOpen(false)}
              disabled={isResetting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleResetAllOrders}
              disabled={isResetting}
              className="gap-1.5 font-bold bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Resetting Database...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Yes, Reset All Orders
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -- SINGLE ORDER DELETION DIALOG ---------------------------------- */}
      <Dialog open={isSingleDeleteOpen} onOpenChange={setIsSingleDeleteOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-bold">Delete Order?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete order #{deletingOrderId?.slice(0, 10).toUpperCase()}? This will remove this order permanently.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSingleDeleteOpen(false)}
              disabled={isDeletingSingle}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSingleOrder}
              disabled={isDeletingSingle}
              className="gap-1.5 font-bold bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {isDeletingSingle ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
