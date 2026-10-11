/**
 * LocalMarket — Production-Ready Frontend Controller
 * Complete coverage for all REST endpoints, DTOs, entities, and SQL view reports.
 */

// Global API Base
const API_BASE = '/api';

// Application State
const state = {
  // Database Entities
  users: [],
  categories: [],
  businesses: [],
  products: [],
  orders: [],
  orderItems: [],
  reviews: [],
  carts: [],

  // Active Context
  currentUser: null,
  activeCart: null,
  activeCartItems: [],
  sellerBusiness: null,

  // Reports Cache
  reports: {
    customerSummary: [],
    productCatalog: [],
    productPerformance: [],
    productRatings: [],
    sellerPerformance: []
  },

  // Active UI Navigation Tabs
  activePage: 'home',
  sellerTab: 'products',
  reportTab: 'customer-summary',
  adminTab: 'users',
  orderFilterStatus: 'ALL',

  // Shop Filters
  shopFilters: {
    search: '',
    category: '',
    city: '',
    sort: 'featured',
    inStockOnly: false
  }
};

// Utility Helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (str) =>
  String(str ?? '').replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  return Number.isNaN(d.getTime())
    ? String(val)
    : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const getInitials = (name) =>
  (name || 'LM')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const getCategoryIcon = (categoryName) => {
  const norm = (categoryName || '').toLowerCase();
  if (norm.includes('bake') || norm.includes('cake') || norm.includes('bread')) return '🥐';
  if (norm.includes('beverage') || norm.includes('tea') || norm.includes('drink')) return '☕';
  if (norm.includes('craft') || norm.includes('decor')) return '🎨';
  if (norm.includes('gift')) return '🎁';
  if (norm.includes('snack') || norm.includes('food')) return '🍿';
  if (norm.includes('cloth')) return '👕';
  if (norm.includes('elec')) return '⚡';
  if (norm.includes('book')) return '📚';
  return '📦';
};

