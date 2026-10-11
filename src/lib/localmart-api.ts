import { queryOptions } from '@tanstack/react-query';

// ============================================================================
// DOMAIN ENTITY & DTO TYPES (100% matched to PostgreSQL & Spring Boot)
// ============================================================================

export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export type User = {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  passwordHash?: string;
};

export type Category = {
  categoryId: number;
  categoryName: string;
};

export type Business = {
  businessId: number;
  businessName: string;
  businessType?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  serviceAreaId?: number;
  serviceAreaName?: string;
  serviceAreaPincode?: string;
  verificationDocument?: string;
  verificationSubmittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: number;
  verifiedByName?: string;
  verificationReason?: string;
  latitude?: number;
  longitude?: number;
  user?: User;
};

export type BusinessRequest = {
  userId: number;
  businessName: string;
  businessType?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  serviceAreaId?: number;
  verificationDocument?: string;
  latitude?: number;
  longitude?: number;
};

export type Product = {
  productId: number;
  productName: string;
  businessName: string;
  categoryName: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  isCollaborative?: boolean;
  collaboration?: any;
  business?: Business;
  category?: Category;
};

export type ProductRequest = {
  businessId: number;
  categoryId: number;
  productName: string;
  description?: string;
  price: number;
  stockQuantity: number;
};

export type Rating = {
  productId: number;
  productName: string;
  businessName: string;
  averageRating: number;
  reviewCount: number;
};

export type Cart = {
  cartId: number;
  user: User;
};

export type CartItem = {
  id: { cartId: number; productId: number };
  cart?: { cartId: number; user?: User };
  product: {
    productId: number;
    productName: string;
    price: number;
    stockQuantity: number;
    description?: string;
    business?: { businessId?: number; businessName?: string; city?: string };
    category?: { categoryId?: number; categoryName?: string };
  };
  quantity: number;
};

export type Order = {
  orderId: number;
  user: User;
  totalAmount: number;
  orderStatus: string;
  orderDate?: string;
  createdAt?: string;
};

export type OrderItem = {
  id: { orderId: number; productId: number };
  order: { orderId: number };
  product: {
    productId: number;
    productName: string;
    price?: number;
  };
  quantity: number;
  unitPrice: number;
};

export type Review = {
  reviewId?: number;
  user?: User;
  product: { productId: number; productName?: string };
  order?: { orderId: number };
  rating: number;
  comment: string;
  createdAt?: string;
};

// Report DTOs from PostgreSQL Views
export type ProductCatalogReport = {
  productId: number;
  productName: string;
  businessName: string;
  categoryName: string;
  description?: string;
  price: number;
  stockQuantity: number;
};

export type SellerPerformance = {
  businessId: number;
  businessName: string;
  totalOrders: number;
  itemsSold: number;
  totalRevenue: number;
};

export type CustomerOrderSummary = {
  userId: number;
  fullName: string;
  totalOrders: number;
  itemsPurchased: number;
  totalSpent: number;
};

export type ProductPerformance = {
  productId: number;
  productName: string;
  businessName: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
};

export type InventoryRecommendation = {
  productId: number;
  productName: string;
  businessId: number;
  businessName: string;
  currentStock: number;
  unitsOrdered60d: number;
  avgDailyDemand: number;
  estimatedDaysRemaining: number;
  inventoryStatus: string;
  suggestedReorderQuantity: number;
  recommendation: string;
};

export type LoginRequest = {
  email: string;
  password?: string;
  expectedRole?: string;
};

export type RegisterShopperRequest = {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
};

export type RegisterSellerRequest = {
  ownerName: string;
  email: string;
  password?: string;
  phone?: string;
  businessName: string;
  description?: string;
  category?: string;
  address: string;
  city?: string;
  state?: string;
  postalCode: string;
  serviceAreaId?: number;
  verificationDocument?: string;
};

export type AuthResponse = {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  businessId?: number;
  businessName?: string;
  verificationStatus?: string;
  message?: string;
};

// ============================================================================
// ADMIN MODULE TYPES
// ============================================================================

export type ServiceArea = {
  areaId: number;
  areaName: string;
  city: string;
  state: string;
  pincode: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
};

