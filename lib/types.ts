// ============================================================
// Z-Electronics: TypeScript Type Definitions
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Component {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shipping_address: string;
  is_project_order: boolean;
  project_description: string | null;
  created_at: string;
  // Joined fields
  profiles?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  component_id: string;
  quantity: number;
  unit_price: number;
  // Joined
  components?: Component;
}

export interface CartItem {
  component: Component;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface ComponentFilters {
  category?: string;
  search?: string;
}

export interface CheckoutFormData {
  shipping_address: string;
  is_project_order: boolean;
  project_description?: string;
}