// Generic Fetch Wrapper
async function fetchApi(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const fetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  try {
    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errMsg =
        typeof data === 'string'
          ? data
          : data?.message || `API request failed with status ${res.status}`;
      throw new Error(errMsg);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${path}:`, err);
    throw err;
  }
}

// Notification Toast System
function showToast(message, type = 'info') {
  const toast = $('#toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = 'toast show';
  if (type === 'error') toast.classList.add('error');
  if (type === 'success') toast.classList.add('success');

  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
}

// Modal Helpers
function openModal(id) {
  const el = $(`#${id}`);
  if (el) {
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
  }
}

function closeModal(id) {
  const el = $(`#${id}`);
  if (el) {
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }
}

// Global Router / Page Navigation
function navigateTo(pageId) {
  state.activePage = pageId;

  // Toggle page visibility
  $$('.page-view').forEach((p) => p.classList.add('hidden'));
  const targetPage = $(`#page-${pageId}`);
  if (targetPage) targetPage.classList.remove('hidden');

  // Update navigation link highlights
  $$('.nav-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
  $$('.mobile-nav-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  // Hide mobile drawer if open
  $('#mobile-drawer')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Route-specific initializers
  if (pageId === 'home') renderHomePage();
  if (pageId === 'shop') renderShopPage();
  if (pageId === 'businesses') renderBusinessesPage();
  if (pageId === 'cart') renderCartPage();
  if (pageId === 'orders') renderOrdersPage();
  if (pageId === 'seller') renderSellerPage();
  if (pageId === 'reports') renderReportsPage();
  if (pageId === 'admin') renderAdminPage();
}

// ==========================================================================
// DATA BOOTSTRAP & SYNCHRONIZATION
// ==========================================================================

async function loadInitialData() {
  try {
    const [users, categories, businesses, products, orders, orderItems, reviews] =
      await Promise.allSettled([
        fetchApi('/users'),
        fetchApi('/categories'),
        fetchApi('/businesses'),
        fetchApi('/products'),
        fetchApi('/orders'),
        fetchApi('/order-items'),
        fetchApi('/reviews')
      ]);

    state.users = users.status === 'fulfilled' ? users.value || [] : [];
    state.categories = categories.status === 'fulfilled' ? categories.value || [] : [];
    state.businesses = businesses.status === 'fulfilled' ? businesses.value || [] : [];
    state.products = products.status === 'fulfilled' ? products.value || [] : [];
    state.orders = orders.status === 'fulfilled' ? orders.value || [] : [];
    state.orderItems = orderItems.status === 'fulfilled' ? orderItems.value || [] : [];
    state.reviews = reviews.status === 'fulfilled' ? reviews.value || [] : [];

    // Restore saved user or default to first customer
    const savedUserId = localStorage.getItem('lm-active-user-id');
    if (savedUserId && state.users.some((u) => String(u.userId) === savedUserId)) {
      state.currentUser = state.users.find((u) => String(u.userId) === savedUserId);
    } else {
      state.currentUser = state.users.find((u) => u.role === 'CUSTOMER') || state.users[0] || null;
      if (state.currentUser) {
        localStorage.setItem('lm-active-user-id', state.currentUser.userId);
      }
    }

    // Restore saved seller store
    const savedStoreId = localStorage.getItem('lm-seller-business-id');
    if (savedStoreId && state.businesses.some((b) => String(b.businessId) === savedStoreId)) {
      state.sellerBusiness = state.businesses.find((b) => String(b.businessId) === savedStoreId);
    } else {
      state.sellerBusiness = state.businesses[0] || null;
    }

    // Refresh cart for current user
    await syncUserCart();

    // Render components
    renderUserPill();
    populateCategorySelectors();
    navigateTo(state.activePage);
  } catch (err) {
    console.error('Failed to bootstrap application:', err);
    showToast('Failed to connect to backend at http://localhost:8080', 'error');
  }
}

// Synchronize User Shopping Cart
async function syncUserCart() {
  if (!state.currentUser) {
    state.activeCart = null;
    state.activeCartItems = [];
    updateCartBadges();
    return;
  }

  try {
    const carts = await fetchApi('/carts');
    state.carts = carts || [];
    state.activeCart =
      state.carts.find((c) => c.user?.userId === state.currentUser.userId) || null;

    if (state.activeCart) {
      const items = await fetchApi(`/cart-items/cart/${state.activeCart.cartId}`);
      state.activeCartItems = items || [];
    } else {
      state.activeCartItems = [];
    }
  } catch (err) {
    console.warn('Could not sync user cart:', err);
    state.activeCartItems = [];
  }
  updateCartBadges();
}

function updateCartBadges() {
  const count = state.activeCartItems.reduce((acc, i) => acc + Number(i.quantity || 0), 0);
  const countEl = $('#cart-count');
  const countMobileEl = $('#cart-count-mobile');
  if (countEl) countEl.textContent = count;
  if (countMobileEl) countMobileEl.textContent = count;
}

function renderUserPill() {
  const nameEl = $('#user-name-display');
  const roleEl = $('#user-role-display');
  const avatarEl = $('#user-avatar-initials');

  if (!state.currentUser) {
    if (nameEl) nameEl.textContent = 'Guest';
    if (roleEl) roleEl.textContent = 'NONE';
    if (avatarEl) avatarEl.textContent = 'G';
    return;
  }

  if (nameEl) nameEl.textContent = state.currentUser.fullName || state.currentUser.email;
  if (roleEl) {
    roleEl.textContent = state.currentUser.role;
    roleEl.className = `user-role-badge role-${state.currentUser.role}`;
  }
  if (avatarEl) avatarEl.textContent = getInitials(state.currentUser.fullName);
}

function populateCategorySelectors() {
  // Populate category filter in shop
  const shopCatSelect = $('#shop-category-filter');
  if (shopCatSelect) {
    const curr = shopCatSelect.value;
    shopCatSelect.innerHTML =
      '<option value="">All Categories</option>' +
      state.categories
        .map((c) => `<option value="${c.categoryId}">${escapeHtml(c.categoryName)}</option>`)
        .join('');
    shopCatSelect.value = curr;
  }

  // Populate category select in product modal
  const formCatSelect = $('#product-form-category');
  if (formCatSelect) {
    formCatSelect.innerHTML = state.categories
      .map((c) => `<option value="${c.categoryId}">${escapeHtml(c.categoryName)}</option>`)
      .join('');
  }

  // Populate category chips in shop
  const chipsContainer = $('#shop-category-chips');
  if (chipsContainer) {
    chipsContainer.innerHTML =
      `<button class="category-chip ${!state.shopFilters.category ? 'active' : ''}" onclick="applyCategoryFilter('')">All</button>` +
      state.categories
        .map(
          (c) =>
            `<button class="category-chip ${String(state.shopFilters.category) === String(c.categoryId) ? 'active' : ''}" onclick="applyCategoryFilter(${c.categoryId})">${getCategoryIcon(c.categoryName)} ${escapeHtml(c.categoryName)}</button>`
        )
        .join('');
  }
}

// ==========================================================================
// 1. HOME LANDING PAGE
// ==========================================================================

function renderHomePage() {
  // Update stats banner
  const pCount = $('#stat-product-count');
  const bCount = $('#stat-business-count');
  const oCount = $('#stat-orders-count');
  if (pCount) pCount.textContent = state.products.length;
  if (bCount) bCount.textContent = state.businesses.length;
  if (oCount) oCount.textContent = state.orders.length;

  // Render categories grid
  const catGrid = $('#home-categories-grid');
  if (catGrid) {
    if (state.categories.length === 0) {
      catGrid.innerHTML =
        '<div class="empty-state full-col"><span class="empty-icon">📁</span><h4 class="empty-title">No categories yet</h4></div>';
    } else {
      catGrid.innerHTML = state.categories
        .map((cat) => {
          const count = state.products.filter(
            (p) => p.category?.categoryId === cat.categoryId
          ).length;
          return `
          <button class="category-card-btn" onclick="applyCategoryFilter(${cat.categoryId}); navigateTo('shop');">
            <div class="category-card-icon">${getCategoryIcon(cat.categoryName)}</div>
            <div>
              <div class="category-card-name">${escapeHtml(cat.categoryName)}</div>
              <div class="category-card-count">${count} items</div>
            </div>
          </button>
        `;
        })
        .join('');
    }
  }

  // Render featured products (top 4 or 8)
  const prodGrid = $('#home-products-grid');
  if (prodGrid) {
    if (state.products.length === 0) {
      prodGrid.innerHTML =
        '<div class="empty-state full-col"><span class="empty-icon">🛍️</span><h4 class="empty-title">No products found</h4></div>';
    } else {
      prodGrid.innerHTML = state.products
        .slice(0, 8)
        .map((p) => buildProductCardHtml(p))
        .join('');
    }
  }
}

// ==========================================================================
// 2. SHOP / MARKETPLACE MODULE
// ==========================================================================

function buildProductCardHtml(product) {
  const stock = Number(product.stockQuantity || 0);
  let stockClass = 'in-stock';
  let stockText = `${stock} in stock`;
  if (stock <= 0) {
    stockClass = 'out-of-stock';
    stockText = 'Out of stock';
  } else if (stock <= 5) {
    stockClass = 'low-stock';
    stockText = `Only ${stock} left!`;
  }

  // Calculate review score
  const reviews = state.reviews.filter((r) => r.product?.productId === product.productId);
  const avg =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const categoryName = product.category?.categoryName || 'General';
  const icon = getCategoryIcon(categoryName);
  const businessName = product.business?.businessName || 'Local Seller';
  const city = product.business?.city || 'Local';

  return `
    <article class="product-card">
      <div class="product-thumb">
        <span>${icon}</span>
        <span class="product-cat-pill">${escapeHtml(categoryName)}</span>
      </div>
      <div class="product-card-body">
        <div class="product-store-info">
          <span class="store-name-link" onclick="filterByStore(${product.business?.businessId})" title="Browse this store">🏪 ${escapeHtml(businessName)}</span>
          <span class="badge badge-blue">${escapeHtml(city)}</span>
        </div>
        <h3 class="product-card-title">${escapeHtml(product.productName)}</h3>
        <p class="product-card-desc">${escapeHtml(product.description || 'Quality handcrafted local product.')}</p>
        
        <div class="product-card-meta">
          <div>
            <span class="product-price">${formatINR(product.price)}</span>
            <div class="mt-1">
              <span class="stock-pill ${stockClass}">${stockText}</span>
            </div>
          </div>
          ${
            avg
              ? `<div class="star-rating">★ <span class="rating-num">${avg} (${reviews.length})</span></div>`
              : '<span class="text-muted" style="font-size:11.5px">No reviews yet</span>'
          }
        </div>

        <div class="product-card-actions">
          <button class="btn btn-outline btn-sm" onclick="showProductDetailsModal(${product.productId})">Details</button>
          <button class="btn btn-primary btn-sm" ${stock <= 0 ? 'disabled' : ''} onclick="handleAddToCart(${product.productId})">
            + Add to Cart
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderShopPage() {
  populateCategorySelectors();

  let filtered = [...state.products];
  const { search, category, city, sort, inStockOnly } = state.shopFilters;

  if (category) {
    filtered = filtered.filter((p) => String(p.category?.categoryId) === String(category));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.productName || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.business?.businessName || '').toLowerCase().includes(q)
    );
  }

  if (city) {
    const c = city.toLowerCase();
    filtered = filtered.filter((p) => (p.business?.city || '').toLowerCase().includes(c));
  }

  if (inStockOnly) {
    filtered = filtered.filter((p) => Number(p.stockQuantity || 0) > 0);
  }

  // Sorting
  if (sort === 'price-asc') {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === 'stock') {
    filtered.sort((a, b) => Number(b.stockQuantity) - Number(a.stockQuantity));
  }

  // Update counts
  const countEl = $('#shop-results-count');
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${state.products.length} products`;
  }

  const grid = $('#shop-products-grid');
  if (grid) {
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state full-col">
          <span class="empty-icon">🔍</span>
          <h3 class="empty-title">No matching products</h3>
          <p class="empty-desc">Try clearing your search keyword, category, or city filter.</p>
          <button class="btn btn-outline" onclick="resetShopFilters()">Reset All Filters</button>
        </div>
      `;
    } else {
      grid.innerHTML = filtered.map((p) => buildProductCardHtml(p)).join('');
    }
  }
}

function applyCategoryFilter(catId) {
  state.shopFilters.category = catId ? String(catId) : '';
  const sel = $('#shop-category-filter');
  if (sel) sel.value = state.shopFilters.category;
  renderShopPage();
}

function filterByStore(businessId) {
  const biz = state.businesses.find((b) => b.businessId === businessId);
  if (!biz) return;
  state.shopFilters.search = biz.businessName;
  const input = $('#shop-search');
  if (input) input.value = biz.businessName;
  navigateTo('shop');
}

function resetShopFilters() {
  state.shopFilters = {
    search: '',
    category: '',
    city: '',
    sort: 'featured',
    inStockOnly: false
  };
  const sInput = $('#shop-search');
  const cSelect = $('#shop-category-filter');
  const cityInput = $('#shop-city-filter');
  const sortSelect = $('#shop-sort-filter');
  const inStockCheck = $('#shop-in-stock-only');

  if (sInput) sInput.value = '';
  if (cSelect) cSelect.value = '';
  if (cityInput) cityInput.value = '';
  if (sortSelect) sortSelect.value = 'featured';
  if (inStockCheck) inStockCheck.checked = false;

  renderShopPage();
}

// ==========================================================================
// 3. CART & CHECKOUT MODULE
// ==========================================================================

async function handleAddToCart(productId) {
  if (!state.currentUser) {
    openModal('user-modal');
    showToast('Please select a customer account first', 'error');
    return;
  }

  const product = state.products.find((p) => p.productId === productId);
  if (!product) return;

  if (Number(product.stockQuantity || 0) <= 0) {
    showToast('Sorry, this product is currently out of stock!', 'error');
    return;
  }

  try {
    // Ensure active cart exists for user
    if (!state.activeCart) {
      state.activeCart = await fetchApi('/carts', {
        method: 'POST',
        body: JSON.stringify({ user: { userId: state.currentUser.userId } })
      });
      state.activeCartItems = [];
    }

    const cartId = state.activeCart.cartId;
    const existing = state.activeCartItems.find(
      (i) => i.product?.productId === productId
    );

    if (existing) {
      const newQty = Number(existing.quantity || 1) + 1;
      await fetchApi(`/cart-items/${cartId}/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ cartId, productId, quantity: newQty })
      });
      showToast(`Updated quantity of "${product.productName}" in cart`, 'success');
    } else {
      await fetchApi('/cart-items', {
        method: 'POST',
        body: JSON.stringify({ cartId, productId, quantity: 1 })
      });
      showToast(`Added "${product.productName}" to cart`, 'success');
    }

    await syncUserCart();
    if (state.activePage === 'cart') renderCartPage();
    if (state.activePage === 'shop') renderShopPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateCartItemQuantity(productId, newQty) {
  if (!state.activeCart) return;
  const cartId = state.activeCart.cartId;

  if (newQty <= 0) {
    await removeCartItem(productId);
    return;
  }

  try {
    await fetchApi(`/cart-items/${cartId}/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ cartId, productId, quantity: newQty })
    });
    await syncUserCart();
    renderCartPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function removeCartItem(productId) {
  if (!state.activeCart) return;
  try {
    await fetchApi(`/cart-items/${state.activeCart.cartId}/${productId}`, {
      method: 'DELETE'
    });
    showToast('Item removed from cart');
    await syncUserCart();
    renderCartPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderCartPage() {
  const container = $('#cart-content-container');
  if (!container) return;

  if (!state.currentUser) {
    container.innerHTML = `
      <div class="empty-state full-col">
        <span class="empty-icon">👤</span>
        <h3 class="empty-title">Select Customer Profile</h3>
        <p class="empty-desc">Choose a customer account to view your cart and place orders.</p>
        <button class="btn btn-primary" onclick="openModal('user-modal')">Select Account</button>
      </div>
    `;
    return;
  }

  if (state.activeCartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state full-col">
        <span class="empty-icon">🛍️</span>
        <h3 class="empty-title">Your shopping cart is empty</h3>
        <p class="empty-desc">Discover fresh produce, baked goods, and crafts from neighborhood sellers.</p>
        <button class="btn btn-primary" onclick="navigateTo('shop')">Explore Marketplace</button>
      </div>
    `;
    return;
  }

  const subtotal = state.activeCartItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.product?.price || 0),
    0
  );

  const itemsHtml = state.activeCartItems
    .map((item) => {
      const p = item.product || {};
      const lineTotal = Number(item.quantity) * Number(p.price || 0);
      return `
      <div class="cart-item-row">
        <div class="cart-item-icon">${getCategoryIcon(p.category?.categoryName)}</div>
        <div class="cart-item-details">
          <strong>${escapeHtml(p.productName)}</strong>
          <span class="muted">${escapeHtml(p.business?.businessName || 'Local Seller')} · ${formatINR(p.price)} each</span>
        </div>
        <div class="qty-counter">
          <button class="qty-btn" onclick="updateCartItemQuantity(${p.productId}, ${item.quantity - 1})">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartItemQuantity(${p.productId}, ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-price-col">
          <span class="cart-item-total">${formatINR(lineTotal)}</span>
          <button class="btn btn-link" style="color:var(--danger); font-size:12px; margin-top:4px;" onclick="removeCartItem(${p.productId})">Remove</button>
        </div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div class="cart-items-panel">
      <div class="panel-header" style="padding:0 0 16px 0; margin-bottom:16px;">
        <h3>Cart Items (${state.activeCartItems.length})</h3>
        <button class="btn btn-ghost btn-sm" onclick="navigateTo('shop')">+ Add More Items</button>
      </div>
      <div class="cart-items-list">
        ${itemsHtml}
      </div>
    </div>

    <aside class="cart-summary-card">
      <h3 class="summary-title">Order Summary</h3>
      <div class="summary-line">
        <span>Subtotal</span>
        <strong>${formatINR(subtotal)}</strong>
      </div>
      <div class="summary-line">
        <span>Local Delivery / Pickup</span>
        <span class="badge badge-emerald">Free</span>
      </div>
      <div class="summary-line">
        <span>Estimated Taxes</span>
        <span>₹0.00</span>
      </div>
      <div class="summary-line total">
        <span>Total Amount</span>
        <strong>${formatINR(subtotal)}</strong>
      </div>

      <div class="shipping-box">
        <label class="form-label" for="checkout-shipping-address">Delivery Address</label>
        <textarea id="checkout-shipping-address" class="textarea-field full-width mt-1" rows="2" placeholder="Enter delivery address…">${escapeHtml(state.currentUser.address || 'Vellore, Tamil Nadu')}</textarea>
      </div>

      <button class="btn btn-primary btn-lg full-btn" onclick="handlePlaceOrderProcedure()">
        ⚡ Place Order (Stored Procedure)
      </button>

      <div class="mt-3 text-center">
        <small class="text-muted">Direct atomic call to <code>POST /api/orders/place/{cartId}</code></small>
      </div>
    </aside>
  `;
}

// Order Checkout via PostgreSQL Stored Procedure
async function handlePlaceOrderProcedure() {
  if (!state.activeCart) {
    showToast('Active cart not found', 'error');
    return;
  }

  const address = $('#checkout-shipping-address')?.value || state.currentUser?.address || '';
  if (!address.trim()) {
    showToast('Please provide a delivery address', 'error');
    return;
  }

  try {
    const cartId = state.activeCart.cartId;
    await fetchApi(`/orders/place/${cartId}`, {
      method: 'POST'
    });

    showToast('🎉 Order successfully placed via PostgreSQL Procedure!', 'success');

    // Refresh products to reflect reduced stock and refresh orders
    const [products, orders, orderItems] = await Promise.all([
      fetchApi('/products'),
      fetchApi('/orders'),
      fetchApi('/order-items')
    ]);
    state.products = products || [];
    state.orders = orders || [];
    state.orderItems = orderItems || [];

    await syncUserCart();
    navigateTo('orders');
  } catch (err) {
    showToast(`Order failed: ${err.message}`, 'error');
  }
}

// ==========================================================================
// 4. BUSINESSES DIRECTORY MODULE
// ==========================================================================

function renderBusinessesPage() {
  const cityFilter = $('#business-city-filter');
  const searchInput = $('#business-search-input');
  const countEl = $('#business-results-count');
  const grid = $('#businesses-grid');

  // Populate city dropdown
  const cities = [...new Set(state.businesses.map((b) => b.city).filter(Boolean))];
  if (cityFilter) {
    const current = cityFilter.value;
    cityFilter.innerHTML =
      '<option value="">All Cities</option>' +
      cities.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    cityFilter.value = current;
  }

  let filtered = [...state.businesses];
  const query = (searchInput?.value || '').trim().toLowerCase();
  const selectedCity = cityFilter?.value || '';

  if (query) {
    filtered = filtered.filter(
      (b) =>
        (b.businessName || '').toLowerCase().includes(query) ||
        (b.description || '').toLowerCase().includes(query) ||
        (b.user?.fullName || '').toLowerCase().includes(query) ||
        (b.phone || '').toLowerCase().includes(query)
    );
  }

  if (selectedCity) {
    filtered = filtered.filter((b) => b.city === selectedCity);
  }

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${state.businesses.length} registered businesses`;
  }

  if (grid) {
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state full-col">
          <span class="empty-icon">🏪</span>
          <h3 class="empty-title">No businesses found</h3>
          <p class="empty-desc">Try clearing your search query or register a new business.</p>
          <button class="btn btn-primary" onclick="openBusinessFormModal()">+ Register Business</button>
        </div>
      `;
    } else {
      grid.innerHTML = filtered
        .map((biz) => {
          const productCount = state.products.filter(
            (p) => p.business?.businessId === biz.businessId
          ).length;
          const isOwner =
            state.currentUser &&
            (biz.user?.userId === state.currentUser.userId || state.currentUser.role === 'ADMIN');

          return `
          <article class="business-card">
            <div class="business-card-top">
              <div class="business-avatar">${getInitials(biz.businessName)}</div>
              <div>
                <h3 class="business-card-title">${escapeHtml(biz.businessName)}</h3>
                <span class="business-owner-tag">Owner: ${escapeHtml(biz.user?.fullName || 'Seller')}</span>
              </div>
            </div>
            
            <p class="business-card-desc">${escapeHtml(biz.description || 'Neighborhood local store.')}</p>

            <div class="business-meta-list">
              <div class="business-meta-row">
                <span>📍</span>
                <span>${escapeHtml(biz.address)}, ${escapeHtml(biz.city)}, ${escapeHtml(biz.state)} ${escapeHtml(biz.postalCode)}</span>
              </div>
              <div class="business-meta-row">
                <span>📞</span>
                <span>${escapeHtml(biz.phone || 'N/A')}</span>
              </div>
              <div class="business-meta-row">
                <span>📦</span>
                <span>${productCount} product listings</span>
              </div>
            </div>

            <div class="business-actions-row">
              <button class="btn btn-primary btn-sm" onclick="filterByStore(${biz.businessId})">Browse Catalog</button>
              ${
                isOwner
                  ? `
                <button class="btn btn-outline btn-sm" onclick="openBusinessFormModal(${biz.businessId})">Edit</button>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteBusiness(${biz.businessId})">Delete</button>
              `
                  : ''
              }
            </div>
          </article>
        `;
        })
        .join('');
    }
  }
}