export type CollaborationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type Collaboration = {
  collaborationId: number;
  initiatorBusinessId: number;
  initiatorBusinessName: string;
  initiatorOwnerName?: string;
  initiatorOwnerEmail?: string;
  initiatorPhone?: string;
  initiatorAddress?: string;
  partnerBusinessId: number;
  partnerBusinessName: string;
  partnerOwnerName?: string;
  partnerOwnerEmail?: string;
  partnerPhone?: string;
  partnerAddress?: string;
  title: string;
  description?: string;
  collaborationType: string;
  status: CollaborationStatus;
  createdAt: string;
  updatedAt?: string;
  linkedProducts?: AdminProduct[];
};

export type CollaborationRequest = {
  initiatorBusinessId: number;
  partnerBusinessId: number;
  title: string;
  description?: string;
  collaborationType?: string;
  productIds?: number[];
};

export type DeliveryMethod = 'SELLER_DELIVERY' | 'SELF_PICKUP';

export type OrderFulfillment = {
  fulfillmentId: number;
  orderId: number;
  businessId: number;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  deliveryMethod: DeliveryMethod;
  pickupLocation?: string;
  deliveryAddress?: string;
  status: string;
  createdAt: string;
};

export type FulfillmentSelectionRequest = {
  businessId: number;
  deliveryMethod: DeliveryMethod;
  pickupLocation?: string;
  deliveryAddress?: string;
};

export type CheckoutWithFulfillmentRequest = {
  cartId: number;
  fulfillments: FulfillmentSelectionRequest[];
};

export type BusinessVerificationSubmitRequest = {
  serviceAreaId?: number;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  verificationDocument?: string;
  latitude?: number;
  longitude?: number;
};

export type AdminDashboardStats = {
  totalCustomers: number;
  totalSellers: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalProducts: number;
  hiddenProducts: number;
  totalOrders: number;
  totalReviews: number;
  hiddenReviews: number;
  totalRevenue: number;
  totalCollaborations?: number;
  pendingCollaborations?: number;
  activeCollaborations?: number;
};

export type AdminUser = {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
};

export type AdminBusiness = {
  businessId: number;
  businessName: string;
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  serviceAreaId?: number;
  serviceAreaName?: string;
  serviceAreaPincode?: string;
  verificationDocument?: string;
  verificationSubmittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: number;
  verifiedByName?: string;
  verificationReason?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
};

export type AdminProduct = {
  productId: number;
  productName: string;
  businessId?: number;
  businessName?: string;
  categoryId?: number;
  categoryName?: string;
  description?: string;
  price: number;
  stockQuantity: number;
  listingStatus: 'ACTIVE' | 'HIDDEN';
};

export type AdminReview = {
  reviewId: number;
  orderId?: number;
  productId?: number;
  productName?: string;
  customerName?: string;
  rating: number;
  comment?: string;
  reviewStatus: 'ACTIVE' | 'HIDDEN';
  reviewDate?: string;
};

export type AdminAuditLog = {
  auditId: number;
  adminUserId?: number;
  adminName?: string;
  adminEmail?: string;
  action: string;
  entityType: string;
  entityId: number;
  reason?: string;
  createdAt: string;
};

export type ApiResult<T> = {
  data: T;
  error: string | null;
};

// ============================================================================
// CENTRALIZED API CLIENT & SSR-SAFE URL RESOLUTION
// ============================================================================

export const reports = {
  catalog: '/api/reports/product-catalog',
  ratings: '/api/reports/product-ratings',
  sellers: '/api/reports/seller-performance',
  customers: '/api/reports/customer-order-summary',
  performance: '/api/reports/product-performance',
} as const;

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return ''; // Browser requests use relative path, proxied by Vite dev server
  }
  // SSR requests in Node need explicit host
  return process.env.BACKEND_URL || 'http://localhost:8081';
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${cleanEndpoint}`;

  const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('localmart_active_user_id') : null;
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(storedUserId ? { 'X-User-Id': storedUserId } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP ${response.status}: Request failed`;
    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed.message || parsed.error || text || errorMessage;
    } catch {
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  const rawText = await response.text();
  return rawText as unknown as T;
}

