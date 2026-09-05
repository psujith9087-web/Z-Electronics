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

export async function getAllOrders(): Promise<Order[]> {
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

    if (error || !data || data.length === 0) {
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
  try {
    if (!isSupabaseConfigured()) {
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (order) {
        order.status = status;
      }
      revalidatePath("/admin");
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
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    return { success: false, error: message };
  }
}

export async function getMyOrders(): Promise<Order[]> {
  return getAllOrders();
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