// Business CRUD Handlers
function openBusinessFormModal(businessId = null) {
  const modal = $('#business-form-modal');
  const title = $('#business-form-title');
  const form = $('#business-form');
  const ownerSelect = $('#business-form-owner');

  // Populate owner select with users
  if (ownerSelect) {
    ownerSelect.innerHTML = state.users
      .map(
        (u) =>
          `<option value="${u.userId}">${escapeHtml(u.fullName || u.email)} (${u.role})</option>`
      )
      .join('');
  }

  if (businessId) {
    const biz = state.businesses.find((b) => b.businessId === businessId);
    if (!biz) return;
    if (title) title.textContent = 'Edit Business Profile';
    $('#business-form-id').value = biz.businessId;
    $('#business-form-name').value = biz.businessName || '';
    $('#business-form-desc').value = biz.description || '';
    if (ownerSelect) ownerSelect.value = biz.user?.userId || state.currentUser?.userId;
    $('#business-form-address').value = biz.address || '';
    $('#business-form-city').value = biz.city || '';
    $('#business-form-state').value = biz.state || '';
    $('#business-form-postal').value = biz.postalCode || '';
    $('#business-form-phone').value = biz.phone || '';
  } else {
    if (title) title.textContent = 'Register New Business';
    form.reset();
    $('#business-form-id').value = '';
    if (ownerSelect && state.currentUser) ownerSelect.value = state.currentUser.userId;
  }

  openModal('business-form-modal');
}

async function handleBusinessFormSubmit(e) {
  e.preventDefault();
  const id = $('#business-form-id').value;
  const body = {
    userId: Number($('#business-form-owner').value),
    businessName: $('#business-form-name').value.trim(),
    description: $('#business-form-desc').value.trim(),
    address: $('#business-form-address').value.trim(),
    city: $('#business-form-city').value.trim(),
    state: $('#business-form-state').value.trim(),
    postalCode: $('#business-form-postal').value.trim(),
    phone: $('#business-form-phone').value.trim()
  };

  try {
    if (id) {
      await fetchApi(`/businesses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      showToast('Business updated successfully', 'success');
    } else {
      await fetchApi('/businesses', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('Business registered successfully', 'success');
    }

    state.businesses = (await fetchApi('/businesses')) || [];
    closeModal('business-form-modal');
    renderBusinessesPage();
    if (state.activePage === 'seller') renderSellerPage();
    if (state.activePage === 'admin') renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteBusiness(id) {
  if (!confirm('Are you sure you want to delete this business?')) return;
  try {
    await fetchApi(`/businesses/${id}`, { method: 'DELETE' });
    showToast('Business deleted successfully', 'success');
    state.businesses = (await fetchApi('/businesses')) || [];
    renderBusinessesPage();
    if (state.activePage === 'seller') renderSellerPage();
    if (state.activePage === 'admin') renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================================================
// 5. ORDERS TRACKING & REVIEWS MODULE
// ==========================================================================

function renderOrdersPage() {
  const container = $('#orders-list-container');
  if (!container) return;

  // Filter orders
  let list = [...state.orders];
  if (state.currentUser && state.currentUser.role !== 'ADMIN') {
    list = list.filter((o) => o.user?.userId === state.currentUser.userId);
  }

  if (state.orderFilterStatus !== 'ALL') {
    list = list.filter((o) => o.orderStatus === state.orderFilterStatus);
  }

  list.sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📦</span>
        <h3 class="empty-title">No orders found</h3>
        <p class="empty-desc">${
          state.orderFilterStatus !== 'ALL'
            ? `No orders matching status "${state.orderFilterStatus}".`
            : 'You have not placed any orders yet.'
        }</p>
        <button class="btn btn-primary" onclick="navigateTo('shop')">Browse Marketplace</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list
    .map((order) => {
      // Find order items for this order
      const items = state.orderItems.filter((i) => i.order?.orderId === order.orderId);
      const total = items.reduce(
        (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice || 0),
        0
      );

      const itemsHtml =
        items.length > 0
          ? items
              .map(
                (item) => `
            <div class="order-item-inline">
              <div>
                <strong>${escapeHtml(item.product?.productName || 'Product')}</strong>
                <span class="muted"> × ${item.quantity} (${formatINR(item.unitPrice)})</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <strong>${formatINR(Number(item.quantity) * Number(item.unitPrice))}</strong>
                <button class="btn btn-outline btn-sm" onclick="openReviewModal(${order.orderId}, ${item.product?.productId}, '${escapeHtml(item.product?.productName || 'Product')}')">⭐ Review</button>
              </div>
            </div>
          `
              )
              .join('')
          : '<p class="muted">Item records stored in database.</p>';

      const canManage =
        state.currentUser &&
        (state.currentUser.role === 'ADMIN' || state.currentUser.role === 'SELLER');

      return `
      <article class="order-card">
        <div class="order-card-header">
          <div class="order-ref">
            <span style="font-size:22px">📦</span>
            <div>
              <strong>Order #ORD-${order.orderId}</strong>
              <div class="muted" style="font-size:12px">${formatDate(order.orderDate)} · Customer: ${escapeHtml(order.user?.fullName || order.user?.email || 'N/A')}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="status-pill status-${order.orderStatus}">${order.orderStatus || 'PENDING'}</span>
            ${
              canManage
                ? `<button class="btn btn-outline btn-sm" onclick="openOrderStatusModal(${order.orderId})">Update Status</button>`
                : ''
            }
          </div>
        </div>

        <div class="order-items-grid">
          ${itemsHtml}
        </div>

        <div class="order-card-footer">
          <div class="muted" style="font-size:13px">
            📍 <strong>Shipping:</strong> ${escapeHtml(order.shippingAddress || 'Local fulfillment')}
          </div>
          <div>
            <span class="muted" style="font-size:13px; margin-right:8px;">Order Total:</span>
            <strong style="font-size:18px; color:var(--text-main);">${formatINR(total)}</strong>
          </div>
        </div>
      </article>
    `;
    })
    .join('');
}

// Order Status Update
function openOrderStatusModal(orderId) {
  const order = state.orders.find((o) => o.orderId === orderId);
  if (!order) return;

  $('#order-status-id').value = order.orderId;
  $('#order-status-ref').value = `Order #ORD-${order.orderId} (${order.user?.fullName || 'User'})`;
  $('#order-status-select').value = order.orderStatus || 'PENDING';
  $('#order-status-address').value = order.shippingAddress || '';

  openModal('order-status-modal');
}

async function handleOrderStatusSubmit(e) {
  e.preventDefault();
  const id = $('#order-status-id').value;
  const status = $('#order-status-select').value;
  const address = $('#order-status-address').value;
  const order = state.orders.find((o) => String(o.orderId) === String(id));
  if (!order) return;

  try {
    await fetchApi(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        user: { userId: order.user?.userId },
        orderDate: order.orderDate,
        orderStatus: status,
        shippingAddress: address
      })
    });

    showToast(`Order status updated to ${status}`, 'success');
    closeModal('order-status-modal');
    state.orders = (await fetchApi('/orders')) || [];
    renderOrdersPage();
    if (state.activePage === 'admin') renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================================================
// 6. REVIEWS & RATINGS MODULE
// ==========================================================================

function openReviewModal(orderId, productId, productName = '') {
  if (!state.currentUser) {
    openModal('user-modal');
    return;
  }

  $('#review-form-order-id').value = orderId;
  $('#review-form-product-id').value = productId;
  $('#review-form-product-name').value = productName;
  $('#review-form-rating').value = '5';
  $('#review-form-comment').value = '';
  updateStarRatingDisplay(5);

  const orderSelect = $('#review-form-order-select');
  if (orderSelect) {
    orderSelect.innerHTML = `<option value="${orderId}">Order #ORD-${orderId}</option>`;
  }

  openModal('review-form-modal');
}

function updateStarRatingDisplay(val) {
  $$('.star-btn').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.value) <= val);
  });
  const label = $('#star-rating-label');
  const labels = {
    1: '1.0 - Poor',
    2: '2.0 - Fair',
    3: '3.0 - Good',
    4: '4.0 - Very Good',
    5: '5.0 - Excellent'
  };
  if (label) label.textContent = labels[val] || `${val}.0`;
}