export async function apiGet<T>(url: string): Promise<ApiResult<T[]>> {
  try {
    const data = await apiFetch<T[]>(url);
    if (!Array.isArray(data)) {
      return { data: [], error: 'Invalid response format received from server.' };
    }
    return { data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'The marketplace is currently unavailable.';
    return {
      data: [],
      error: msg.includes('Failed to fetch') || msg.includes('fetch failed')
        ? 'The marketplace is currently unavailable. Please verify Spring Boot is running on port 8081.'
        : msg,
    };
  }
}

// ============================================================================
// REACT QUERY OPTIONS FOR COMMON DATA
// ============================================================================

export const catalogOptions = queryOptions({
  queryKey: ['catalog'],
  queryFn: () => apiGet<Product>(reports.catalog),
  staleTime: 30000,
  retry: false,
});

export const ratingOptions = queryOptions({
  queryKey: ['ratings'],
  queryFn: () => apiGet<Rating>(reports.ratings),
  staleTime: 30000,
  retry: false,
});

export const businessesOptions = queryOptions({
  queryKey: ['businesses'],
  queryFn: () => apiGet<Business>('/api/businesses'),
  staleTime: 30000,
  retry: false,
});

export const categoriesOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: () => apiGet<Category>('/api/categories'),
  staleTime: 60000,
  retry: false,
});

export const usersOptions = queryOptions({
  queryKey: ['users'],
  queryFn: () => apiGet<User>('/api/users'),
  staleTime: 30000,
  retry: false,
});

export const sellerPerformanceOptions = queryOptions({
  queryKey: ['reports-sellers'],
  queryFn: () => apiGet<SellerPerformance>(reports.sellers),
  staleTime: 30000,
  retry: false,
});

export const customerSummaryOptions = queryOptions({
  queryKey: ['reports-customers'],
  queryFn: () => apiGet<CustomerOrderSummary>(reports.customers),
  staleTime: 30000,
  retry: false,
});

export const productPerformanceOptions = queryOptions({
  queryKey: ['reports-performance'],
  queryFn: () => apiGet<ProductPerformance>(reports.performance),
  staleTime: 30000,
  retry: false,
});

// ============================================================================
// SPECIFIC REST API METHODS (Matching Spring Boot Controllers)
// ============================================================================

