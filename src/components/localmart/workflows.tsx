import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Star,
  Package,
  ChartNoAxesCombined,
  LayoutDashboard,
  Users,
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Store,
  Layers,
  ArrowRight,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  Handshake,
  XCircle,
  Upload,
} from 'lucide-react';
import {
  catalogOptions,
  ratingOptions,
  pageSearch,
  formatCurrency,
  localmartApi,
  resolveUserCart,
  type CartItem,
  type Order,
  type OrderItem,
  type Review,
  type ProductRequest,
  type InventoryRecommendation,
  type SellerPerformance,
  type CustomerOrderSummary,
  type ProductPerformance,
  type User,
  type UserRole,
  type ServiceArea,
} from '@/lib/localmart-api';
import { useAuth } from '@/lib/use-auth';
import { PageHeading, StatusPanel, Button, Link, RatingView } from './shared';
import { getProductImageUrl } from '@/lib/product-images';
import { AuthPage } from './auth';

// ============================================================================
// 1. CART WORKFLOW
// ============================================================================
export function Cart() {
  const { currentUser, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadCart = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const cId = await resolveUserCart(currentUser.userId);
      setCartId(cId);
      const cartItems = await localmartApi.getCartItems(cId);
      setItems(cartItems);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve cart items.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const handleUpdateQty = async (productId: number, newQty: number) => {
    if (!cartId || newQty < 1) return;
    try {
      await localmartApi.updateCartItem(cartId, productId, newQty);
      window.dispatchEvent(new CustomEvent('localmart:cart-changed'));
      await loadCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update quantity';
      alert(msg);
    }
  };

  const handleRemove = async (productId: number) => {
    if (!cartId) return;
    try {
      await localmartApi.deleteCartItem(cartId, productId);
      window.dispatchEvent(new CustomEvent('localmart:cart-changed'));
      await loadCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove item';
      alert(msg);
    }
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product ? Number(item.product.price) : 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [items]);

  return (
    <>
      <PageHeading title="YOUR CART" subtitle="Good finds deserve a place in your everyday." />
      <div className="wrap section order-layout">
        <div>
          {authLoading || loading ? (
            <StatusPanel title="Loading your cart…" message="Checking live inventory in PostgreSQL database." />
          ) : !currentUser ? (
            <StatusPanel
              title="Sign-in Required"
              message="Please select or switch to an active customer profile to view your saved items."
              icon="locked"
            />
          ) : error ? (
            <StatusPanel
              title="Cart unavailable"
              message={error}
              retry={() => {
                void loadCart();
              }}
            />
          ) : items.length === 0 ? (
            <StatusPanel
              title="Your cart is empty"
              message="No items are currently staged in your cart. Explore our marketplace and support small local businesses."
              icon="empty"
            />
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Business</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const price = Number(item.product?.price || 0);
                    const qty = item.quantity || 1;
                    return (
                      <tr key={item.product.productId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                flexShrink: 0,
                                overflow: 'hidden',
                                borderRadius: '4px',
                                background: 'var(--muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {getProductImageUrl(item.product) ? (
                                <img
                                  src={getProductImageUrl(item.product)}
                                  alt={item.product.productName}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <Package size={20} style={{ opacity: 0.4 }} />
                              )}
                            </div>
                            <div>
                              <Link to="/product" search={{ id: String(item.product.productId) }}>
                                <strong>{item.product.productName}</strong>
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted-foreground)' }}>
                          {item.product.business?.businessName || 'Local Seller'}
                        </td>
                        <td>{formatCurrency(price)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              border: '1px solid var(--border)',
                              borderRadius: '2px',
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              style={{ width: '28px', height: '28px' }}
                              disabled={qty <= 1}
                              onClick={() => handleUpdateQty(item.product.productId, qty - 1)}
                            >
                              <Minus size={12} />
                            </Button>
                            <span style={{ padding: '0 8px', fontSize: '14px' }}>{qty}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              style={{ width: '28px', height: '28px' }}
                              onClick={() => handleUpdateQty(item.product.productId, qty + 1)}
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                        </td>
                        <td>
                          <strong>{formatCurrency(price * qty)}</strong>
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.product.productId)}
                            title="Remove item"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="order-summary">
          <h2>ORDER SUMMARY</h2>
          <div className="summary-row">
            <span>Staged Items</span>
            <span>{items.reduce((acc, i) => acc + (i.quantity || 1), 0)}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <p>
            {cartId
              ? `Cart #${cartId} backed by PostgreSQL cart_items table. Prices reflect current database catalog.`
              : 'Sign in to initialize a PostgreSQL cart.'}
          </p>
          <Button
            disabled={items.length === 0 || !currentUser}
            onClick={() => navigate({ to: '/checkout' })}
          >
            PROCEED TO CHECKOUT <ArrowRight />
          </Button>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/catalog" className="text-link">
              EXPLORE PRODUCTS <ArrowRight />
            </Link>
          </p>
        </aside>
      </div>
    </>
  );
}

// ============================================================================
// 2. CHECKOUT WORKFLOW (Invokes PostgreSQL Stored Procedure place_order)
// ============================================================================
export function Checkout() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fulfillmentOptions, setFulfillmentOptions] = useState<
    Record<number, { method: 'SELLER_DELIVERY' | 'SELF_PICKUP'; pickupLocation?: string; deliveryAddress?: string }>
  >({});
  const [businessesDetails, setBusinessesDetails] = useState<Record<number, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        setLoading(true);
        const cId = await resolveUserCart(currentUser!.userId);
        setCartId(cId);
        const [cartItems, allBiz] = await Promise.all([
          localmartApi.getCartItems(cId),
          localmartApi.getBusinesses().catch(() => []),
        ]);
        setItems(cartItems);

        const bMap: Record<number, any> = {};
        for (const b of allBiz) {
          bMap[b.businessId] = b;
        }
        setBusinessesDetails(bMap);

        // Pre-initialize fulfillment selection
        const initialFulfillment: Record<number, { method: 'SELLER_DELIVERY' | 'SELF_PICKUP' }> = {};
        for (const it of cartItems) {
          const bId = it.product?.business?.businessId || 1;
          if (!initialFulfillment[bId]) {
            initialFulfillment[bId] = { method: 'SELLER_DELIVERY' };
          }
        }
        setFulfillmentOptions(initialFulfillment);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load checkout details.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [currentUser]);

  const itemsByBusiness = useMemo(() => {
    const map = new Map<number, { businessName: string; items: CartItem[] }>();
    for (const item of items) {
      const bId = item.product?.business?.businessId || 1;
      const bName = item.product?.business?.businessName || 'Local Seller';
      if (!map.has(bId)) {
        map.set(bId, { businessName: bName, items: [] });
      }
      map.get(bId)!.items.push(item);
    }
    return map;
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product ? Number(item.product.price) : 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [items]);

  const handlePlaceOrder = async () => {
    if (!cartId) return;
    try {
      setPlacing(true);
      setError(null);

      const fulfillments = Array.from(itemsByBusiness.keys()).map((bId) => {
        const opt = fulfillmentOptions[bId] || { method: 'SELLER_DELIVERY' };
        const bInfo = businessesDetails[bId];
        const shopAddress = bInfo
          ? `${bInfo.address || ''}, ${bInfo.city || ''} (${bInfo.postalCode || ''})`
          : 'Verified Local Shop Address';

        return {
          businessId: bId,
          deliveryMethod: opt.method,
          pickupLocation: shopAddress,
          deliveryAddress: currentUser?.address || 'Local Delivery Address',
        };
      });

      const response = await localmartApi.placeOrderWithFulfillments({
        cartId,
        fulfillments,
      });

      setOrderResult(response?.message || 'Order placed successfully!');
      window.dispatchEvent(new CustomEvent('localmart:cart-changed'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order.';
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <PageHeading title="CHECKOUT" subtitle="One step closer to your local discoveries." />
      <div className="wrap section order-layout">
        <div>
          {orderResult ? (
            <div style={{ padding: '2rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
              <h2 className="font-display text-2xl mb-2">Order Successfully Placed!</h2>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                Your order has been transacted atomically via PostgreSQL stored procedure{' '}
                <code>place_order({cartId})</code>, and fulfillment preferences are recorded in{' '}
                <code>order_fulfillment</code>.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button onClick={() => navigate({ to: '/orders' })}>VIEW ORDER HISTORY</Button>
                <Button variant="outline" onClick={() => navigate({ to: '/catalog' })}>
                  CONTINUE SHOPPING
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl mb-6">ORDER REVIEW</h2>
              {loading ? (
                <StatusPanel title="Verifying order items…" message="Loading staged cart from database." />
              ) : items.length === 0 ? (
                <StatusPanel
                  title="Your cart is empty"
                  message="Add products to your cart before proceeding to checkout."
                  icon="empty"
                />
              ) : (
                <div className="table-scroll mb-8">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Seller</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i) => (
                        <tr key={i.product.productId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  flexShrink: 0,
                                  overflow: 'hidden',
                                  borderRadius: '4px',
                                  background: 'var(--muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {getProductImageUrl(i.product) ? (
                                  <img
                                    src={getProductImageUrl(i.product)}
                                    alt={i.product.productName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <Package size={16} style={{ opacity: 0.4 }} />
                                )}
                              </div>
                              <span style={{ fontWeight: 500 }}>{i.product.productName}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--muted-foreground)' }}>
                            {i.product.business?.businessName || 'Local Seller'}
                          </td>
                          <td>{formatCurrency(Number(i.product.price))}</td>
                          <td>{i.quantity}</td>
                          <td>{formatCurrency(Number(i.product.price) * i.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MULTI-BUSINESS FULFILLMENT PREFERENCES */}
              {items.length > 0 && (
                <>
                  <h2 className="font-display text-2xl mt-8 mb-3">DELIVERY & PICKUP PREFERENCES</h2>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
                    LOCALMART supports multi-business checkout. Choose whether you would like neighborhood seller delivery or self-pickup at each artisan's storefront.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                    {Array.from(itemsByBusiness.entries()).map(([bizId, group]) => {
                      const bInfo = businessesDetails[bizId];
                      const currentOpt = fulfillmentOptions[bizId] || { method: 'SELLER_DELIVERY' };
                      const shopAddress = bInfo
                        ? `${bInfo.address || ''}, ${bInfo.city || ''} (${bInfo.postalCode || ''})`
                        : 'Verified Physical Establishment';

                      return (
                        <div
                          key={bizId}
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '1.25rem',
                            background: '#fff',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '16px' }}>{group.businessName}</strong>
                              <span style={{ fontSize: '13px', color: 'var(--muted-foreground)', display: 'block' }}>
                                Package contains: {group.items.map((i) => i.product.productName).join(', ')}
                              </span>
                            </div>
                            {bInfo?.verificationStatus === 'APPROVED' && (
                              <span
                                style={{
                                  fontSize: '12px',
                                  background: '#e6fffa',
                                  color: '#234e52',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontWeight: 600,
                                }}
                              >
                                ✓ Verified Local Shop
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                              gap: '1rem',
                              marginTop: '0.75rem',
                            }}
                          >
                            <div
                              onClick={() =>
                                setFulfillmentOptions((prev) => ({
                                  ...prev,
                                  [bizId]: { method: 'SELLER_DELIVERY' },
                                }))
                              }
                              style={{
                                border: `2px solid ${
                                  currentOpt.method === 'SELLER_DELIVERY' ? 'var(--coral, #c86144)' : 'var(--border)'
                                }`,
                                borderRadius: '8px',
                                padding: '1rem',
                                cursor: 'pointer',
                                background: currentOpt.method === 'SELLER_DELIVERY' ? '#fffaf8' : '#fafafa',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <Truck size={18} color={currentOpt.method === 'SELLER_DELIVERY' ? 'var(--coral, #c86144)' : '#666'} />
                                <strong style={{ fontSize: '14px' }}>Seller Delivery</strong>
                              </div>
                              <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
                                Hand-delivered to: <strong>{currentUser?.address || 'Your Address'}</strong>
                              </p>
                            </div>

                            <div
                              onClick={() =>
                                setFulfillmentOptions((prev) => ({
                                  ...prev,
                                  [bizId]: { method: 'SELF_PICKUP' },
                                }))
                              }
                              style={{
                                border: `2px solid ${
                                  currentOpt.method === 'SELF_PICKUP' ? 'var(--coral, #c86144)' : 'var(--border)'
                                }`,
                                borderRadius: '8px',
                                padding: '1rem',
                                cursor: 'pointer',
                                background: currentOpt.method === 'SELF_PICKUP' ? '#fffaf8' : '#fafafa',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <Store size={18} color={currentOpt.method === 'SELF_PICKUP' ? 'var(--coral, #c86144)' : '#666'} />
                                <strong style={{ fontSize: '14px' }}>Self Pickup</strong>
                              </div>
                              <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
                                Pick up in person: <strong>{shopAddress}</strong>
                              </p>
                              {bInfo?.phone && (
                                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', display: 'block', marginTop: '2px' }}>
                                  Shop Phone: {bInfo.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <h2 className="font-display text-2xl mt-8 mb-6">CUSTOMER INFORMATION</h2>
              {currentUser ? (
                <div style={{ padding: '1.5rem', background: 'var(--secondary)', borderRadius: '4px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {currentUser.fullName}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
                    Email: {currentUser.email} &bull; Phone: {currentUser.phone || 'N/A'}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    Delivery Address: {currentUser.address || 'Local Delivery Point'}
                  </p>
                </div>
              ) : (
                <StatusPanel
                  compact
                  title="Customer information is unavailable"
                  message="Please sign in or select an active user profile."
                  icon="locked"
                />
              )}

              {error && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
                  <AlertTriangle size={18} style={{ display: 'inline', marginRight: '6px' }} />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {!orderResult && (
          <aside className="order-summary">
            <h2>YOUR ORDER</h2>
            <div className="summary-row">
              <span>Items Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p>
              Atomic transaction execution via PostgreSQL Stored Procedure <code>place_order({cartId || '?'})</code>.
              Deducts product inventory and generates verified order & multi-business fulfillment records.
            </p>
            <Button
              disabled={items.length === 0 || !currentUser || placing}
              onClick={handlePlaceOrder}
            >
              {placing ? 'PROCESSING TRANSACTION…' : 'PLACE ORDER'}
            </Button>
          </aside>
        )}
      </div>
    </>
  );
}

// ============================================================================
// 3. ORDERS WORKFLOW
// ============================================================================
export function Orders() {
  const { currentUser, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [fulfillmentsMap, setFulfillmentsMap] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allOrders, allItems] = await Promise.all([
        localmartApi.getOrders(),
        localmartApi.getOrderItems().catch(() => []),
      ]);

      // If customer, filter to only their orders; if admin/seller show all
      const userOrders =
        role === 'CUSTOMER' && currentUser
          ? allOrders.filter((o) => o.user && o.user.userId === currentUser.userId)
          : allOrders;

      const reversed = [...userOrders].reverse();
      setOrders(reversed);
      setOrderItems(allItems);

      // Fetch fulfillments for these orders
      const fMap: Record<number, any[]> = {};
      await Promise.all(
        reversed.map(async (o) => {
          try {
            const fList = await localmartApi.getOrderFulfillments(o.orderId);
            fMap[o.orderId] = fList;
          } catch {
            fMap[o.orderId] = [];
          }
        })
      );
      setFulfillmentsMap(fMap);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load order history.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser, role]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <>
      <PageHeading
        title="MY ORDERS"
        subtitle="Your local discoveries, all in one place."
        eyebrow={role === 'CUSTOMER' ? 'VERIFIED PURCHASE HISTORY' : 'ALL PLATFORM ORDERS'}
      />
      <div className="wrap section">
        {loading ? (
          <StatusPanel title="Loading order history…" message="Retrieving orders from PostgreSQL database." />
        ) : error ? (
          <StatusPanel
            title="Unable to load orders"
            message={error}
            retry={() => {
              void loadOrders();
            }}
          />
        ) : orders.length === 0 ? (
          <>
            <StatusPanel
              title="No orders found"
              message={
                role === 'CUSTOMER'
                  ? 'You have not placed any orders yet. Discover handmade products in our catalog.'
                  : 'No orders are recorded in the PostgreSQL orders table yet.'
              }
              icon="empty"
            />
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link to="/catalog">
                  EXPLORE PRODUCTS <ArrowRight />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map((order) => {
              const itemsForOrder = orderItems.filter(
                (item) => item.order && item.order.orderId === order.orderId
              );

              return (
                <div
                  key={order.orderId}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '1.5rem',
                    background: 'var(--background)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '1rem',
                      marginBottom: '1rem',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600 }}>
                        Order #{order.orderId}
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
                        Placed on:{' '}
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent'}
                        {order.user && ` · Customer: ${order.user.fullName}`}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          background: 'var(--secondary)',
                          color: 'var(--primary)',
                          borderRadius: '2px',
                          fontSize: '13px',
                          fontWeight: 600,
                          marginBottom: '0.25rem',
                        }}
                      >
                        {order.orderStatus || 'COMPLETED'}
                      </span>
                      <p style={{ fontSize: '17px', fontWeight: 700 }}>
                        {formatCurrency(Number(order.totalAmount || 0))}
                      </p>
                    </div>
                  </div>

                  {itemsForOrder.length > 0 ? (
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Product Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsForOrder.map((it, idx) => {
                            const uPrice = Number(it.unitPrice || 0);
                            return (
                              <tr key={idx}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        flexShrink: 0,
                                        overflow: 'hidden',
                                        borderRadius: '4px',
                                        background: 'var(--muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {getProductImageUrl(it.product) ? (
                                        <img
                                          src={getProductImageUrl(it.product)}
                                          alt={it.product?.productName || 'Product'}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <Package size={16} style={{ opacity: 0.4 }} />
                                      )}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>
                                      {it.product?.productName || 'Catalog Product'}
                                    </span>
                                  </div>
                                </td>
                                <td>{it.quantity}</td>
                                <td>{formatCurrency(uPrice)}</td>
                                <td>{formatCurrency(uPrice * it.quantity)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      Line items recorded in PostgreSQL order_items table.
                    </p>
                  )}

                  {fulfillmentsMap[order.orderId] && fulfillmentsMap[order.orderId].length > 0 && (
                    <div
                      style={{
                        marginTop: '1.25rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <strong style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        FULFILLMENT METHOD & PICKUP / DELIVERY DETAILS:
                      </strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {fulfillmentsMap[order.orderId].map((f) => (
                          <div
                            key={f.fulfillmentId}
                            style={{
                              background: f.deliveryMethod === 'SELF_PICKUP' ? '#f0fff4' : '#f7fafc',
                              border: `1px solid ${f.deliveryMethod === 'SELF_PICKUP' ? '#9ae6b4' : '#e2e8f0'}`,
                              borderRadius: '6px',
                              padding: '0.5rem 0.85rem',
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                            }}
                          >
                            {f.deliveryMethod === 'SELF_PICKUP' ? (
                              <>
                                <Store size={16} color="#276749" />
                                <span>
                                  <strong>Self Pickup:</strong> {f.businessName} —{' '}
                                  <span style={{ color: 'var(--muted-foreground)' }}>
                                    {f.pickupLocation || 'Local Storefront'}
                                  </span>
                                </span>
                              </>
                            ) : (
                              <>
                                <Truck size={16} color="#2b6cb0" />
                                <span>
                                  <strong>Seller Delivery:</strong> {f.businessName} to{' '}
                                  <span style={{ color: 'var(--muted-foreground)' }}>
                                    {f.deliveryAddress || 'Customer Address'}
                                  </span>
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// 4. REVIEWS WORKFLOW
// ============================================================================
export function Reviews() {
  const search = pageSearch(useSearch({ strict: false }));
  const catalog = useSuspenseQuery(catalogOptions);
  const ratings = useSuspenseQuery(ratingOptions);
  const { currentUser } = useAuth();

  const [id, setId] = useState(search.id ?? '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAllReviews = useCallback(async () => {
    try {
      const all = await localmartApi.getReviews();
      setReviewsList(all.reverse());
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    }
  }, []);

  useEffect(() => {
    void loadAllReviews();
  }, [loadAllReviews]);

  const selectedRating = ratings.data.data.find((r) => String(r.productId) === id);
  const selectedProduct = catalog.data.data.find((p) => String(p.productId) === id);

  const filteredReviews = useMemo(() => {
    if (!id) return reviewsList;
    return reviewsList.filter((r) => r.product && String(r.product.productId) === id);
  }, [id, reviewsList]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      alert('Please select a product to review.');
      return;
    }
    if (!comment.trim()) {
      alert('Please write your review comment.');
      return;
    }

    try {
      setSubmitting(true);
      await localmartApi.createReview({
        product: { productId: parseInt(id, 10) },
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setSuccessMsg('Review recorded successfully in PostgreSQL reviews table!');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadAllReviews();
      void ratings.refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeading title="RATINGS & REVIEWS" subtitle="Local experiences. Honest opinions." />
      <div className="wrap section review-layout">
        <div>
          <label className="field">
            <span>FILTER BY PRODUCT</span>
            <select
              aria-label="Select product to review"
              value={id}
              onChange={(e) => setId(e.target.value)}
            >
              <option value="">All Products ({reviewsList.length} reviews)</option>
              {catalog.data.data.map((p) => (
                <option value={p.productId} key={p.productId}>
                  {p.productName} — {p.businessName}
                </option>
              ))}
            </select>
          </label>

          {id && selectedProduct && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--secondary)', borderRadius: '4px' }}>
              <h2 className="font-display text-2xl mb-1">{selectedProduct.productName}</h2>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                {selectedProduct.businessName} &bull; {selectedProduct.categoryName}
              </p>
              <RatingView rating={selectedRating} />
            </div>
          )}

          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem' }}>
            {id ? 'Customer Reviews for this Item' : 'Recent Reviews across Marketplace'}
          </h3>

          {filteredReviews.length === 0 ? (
            <StatusPanel
              compact
              title="No reviews yet"
              message="Be the first customer to share your thoughts on this local creation!"
              icon="empty"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReviews.map((rev, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border)',
                    padding: '1.25rem',
                    borderRadius: '4px',
                    background: 'var(--background)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong>{rev.user ? rev.user.fullName : 'Verified Local Customer'}</strong>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                      {'★'.repeat(rev.rating)}
                      <span style={{ color: '#cbd5e1' }}>{'★'.repeat(Math.max(0, 5 - rev.rating))}</span>
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                    Product: {rev.product?.productName || 'Catalog Item'}
                  </p>
                  <p style={{ fontSize: '15px', lineHeight: 1.6 }}>"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form className="review-form" onSubmit={handleSubmitReview}>
          <h2>Share your experience</h2>
          {successMsg && (
            <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {successMsg}
            </div>
          )}
          <label className="field">
            <span>SELECT PRODUCT</span>
            <select
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              aria-label="Product to review"
            >
              <option value="">Choose product…</option>
              {catalog.data.data.map((p) => (
                <option value={p.productId} key={p.productId}>
                  {p.productName} ({p.businessName})
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>YOUR RATING ({rating} STARS)</span>
          </label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                type="button"
                key={n}
                className={rating >= n ? 'selected' : ''}
                variant="ghost"
                size="icon"
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
              >
                <Star fill={rating >= n ? 'currentColor' : 'none'} />
              </Button>
            ))}
          </div>

          <label className="field">
            <span>YOUR REVIEW COMMENT</span>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other shoppers about your local discovery…"
              maxLength={2000}
            />
          </label>

          <Button type="submit" disabled={submitting || !id || !comment.trim()}>
            {submitting ? 'RECORDING TO DATABASE…' : 'SUBMIT REVIEW'}
          </Button>

          <p className="notice" style={{ marginTop: '0.75rem' }}>
            Review will be saved in PostgreSQL <code>reviews</code> table and immediately updates the{' '}
            <code>product_ratings</code> view.
          </p>
        </form>
      </div>
    </>
  );
}

// ============================================================================
// 5. SELLER WORKSPACE (Products CRUD + Inventory Recommendations)
// ============================================================================
export function Seller() {
  const { currentUser, role } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);
  const [activeBizDetails, setActiveBizDetails] = useState<any | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [sellerReport, setSellerReport] = useState<SellerPerformance | null>(null);
  const [recommendations, setRecommendations] = useState<InventoryRecommendation[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [showVerifForm, setShowVerifForm] = useState(false);
  const [verifAddress, setVerifAddress] = useState('');
  const [verifPostalCode, setVerifPostalCode] = useState('');
  const [verifServiceAreaId, setVerifServiceAreaId] = useState<number | string>('');
  const [verifDoc, setVerifDoc] = useState('');
  const [verifFile, setVerifFile] = useState<File | null>(null);
  const [verifFileError, setVerifFileError] = useState<string | null>(null);
  const [submittingVerif, setSubmittingVerif] = useState(false);
  const [pincodeValidating, setPincodeValidating] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{ valid: boolean; message: string; areaName?: string } | null>(null);

  // Add Product form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number>(1);
  const [newPrice, setNewPrice] = useState('150.00');
  const [newStock, setNewStock] = useState('10');
  const [newDesc, setNewDesc] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const loadSellerData = useCallback(async () => {
    try {
      setLoading(true);
      const [allBiz, allCats, allPerf] = await Promise.all([
        localmartApi.getBusinesses(),
        localmartApi.getCategories(),
        localmartApi.reports.sellerPerformance(),
      ]);

      setBusinesses(allBiz);
      setCategories(allCats);

      // Match seller's business
      let matchedBiz = allBiz.find((b) => b.user && b.user.userId === currentUser?.userId);
      if (!matchedBiz && allBiz.length > 0) {
        matchedBiz = allBiz[0];
      }

      if (matchedBiz) {
        setSelectedBizId(matchedBiz.businessId);

        // Fetch detailed business info and service areas
        try {
          const [bizDetails, areas] = await Promise.all([
            localmartApi.getBusinessDetails(matchedBiz.businessId),
            localmartApi.getServiceAreas(),
          ]);
          setActiveBizDetails(bizDetails);
          setServiceAreas(areas);
          setVerifAddress(bizDetails.physicalAddress || bizDetails.address || '');
          setVerifPostalCode(bizDetails.postalCode || '');
          if (bizDetails.serviceAreaId) {
            setVerifServiceAreaId(bizDetails.serviceAreaId);
          } else if (areas.length > 0) {
            setVerifServiceAreaId(areas[0].serviceAreaId);
          }
          setVerifDoc(bizDetails.verificationDocument || '');
        } catch (err) {
          console.warn('Failed to load business details or service areas:', err);
        }

        // Fetch seller's products
        const allProds = await localmartApi.getProducts();
        const bizProds = allProds.filter(
          (p) => p.business && p.business.businessId === matchedBiz!.businessId
        );
        setSellerProducts(bizProds);

        // Fetch seller performance
        const perf = allPerf.find((s) => s.businessId === matchedBiz!.businessId) || null;
        setSellerReport(perf);

        // Fetch inventory recommendations
        try {
          const recs = await localmartApi.getInventoryRecommendations(matchedBiz.businessId);
          setRecommendations(recs);
        } catch {
          setRecommendations([]);
        }
      }
    } catch (err) {
      console.warn('Failed to load seller data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadSellerData();
  }, [loadSellerData]);

  const handleValidatePincode = async () => {
    const code = verifPostalCode.trim();
    if (!code) {
      setPincodeResult({ valid: false, message: 'Please enter a 6-digit postal code.' });
      return;
    }
    try {
      setPincodeValidating(true);
      const res = await localmartApi.validatePincode(code);
      if (res.valid && res.serviceArea) {
        setPincodeResult({
          valid: true,
          message: `Local Service Area Confirmed: ${res.serviceArea.areaName} (${res.serviceArea.pincode})`,
          areaName: res.serviceArea.areaName,
        });
        setVerifServiceAreaId(res.serviceArea.serviceAreaId);
      } else {
        setPincodeResult({
          valid: false,
          message: res.message || 'Postal code is outside verified local service coverage.',
        });
      }
    } catch {
      setPincodeResult({ valid: false, message: 'Postal code check error. Please try again.' });
    } finally {
      setPincodeValidating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setVerifFile(null);
      setVerifFileError(null);
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setVerifFileError('Invalid file format. Only PDF documents (.pdf) are accepted.');
      setVerifFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setVerifFileError(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller PDF.`);
      setVerifFile(null);
      return;
    }

    setVerifFileError(null);
    setVerifFile(file);
    setVerifDoc(file.name);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) return;

    if (!verifFile && !activeBizDetails?.verificationDocument && !verifDoc) {
      alert('Please upload an official PDF trade license or verification document.');
      return;
    }

    try {
      setSubmittingVerif(true);

      let uploadedDocName: string | undefined = undefined;
      if (verifFile) {
        const uploadResult = await localmartApi.uploadVerificationDocument(selectedBizId, verifFile);
        uploadedDocName = uploadResult.verificationDocument;
      }

      await localmartApi.submitBusinessVerification(selectedBizId, {
        physicalAddress: verifAddress.trim(),
        postalCode: verifPostalCode.trim(),
        serviceAreaId: Number(verifServiceAreaId),
        verificationDocument: uploadedDocName || (verifDoc.trim() ? verifDoc.trim() : undefined),
      });

      alert('Physical store verification application and document submitted to LocalMart Admin!');
      setVerifFile(null);
      setVerifFileError(null);
      setShowVerifForm(false);
      await loadSellerData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit verification';
      alert(msg);
    } finally {
      setSubmittingVerif(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) return;

    if (activeBizDetails?.verificationStatus !== 'APPROVED') {
      alert('Product creation is locked until store verification is APPROVED by LocalMart admins.');
      return;
    }

    try {
      setSavingProduct(true);
      const req: ProductRequest = {
        businessId: selectedBizId,
        categoryId: Number(newCategoryId),
        productName: newProductName.trim(),
        price: parseFloat(newPrice),
        stockQuantity: parseInt(newStock, 10),
        description: newDesc.trim(),
      };

      await localmartApi.createProduct(req);
      setShowAddForm(false);
      setNewProductName('');
      setNewDesc('');
      await loadSellerData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create product';
      alert(msg);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product from PostgreSQL?')) return;
    try {
      await localmartApi.deleteProduct(productId);
      await loadSellerData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      alert(msg);
    }
  };

  const activeBiz = businesses.find((b) => b.businessId === selectedBizId);
  const isApproved = activeBizDetails?.verificationStatus === 'APPROVED';
  const isPending = activeBizDetails?.verificationStatus === 'PENDING';
  const isRejected = activeBizDetails?.verificationStatus === 'REJECTED';
  const isSuspended = activeBizDetails?.verificationStatus === 'SUSPENDED';

  return (
    <>
      <PageHeading
        title="SELLER WORKSPACE"
        subtitle="Your products. Your business. Your local community."
        eyebrow="LOCALMART FOR BUSINESS"
      />
      <div className="wrap dashboard-shell">
        <aside className="dashboard-nav">
          <a className="active" href="#overview">
            <LayoutDashboard />
            Overview
          </a>
          <a href="#verification">
            <ShieldCheck />
            Verification
          </a>
          <a href="#products">
            <Package />
            Products
          </a>
          <a href="/collaborate">
            <Handshake />
            Collaborations
          </a>
          <a href="#recommendations">
            <ChartNoAxesCombined />
            Inventory Advice
          </a>
        </aside>

        <div>
          {loading ? (
            <StatusPanel title="Loading seller intelligence…" message="Retrieving business and inventory metrics." />
          ) : !activeBiz ? (
            <StatusPanel
              compact
              title="Seller access required"
              message="No registered store found for this account. Switch to a Seller persona in your Profile."
              icon="locked"
            />
          ) : (
            <>
              {/* Store switcher if multiple stores */}
              {businesses.length > 1 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600 }}>Active Store:</label>
                  <select
                    value={selectedBizId || ''}
                    onChange={(e) => {
                      setSelectedBizId(Number(e.target.value));
                      void loadSellerData();
                    }}
                    style={{ padding: '6px 12px', fontSize: '14px', border: '1px solid var(--border)' }}
                  >
                    {businesses.map((b) => (
                      <option key={b.businessId} value={b.businessId}>
                        {b.businessName} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* VERIFICATION STATUS NOTIFICATION BANNER */}
              {isApproved && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '15px' }}>VERIFIED PHYSICAL ESTABLISHMENT</h4>
                        <span style={{ background: '#16a34a', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>APPROVED</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#15803d' }}>
                        {activeBizDetails?.serviceAreaName || activeBizDetails?.serviceArea?.areaName || 'Local Service Area'} • Physical store address: {activeBizDetails?.physicalAddress || activeBizDetails?.address || 'Verified on file'}
                        {activeBizDetails?.verificationDocument && (
                          <span style={{ marginLeft: '8px', opacity: 0.8 }}>({activeBizDetails.verificationDocument})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <a href="/collaborate" style={{ fontSize: '13px', fontWeight: 600, color: '#166534', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                    Explore Maker Collaborations →
                  </a>
                </div>
              )}

              {isPending && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: '15px' }}>STORE VERIFICATION IN REVIEW</h4>
                        <span style={{ background: '#d97706', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>PENDING ADMIN REVIEW</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#b45309' }}>
                        Your store proof document ({activeBizDetails?.verificationDocument || 'Submitted'}) for {activeBizDetails?.serviceAreaName || 'local area'} is under review by LocalMart administrators. New product creation and collaborative selling will unlock once approved.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setShowVerifForm(!showVerifForm)}>
                    {showVerifForm ? 'CLOSE FORM' : 'UPDATE PROOF'}
                  </Button>
                </div>
              )}

              {isRejected && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <XCircle size={24} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#991b1b', fontSize: '15px' }}>STORE VERIFICATION ACTION REQUIRED</h4>
                        <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>REJECTED</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#b91c1c' }}>
                        <strong>Rejection Reason:</strong> {activeBizDetails?.verificationReason || 'Address or documentation requirements not met.'}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                        Please verify your physical establishment, check postal code coverage, and re-submit your proof document below.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setShowVerifForm(true)}>
                    RESUBMIT PROOF
                  </Button>
                </div>
              )}

              {isSuspended && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <XCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#991b1b', fontSize: '15px' }}>STORE SUSPENDED</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#b91c1c' }}>
                      Reason: {activeBizDetails?.verificationReason || 'Administrative suspension.'}
                    </p>
                  </div>
                </div>
              )}

              {/* OVERVIEW SECTION */}
              <section id="overview" className="dashboard-section">
                <h2>OVERVIEW — {activeBiz.businessName}</h2>
                <div className="metric-grid">
                  <div className="metric">
                    <p>Total Products</p>
                    <strong>{sellerProducts.length}</strong>
                  </div>
                  <div className="metric">
                    <p>Total Orders</p>
                    <strong>{sellerReport ? sellerReport.totalOrders : '0'}</strong>
                  </div>
                  <div className="metric">
                    <p>Items Sold</p>
                    <strong>{sellerReport ? sellerReport.itemsSold : '0'}</strong>
                  </div>
                  <div className="metric">
                    <p>Total Revenue</p>
                    <strong>{sellerReport ? formatCurrency(Number(sellerReport.totalRevenue)) : '₹0.00'}</strong>
                  </div>
                </div>
              </section>

              {/* VERIFICATION & SERVICE AREA SECTION */}
              <section id="verification" className="dashboard-section">
                <div className="dashboard-title">
                  <div>
                    <h2>LOCAL VERIFICATION & SERVICE AREA</h2>
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: '4px 0 0' }}>
                      LocalMart strictly validates physical shops located within approved municipal coverage zones.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setShowVerifForm(!showVerifForm)}>
                    {showVerifForm ? 'CLOSE FORM' : 'UPDATE VERIFICATION INFO'}
                  </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                        color: isApproved ? '#166534' : isPending ? '#92400e' : '#991b1b',
                      }}>
                        {activeBizDetails?.verificationStatus || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Area</div>
                    <strong style={{ fontSize: '15px', display: 'block', marginTop: '4px' }}>
                      {activeBizDetails?.serviceAreaName || activeBizDetails?.serviceArea?.areaName || 'Not Assigned'}
                    </strong>
                  </div>

                  <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Address</div>
                    <span style={{ fontSize: '14px', display: 'block', marginTop: '4px' }}>
                      {activeBizDetails?.physicalAddress || activeBizDetails?.address || 'None provided'} (PIN: {activeBizDetails?.postalCode || 'N/A'})
                    </span>
                  </div>

                  <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Document</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', wordBreak: 'break-all', fontWeight: 500 }}>
                        {activeBizDetails?.verificationDocument || 'No document on file'}
                      </span>
                      {activeBizDetails?.verificationDocument && selectedBizId && (
                        <a
                          href={localmartApi.getVerificationDocumentUrl(selectedBizId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: 'var(--coral, #c86144)',
                            fontWeight: 600,
                            textDecoration: 'underline',
                          }}
                        >
                          <FileText size={14} /> View PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {showVerifForm && (
                  <form
                    onSubmit={handleVerificationSubmit}
                    style={{
                      border: '1px solid var(--border)',
                      padding: '1.5rem',
                      borderRadius: '6px',
                      background: 'var(--secondary)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Submit Physical Store Verification Proof
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                      Valid physical location required. Postal codes are tested against authorized municipal delivery boundaries.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <label className="field" style={{ marginBottom: 0 }}>
                        <span>PHYSICAL STORE ADDRESS</span>
                        <input
                          required
                          value={verifAddress}
                          onChange={(e) => setVerifAddress(e.target.value)}
                          placeholder="e.g. 14 Gandhi Road, Vellore"
                        />
                      </label>

                      <div>
                        <label className="field" style={{ marginBottom: '4px' }}>
                          <span>POSTAL CODE (PINCODE)</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              required
                              value={verifPostalCode}
                              onChange={(e) => {
                                setVerifPostalCode(e.target.value);
                                setPincodeResult(null);
                              }}
                              placeholder="e.g. 632001"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={pincodeValidating || !verifPostalCode.trim()}
                              onClick={handleValidatePincode}
                            >
                              {pincodeValidating ? 'Checking…' : 'Check PIN'}
                            </Button>
                          </div>
                        </label>
                        {pincodeResult && (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: pincodeResult.valid ? '#166534' : '#b91c1c',
                            marginTop: '4px',
                          }}>
                            {pincodeResult.message}
                          </div>
                        )}
                      </div>

                      <label className="field" style={{ marginBottom: 0 }}>
                        <span>SERVICE AREA ZONE</span>
                        <select
                          required
                          value={verifServiceAreaId}
                          onChange={(e) => setVerifServiceAreaId(e.target.value)}
                        >
                          <option value="">-- Select Local Service Area --</option>
                          {serviceAreas.map((sa) => (
                            <option key={sa.serviceAreaId} value={sa.serviceAreaId}>
                              {sa.areaName} ({sa.pincode})
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="field" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                        <span style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                          VERIFICATION PROOF DOCUMENT (OFFICIAL PDF ONLY)
                        </span>
                        <div
                          style={{
                            border: verifFileError ? '2px dashed #e53e3e' : verifFile ? '2px solid #38a169' : '2px dashed var(--border)',
                            background: verifFile ? '#f0fff4' : 'var(--stone-50, #fcfbf9)',
                            borderRadius: '8px',
                            padding: '1.25rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'border-color 0.2s ease',
                          }}
                        >
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer',
                            }}
                          />
                          {verifFile ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle2 size={32} style={{ color: '#2f855a' }} />
                              <strong style={{ fontSize: '14px', color: '#22543d' }}>{verifFile.name}</strong>
                              <span style={{ fontSize: '12px', color: '#4a5568' }}>
                                {(verifFile.size / 1024).toFixed(1)} KB • Ready for secure verification upload
                              </span>
                              <span style={{ fontSize: '11px', color: '#718096', textDecoration: 'underline', marginTop: '4px' }}>
                                Click or drag another file to replace
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              <Upload size={28} style={{ color: 'var(--coral, #c86144)' }} />
                              <strong style={{ fontSize: '14px' }}>
                                Click to select or drag & drop trade license / storefront proof
                              </strong>
                              <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                Official municipal establishment or trade certificate (.pdf only, max 10MB)
                              </span>
                              {activeBizDetails?.verificationDocument && (
                                <span style={{ fontSize: '12px', color: '#4a5568', marginTop: '4px' }}>
                                  Current file on record: <strong>{activeBizDetails.verificationDocument}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {verifFileError && (
                          <div style={{ color: '#e53e3e', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                            {verifFileError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <Button type="submit" disabled={submittingVerif}>
                        {submittingVerif ? 'SUBMITTING TO ADMIN…' : 'SUBMIT VERIFICATION DETAILS'}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setShowVerifForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </section>

              {/* PRODUCTS MANAGEMENT SECTION */}
              <section id="products" className="dashboard-section">
                <div className="dashboard-title">
                  <h2>PRODUCT MANAGEMENT</h2>
                  <Button
                    size="sm"
                    disabled={!isApproved}
                    onClick={() => {
                      if (!isApproved) {
                        alert('Product creation is locked until store verification is APPROVED by LocalMart admins.');
                        return;
                      }
                      setShowAddForm(!showAddForm);
                    }}
                    title={!isApproved ? 'Store must be APPROVED to list products' : undefined}
                  >
                    {showAddForm ? 'CANCEL' : '+ ADD PRODUCT'}
                  </Button>
                </div>

                {!isApproved && (
                  <div style={{
                    margin: '0.5rem 0 1rem',
                    padding: '0.75rem 1rem',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertTriangle size={16} />
                    Product creation is currently locked. Your store verification status is{' '}
                    <strong>{activeBizDetails?.verificationStatus || 'PENDING'}</strong>. Once approved by LocalMart administrators, product listing will be unlocked.
                  </div>
                )}

                {showAddForm && (
                  <form
                    onSubmit={handleCreateProduct}
                    style={{
                      border: '1px solid var(--border)',
                      padding: '1.5rem',
                      borderRadius: '4px',
                      background: 'var(--secondary)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem' }}>
                      Add New Product to PostgreSQL Catalog
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                      <label className="field" style={{ marginBottom: 0 }}>
                        <span>PRODUCT NAME</span>
                        <input
                          required
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="e.g. Sourdough Loaf"
                        />
                      </label>
                      <label className="field" style={{ marginBottom: 0 }}>
                        <span>CATEGORY</span>
                        <select
                          value={newCategoryId}
                          onChange={(e) => setNewCategoryId(Number(e.target.value))}
                        >
                          {categories.map((c) => (
                            <option key={c.categoryId} value={c.categoryId}>
                              {c.categoryName}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field" style={{ marginBottom: 0 }}>
                        <span>PRICE (₹)</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      </label>
                      <label className="field" style={{ marginBottom: 0 }}>
                        <span>STOCK QUANTITY</span>
                        <input
                          type="number"
                          required
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                        />
                      </label>
                    </div>
                    <label className="field" style={{ marginBottom: '1rem' }}>
                      <span>DESCRIPTION</span>
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Product craftsmanship, ingredients, or details..."
                        style={{ minHeight: '80px' }}
                      />
                    </label>
                    <Button type="submit" disabled={savingProduct}>
                      {savingProduct ? 'SAVING TO DATABASE…' : 'SAVE PRODUCT TO POSTGRESQL'}
                    </Button>
                  </form>
                )}

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-cell">
                            No products currently listed for this store.
                          </td>
                        </tr>
                      ) : (
                        sellerProducts.map((p) => (
                          <tr key={p.productId}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    borderRadius: '4px',
                                    background: 'var(--muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {getProductImageUrl(p) ? (
                                    <img
                                      src={getProductImageUrl(p)}
                                      alt={p.productName}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <Package size={16} style={{ opacity: 0.4 }} />
                                  )}
                                </div>
                                <strong>{p.productName}</strong>
                              </div>
                            </td>
                            <td>{p.category?.categoryName || p.categoryName || 'General'}</td>
                            <td>{formatCurrency(Number(p.price))}</td>
                            <td>
                              <span
                                style={{
                                  color: p.stockQuantity <= 5 ? 'var(--destructive)' : 'var(--success)',
                                  fontWeight: 600,
                                }}
                              >
                                {p.stockQuantity} units
                              </span>
                            </td>
                            <td>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(p.productId)}
                                className="text-destructive"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* INVENTORY RECOMMENDATIONS SECTION */}
              <section id="recommendations" className="dashboard-section">
                <h2>INVENTORY RECOMMENDATIONS</h2>
                <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                  Database-driven restock analytics calculated via Spring Boot and PostgreSQL views.
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Current Stock</th>
                        <th>Status</th>
                        <th>60d Demand</th>
                        <th>Days Left</th>
                        <th>Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="empty-cell">
                            All products are adequately stocked or pending order velocity.
                          </td>
                        </tr>
                      ) : (
                        recommendations.map((rec, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{rec.productName}</strong>
                            </td>
                            <td>{rec.currentStock}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 6px',
                                  borderRadius: '2px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  background:
                                    rec.inventoryStatus === 'CRITICAL'
                                      ? '#fee2e2'
                                      : rec.inventoryStatus === 'LOW'
                                      ? '#fef3c7'
                                      : '#dcfce7',
                                  color:
                                    rec.inventoryStatus === 'CRITICAL'
                                      ? '#b91c1c'
                                      : rec.inventoryStatus === 'LOW'
                                      ? '#b45309'
                                      : '#15803d',
                                }}
                              >
                                {rec.inventoryStatus}
                              </span>
                            </td>
                            <td>{rec.unitsOrdered60d || 0} units</td>
                            <td>{Number(rec.estimatedDaysRemaining || 0).toFixed(1)} days</td>
                            <td>
                              {rec.recommendation}
                              {rec.suggestedReorderQuantity > 0 && (
                                <strong style={{ marginLeft: '4px', color: 'var(--primary)' }}>
                                  (+{rec.suggestedReorderQuantity})
                                </strong>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// 6. ADMIN WORKFLOW (Live PostgreSQL Reporting Views)
// ============================================================================
export function Admin() {
  const [catalogReport, setCatalogReport] = useState<any[]>([]);
  const [sellerReport, setSellerReport] = useState<SellerPerformance[]>([]);
  const [customerSummary, setCustomerSummary] = useState<CustomerOrderSummary[]>([]);
  const [productPerf, setProductPerf] = useState<ProductPerformance[]>([]);
  const [productRatings, setProductRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cat, sel, cust, perf, rat] = await Promise.all([
        localmartApi.reports.productCatalog(),
        localmartApi.reports.sellerPerformance(),
        localmartApi.reports.customerOrderSummary(),
        localmartApi.reports.productPerformance(),
        localmartApi.reports.productRatings(),
      ]);

      setCatalogReport(cat);
      setSellerReport(sel);
      setCustomerSummary(cust);
      setProductPerf(perf);
      setProductRatings(rat);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query database views.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminReports();
  }, [loadAdminReports]);

  const totalGrossRevenue = useMemo(() => {
    return sellerReport.reduce((sum, s) => sum + Number(s.totalRevenue || 0), 0);
  }, [sellerReport]);

  const totalOrdersPlaced = useMemo(() => {
    return sellerReport.reduce((sum, s) => sum + Number(s.totalOrders || 0), 0);
  }, [sellerReport]);

  return (
    <>
      <PageHeading
        title="MARKETPLACE REPORTS"
        subtitle="A clear view of your local marketplace backed by PostgreSQL views."
        eyebrow="LOCALMART ADMINISTRATION"
      />
      <div className="wrap dashboard-shell">
        <aside className="dashboard-nav">
          <a className="active" href="#catalog">
            <Package />
            Product catalog
          </a>
          <a href="#sellers">
            <ChartNoAxesCombined />
            Seller performance
          </a>
          <a href="#customers">
            <Users />
            Customers
          </a>
          <a href="#performance">
            <Layers />
            Product sales
          </a>
          <a href="#ratings">
            <Star />
            Product ratings
          </a>
        </aside>

        <div>
          {loading ? (
            <StatusPanel title="Querying PostgreSQL Views…" message="Executing analytic queries across database reporting views." />
          ) : error ? (
            <StatusPanel
              title="Reports unavailable"
              message={error}
              retry={() => {
                void loadAdminReports();
              }}
            />
          ) : (
            <>
              {/* TOP METRICS GRID */}
              <div className="metric-grid">
                <div className="metric">
                  <p>Catalog Products</p>
                  <strong>{catalogReport.length}</strong>
                </div>
                <div className="metric">
                  <p>Verified Sellers</p>
                  <strong>{sellerReport.length}</strong>
                </div>
                <div className="metric">
                  <p>Registered Customers</p>
                  <strong>{customerSummary.length}</strong>
                </div>
                <div className="metric">
                  <p>Gross Marketplace Revenue</p>
                  <strong>{formatCurrency(totalGrossRevenue)}</strong>
                </div>
              </div>

              {/* 1. PRODUCT CATALOG VIEW */}
              <section className="dashboard-section" id="catalog">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>PRODUCT CATALOG (VIEW product_catalog)</h2>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    {catalogReport.length} records
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Business</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogReport.map((p) => (
                        <tr key={p.productId}>
                          <td>
                            <strong>{p.productName}</strong>
                          </td>
                          <td>{p.businessName}</td>
                          <td>{p.categoryName}</td>
                          <td>{formatCurrency(Number(p.price))}</td>
                          <td>{p.stockQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 2. SELLER PERFORMANCE VIEW */}
              <section className="dashboard-section" id="sellers">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>SELLER PERFORMANCE (VIEW seller_performance)</h2>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    {sellerReport.length} stores
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Business Store</th>
                        <th>Total Orders</th>
                        <th>Items Sold</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerReport.map((s) => (
                        <tr key={s.businessId}>
                          <td>
                            <strong>{s.businessName}</strong>
                          </td>
                          <td>{s.totalOrders}</td>
                          <td>{s.itemsSold}</td>
                          <td>
                            <strong style={{ color: 'var(--primary)' }}>
                              {formatCurrency(Number(s.totalRevenue))}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 3. CUSTOMER ORDER SUMMARY VIEW */}
              <section className="dashboard-section" id="customers">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>CUSTOMER ORDER SUMMARY (VIEW customer_order_summary)</h2>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    {customerSummary.length} customers
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Total Orders</th>
                        <th>Items Purchased</th>
                        <th>Total Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerSummary.map((c) => (
                        <tr key={c.userId}>
                          <td>
                            <strong>{c.fullName}</strong>
                          </td>
                          <td>{c.totalOrders}</td>
                          <td>{c.itemsPurchased}</td>
                          <td>{formatCurrency(Number(c.totalSpent))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 4. PRODUCT PERFORMANCE VIEW */}
              <section className="dashboard-section" id="performance">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>PRODUCT PERFORMANCE (VIEW product_performance)</h2>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    {productPerf.length} products
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Store</th>
                        <th>Category</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productPerf.map((pp) => (
                        <tr key={pp.productId}>
                          <td>
                            <strong>{pp.productName}</strong>
                          </td>
                          <td>{pp.businessName}</td>
                          <td>{pp.categoryName}</td>
                          <td>{pp.unitsSold}</td>
                          <td>{formatCurrency(Number(pp.revenue))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 5. PRODUCT RATINGS VIEW */}
              <section className="dashboard-section" id="ratings">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>PRODUCT RATINGS (VIEW product_ratings)</h2>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    {productRatings.length} rated products
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Business</th>
                        <th>Average Rating</th>
                        <th>Total Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productRatings.map((pr) => (
                        <tr key={pr.productId}>
                          <td>
                            <strong>{pr.productName}</strong>
                          </td>
                          <td>{pr.businessName}</td>
                          <td>★ {Number(pr.averageRating || 0).toFixed(1)} / 5</td>
                          <td>{pr.reviewCount} reviews</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// 7. PROFILE & DEMO PERSONA SWITCHER WORKFLOW
// ============================================================================
export function Profile() {
  const { currentUser, role, allUsers, switchUser, switchRole, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate({ to: '/login' });
    }
  }, [loading, currentUser, navigate]);

  const handleSignOut = () => {
    logout();
    navigate({ to: '/login' });
  };

  const handleSwitchAccount = () => {
    logout();
    navigate({ to: '/login' });
  };

  if (loading) {
    return null;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <PageHeading title="YOUR LOCALMART ACCOUNT" subtitle="A marketplace that’s a little closer to you." />
      <div className="wrap section" style={{ maxWidth: '760px' }}>
        <div style={{ border: '1px solid var(--border)', padding: '2rem', borderRadius: '4px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div>
              <h2 className="font-display text-2xl" style={{ margin: 0 }}>
                {currentUser.fullName}
              </h2>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                {currentUser.role} ACCOUNT
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchAccount}
              >
                Switch Account
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', fontSize: '14px', marginBottom: '2rem' }}>
            <div>
              <span style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </span>
              <p style={{ fontWeight: 500, marginTop: '2px' }}>{currentUser.email}</p>
            </div>
            <div>
              <span style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Phone Number
              </span>
              <p style={{ fontWeight: 500, marginTop: '2px' }}>{currentUser.phone || 'Not provided'}</p>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Delivery / Physical Address
              </span>
              <p style={{ fontWeight: 500, marginTop: '2px' }}>{currentUser.address || 'Vellore, Tamil Nadu'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/orders' })}>
              View Orders
            </Button>
            {role === 'SELLER' && (
              <Button size="sm" onClick={() => navigate({ to: '/seller' })}>
                Open Seller Workspace
              </Button>
            )}
            {role === 'ADMIN' && (
              <Button size="sm" onClick={() => navigate({ to: '/admin' })}>
                Open Admin Reports
              </Button>
            )}
          </div>

          {/* Quick Demo Selector for Development / Hackathon Evaluation */}
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Fast Persona Switcher (PostgreSQL)
            </span>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {(['CUSTOMER', 'SELLER', 'ADMIN'] as UserRole[]).map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant={role === r ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => switchRole(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
            <select
              style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)' }}
              value={currentUser?.userId || ''}
              onChange={(e) => switchUser(Number(e.target.value))}
            >
              {allUsers.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.fullName} — {u.role} ({u.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// 8. INFORMATIONAL PAGES (About, Contact, Help)
// ============================================================================
export function Info({ kind }: { kind: 'about' | 'contact' | 'help' }) {
  return (
    <>
      <PageHeading
        title={kind === 'about' ? 'A LITTLE MORE LOCAL' : kind === 'contact' ? 'LET’S CONNECT' : 'HERE TO HELP'}
        subtitle={
          kind === 'about'
            ? 'Discover local. Shop nearby. Support small.'
            : kind === 'contact'
            ? 'Good communities start with a conversation.'
            : 'Your local marketplace, made simpler.'
        }
      />
      <div className="wrap section help-copy">
        {kind === 'about' ? (
          <>
            <h2>WHAT IS LOCALMART?</h2>
            <p>
              LOCALMART connects customers with local businesses and their products through one database-driven
              marketplace. Discover thoughtful products, see stock and rating information, and get to know the businesses
              in your community.
            </p>
            <h2>Small businesses. A bigger connection.</h2>
            <p>
              Every local business has a story. We bring their products a little closer, helping independent sellers
              reach more customers.
            </p>
            <h2>PostgreSQL DBMS Engine</h2>
            <p>
              This marketplace is supported by a relational PostgreSQL database schema utilizing views, procedures, and
              triggers to ensure strict data consistency and real-time inventory management.
            </p>
          </>
        ) : kind === 'contact' ? (
          <>
            <h2>Contact your local store</h2>
            <p>
              Browse businesses to find the store behind a product. You can contact sellers directly or visit their
              workshops in Vellore and Chennai.
            </p>
            <Link to="/business" className="text-link mt-6">
              DISCOVER BUSINESSES <ArrowRight />
            </Link>
          </>
        ) : (
          <>
            <h2>Finding your next favourite</h2>
            <p>
              Browse the catalog and filter by business or category. Product listings display the price and current
              stock information supplied by the PostgreSQL marketplace.
            </p>
            <h2>Ordering & Checkouts</h2>
            <p>
              Orders are validated and processed atomically via PostgreSQL stored procedure <code>place_order</code>,
              ensuring inventory is accurately decremented.
            </p>
            <Link to="/catalog" className="text-link mt-6">
              EXPLORE PRODUCTS <ArrowRight />
            </Link>
          </>
        )}
      </div>
    </>
  );
}