async function handleReviewFormSubmit(e) {
  e.preventDefault();
  const orderId = Number($('#review-form-order-id').value);
  const productId = Number($('#review-form-product-id').value);
  const rating = Number($('#review-form-rating').value);
  const comment = $('#review-form-comment').value.trim();

  try {
    await fetchApi('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        order: { orderId },
        product: { productId },
        rating,
        comment
      })
    });

    showToast('Thank you! Review submitted successfully', 'success');
    closeModal('review-form-modal');
    state.reviews = (await fetchApi('/reviews')) || [];
    renderOrdersPage();
    if (state.activePage === 'shop') renderShopPage();
    if (state.activePage === 'reports') renderReportsPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================================================
// 7. SELLER PORTAL MODULE
// ==========================================================================

function renderSellerPage() {
  const dropdown = $('#seller-store-dropdown');
  const storeNameEl = $('#seller-current-store-name');

  // Filter seller businesses
  const userStores = state.businesses.filter(
    (b) => state.currentUser && b.user?.userId === state.currentUser.userId
  );

  const availableStores = userStores.length > 0 ? userStores : state.businesses;

  if (availableStores.length > 0) {
    if (
      !state.sellerBusiness ||
      !availableStores.some((b) => b.businessId === state.sellerBusiness.businessId)
    ) {
      state.sellerBusiness = availableStores[0];
      localStorage.setItem('lm-seller-business-id', state.sellerBusiness.businessId);
    }
  } else {
    state.sellerBusiness = null;
  }

  if (storeNameEl) {
    storeNameEl.textContent = state.sellerBusiness
      ? `${state.sellerBusiness.businessName} (${state.sellerBusiness.city})`
      : 'No Registered Store';
  }

  if (dropdown) {
    dropdown.innerHTML = availableStores
      .map(
        (b) =>
          `<option value="${b.businessId}" ${
            state.sellerBusiness?.businessId === b.businessId ? 'selected' : ''
          }>${escapeHtml(b.businessName)} · ${escapeHtml(b.city)}</option>`
      )
      .join('');
  }

  // Render active seller tab
  $$('[data-seller-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sellerTab === state.sellerTab);
  });
  $$('.seller-tab-content').forEach((tab) => tab.classList.add('hidden'));
  $(`#seller-tab-${state.sellerTab}`)?.classList.remove('hidden');

  if (state.sellerTab === 'products') renderSellerProducts();
  if (state.sellerTab === 'recommendations') renderSellerRecommendations();
  if (state.sellerTab === 'profile') renderSellerProfile();
}

function renderSellerProducts() {
  const tbody = $('#seller-products-tbody');
  if (!tbody) return;

  if (!state.sellerBusiness) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center muted">No store selected.</td></tr>';
    return;
  }

  const items = state.products.filter(
    (p) => p.business?.businessId === state.sellerBusiness.businessId
  );

  if (items.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center muted" style="padding:24px;">No products added to this store yet. Click "+ Add Product" to create one.</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map((p) => {
      const stock = Number(p.stockQuantity || 0);
      const stockBadge =
        stock <= 0
          ? '<span class="stock-pill out-of-stock">Out of Stock</span>'
          : stock <= 5
          ? `<span class="stock-pill low-stock">${stock} Low</span>`
          : `<span class="stock-pill in-stock">${stock} Healthy</span>`;

      return `
      <tr>
        <td><code>#${p.productId}</code></td>
        <td><strong>${escapeHtml(p.productName)}</strong></td>
        <td><span class="badge badge-emerald">${escapeHtml(p.category?.categoryName || 'General')}</span></td>
        <td><strong>${formatINR(p.price)}</strong></td>
        <td>${stock}</td>
        <td>${stockBadge}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openProductFormModal(${p.productId})">Edit</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteProduct(${p.productId})">Delete</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

// Smart Inventory Recommendations Feeds
async function renderSellerRecommendations() {
  const tbody = $('#seller-recommendations-tbody');
  if (!tbody || !state.sellerBusiness) return;

  try {
    const data =
      (await fetchApi(
        `/inventory/recommendations/business/${state.sellerBusiness.businessId}`
      )) || [];

    // KPI Summary
    const storeProds = state.products.filter(
      (p) => p.business?.businessId === state.sellerBusiness.businessId
    );
    const lowStockCount = data.filter((x) => x.inventoryStatus === 'LOW').length;
    const healthyCount = data.filter((x) => x.inventoryStatus === 'HEALTHY').length;
    const totalReorders = data.reduce(
      (sum, x) => sum + Number(x.suggestedReorderQuantity || 0),
      0
    );

    $('#kpi-seller-catalog-count').textContent = storeProds.length;
    $('#kpi-seller-low-stock').textContent = lowStockCount;
    $('#kpi-seller-healthy-stock').textContent = healthyCount;
    $('#kpi-seller-reorder-units').textContent = totalReorders;

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center muted" style="padding:24px;">No recommendation analytics generated for this store yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map((row) => {
        const isLow = row.inventoryStatus === 'LOW';
        const statusBadge = isLow
          ? '<span class="badge badge-rose">LOW STOCK</span>'
          : '<span class="badge badge-emerald">HEALTHY</span>';

        return `
        <tr>
          <td><strong>${escapeHtml(row.productName)}</strong></td>
          <td>${row.currentStock}</td>
          <td>${row.unitsOrdered60d || 0}</td>
          <td>${Number(row.avgDailyDemand || 0).toFixed(2)} / day</td>
          <td>${row.estimatedDaysRemaining !== null ? `${Number(row.estimatedDaysRemaining).toFixed(0)} days` : '—'}</td>
          <td>${statusBadge}</td>
          <td>
            ${
              row.suggestedReorderQuantity > 0
                ? `<strong style="color:var(--warning)">+${row.suggestedReorderQuantity} units</strong>`
                : '<span class="muted">0</span>'
            }
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${isLow ? 'badge-amber' : 'badge-emerald'}">${escapeHtml(row.recommendation)}</span>
              ${
                row.suggestedReorderQuantity > 0
                  ? `<button class="btn btn-primary btn-sm" onclick="quickRestockProduct(${row.productId}, ${row.currentStock + row.suggestedReorderQuantity})">Restock Now</button>`
                  : ''
              }
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center muted" style="padding:20px;">Failed to load recommendations: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function quickRestockProduct(productId, newStock) {
  const p = state.products.find((x) => x.productId === productId);
  if (!p) return;
  try {
    await fetchApi(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        businessId: p.business?.businessId,
        categoryId: p.category?.categoryId,
        productName: p.productName,
        description: p.description,
        price: p.price,
        stockQuantity: newStock
      })
    });
    showToast(`Restocked ${p.productName} to ${newStock} units`, 'success');
    state.products = (await fetchApi('/products')) || [];
    renderSellerPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderSellerProfile() {
  const container = $('#seller-profile-card-container');
  if (!container || !state.sellerBusiness) {
    if (container)
      container.innerHTML = '<div class="empty-state">No store selected.</div>';
    return;
  }

  const b = state.sellerBusiness;
  container.innerHTML = `
    <div class="panel-card" style="padding:28px;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px;">
        <div>
          <h2>${escapeHtml(b.businessName)}</h2>
          <span class="muted">Owner: ${escapeHtml(b.user?.fullName || 'Seller')} (${escapeHtml(b.user?.email || '')})</span>
        </div>
        <button class="btn btn-outline" onclick="openBusinessFormModal(${b.businessId})">⚙️ Edit Store Info</button>
      </div>

      <p style="font-size:15px; margin-bottom:24px;">${escapeHtml(b.description || 'No description provided.')}</p>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
        <div class="kpi-card">
          <span class="kpi-title">Address</span>
          <strong>${escapeHtml(b.address)}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">City / State</span>
          <strong>${escapeHtml(b.city)}, ${escapeHtml(b.state)}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Postal Code</span>
          <strong>${escapeHtml(b.postalCode)}</strong>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Phone Contact</span>
          <strong>${escapeHtml(b.phone)}</strong>
        </div>
      </div>
    </div>
  `;
}