export const localmartApi = {
  // Products
  getProducts: () => apiFetch<Product[]>('/api/products'),
  getProduct: (id: number) => apiFetch<Product>(`/api/products/${id}`),
  createProduct: (req: ProductRequest) =>
    apiFetch<Product>('/api/products', { method: 'POST', body: JSON.stringify(req) }),
  updateProduct: (id: number, req: ProductRequest) =>
    apiFetch<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(req) }),
  deleteProduct: (id: number) =>
    apiFetch<string>(`/api/products/${id}`, { method: 'DELETE' }),

  // PostgreSQL View Product Availability Search
  searchAvailableProducts: (name: string, city: string) =>
    apiFetch<Product[]>(`/api/search/products?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}`),

  // Businesses
  getBusinesses: () => apiFetch<Business[]>('/api/businesses'),
  getBusiness: (id: number) => apiFetch<Business>(`/api/businesses/${id}`),
  createBusiness: (req: BusinessRequest) =>
    apiFetch<Business>('/api/businesses', { method: 'POST', body: JSON.stringify(req) }),

  // Categories
  getCategories: () => apiFetch<Category[]>('/api/categories'),

  // Users
  getUsers: () => apiFetch<User[]>('/api/users'),
  getUser: (id: number) => apiFetch<User>(`/api/users/${id}`),
  createUser: (user: Partial<User>) =>
    apiFetch<User>('/api/users', { method: 'POST', body: JSON.stringify(user) }),

  // Carts & Cart Items
  getCarts: () => apiFetch<Cart[]>('/api/carts'),
  getCart: (id: number) => apiFetch<Cart>(`/api/carts/${id}`),
  createCart: (userId: number) =>
    apiFetch<Cart>('/api/carts', { method: 'POST', body: JSON.stringify({ user: { userId } }) }),
  getCartItems: (cartId: number) => apiFetch<CartItem[]>(`/api/cart-items/cart/${cartId}`),
  addCartItem: (cartId: number, productId: number, quantity = 1) =>
    apiFetch<CartItem>('/api/cart-items', {
      method: 'POST',
      body: JSON.stringify({ cartId, productId, quantity }),
    }),
  updateCartItem: (cartId: number, productId: number, quantity: number) =>
    apiFetch<CartItem>(`/api/cart-items/${cartId}/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ cartId, productId, quantity }),
    }),
  deleteCartItem: (cartId: number, productId: number) =>
    apiFetch<string>(`/api/cart-items/${cartId}/${productId}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => apiFetch<Order[]>('/api/orders'),
  getOrder: (id: number) => apiFetch<Order>(`/api/orders/${id}`),
  getOrderItems: () => apiFetch<OrderItem[]>('/api/order-items'),
  placeOrder: (cartId: number) =>
    apiFetch<string>(`/api/orders/place/${cartId}`, { method: 'POST' }),

  // Reviews
  getReviews: () => apiFetch<Review[]>('/api/reviews'),
  createReview: (review: { order?: { orderId: number }; product: { productId: number }; rating: number; comment: string }) =>
    apiFetch<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(review) }),

  // Inventory Recommendations
  getInventoryRecommendations: (businessId: number) =>
    apiFetch<InventoryRecommendation[]>(`/api/inventory/recommendations/business/${businessId}`),

  // Reports
  reports: {
    productCatalog: () => apiFetch<ProductCatalogReport[]>(reports.catalog),
    sellerPerformance: () => apiFetch<SellerPerformance[]>(reports.sellers),
    customerOrderSummary: () => apiFetch<CustomerOrderSummary[]>(reports.customers),
    productPerformance: () => apiFetch<ProductPerformance[]>(reports.performance),
    productRatings: () => apiFetch<Rating[]>(reports.ratings),
  },

  // Admin Module
  admin: {
    dashboard: () => apiFetch<AdminDashboardStats>('/api/admin/dashboard'),
    getUsers: (params?: { role?: string; status?: string; search?: string }) => {
      const sp = new URLSearchParams();
      if (params?.role && params.role !== 'ALL') sp.set('role', params.role);
      if (params?.status && params.status !== 'ALL') sp.set('status', params.status);
      if (params?.search) sp.set('search', params.search);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return apiFetch<AdminUser[]>(`/api/admin/users${q}`);
    },
    updateUserStatus: (userId: number, status: 'ACTIVE' | 'SUSPENDED', reason?: string) =>
      apiFetch<AdminUser>(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    getBusinesses: (status?: string) => {
      const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
      return apiFetch<AdminBusiness[]>(`/api/admin/businesses${q}`);
    },
    updateBusinessVerification: (businessId: number, status: string, reason?: string) =>
      apiFetch<AdminBusiness>(`/api/admin/businesses/${businessId}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    getCategories: () => apiFetch<Category[]>('/api/admin/categories'),
    createCategory: (categoryName: string) =>
      apiFetch<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ categoryName }),
      }),
    updateCategory: (categoryId: number, categoryName: string) =>
      apiFetch<Category>(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ categoryName }),
      }),
    deleteCategory: (categoryId: number) =>
      apiFetch<{ message: string }>(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      }),
    getProducts: (params?: { status?: string; search?: string }) => {
      const sp = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') sp.set('status', params.status);
      if (params?.search) sp.set('search', params.search);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return apiFetch<AdminProduct[]>(`/api/admin/products${q}`);
    },
    updateProductStatus: (productId: number, status: 'ACTIVE' | 'HIDDEN', reason?: string) =>
      apiFetch<AdminProduct>(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    getReviews: (status?: string) => {
      const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
      return apiFetch<AdminReview[]>(`/api/admin/reviews${q}`);
    },
    updateReviewStatus: (reviewId: number, status: 'ACTIVE' | 'HIDDEN', reason?: string) =>
      apiFetch<AdminReview>(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    getAuditLogs: (params?: { action?: string; entityType?: string }) => {
      const sp = new URLSearchParams();
      if (params?.action && params.action !== 'ALL') sp.set('action', params.action);
      if (params?.entityType && params.entityType !== 'ALL') sp.set('entityType', params.entityType);
      const q = sp.toString() ? `?${sp.toString()}` : '';
      return apiFetch<AdminAuditLog[]>(`/api/admin/audit-logs${q}`);
    },
    getServiceAreas: () => apiFetch<ServiceArea[]>('/api/admin/service-areas'),
    createServiceArea: (area: Partial<ServiceArea>) =>
      apiFetch<ServiceArea>('/api/admin/service-areas', {
        method: 'POST',
        body: JSON.stringify(area),
      }),
    updateServiceArea: (areaId: number, area: Partial<ServiceArea>) =>
      apiFetch<ServiceArea>(`/api/admin/service-areas/${areaId}`, {
        method: 'PUT',
        body: JSON.stringify(area),
      }),
    getCollaborations: (status?: string) => {
      const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
      return apiFetch<Collaboration[]>(`/api/admin/collaborations${q}`);
    },
    updateCollaborationStatus: (collaborationId: number, status: string, reason?: string) =>
      apiFetch<Collaboration>(`/api/admin/collaborations/${collaborationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
  },

  // Service Areas
  getServiceAreas: (all = false) =>
    apiFetch<ServiceArea[]>(`/api/service-areas${all ? '?all=true' : ''}`),
  validatePincode: (pincode: string) =>
    apiFetch<{ pincode: string; isCovered: boolean; serviceAreas: ServiceArea[] }>(
      `/api/service-areas/validate?pincode=${encodeURIComponent(pincode)}`
    ),

  // Approved Businesses Directory & Verification
  getApprovedBusinesses: () => apiFetch<AdminBusiness[]>('/api/businesses/approved'),
  getBusinessDetails: (id: number) => apiFetch<AdminBusiness>(`/api/businesses/${id}/details`),
  submitBusinessVerification: (businessId: number, req: BusinessVerificationSubmitRequest) =>
    apiFetch<AdminBusiness>(`/api/businesses/${businessId}/verification`, {
      method: 'PUT',
      body: JSON.stringify(req),
    }),
  uploadVerificationDocument: async (businessId: number, file: File): Promise<AdminBusiness> => {
    const base = getApiBaseUrl();
    const url = `${base}/api/businesses/${businessId}/verification/upload`;
    const formData = new FormData();
    formData.append('file', file);

    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('localmart_active_user_id') : null;
    const headers: HeadersInit = {
      ...(storedUserId ? { 'X-User-Id': storedUserId } : {}),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = `HTTP ${response.status}: Failed to upload document`;
      try {
        const parsed = JSON.parse(text);
        errorMessage = parsed.message || parsed.error || errorMessage;
      } catch {
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
  getVerificationDocumentUrl: (businessId: number): string => {
    const base = getApiBaseUrl();
    return `${base}/api/businesses/${businessId}/verification/document`;
  },

  // Collaborations
  getCollaborations: (status?: string) => {
    const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<Collaboration[]>(`/api/collaborations${q}`);
  },
  getCollaboration: (id: number) => apiFetch<Collaboration>(`/api/collaborations/${id}`),
  getCollaborationsForBusiness: (businessId: number, status?: string) => {
    const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<Collaboration[]>(`/api/collaborations/business/${businessId}${q}`);
  },
  proposeCollaboration: (req: CollaborationRequest) =>
    apiFetch<Collaboration>('/api/collaborations', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  updateCollaborationStatus: (id: number, status: string, reason?: string) =>
    apiFetch<Collaboration>(`/api/collaborations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),
  createCollaborativeProduct: (req: {
    collaborationId: number;
    categoryId: number;
    productName: string;
    description?: string;
    price: number;
    stockQuantity: number;
  }) =>
    apiFetch<Product>('/api/collaborations/create-product', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  // Multi-Business Checkout with Fulfillment
  placeOrderWithFulfillments: (req: CheckoutWithFulfillmentRequest) =>
    apiFetch<{ message: string; orderId: number }>('/api/orders/place-with-fulfillment', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  // Authentication & Registration
  login: (req: LoginRequest) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  registerShopper: (req: RegisterShopperRequest) =>
    apiFetch<AuthResponse>('/api/auth/register-shopper', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  registerSeller: (req: RegisterSellerRequest) =>
    apiFetch<AuthResponse>('/api/auth/register-seller', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
};

// ============================================================================
// SESSION & DEMO PERSONA MANAGEMENT (Pure client-side persistence)
// ============================================================================

const ACTIVE_USER_ID_KEY = 'localmart_active_user_id';
const ACTIVE_ROLE_KEY = 'localmart_active_role';
const CART_ID_KEY = 'localmart_active_cart_id';

export function getStoredRole(): UserRole {
  if (typeof window === 'undefined') return 'CUSTOMER';
  const role = localStorage.getItem(ACTIVE_ROLE_KEY);
  if (role === 'SELLER' || role === 'ADMIN' || role === 'CUSTOMER') return role;
  return 'CUSTOMER';
}

export function setStoredRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_ROLE_KEY, role);
  window.dispatchEvent(new CustomEvent('localmart:auth-changed'));
}

export function getStoredUserId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ACTIVE_USER_ID_KEY);
  return raw ? parseInt(raw, 10) : null;
}

export function setStoredUserId(id: number | null): void {
  if (typeof window === 'undefined') return;
  if (id === null) {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
    localStorage.removeItem(CART_ID_KEY);
  } else {
    localStorage.setItem(ACTIVE_USER_ID_KEY, String(id));
  }
  window.dispatchEvent(new CustomEvent('localmart:auth-changed'));
}

export function getStoredCartId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CART_ID_KEY);
  return raw ? parseInt(raw, 10) : null;
}

export function setStoredCartId(id: number | null): void {
  if (typeof window === 'undefined') return;
  if (id === null) {
    localStorage.removeItem(CART_ID_KEY);
  } else {
    localStorage.setItem(CART_ID_KEY, String(id));
  }
  // NOTE: Never dispatch 'localmart:cart-changed' here!
  // 'localmart:cart-changed' signals cart item mutations (add/update/remove/checkout).
  // Dispatching it here triggers an infinite recursive loop with auth/cart hooks.
}

// In-memory cache & promise deduplicator to guarantee single network resolution
const userCartCache = new Map<number, number>();
const inFlightCartResolutions = new Map<number, Promise<number>>();

export function invalidateCartCache(userId?: number): void {
  if (userId) {
    userCartCache.delete(userId);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`localmart_cart_user_${userId}`);
    }
  } else {
    userCartCache.clear();
  }
}

/**
 * Resolves or automatically provisions a real PostgreSQL cart for the given user.
 * Caches resolution and deduplicates in-flight calls so concurrent components or
 * StrictMode renders never flood the backend or create duplicate carts.
 */
export async function resolveUserCart(userId: number): Promise<number> {
  if (!userId) {
    throw new Error('Valid userId is required to resolve cart');
  }

  // 1. Fast in-memory cache check
  const memCached = userCartCache.get(userId);
  if (memCached) {
    setStoredCartId(memCached);
    return memCached;
  }

  // 2. LocalStorage cache check for this specific user
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`localmart_cart_user_${userId}`);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) {
        userCartCache.set(userId, parsed);
        setStoredCartId(parsed);
        return parsed;
      }
    }
  }

  // 3. Deduplicate in-flight requests
  const inFlight = inFlightCartResolutions.get(userId);
  if (inFlight) {
    return inFlight;
  }

  const promise = (async () => {
    try {
      const carts = await localmartApi.getCarts();
      const existing = carts.find(c => c.user && c.user.userId === userId);
      if (existing) {
        userCartCache.set(userId, existing.cartId);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`localmart_cart_user_${userId}`, String(existing.cartId));
        }
        setStoredCartId(existing.cartId);
        return existing.cartId;
      }

      const created = await localmartApi.createCart(userId);
      userCartCache.set(userId, created.cartId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`localmart_cart_user_${userId}`, String(created.cartId));
      }
      setStoredCartId(created.cartId);
      return created.cartId;
    } catch (err) {
      console.warn('Failed to resolve cart for user', userId, err);
      throw err;
    } finally {
      inFlightCartResolutions.delete(userId);
    }
  })();

  inFlightCartResolutions.set(userId, promise);
  return promise;
}

// ============================================================================
// UTILITY FUNCTIONS (Preserved from existing Lovable frontend)
// ============================================================================

export const pageSearch = (value: Record<string, unknown>) => ({
  q: typeof value.q === 'string' ? value.q : undefined,
  category: typeof value.category === 'string' ? value.category : undefined,
  business: typeof value.business === 'string' ? value.business : undefined,
  id: typeof value.id === 'string' || typeof value.id === 'number' ? String(value.id) : undefined,
  redirect: typeof value.redirect === 'string' ? value.redirect : undefined,
});

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | LOCALMART` },
      { name: 'description', content: description },
      { property: 'og:title', content: `${title} | LOCALMART` },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  };
}

export function safeImage(url?: string) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, 'https://localmart.invalid');
    return ['https:', 'http:'].includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
