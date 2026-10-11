import { useEffect, useSyncExternalStore } from 'react';
import {
  type User,
  type UserRole,
  type LoginRequest,
  type RegisterShopperRequest,
  type RegisterSellerRequest,
  type AuthResponse,
  type Business,
  getStoredUserId,
  getStoredRole,
  localmartApi,
  resolveUserCart,
  invalidateCartCache,
} from './localmart-api';

export type AuthState = {
  currentUser: User | null;
  role: UserRole;
  allUsers: User[];
  sellerBusiness: Business | null;
  cartCount: number;
  loading: boolean;
};

const initialAuthState: AuthState = {
  currentUser: null,
  role: getStoredRole(),
  allUsers: [],
  sellerBusiness: null,
  cartCount: 0,
  loading: true,
};

let authState: AuthState = { ...initialAuthState };

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(partial: Partial<AuthState>) {
  authState = { ...authState, ...partial };
  emitChange();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return authState;
}

function getServerSnapshot(): AuthState {
  return initialAuthState;
}

// In-flight request deduplication
let refreshCartPromise: Promise<number> | null = null;
let loadUsersPromise: Promise<void> | null = null;
let initialized = false;

export async function refreshCartCount(userId?: number): Promise<number> {
  const targetUserId = userId ?? authState.currentUser?.userId ?? getStoredUserId();
  if (!targetUserId) {
    if (authState.cartCount !== 0) updateState({ cartCount: 0 });
    return 0;
  }

  // Deduplicate concurrent refresh calls
  if (refreshCartPromise) {
    return refreshCartPromise;
  }

  refreshCartPromise = (async () => {
    try {
      const cartId = await resolveUserCart(targetUserId);
      const items = await localmartApi.getCartItems(cartId);
      const count = Array.isArray(items)
        ? items.reduce((acc, item) => acc + (item.quantity || 1), 0)
        : 0;

      if (authState.cartCount !== count) {
        updateState({ cartCount: count });
      }
      return count;
    } catch {
      updateState({ cartCount: 0 });
      return 0;
    } finally {
      refreshCartPromise = null;
    }
  })();

  return refreshCartPromise;
}

export async function loadUsersAndActive(): Promise<void> {
  if (loadUsersPromise) {
    return loadUsersPromise;
  }

  loadUsersPromise = (async () => {
    try {
      updateState({ loading: true });
      const users = await localmartApi.getUsers();

      const savedId = getStoredUserId();
      if (!savedId) {
        // User is unauthenticated / logged out
        updateState({
          allUsers: users,
          currentUser: null,
          role: 'CUSTOMER',
          loading: false,
          cartCount: 0,
        });
        return;
      }

      const matched = users.find(u => u.userId === savedId);
      if (!matched) {
        // Obsolete or non-existent user ID in storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('localmart_active_user_id');
          localStorage.removeItem('localmart_active_role');
          localStorage.removeItem('localmart_active_cart_id');
          localStorage.removeItem('localmart_active_business_id');
        }
        updateState({
          allUsers: users,
          currentUser: null,
          role: 'CUSTOMER',
          loading: false,
          cartCount: 0,
        });
        return;
      }

      const activeRole = matched.role;
      if (typeof window !== 'undefined') {
        localStorage.setItem('localmart_active_role', activeRole);
      }

      let sellerBiz: Business | null = null;
      if (matched.role === 'SELLER') {
        try {
          const allBiz = await localmartApi.getBusinesses();
          const found = allBiz.find(b => b.user && b.user.userId === matched.userId);
          const savedBizId = typeof window !== 'undefined' ? localStorage.getItem('localmart_active_business_id') : null;
          const targetBizId = found?.businessId ?? (savedBizId ? Number(savedBizId) : undefined);
          if (targetBizId) {
            try {
              sellerBiz = await localmartApi.getBusinessDetails(targetBizId);
            } catch {
              sellerBiz = found || null;
            }
          } else if (found) {
            sellerBiz = found;
          }
        } catch (bizErr) {
          console.warn('Failed to resolve seller business in auth:', bizErr);
        }
      }

      updateState({
        allUsers: users,
        currentUser: matched,
        role: activeRole,
        sellerBusiness: sellerBiz,
        loading: false,
      });

      if (matched.role === 'CUSTOMER') {
        await refreshCartCount(matched.userId);
      } else {
        updateState({ cartCount: 0 });
      }
    } catch (err) {
      console.warn('Failed to load users from backend:', err);
      updateState({ loading: false });
    } finally {
      loadUsersPromise = null;
    }
  })();

  return loadUsersPromise;
}

export async function switchUser(userId: number): Promise<void> {
  const user = authState.allUsers.find(u => u.userId === userId);
  if (!user) return;

  if (typeof window !== 'undefined') {
    localStorage.setItem('localmart_active_user_id', String(user.userId));
    localStorage.setItem('localmart_active_role', user.role);
  }

  let sellerBiz: Business | null = null;
  if (user.role === 'SELLER') {
    try {
      const allBiz = await localmartApi.getBusinesses();
      const found = allBiz.find(b => b.user && b.user.userId === user.userId);
      if (found) {
        try {
          sellerBiz = await localmartApi.getBusinessDetails(found.businessId);
        } catch {
          sellerBiz = found;
        }
      }
    } catch {
      // fallback
    }
  }

  updateState({
    currentUser: user,
    role: user.role,
    sellerBusiness: sellerBiz,
  });

  if (user.role === 'CUSTOMER') {
    await refreshCartCount(user.userId);
  } else {
    updateState({ cartCount: 0 });
  }
}

