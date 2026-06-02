// ─── SKYKART — Shared TypeScript Types ────────────────────────────────────────
// These mirror the Pydantic schemas from the FastAPI backend.

// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  phone?: string;
  password: string;
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  parent_id?: string;
  created_at: string;
}

// ── Product ───────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  stock_quantity: number;
  sku?: string;
  image_urls: string[];
  thumbnail_url?: string;
  is_active: boolean;
  is_featured: boolean;
  avg_rating: number;
  review_count: number;
  tags: string[];
  category_id?: string;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  sort_by?: "created_at" | "price" | "avg_rating" | "name";
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  item_count: number;
  total_amount: number;
}

// ── Address ───────────────────────────────────────────────────────────────────
export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export type AddressCreate = Omit<Address, "id" | "user_id" | "created_at">;

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_charge: number;
  total_amount: number;
  coupon_code?: string;
  notes?: string;
  items: OrderItem[];
  address: Address;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export interface RazorpayOrderPayload {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  order_id: string;
  name: string;
  description: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  revenue_total: number;
  revenue_today: number;
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiError {
  detail: string | { msg: string; type: string }[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
