/**
 * SKYKART — API Service Layer
 * ─────────────────────────────
 * One file per domain — thin wrappers around the Axios client.
 * Components never call `api` directly; they call these services.
 */

import { api, setTokens, clearTokens } from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  Product,
  ProductListResponse,
  ProductFilters,
  Category,
  Cart,
  Address,
  AddressCreate,
  Order,
  OrderListResponse,
  RazorpayOrderPayload,
  AdminStats,
} from "@/types";

// ════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const authService = {
  async register(data: RegisterRequest): Promise<User> {
    const res = await api.post<User>("/auth/register", data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/login", data);
    setTokens(res.data.access_token, res.data.refresh_token);
    return res.data;
  },

  async logout(): Promise<void> {
    clearTokens();
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

// ════════════════════════════════════════════════════════════════════════════
// PRODUCT SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const productService = {
  async list(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const res = await api.get<ProductListResponse>("/products", { params: filters });
    return res.data;
  },

  async getBySlug(slug: string): Promise<Product> {
    const res = await api.get<Product>(`/products/${slug}`);
    return res.data;
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    const res = await api.get<Product[]>("/products/featured", { params: { limit } });
    return res.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get<Category[]>("/categories");
    return res.data;
  },

  // Admin
  async create(data: Partial<Product>): Promise<Product> {
    const res = await api.post<Product>("/products", data);
    return res.data;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const res = await api.patch<Product>(`/products/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await api.post<Category>("/categories", data);
    return res.data;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// CART SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const cartService = {
  async get(): Promise<Cart> {
    const res = await api.get<Cart>("/cart");
    return res.data;
  },

  async addItem(productId: string, quantity = 1): Promise<Cart> {
    const res = await api.post<Cart>("/cart/items", {
      product_id: productId,
      quantity,
    });
    return res.data;
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const res = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await api.delete<Cart>(`/cart/items/${itemId}`);
    return res.data;
  },

  async clear(): Promise<void> {
    await api.delete("/cart");
  },
};

// ════════════════════════════════════════════════════════════════════════════
// USER SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const userService = {
  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.patch<User>("/users/profile", data);
    return res.data;
  },

  async getAddresses(): Promise<Address[]> {
    const res = await api.get<Address[]>("/users/addresses");
    return res.data;
  },

  async addAddress(data: AddressCreate): Promise<Address> {
    const res = await api.post<Address>("/users/addresses", data);
    return res.data;
  },

  async updateAddress(id: string, data: AddressCreate): Promise<Address> {
    const res = await api.put<Address>(`/users/addresses/${id}`, data);
    return res.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/users/addresses/${id}`);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// ORDER SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const orderService = {
  async checkout(addressId: string, couponCode?: string): Promise<Order> {
    const res = await api.post<Order>("/orders", {
      address_id: addressId,
      coupon_code: couponCode,
    });
    return res.data;
  },

  async list(page = 1, perPage = 10): Promise<OrderListResponse> {
    const res = await api.get<OrderListResponse>("/orders", {
      params: { page, per_page: perPage },
    });
    return res.data;
  },

  async getById(id: string): Promise<Order> {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },

  async cancel(id: string): Promise<Order> {
    const res = await api.post<Order>(`/orders/${id}/cancel`);
    return res.data;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// PAYMENT SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const paymentService = {
  async createRazorpayOrder(orderId: string): Promise<RazorpayOrderPayload> {
    const res = await api.post<RazorpayOrderPayload>("/payments/create-order", {
      order_id: orderId,
    });
    return res.data;
  },

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ message: string; order_id: string }> {
    const res = await api.post("/payments/verify", data);
    return res.data;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// ADMIN SERVICE
// ════════════════════════════════════════════════════════════════════════════

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>("/admin/stats");
    return res.data;
  },

  async listUsers(page = 1, perPage = 20, search?: string) {
    const res = await api.get("/admin/users", {
      params: { page, per_page: perPage, search },
    });
    return res.data;
  },

  async listOrders(page = 1, perPage = 20, status?: string) {
    const res = await api.get("/admin/orders", {
      params: { page, per_page: perPage, status },
    });
    return res.data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },

  async updateUserRole(userId: string, role: string) {
    const res = await api.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },
};