// Product CRUD Handlers
function openProductFormModal(productId = null) {
  const title = $('#product-form-title');
  const bizSelect = $('#product-form-business');
  const catSelect = $('#product-form-category');
  const form = $('#product-form');

  // Populate businesses dropdown
  if (bizSelect) {
    bizSelect.innerHTML = state.businesses
      .map(
        (b) =>
          `<option value="${b.businessId}" ${
            state.sellerBusiness?.businessId === b.businessId ? 'selected' : ''
          }>${escapeHtml(b.businessName)}</option>`
      )
      .join('');
  }

  // Populate categories dropdown
  if (catSelect) {
    catSelect.innerHTML = state.categories
      .map((c) => `<option value="${c.categoryId}">${escapeHtml(c.categoryName)}</option>`)
      .join('');
  }

  if (productId) {
    const p = state.products.find((x) => x.productId === productId);
    if (!p) return;
    if (title) title.textContent = 'Edit Product';
    $('#product-form-id').value = p.productId;
    $('#product-form-name').value = p.productName || '';
    $('#product-form-desc').value = p.description || '';
    if (bizSelect) bizSelect.value = p.business?.businessId;
    if (catSelect) catSelect.value = p.category?.categoryId;
    $('#product-form-price').value = p.price;
    $('#product-form-stock').value = p.stockQuantity;
  } else {
    if (title) title.textContent = 'Add New Product';
    form.reset();
    $('#product-form-id').value = '';
    if (bizSelect && state.sellerBusiness) {
      bizSelect.value = state.sellerBusiness.businessId;
    }
  }

  openModal('product-form-modal');
}

