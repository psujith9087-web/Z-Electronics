// ============================================================
// Z-Electronics: Core TypeScript Type Definitions
// ============================================================

export interface ComponentItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  created_at?: string;
}

export type OrderStatus =
  | "Pending"
  | "Completed"
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: "Pending" | "Completed" | "paid" | "shipped" | "delivered" | "cancelled" | any;
  created_at: string;
  order_items?: OrderItem[];
  profiles?: any;
  guest_email?: string;
  guest_phone?: string;
  shipping_address?: any;
  payment_method?: "cod" | "razorpay" | "upi_qr" | string;
  payment_status?: "pending" | "paid" | "failed";
  payment_id?: string;
  tracking_number?: string;
  courier_name?: string;
  user_id?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  component_id: string;
  quantity: number;
  price_at_purchase: number;
  components?: ComponentItem;
  products?: any;
  product_id?: string | null;
  product_name_snapshot?: string;
  price_snapshot?: number;
  subtotal?: number;
}

export interface CartItem {
  component: ComponentItem;
  quantity: number;
  product?: any;
}

export interface OrderCreationData {
  customer_name: string;
  customer_phone: string;
  payment_method?: "cod" | "razorpay" | "upi_qr" | string;
  payment_status?: "pending" | "paid" | "failed";
  payment_id?: string;
  shipping_address?: any;
  items: {
    component_id: string;
    quantity: number;
    price: number;
    name?: string;
  }[];
}

export interface PaymentConfig {
  upiId: string;
  payeeName: string;
  qrImageUrl: string;
  phone: string;
  note?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayEnabled?: boolean;
  codEnabled?: boolean;
}

// ── Backwards compatibility types for legacy routes ──

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string;
  created_at?: string;
  children?: Category[];
  parent?: Category;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id?: string | null;
  price: number;
  compare_at_price?: number | null;
  sku?: string;
  stock_quantity: number;
  images?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "customer" | "admin";
  created_at: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export type SortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "oldest";

export interface ProductFilters {
  category_slug?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: SortOption;
  page?: number;
  per_page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CheckoutFormData {
  shipping_address: ShippingAddress;
  payment_method: "cod" | "online";
  guest_email?: string;
  guest_phone?: string;
}

export interface DashboardStats {
  total_products: number;
  total_orders: number;
  revenue: number;
  low_stock_count: number;
  pending_orders: number;
}

// Homepage Value Proposition Stat Card Type
export type StatCardIcon =
  | "Cpu"
  | "Truck"
  | "CheckCircle2"
  | "Headphones"
  | "ShieldCheck"
  | "Zap"
  | "Package"
  | "Clock"
  | "Sparkles"
  | "IndianRupee";

export type StatCardColor = "primary" | "emerald" | "blue" | "indigo" | "amber" | "rose";

export interface StatCard {
  id: string;
  icon: StatCardIcon;
  color: StatCardColor;
  title: string;
  subtitle: string;
}

export const DEFAULT_SITE_STATS: StatCard[] = [
  {
    id: "stat-1",
    icon: "Cpu",
    color: "primary",
    title: "500+",
    subtitle: "Components in Stock",
  },
  {
    id: "stat-2",
    icon: "Truck",
    color: "emerald",
    title: "Same Day",
    subtitle: "Dispatch Available",
  },
  {
    id: "stat-3",
    icon: "CheckCircle2",
    color: "blue",
    title: "100% Tested",
    subtitle: "Verified Hardware",
  },
  {
    id: "stat-4",
    icon: "Headphones",
    color: "indigo",
    title: "Direct Support",
    subtitle: "Owner Sujith",
  },
];

// Currency formatting helper in Indian Rupees (₹)
export function formatPrice(price: number): string {
  return `₹${Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// Slug generator helper
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
