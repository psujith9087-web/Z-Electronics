"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_ORDERS, MOCK_COMPONENTS } from "@/lib/mock-data";
import { Order, OrderStatus, OrderCreationData } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function createOrder(data: OrderCreationData): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const { customer_name, customer_phone, items } = data;

    if (!customer_name?.trim() || !customer_phone?.trim()) {
      return { success: false, error: "Customer name and phone number are required." };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty. Please add components before placing an order." };
    }

    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    if (!isSupabaseConfigured()) {
      const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      const createdOrder: Order = {
        id: newOrderId,
        customer_name,
        customer_phone,
        total_amount,
        status: "Pending",
        created_at: new Date().toISOString(),
        order_items: items.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          order_id: newOrderId,
          component_id: item.component_id,
          quantity: item.quantity,
          price_at_purchase: item.price,
          components: MOCK_COMPONENTS.find((c) => c.id === item.component_id) || {
            id: item.component_id,
            name: item.name || "Electronic Component",
            description: "",
            price: item.price,
            stock_quantity: 10,
            created_at: new Date().toISOString(),
          },
        })),
      };

      MOCK_ORDERS.unshift(createdOrder);
      revalidatePath("/admin");
      revalidatePath("/");
      return { success: true, data: createdOrder };
    }

    const supabase = await createClient();

    // 1. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customer_name.trim(),
          customer_phone: customer_phone.trim(),
          total_amount,
          status: "Pending",
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      return { success: false, error: orderError?.message || "Failed to create order." };
    }

    // 2. Insert into order_items table
    const orderItemsToInsert = items.map((item) => ({
      order_id: orderData.id,
      component_id: item.component_id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Error inserting order items:", itemsError);
    }

    // 3. Fetch full order with components
    const { data: fullOrder } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          components (*)
        )
      `)
      .eq("id", orderData.id)
      .single();

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, data: (fullOrder || orderData) as Order };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred while placing your order.";
    return { success: false, error: message };
  }
}

import { getCustomerSession } from "@/lib/actions/auth";
import { checkAdminSession } from "@/lib/actions/admin-auth";

export async function getAllOrders(): Promise<Order[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return [];
  }

  try {
    if (!isSupabaseConfigured()) {
      return MOCK_ORDERS;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          components (*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return MOCK_ORDERS;
    }

    return data as Order[];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return MOCK_ORDERS;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    if (!isSupabaseConfigured()) {
      const found = MOCK_ORDERS.find((o) => o.id === id);
      return found || null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          components (*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return MOCK_ORDERS.find((o) => o.id === id) || null;
    }

    return data as Order;
  } catch (err) {
    console.error("Error fetching order by id:", err);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    if (!isSupabaseConfigured()) {
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (order) {
        order.status = status;
      }
      revalidatePath("/admin");
      revalidatePath("/orders");
      revalidatePath(`/orders/${orderId}`);
      return { success: true };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    return { success: false, error: message };
  }
}

export async function getMyOrders(phoneOverride?: string): Promise<Order[]> {
  try {
    let targetPhone = phoneOverride?.replace(/\D/g, "");

    if (!targetPhone) {
      const session = await getCustomerSession();
      if (session?.phone) {
        targetPhone = session.phone.replace(/\D/g, "");
      }
    }

    if (!targetPhone) {
      return [];
    }

    if (!isSupabaseConfigured()) {
      return MOCK_ORDERS.filter((o) => o.customer_phone.replace(/\D/g, "").includes(targetPhone!));
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          components (*)
        )
      `)
      .ilike("customer_phone", `%${targetPhone}%`)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as Order[];
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    return [];
  }
}

export async function searchOrders(query: string): Promise<Order[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Sanitize input to prevent PostgREST/SQL filter injection
  const cleanTerm = trimmed.replace(/[%()'",.;:\\]/g, "").trim();
  if (!cleanTerm) return [];

  try {
    if (!isSupabaseConfigured()) {
      const cleanQ = cleanTerm.toLowerCase();
      return MOCK_ORDERS.filter(
        (o) =>
          o.id.toLowerCase().includes(cleanQ) ||
          o.customer_phone.includes(cleanQ) ||
          o.customer_name.toLowerCase().includes(cleanQ)
      );
    }

    const supabase = await createClient();
    const digitsOnly = cleanTerm.replace(/\D/g, "");

    let ordersQuery = supabase.from("orders").select(`
      *,
      order_items (
        *,
        components (*)
      )
    `);

    if (digitsOnly.length >= 7) {
      ordersQuery = ordersQuery.ilike("customer_phone", `%${digitsOnly}%`);
    } else {
      ordersQuery = ordersQuery.or(`id.ilike.%${cleanTerm}%,customer_name.ilike.%${cleanTerm}%`);
    }

    const { data, error } = await ordersQuery.order("created_at", { ascending: false }).limit(10);

    if (error || !data) {
      return [];
    }

    return data as Order[];
  } catch (err) {
    console.error("Error searching orders:", err);
    return [];
  }
}

export async function getOrderStats() {
  const orders = await getAllOrders();
  const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pending_orders = orders.filter((o) => o.status === "Pending").length;
  return {
    total_products: 16,
    total_orders: orders.length,
    revenue,
    low_stock_count: 2,
    pending_orders,
  };
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    if (!isSupabaseConfigured()) {
      const idx = MOCK_ORDERS.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        MOCK_ORDERS.splice(idx, 1);
      }
      revalidatePath("/admin");
      revalidatePath("/orders");
      return { success: true };
    }

    const supabase = await createClient();

    // 1. Delete associated order items first to satisfy foreign key
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.warn("Notice while deleting order items:", itemsError);
    }

    // 2. Delete the order
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      return { success: false, error: orderError.message };
    }

    revalidatePath("/admin");
    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete order.";
    return { success: false, error: msg };
  }
}

export async function resetAllOrders(): Promise<{ success: boolean; error?: string; count?: number }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    if (!isSupabaseConfigured()) {
      const count = MOCK_ORDERS.length;
      MOCK_ORDERS.length = 0;
      revalidatePath("/admin");
      revalidatePath("/orders");
      return { success: true, count };
    }

    const supabase = await createClient();

    // 1. Delete all order items first
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (itemsError) {
      console.warn("Notice while clearing order items:", itemsError);
    }

    // 2. Delete all orders
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (ordersError) {
      return { success: false, error: ordersError.message };
    }

    revalidatePath("/admin");
    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reset orders.";
    return { success: false, error: msg };
  }
}