async function handleProductFormSubmit(e) {
  e.preventDefault();
  const id = $('#product-form-id').value;
  const body = {
    businessId: Number($('#product-form-business').value),
    categoryId: Number($('#product-form-category').value),
    productName: $('#product-form-name').value.trim(),
    description: $('#product-form-desc').value.trim(),
    price: Number($('#product-form-price').value),
    stockQuantity: Number($('#product-form-stock').value)
  };

  try {
    if (id) {
      await fetchApi(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      showToast('Product updated successfully', 'success');
    } else {
      await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('Product added successfully', 'success');
    }

    state.products = (await fetchApi('/products')) || [];
    closeModal('product-form-modal');
    renderHomePage();
    renderShopPage();
    if (state.activePage === 'seller') renderSellerPage();
    if (state.activePage === 'reports') renderReportsPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await fetchApi(`/products/${productId}`, { method: 'DELETE' });
    showToast('Product deleted successfully', 'success');
    state.products = (await fetchApi('/products')) || [];
    renderHomePage();
    renderShopPage();
    if (state.activePage === 'seller') renderSellerPage();
    if (state.activePage === 'reports') renderReportsPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Product Details & Reviews Modal
function showProductDetailsModal(productId) {
  const product = state.products.find((p) => p.productId === productId);
  if (!product) return;

  $('#product-detail-name').textContent = product.productName;
  $('#product-detail-category-badge').textContent = product.category?.categoryName || 'GENERAL';

  const reviews = state.reviews.filter((r) => r.product?.productId === productId);
  const avg =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const stock = Number(product.stockQuantity || 0);

  const reviewsHtml =
    reviews.length > 0
      ? reviews
          .map(
            (r) => `
        <div style="padding:14px; background:#f8fafc; border-radius:var(--radius-md); margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span class="star-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
            <span class="muted" style="font-size:12px;">${formatDate(r.reviewDate)}</span>
          </div>
          <p style="font-size:13.5px; color:var(--text-main);">${escapeHtml(r.comment || 'No comment provided.')}</p>
        </div>
      `
          )
          .join('')
      : '<p class="muted">No customer reviews yet. Be the first to try this product!</p>';

  $('#product-detail-body').innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1.3fr; gap:24px; margin-bottom:24px;">
      <div style="height:220px; background:linear-gradient(135deg,#f1f5f9,#e2e8f0); border-radius:var(--radius-lg); display:grid; place-items:center; font-size:64px;">
        ${getCategoryIcon(product.category?.categoryName)}
      </div>
      <div>
        <div class="muted" style="font-size:13px; margin-bottom:8px;">
          Sold by: <strong>${escapeHtml(product.business?.businessName || 'Local Seller')}</strong> (${escapeHtml(product.business?.city || 'Local')})
        </div>
        <div style="font-size:28px; font-weight:850; color:var(--text-main); margin-bottom:12px;">
          ${formatINR(product.price)}
        </div>
        <div style="margin-bottom:14px;">
          <span class="stock-pill ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${stock > 0 ? `${stock} in stock` : 'Out of Stock'}
          </span>
          ${
            avg
              ? `<span class="star-rating" style="margin-left:10px;">★ ${avg} / 5.0 (${reviews.length} reviews)</span>`
              : ''
          }
        </div>
        <p style="font-size:14px; line-height:1.55; margin-bottom:20px;">
          ${escapeHtml(product.description || 'Artisan local goods crafted in the neighborhood.')}
        </p>
        <button class="btn btn-primary full-btn" ${stock <= 0 ? 'disabled' : ''} onclick="handleAddToCart(${product.productId}); closeModal('product-detail-modal');">
          + Add to Shopping Cart
        </button>
      </div>
    </div>

    <div style="border-top:1px solid var(--border-light); padding-top:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h4>Customer Reviews (${reviews.length})</h4>
        <button class="btn btn-outline btn-sm" onclick="closeModal('product-detail-modal'); navigateTo('orders');">View My Orders to Review</button>
      </div>
      <div style="max-height:240px; overflow-y:auto;">
        ${reviewsHtml}
      </div>
    </div>
  `;

  openModal('product-detail-modal');
}

// ==========================================================================
// 8. EXECUTIVE ANALYTICS & REPORTS DASHBOARD
// ==========================================================================

async function renderReportsPage() {
  // Highlight tab
  $$('[data-report-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.reportTab === state.reportTab);
  });
  $$('.report-content-panel').forEach((panel) => panel.classList.add('hidden'));
  $(`#report-tab-${state.reportTab}`)?.classList.remove('hidden');

  try {
    const [cSummary, pCatalog, pPerf, pRatings, sPerf] = await Promise.allSettled([
      fetchApi('/reports/customer-order-summary'),
      fetchApi('/reports/product-catalog'),
      fetchApi('/reports/product-performance'),
      fetchApi('/reports/product-ratings'),
      fetchApi('/reports/seller-performance')
    ]);

    state.reports.customerSummary = cSummary.status === 'fulfilled' ? cSummary.value || [] : [];
    state.reports.productCatalog = pCatalog.status === 'fulfilled' ? pCatalog.value || [] : [];
    state.reports.productPerformance = pPerf.status === 'fulfilled' ? pPerf.value || [] : [];
    state.reports.productRatings = pRatings.status === 'fulfilled' ? pRatings.value || [] : [];
    state.reports.sellerPerformance = sPerf.status === 'fulfilled' ? sPerf.value || [] : [];

    // Update Top KPIs
    const totalSpent = state.reports.customerSummary.reduce(
      (sum, r) => sum + Number(r.totalSpent || 0),
      0
    );
    const totalOrders = state.reports.customerSummary.reduce(
      (sum, r) => sum + Number(r.totalOrders || 0),
      0
    );
    const unitsSold = state.reports.productPerformance.reduce(
      (sum, r) => sum + Number(r.unitsSold || 0),
      0
    );

    const validRatings = state.reports.productRatings.filter(
      (r) => Number(r.averageRating || 0) > 0
    );
    const avgRating =
      validRatings.length > 0
        ? (
            validRatings.reduce((sum, r) => sum + Number(r.averageRating), 0) /
            validRatings.length
          ).toFixed(1)
        : '0.0';

    $('#rep-kpi-total-spent').textContent = formatINR(totalSpent);
    $('#rep-kpi-total-orders').textContent = totalOrders;
    $('#rep-kpi-units-sold').textContent = unitsSold;
    $('#rep-kpi-avg-rating').textContent = `${avgRating} ★`;
    $('#rep-kpi-seller-count').textContent = state.reports.sellerPerformance.length;

    // Render Sub-report
    if (state.reportTab === 'customer-summary') renderReportCustomerSummary();
    if (state.reportTab === 'product-catalog') renderReportProductCatalog();
    if (state.reportTab === 'product-performance') renderReportProductPerformance();
    if (state.reportTab === 'product-ratings') renderReportProductRatings();
    if (state.reportTab === 'seller-performance') renderReportSellerPerformance();
  } catch (err) {
    showToast(`Failed loading reports: ${err.message}`, 'error');
  }
}

// 1. Customer Order Summary Report
function renderReportCustomerSummary() {
  const tbody = $('#customer-summary-tbody');
  const chart = $('#customer-summary-chart-container');
  const data = state.reports.customerSummary;

  if (tbody) {
    tbody.innerHTML =
      data.length === 0
        ? '<tr><td colspan="6" class="text-center muted">No customer data returned from SQL view.</td></tr>'
        : data
            .map((row) => {
              const aov =
                Number(row.totalOrders) > 0
                  ? Number(row.totalSpent) / Number(row.totalOrders)
                  : 0;
              return `
          <tr>
            <td><code>#${row.userId}</code></td>
            <td><strong>${escapeHtml(row.fullName)}</strong></td>
            <td>${row.totalOrders}</td>
            <td>${row.itemsPurchased}</td>
            <td><strong>${formatINR(row.totalSpent)}</strong></td>
            <td>${formatINR(aov)}</td>
          </tr>
        `;
            })
            .join('');
  }

  // Visual Bar Chart
  if (chart && data.length > 0) {
    const maxSpent = Math.max(...data.map((r) => Number(r.totalSpent || 0)), 1);
    chart.innerHTML = `
      <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:12px;">Top Customer Lifetime Spend</h4>
      ${data
        .map((r) => {
          const pct = Math.min(100, (Number(r.totalSpent) / maxSpent) * 100);
          return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${escapeHtml(r.fullName)}</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width:${pct}%"></div>
            </div>
            <span class="chart-bar-val">${formatINR(r.totalSpent)}</span>
          </div>
        `;
        })
        .join('')}
    `;
  }
}

// 2. Product Catalog Report
function renderReportProductCatalog() {
  const tbody = $('#product-catalog-tbody');
  const query = ($('#report-catalog-search')?.value || '').toLowerCase();
  let data = state.reports.productCatalog;

  if (query) {
    data = data.filter(
      (r) =>
        (r.productName || '').toLowerCase().includes(query) ||
        (r.businessName || '').toLowerCase().includes(query) ||
        (r.categoryName || '').toLowerCase().includes(query)
    );
  }

  if (tbody) {
    tbody.innerHTML =
      data.length === 0
        ? '<tr><td colspan="7" class="text-center muted">No matching catalog items.</td></tr>'
        : data
            .map(
              (row) => `
          <tr>
            <td><code>#${row.productId}</code></td>
            <td><strong>${escapeHtml(row.productName)}</strong></td>
            <td>${escapeHtml(row.businessName)}</td>
            <td><span class="badge badge-emerald">${escapeHtml(row.categoryName)}</span></td>
            <td style="max-width:250px;" class="muted">${escapeHtml(row.description || '—')}</td>
            <td><strong>${formatINR(row.price)}</strong></td>
            <td>${row.stockQuantity}</td>
          </tr>
        `
            )
            .join('');
  }
}

// 3. Product Performance Report
function renderReportProductPerformance() {
  const tbody = $('#product-performance-tbody');
  const chart = $('#product-performance-chart-container');
  const data = state.reports.productPerformance;

  const totalRev = data.reduce((sum, r) => sum + Number(r.revenue || 0), 0) || 1;

  if (tbody) {
    tbody.innerHTML =
      data.length === 0
        ? '<tr><td colspan="7" class="text-center muted">No performance data available.</td></tr>'
        : data
            .map((row) => {
              const share = ((Number(row.revenue || 0) / totalRev) * 100).toFixed(1);
              return `
          <tr>
            <td><code>#${row.productId}</code></td>
            <td><strong>${escapeHtml(row.productName)}</strong></td>
            <td>${escapeHtml(row.businessName)}</td>
            <td><span class="badge badge-blue">${escapeHtml(row.categoryName)}</span></td>
            <td>${row.unitsSold}</td>
            <td><strong>${formatINR(row.revenue)}</strong></td>
            <td><span class="badge badge-purple">${share}%</span></td>
          </tr>
        `;
            })
            .join('');
  }

  // Visual Bar Chart
  if (chart && data.length > 0) {
    const maxRev = Math.max(...data.map((r) => Number(r.revenue || 0)), 1);
    chart.innerHTML = `
      <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:12px;">Top Products by Gross Revenue</h4>
      ${data
        .slice(0, 6)
        .map((r) => {
          const pct = Math.min(100, (Number(r.revenue) / maxRev) * 100);
          return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${escapeHtml(r.productName)}</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill purple" style="width:${pct}%"></div>
            </div>
            <span class="chart-bar-val">${formatINR(r.revenue)}</span>
          </div>
        `;
        })
        .join('')}
    `;
  }
}

// 4. Product Ratings Report
function renderReportProductRatings() {
  const tbody = $('#product-ratings-tbody');
  const chart = $('#product-ratings-chart-container');
  const data = state.reports.productRatings;

  if (tbody) {
    tbody.innerHTML =
      data.length === 0
        ? '<tr><td colspan="6" class="text-center muted">No ratings records available.</td></tr>'
        : data
            .map((row) => {
              const rating = Number(row.averageRating || 0);
              const badge =
                rating >= 4.5
                  ? '<span class="badge badge-emerald">Top Rated</span>'
                  : rating >= 3.5
                  ? '<span class="badge badge-amber">Satisfactory</span>'
                  : '<span class="badge badge-rose">Needs Attention</span>';

              return `
          <tr>
            <td><code>#${row.productId}</code></td>
            <td><strong>${escapeHtml(row.productName)}</strong></td>
            <td>${escapeHtml(row.businessName)}</td>
            <td><span class="star-rating">★ ${rating.toFixed(2)}</span></td>
            <td>${row.reviewCount}</td>
            <td>${badge}</td>
          </tr>
        `;
            })
            .join('');
  }

  if (chart && data.length > 0) {
    chart.innerHTML = `
      <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:12px;">Customer Rating Breakdown (0 - 5 Stars)</h4>
      ${data
        .slice(0, 6)
        .map((r) => {
          const pct = (Number(r.averageRating || 0) / 5) * 100;
          return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${escapeHtml(r.productName)}</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width:${pct}%"></div>
            </div>
            <span class="chart-bar-val">${Number(r.averageRating || 0).toFixed(1)} ★</span>
          </div>
        `;
        })
        .join('')}
    `;
  }
}

// 5. Seller Performance Report
function renderReportSellerPerformance() {
  const tbody = $('#seller-performance-tbody');
  const chart = $('#seller-performance-chart-container');
  const data = state.reports.sellerPerformance;

  if (tbody) {
    tbody.innerHTML =
      data.length === 0
        ? '<tr><td colspan="5" class="text-center muted">No seller records available.</td></tr>'
        : data
            .map(
              (row) => `
          <tr>
            <td><code>#${row.businessId}</code></td>
            <td><strong>${escapeHtml(row.businessName)}</strong></td>
            <td>${row.totalOrders}</td>
            <td>${row.itemsSold}</td>
            <td><strong>${formatINR(row.totalRevenue)}</strong></td>
          </tr>
        `
            )
            .join('');
  }

  if (chart && data.length > 0) {
    const maxRev = Math.max(...data.map((r) => Number(r.totalRevenue || 0)), 1);
    chart.innerHTML = `
      <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:12px;">Seller Revenue Leaderboard</h4>
      ${data
        .map((r) => {
          const pct = Math.min(100, (Number(r.totalRevenue) / maxRev) * 100);
          return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${escapeHtml(r.businessName)}</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill blue" style="width:${pct}%"></div>
            </div>
            <span class="chart-bar-val">${formatINR(r.totalRevenue)}</span>
          </div>
        `;
        })
        .join('')}
    `;
  }
}

// ==========================================================================
// 9. ADMIN CONTROL CENTER (FULL CRUD FOR ALL ENTITIES)
// ==========================================================================

function renderAdminPage() {
  // Tab headers
  $$('[data-admin-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.adminTab === state.adminTab);
  });
  $$('.admin-tab-content').forEach((panel) => panel.classList.add('hidden'));
  $(`#admin-tab-${state.adminTab}`)?.classList.remove('hidden');

  if (state.adminTab === 'users') renderAdminUsers();
  if (state.adminTab === 'categories') renderAdminCategories();
  if (state.adminTab === 'businesses') renderAdminBusinesses();
  if (state.adminTab === 'orders') renderAdminOrders();
  if (state.adminTab === 'order-items') renderAdminOrderItems();
  if (state.adminTab === 'reviews') renderAdminReviews();
  if (state.adminTab === 'carts') renderAdminCarts();
}

// Admin: Users CRUD
function renderAdminUsers() {
  const tbody = $('#admin-users-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.users
    .map(
      (u) => `
    <tr>
      <td><code>#${u.userId}</code></td>
      <td><strong>${escapeHtml(u.fullName)}</strong></td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="role-badge role-${u.role}">${u.role}</span></td>
      <td>${escapeHtml(u.phone || '—')}</td>
      <td>${escapeHtml(u.address || '—')}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="openUserFormModal(${u.userId})">Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteUser(${u.userId})">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

function openUserFormModal(userId = null) {
  const form = $('#user-form');
  const title = $('#user-form-title');

  if (userId) {
    const u = state.users.find((x) => x.userId === userId);
    if (!u) return;
    if (title) title.textContent = 'Edit User Profile';
    $('#user-form-id').value = u.userId;
    $('#user-form-fullname').value = u.fullName || '';
    $('#user-form-email').value = u.email || '';
    $('#user-form-password').value = '';
    $('#user-form-password').required = false;
    $('#user-form-role').value = u.role || 'CUSTOMER';
    $('#user-form-phone').value = u.phone || '';
    $('#user-form-address').value = u.address || '';
  } else {
    if (title) title.textContent = 'Create New User';
    form.reset();
    $('#user-form-id').value = '';
    $('#user-form-password').required = true;
  }
  openModal('user-form-modal');
}

async function handleUserFormSubmit(e) {
  e.preventDefault();
  const id = $('#user-form-id').value;
  const body = {
    fullName: $('#user-form-fullname').value.trim(),
    email: $('#user-form-email').value.trim(),
    passwordHash: $('#user-form-password').value || 'hashed_default_pwd',
    role: $('#user-form-role').value,
    phone: $('#user-form-phone').value.trim(),
    address: $('#user-form-address').value.trim()
  };

  try {
    if (id) {
      await fetchApi(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      showToast('User profile updated successfully', 'success');
    } else {
      await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('User account created successfully', 'success');
    }

    state.users = (await fetchApi('/users')) || [];
    closeModal('user-form-modal');
    renderUserPill();
    if (state.activePage === 'admin') renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    await fetchApi(`/users/${userId}`, { method: 'DELETE' });
    showToast('User deleted successfully', 'success');
    state.users = (await fetchApi('/users')) || [];
    renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Admin: Categories CRUD
function renderAdminCategories() {
  const tbody = $('#admin-categories-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.categories
    .map((c) => {
      const prodCount = state.products.filter(
        (p) => p.category?.categoryId === c.categoryId
      ).length;
      return `
      <tr>
        <td><code>#${c.categoryId}</code></td>
        <td><strong>${getCategoryIcon(c.categoryName)} ${escapeHtml(c.categoryName)}</strong></td>
        <td>${prodCount} products</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openCategoryFormModal(${c.categoryId})">Edit</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteCategory(${c.categoryId})">Delete</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function openCategoryFormModal(categoryId = null) {
  const title = $('#category-form-title');
  const form = $('#category-form');

  if (categoryId) {
    const c = state.categories.find((x) => x.categoryId === categoryId);
    if (!c) return;
    if (title) title.textContent = 'Edit Category';
    $('#category-form-id').value = c.categoryId;
    $('#category-form-name').value = c.categoryName;
  } else {
    if (title) title.textContent = 'Add Category';
    form.reset();
    $('#category-form-id').value = '';
  }
  openModal('category-form-modal');
}

async function handleCategoryFormSubmit(e) {
  e.preventDefault();
  const id = $('#category-form-id').value;
  const name = $('#category-form-name').value.trim();

  try {
    if (id) {
      await fetchApi(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ categoryName: name })
      });
      showToast('Category updated successfully', 'success');
    } else {
      await fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify({ categoryName: name })
      });
      showToast('Category created successfully', 'success');
    }

    state.categories = (await fetchApi('/categories')) || [];
    closeModal('category-form-modal');
    populateCategorySelectors();
    renderHomePage();
    renderShopPage();
    if (state.activePage === 'admin') renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  try {
    await fetchApi(`/categories/${id}`, { method: 'DELETE' });
    showToast('Category deleted successfully', 'success');
    state.categories = (await fetchApi('/categories')) || [];
    populateCategorySelectors();
    renderHomePage();
    renderShopPage();
    if (state.activePage === 'admin') renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Admin: Businesses
function renderAdminBusinesses() {
  const tbody = $('#admin-businesses-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.businesses
    .map(
      (b) => `
    <tr>
      <td><code>#${b.businessId}</code></td>
      <td><strong>${escapeHtml(b.businessName)}</strong></td>
      <td>${escapeHtml(b.user?.fullName || b.user?.email || 'N/A')}</td>
      <td>${escapeHtml(b.city)}, ${escapeHtml(b.state)}</td>
      <td>${escapeHtml(b.phone || '—')}</td>
      <td>${escapeHtml(b.postalCode || '—')}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="openBusinessFormModal(${b.businessId})">Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteBusiness(${b.businessId})">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

// Admin: Orders
function renderAdminOrders() {
  const tbody = $('#admin-orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.orders
    .map((o) => {
      const itemsCount = state.orderItems.filter(
        (i) => i.order?.orderId === o.orderId
      ).length;
      return `
      <tr>
        <td><code>#ORD-${o.orderId}</code></td>
        <td><strong>${escapeHtml(o.user?.fullName || o.user?.email || 'N/A')}</strong></td>
        <td>${formatDate(o.orderDate)}</td>
        <td><span class="status-pill status-${o.orderStatus}">${o.orderStatus}</span></td>
        <td>${escapeHtml(o.shippingAddress || '—')}</td>
        <td>${itemsCount} items</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openOrderStatusModal(${o.orderId})">Update</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteOrder(${o.orderId})">Delete</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

async function deleteOrder(id) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  try {
    await fetchApi(`/orders/${id}`, { method: 'DELETE' });
    showToast('Order deleted successfully', 'success');
    state.orders = (await fetchApi('/orders')) || [];
    renderOrdersPage();
    if (state.activePage === 'admin') renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Admin: Order Items CRUD
function renderAdminOrderItems() {
  const tbody = $('#admin-order-items-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.orderItems
    .map((item) => {
      const line = Number(item.quantity) * Number(item.unitPrice || 0);
      return `
      <tr>
        <td><code>#ORD-${item.order?.orderId}</code></td>
        <td><strong>${escapeHtml(item.product?.productName || 'Product')}</strong></td>
        <td>${item.quantity}</td>
        <td>${formatINR(item.unitPrice)}</td>
        <td><strong>${formatINR(line)}</strong></td>
        <td>
          <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteOrderItem(${item.order?.orderId}, ${item.product?.productId})">Delete</button>
        </td>
      </tr>
    `;
    })
    .join('');
}

function openOrderItemModal() {
  const oSelect = $('#order-item-form-order');
  const pSelect = $('#order-item-form-product');

  if (oSelect) {
    oSelect.innerHTML = state.orders
      .map(
        (o) =>
          `<option value="${o.orderId}">#ORD-${o.orderId} - ${escapeHtml(o.user?.fullName || '')}</option>`
      )
      .join('');
  }

  if (pSelect) {
    pSelect.innerHTML = state.products
      .map(
        (p) =>
          `<option value="${p.productId}" data-price="${p.price}">${escapeHtml(p.productName)} (${formatINR(p.price)})</option>`
      )
      .join('');
  }

  pSelect?.addEventListener('change', () => {
    const opt = pSelect.selectedOptions[0];
    if (opt && $('#order-item-form-price')) {
      $('#order-item-form-price').value = opt.dataset.price || '';
    }
  });

  if (state.products.length > 0 && $('#order-item-form-price')) {
    $('#order-item-form-price').value = state.products[0].price;
  }

  openModal('order-item-modal');
}

async function handleOrderItemFormSubmit(e) {
  e.preventDefault();
  const orderId = Number($('#order-item-form-order').value);
  const productId = Number($('#order-item-form-product').value);
  const quantity = Number($('#order-item-form-qty').value);
  const unitPrice = Number($('#order-item-form-price').value);

  try {
    await fetchApi('/order-items', {
      method: 'POST',
      body: JSON.stringify({ orderId, productId, quantity, unitPrice })
    });

    showToast('Order item recorded successfully', 'success');
    closeModal('order-item-modal');
    state.orderItems = (await fetchApi('/order-items')) || [];
    renderAdminPage();
    renderOrdersPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteOrderItem(orderId, productId) {
  if (!confirm('Are you sure you want to remove this item from the order?')) return;
  try {
    await fetchApi(`/order-items/${orderId}/${productId}`, { method: 'DELETE' });
    showToast('Order item removed', 'success');
    state.orderItems = (await fetchApi('/order-items')) || [];
    renderAdminPage();
    renderOrdersPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Admin: Reviews CRUD
function renderAdminReviews() {
  const tbody = $('#admin-reviews-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.reviews
    .map(
      (r) => `
    <tr>
      <td><code>#${r.reviewId}</code></td>
      <td><strong>${escapeHtml(r.product?.productName || 'Product')}</strong></td>
      <td><code>#ORD-${r.order?.orderId}</code></td>
      <td><span class="star-rating">★ ${r.rating}</span></td>
      <td>${escapeHtml(r.comment || '—')}</td>
      <td>${formatDate(r.reviewDate)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteReview(${r.reviewId})">Delete</button>
      </td>
    </tr>
  `
    )
    .join('');
}

async function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  try {
    await fetchApi(`/reviews/${reviewId}`, { method: 'DELETE' });
    showToast('Review deleted successfully', 'success');
    state.reviews = (await fetchApi('/reviews')) || [];
    renderAdminPage();
    renderShopPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Admin: Carts Inspector
function renderAdminCarts() {
  const tbody = $('#admin-carts-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.carts
    .map(
      (c) => `
    <tr>
      <td><code>#CART-${c.cartId}</code></td>
      <td><code>#${c.user?.userId}</code></td>
      <td><strong>${escapeHtml(c.user?.fullName || c.user?.email || 'N/A')}</strong></td>
      <td><button class="btn btn-outline btn-sm" onclick="inspectCartItems(${c.cartId})">View Items</button></td>
      <td>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteCart(${c.cartId})">Delete Cart</button>
      </td>
    </tr>
  `
    )
    .join('');
}

async function inspectCartItems(cartId) {
  try {
    const items = await fetchApi(`/cart-items/cart/${cartId}`);
    if (!items || items.length === 0) {
      alert(`Cart #CART-${cartId} is currently empty.`);
      return;
    }
    const breakdown = items
      .map(
        (i) => `• ${i.product?.productName} × ${i.quantity} (₹${i.product?.price})`
      )
      .join('\n');
    alert(`Items in Cart #CART-${cartId}:\n\n${breakdown}`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCart(cartId) {
  if (!confirm('Are you sure you want to delete this cart?')) return;
  try {
    await fetchApi(`/carts/${cartId}`, { method: 'DELETE' });
    showToast('Cart deleted successfully', 'success');
    state.carts = (await fetchApi('/carts')) || [];
    await syncUserCart();
    renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleAdminCreateCart() {
  const userId = prompt('Enter User ID to create cart for:');
  if (!userId) return;
  try {
    await fetchApi('/carts', {
      method: 'POST',
      body: JSON.stringify({ user: { userId: Number(userId) } })
    });
    showToast('Cart created successfully', 'success');
    state.carts = (await fetchApi('/carts')) || [];
    renderAdminPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================================================
// 10. REAL-TIME PRODUCT AVAILABILITY SEARCH
// ==========================================================================

async function searchProductAvailability() {
  const keyword = $('#avail-keyword-input')?.value.trim() || '';
  const city = $('#avail-city-input')?.value.trim() || '';
  const container = $('#avail-results-container');
  if (!container) return;

  if (!city) {
    showToast('Please enter a city name (e.g. Vellore)', 'error');
    return;
  }

  container.innerHTML = '<p class="muted">Querying PostgreSQL product_availability view…</p>';

  try {
    const results =
      (await fetchApi(
        `/search/products?name=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`
      )) || [];

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">⚠️</span>
          <h4 class="empty-title">No matching stock found</h4>
          <p class="empty-desc">No products in "${escapeHtml(city)}" matching keyword "${escapeHtml(keyword)}" with active stock.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>City</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${results
              .map(
                (r) => `
              <tr>
                <td><strong>${escapeHtml(r.productName)}</strong></td>
                <td>${escapeHtml(r.businessName)}</td>
                <td>${escapeHtml(r.city)}</td>
                <td><strong>${formatINR(r.price)}</strong></td>
                <td>${r.stockQuantity}</td>
                <td><span class="star-rating">★ ${Number(r.averageRating || 0).toFixed(1)} (${r.reviewCount})</span></td>
                <td><span class="badge badge-emerald">${escapeHtml(r.availabilityStatus)}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="closeModal('availability-modal'); handleAddToCart(${r.productId});">
                    + Cart
                  </button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-state text-danger">${escapeHtml(err.message)}</div>`;
  }
}

// ==========================================================================
// 11. USER SWITCHER MODAL & PERSONA SIMULATION
// ==========================================================================

function openUserSwitcherModal() {
  const select = $('#user-select-dropdown');
  if (!select) return;

  select.innerHTML = state.users
    .map(
      (u) =>
        `<option value="${u.userId}" ${
          state.currentUser?.userId === u.userId ? 'selected' : ''
        }>${escapeHtml(u.fullName || u.email)} (${u.role}) - ID: ${u.userId}</option>`
    )
    .join('');

  updateSelectedUserCard();
  openModal('user-modal');
}

function updateSelectedUserCard() {
  const select = $('#user-select-dropdown');
  const card = $('#selected-user-card');
  if (!select || !card) return;

  const u = state.users.find((x) => String(x.userId) === select.value);
  if (!u) {
    card.innerHTML = '';
    return;
  }

  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong>${escapeHtml(u.fullName || u.email)}</strong>
      <span class="role-badge role-${u.role}">${u.role}</span>
    </div>
    <div class="muted" style="font-size:12.5px;">
      📧 ${escapeHtml(u.email)}<br>
      📞 ${escapeHtml(u.phone || 'No phone recorded')}<br>
      📍 ${escapeHtml(u.address || 'No shipping address')}
    </div>
  `;
}

async function handleApplyUserSwitch() {
  const select = $('#user-select-dropdown');
  if (!select) return;

  const user = state.users.find((u) => String(u.userId) === select.value);
  if (!user) return;

  state.currentUser = user;
  localStorage.setItem('lm-active-user-id', user.userId);
  closeModal('user-modal');

  await syncUserCart();
  renderUserPill();
  showToast(`Switched active context to: ${user.fullName} (${user.role})`, 'success');

  // Rerender active view
  navigateTo(state.activePage);
}

// ==========================================================================
// 12. EVENT LISTENERS INITIALIZATION
// ==========================================================================

function attachEventListeners() {
  // Navigation Links
  $$('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Mobile drawer toggle
  $('#mobile-toggle')?.addEventListener('click', () => {
    $('#mobile-drawer')?.classList.toggle('hidden');
  });

  // User switcher pill
  $('#user-switcher-btn')?.addEventListener('click', openUserSwitcherModal);
  $('#user-select-dropdown')?.addEventListener('change', updateSelectedUserCard);
  $('#user-modal-confirm-btn')?.addEventListener('click', handleApplyUserSwitch);
  $('#user-modal-create-btn')?.addEventListener('click', () => {
    closeModal('user-modal');
    openUserFormModal();
  });
  $('#user-modal-edit-btn')?.addEventListener('click', () => {
    closeModal('user-modal');
    if (state.currentUser) openUserFormModal(state.currentUser.userId);
  });

  // Shop Filters
  $('#shop-search')?.addEventListener('input', (e) => {
    state.shopFilters.search = e.target.value;
    renderShopPage();
  });
  $('#shop-category-filter')?.addEventListener('change', (e) => {
    state.shopFilters.category = e.target.value;
    renderShopPage();
  });
  $('#shop-city-filter')?.addEventListener('input', (e) => {
    state.shopFilters.city = e.target.value;
    renderShopPage();
  });
  $('#shop-sort-filter')?.addEventListener('change', (e) => {
    state.shopFilters.sort = e.target.value;
    renderShopPage();
  });
  $('#shop-in-stock-only')?.addEventListener('change', (e) => {
    state.shopFilters.inStockOnly = e.target.checked;
    renderShopPage();
  });
  $('#shop-apply-btn')?.addEventListener('click', renderShopPage);
  $('#shop-reset-btn')?.addEventListener('click', resetShopFilters);

  // Business Directory
  $('#business-search-input')?.addEventListener('input', renderBusinessesPage);
  $('#business-city-filter')?.addEventListener('change', renderBusinessesPage);
  $('#business-reset-btn')?.addEventListener('click', () => {
    if ($('#business-search-input')) $('#business-search-input').value = '';
    if ($('#business-city-filter')) $('#business-city-filter').value = '';
    renderBusinessesPage();
  });
  $('#register-business-btn')?.addEventListener('click', () => openBusinessFormModal());

  // Orders
  $('#refresh-orders-btn')?.addEventListener('click', async () => {
    state.orders = (await fetchApi('/orders')) || [];
    state.orderItems = (await fetchApi('/order-items')) || [];
    renderOrdersPage();
    showToast('Orders refreshed');
  });

  $$('[data-order-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('[data-order-status]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.orderFilterStatus = btn.dataset.orderStatus;
      renderOrdersPage();
    });
  });

  // Seller Portal
  $('#seller-store-dropdown')?.addEventListener('change', (e) => {
    state.sellerBusiness =
      state.businesses.find((b) => String(b.businessId) === e.target.value) || null;
    if (state.sellerBusiness) {
      localStorage.setItem('lm-seller-business-id', state.sellerBusiness.businessId);
    }
    renderSellerPage();
  });
  $('#seller-new-store-btn')?.addEventListener('click', () => openBusinessFormModal());
  $('#seller-add-product-btn')?.addEventListener('click', () => openProductFormModal());
  $('#seller-add-product-inline-btn')?.addEventListener('click', () => openProductFormModal());
  $('#seller-edit-business-btn')?.addEventListener('click', () => {
    if (state.sellerBusiness) openBusinessFormModal(state.sellerBusiness.businessId);
  });
  $('#refresh-recommendations-btn')?.addEventListener('click', () => {
    renderSellerRecommendations();
    showToast('Inventory recommendations refreshed');
  });

  $$('[data-seller-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sellerTab = btn.dataset.sellerTab;
      renderSellerPage();
    });
  });

  // Reports
  $$('[data-report-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.reportTab = btn.dataset.reportTab;
      renderReportsPage();
    });
  });
  $('#reports-refresh-all-btn')?.addEventListener('click', () => {
    renderReportsPage();
    showToast('Reports data updated from SQL views');
  });
  $('#reports-print-btn')?.addEventListener('click', () => window.print());
  $('#report-catalog-search')?.addEventListener('input', renderReportProductCatalog);

  // Admin Portal
  $$('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.adminTab = btn.dataset.adminTab;
      renderAdminPage();
    });
  });
  $('#admin-create-user-btn')?.addEventListener('click', () => openUserFormModal());
  $('#admin-create-category-btn')?.addEventListener('click', () => openCategoryFormModal());
  $('#admin-create-business-btn')?.addEventListener('click', () => openBusinessFormModal());
  $('#admin-create-order-btn')?.addEventListener('click', () => {
    const cartId = prompt('Enter Cart ID to convert into order:');
    if (cartId) {
      fetchApi(`/orders/place/${cartId}`, { method: 'POST' })
        .then(() => {
          showToast('Order placed from cart', 'success');
          loadInitialData();
        })
        .catch((err) => showToast(err.message, 'error'));
    }
  });
  $('#admin-create-order-item-btn')?.addEventListener('click', openOrderItemModal);
  $('#admin-create-review-btn')?.addEventListener('click', () => {
    if (state.orders.length > 0 && state.products.length > 0) {
      openReviewModal(
        state.orders[0].orderId,
        state.products[0].productId,
        state.products[0].productName
      );
    }
  });
  $('#admin-create-cart-btn')?.addEventListener('click', handleAdminCreateCart);

  // Modal Closures
  $$('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  $$('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  // Forms Submissions
  $('#product-form')?.addEventListener('submit', handleProductFormSubmit);
  $('#business-form')?.addEventListener('submit', handleBusinessFormSubmit);
  $('#category-form')?.addEventListener('submit', handleCategoryFormSubmit);
  $('#user-form')?.addEventListener('submit', handleUserFormSubmit);
  $('#review-form')?.addEventListener('submit', handleReviewFormSubmit);
  $('#order-status-form')?.addEventListener('submit', handleOrderStatusSubmit);
  $('#order-item-form')?.addEventListener('submit', handleOrderItemFormSubmit);

  // Star Rating Picker
  $$('.star-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.value);
      $('#review-form-rating').value = val;
      updateStarRatingDisplay(val);
    });
  });

  // Real-Time Availability Modal
  $('#check-availability-modal-btn')?.addEventListener('click', () => {
    openModal('availability-modal');
    searchProductAvailability();
  });
  $('#avail-search-btn')?.addEventListener('click', searchProductAvailability);
}

// Expose necessary global functions for inline HTML event triggers
window.navigateTo = navigateTo;
window.applyCategoryFilter = applyCategoryFilter;
window.filterByStore = filterByStore;
window.resetShopFilters = resetShopFilters;
window.handleAddToCart = handleAddToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.handlePlaceOrderProcedure = handlePlaceOrderProcedure;
window.showProductDetailsModal = showProductDetailsModal;
window.openBusinessFormModal = openBusinessFormModal;
window.deleteBusiness = deleteBusiness;
window.openOrderStatusModal = openOrderStatusModal;
window.openReviewModal = openReviewModal;
window.openProductFormModal = openProductFormModal;
window.deleteProduct = deleteProduct;
window.quickRestockProduct = quickRestockProduct;
window.openUserFormModal = openUserFormModal;
window.deleteUser = deleteUser;
window.openCategoryFormModal = openCategoryFormModal;
window.deleteCategory = deleteCategory;
window.deleteOrder = deleteOrder;
window.deleteOrderItem = deleteOrderItem;
window.deleteReview = deleteReview;
window.inspectCartItems = inspectCartItems;
window.deleteCart = deleteCart;
window.closeModal = closeModal;
window.openModal = openModal;

// Application Initialization
window.addEventListener('DOMContentLoaded', () => {
  attachEventListeners();
  loadInitialData();
});