export async function switchRole(newRole: UserRole): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('localmart_active_role', newRole);
  }

  const matchingUser = authState.allUsers.find(u => u.role === newRole) || null;
  if (matchingUser && typeof window !== 'undefined') {
    localStorage.setItem('localmart_active_user_id', String(matchingUser.userId));
  }

  let sellerBiz: Business | null = null;
  if (newRole === 'SELLER' && matchingUser) {
    try {
      const allBiz = await localmartApi.getBusinesses();
      const found = allBiz.find(b => b.user && b.user.userId === matchingUser.userId);
      if (found) {
        try {
          sellerBiz = await localmartApi.getBusinessDetails(found.businessId);
        } catch {
          sellerBiz = found;
        }
      }
    } catch {
      // fallback
    }
  }

  updateState({
    role: newRole,
    currentUser: matchingUser,
    sellerBusiness: sellerBiz,
  });

  if (newRole === 'CUSTOMER' && matchingUser) {
    await refreshCartCount(matchingUser.userId);
  } else {
    updateState({ cartCount: 0 });
  }
}

// Global browser listeners initialized once
if (typeof window !== 'undefined') {
  window.addEventListener('localmart:auth-changed', () => {
    void loadUsersAndActive();
  });

  window.addEventListener('localmart:cart-changed', () => {
    void refreshCartCount();
  });
}

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  void loadUsersAndActive();
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const resp = await localmartApi.login(request);
  if (typeof window !== 'undefined') {
    localStorage.setItem('localmart_active_user_id', String(resp.userId));
    localStorage.setItem('localmart_active_role', resp.role);
    if (resp.businessId) {
      localStorage.setItem('localmart_active_business_id', String(resp.businessId));
    }
  }

  const user: User = {
    userId: resp.userId,
    fullName: resp.fullName,
    email: resp.email,
    role: resp.role,
    phone: resp.phone,
    address: resp.address,
  };

  let sellerBiz: Business | null = null;
  if (resp.role === 'SELLER') {
    const bizId = resp.businessId;
    if (bizId) {
      try {
        sellerBiz = await localmartApi.getBusinessDetails(bizId);
      } catch {
        // fallback
      }
    }
  }

  updateState({
    currentUser: user,
    role: resp.role,
    sellerBusiness: sellerBiz,
    loading: false,
  });

  if (resp.role === 'CUSTOMER') {
    await refreshCartCount(resp.userId);
  } else {
    updateState({ cartCount: 0 });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('localmart:auth-changed'));
  }

  return resp;
}

export async function registerShopper(request: RegisterShopperRequest): Promise<AuthResponse> {
  const resp = await localmartApi.registerShopper(request);
  if (typeof window !== 'undefined') {
    localStorage.setItem('localmart_active_user_id', String(resp.userId));
    localStorage.setItem('localmart_active_role', resp.role);
  }

  const user: User = {
    userId: resp.userId,
    fullName: resp.fullName,
    email: resp.email,
    role: resp.role,
    phone: resp.phone,
    address: resp.address,
  };

  updateState({
    currentUser: user,
    role: resp.role,
    sellerBusiness: null,
    loading: false,
  });

  await refreshCartCount(resp.userId);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('localmart:auth-changed'));
  }

  return resp;
}

export async function registerSeller(request: RegisterSellerRequest): Promise<AuthResponse> {
  const resp = await localmartApi.registerSeller(request);
  if (typeof window !== 'undefined') {
    localStorage.setItem('localmart_active_user_id', String(resp.userId));
    localStorage.setItem('localmart_active_role', resp.role);
    if (resp.businessId) {
      localStorage.setItem('localmart_active_business_id', String(resp.businessId));
    }
  }

  const user: User = {
    userId: resp.userId,
    fullName: resp.fullName,
    email: resp.email,
    role: resp.role,
    phone: resp.phone,
    address: resp.address,
  };

  let sellerBiz: Business | null = null;
  if (resp.businessId) {
    try {
      sellerBiz = await localmartApi.getBusinessDetails(resp.businessId);
    } catch {
      // fallback
    }
  }

  updateState({
    currentUser: user,
    role: resp.role,
    sellerBusiness: sellerBiz,
    loading: false,
    cartCount: 0,
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('localmart:auth-changed'));
  }

  return resp;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('localmart_active_user_id');
    localStorage.removeItem('localmart_active_role');
    localStorage.removeItem('localmart_active_cart_id');
    localStorage.removeItem('localmart_active_business_id');
    sessionStorage.clear();
  }

  // Clear in-memory cart cache
  invalidateCartCache();

  updateState({
    currentUser: null,
    role: 'CUSTOMER',
    sellerBusiness: null,
    cartCount: 0,
    loading: false,
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('localmart:auth-changed'));
    window.dispatchEvent(new CustomEvent('localmart:cart-changed'));
  }
}

export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureInitialized();
  }, []);

  return {
    currentUser: state.currentUser,
    user: state.currentUser,
    role: state.role,
    sellerBusiness: state.sellerBusiness,
    allUsers: state.allUsers,
    cartCount: state.cartCount,
    loading: state.loading,
    login,
    registerShopper,
    registerSeller,
    logout,
    switchUser,
    switchRole,
    refreshCartCount,
  };
}
