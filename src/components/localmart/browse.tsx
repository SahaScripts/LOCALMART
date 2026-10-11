import { useState, useMemo, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Store, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import {
  catalogOptions,
  ratingOptions,
  pageSearch,
  formatCurrency,
  localmartApi,
  resolveUserCart,
  type Review,
} from '@/lib/localmart-api';
import { useAuth } from '@/lib/use-auth';
import {
  PageHeading,
  StatusPanel,
  ProductCard,
  ProductImage,
  RatingView,
  Button,
  Link,
  ArrowRight,
  Breadcrumb,
} from './shared';

export function Catalog() {
  const search = pageSearch(useSearch({ strict: false }));
  const [q, setQ] = useState(search.q ?? '');
  const [category, setCategory] = useState(search.category ?? '');
  const [business, setBusiness] = useState(search.business ?? '');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('name');
  const [filters, setFilters] = useState(false);

  const catalog = useSuspenseQuery(catalogOptions);
  const ratings = useSuspenseQuery(ratingOptions);

  const categories = [...new Set(catalog.data.data.map((p) => p.categoryName))];
  const businesses = [...new Set(catalog.data.data.map((p) => p.businessName))];

  const rows = useMemo(
    () =>
      catalog.data.data
        .filter(
          (p) =>
            (!category || p.categoryName === category) &&
            (!business || p.businessName === business) &&
            (!inStock || p.stockQuantity > 0) &&
            `${p.productName} ${p.businessName} ${p.categoryName} ${p.description ?? ''}`
              .toLowerCase()
              .includes(q.toLowerCase())
        )
        .sort((a, b) =>
          sort === 'price-low'
            ? Number(a.price) - Number(b.price)
            : sort === 'price-high'
            ? Number(b.price) - Number(a.price)
            : a.productName.localeCompare(b.productName)
        ),
    [catalog.data.data, category, business, inStock, q, sort]
  );

  return (
    <>
      <PageHeading
        title="SHOP LOCAL"
        subtitle="Thoughtful finds. Independent businesses. A marketplace closer to home."
      />
      <div className="wrap catalog-layout">
        <aside className={`catalog-filters ${filters ? 'open' : ''}`}>
          <h2>Refine your finds</h2>
          <label className="field">
            <span>SEARCH</span>
            <input
              aria-label="Search catalog"
              placeholder="What are you looking for?"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label className="field">
            <span>CATEGORY</span>
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>BUSINESS</span>
            <select
              aria-label="Business"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
            >
              <option value="">All businesses</option>
              {businesses.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            In stock only
          </label>
          <Button
            size="sm"
            variant="link"
            onClick={() => {
              setQ('');
              setCategory('');
              setBusiness('');
              setInStock(false);
            }}
          >
            Clear filters
          </Button>
        </aside>

        <div>
          <div className="catalog-toolbar">
            <Button
              variant="outline"
              size="sm"
              className="mobile-filter-button"
              onClick={() => setFilters(!filters)}
              aria-expanded={filters}
            >
              <SlidersHorizontal />
              FILTERS
            </Button>
            <span>
              {catalog.data.error
                ? 'Your local marketplace'
                : `${rows.length} ${rows.length === 1 ? 'product' : 'products'}`}
            </span>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
          </div>

          {catalog.data.error ? (
            <StatusPanel
              message={catalog.data.error}
              retry={() => {
                void catalog.refetch();
              }}
            />
          ) : rows.length ? (
            <div className="product-grid">
              {rows.map((p) => (
                <ProductCard
                  key={p.productId}
                  product={p}
                  rating={ratings.data.data.find((r) => r.productId === p.productId)}
                />
              ))}
            </div>
          ) : (
            <StatusPanel
              title="No products found"
              message="Try another search or clear your filters to discover more."
              icon="empty"
            />
          )}
        </div>
      </div>
    </>
  );
}

export function Product() {
  const search = pageSearch(useSearch({ strict: false }));
  const catalog = useSuspenseQuery(catalogOptions);
  const ratings = useSuspenseQuery(ratingOptions);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const { currentUser } = useAuth();
  const product = catalog.data.data.find((p) => String(p.productId) === search.id);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    async function loadReviews() {
      try {
        setLoadingReviews(true);
        const all = await localmartApi.getReviews();
        if (!cancelled) {
          const matched = all.filter((r) => r.product && r.product.productId === product?.productId);
          setReviews(matched);
        }
      } catch (err) {
        console.warn('Failed to load reviews for product', err);
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    }
    void loadReviews();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!currentUser) {
      window.location.href = '/profile';
      return;
    }

    try {
      setAdding(true);
      const cartId = await resolveUserCart(currentUser.userId);
      await localmartApi.addCartItem(cartId, product.productId, quantity);
      window.dispatchEvent(new CustomEvent('localmart:cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add item to cart';
      alert(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {!product ? (
        <>
          <PageHeading title="PRODUCT DETAILS" />
          <div className="wrap section">
            <StatusPanel
              title={catalog.data.error ? 'Unable to load product' : 'Choose a local discovery'}
              message={
                catalog.data.error ?? 'Explore the marketplace to find a product you love.'
              }
              retry={
                catalog.data.error
                  ? () => {
                      void catalog.refetch();
                    }
                  : undefined
              }
            />
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link to="/catalog">
                  EXPLORE PRODUCTS <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="wrap section">
          <Breadcrumb label={product.productName} />
          <div className="detail-layout">
            <div className="detail-image">
              <ProductImage product={product} />
            </div>
            <div className="detail-info">
              <p className="eyebrow text-primary">{product.categoryName}</p>
              <h1>{product.productName}</h1>
              <Link
                className="text-link"
                to="/business"
                search={{ business: product.businessName }}
              >
                {product.businessName} · View Store <ArrowRight />
              </Link>
              <RatingView
                rating={ratings.data.data.find((r) => r.productId === product.productId)}
              />
              <p className="price">{formatCurrency(Number(product.price))}</p>
              <p className="detail-description">
                {product.description || 'No additional description is available for this product.'}
              </p>
              <p className={`stock-label ${product.stockQuantity <= 0 ? 'unavailable' : ''}`}>
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} available in PostgreSQL inventory`
                  : 'OUT OF STOCK'}
              </p>

              <div className="quantity">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || product.stockQuantity <= 0}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus />
                </Button>
                <span>{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stockQuantity || product.stockQuantity <= 0}
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                >
                  <Plus />
                </Button>
              </div>

              <div>
                <Button
                  disabled={product.stockQuantity <= 0 || adding}
                  onClick={handleAddToCart}
                  style={{ minWidth: '180px' }}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-white" />
                      ADDED {quantity} TO CART
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {product.stockQuantity <= 0 ? 'OUT OF STOCK' : adding ? 'ADDING…' : `ADD ${quantity} TO CART`}
                    </>
                  )}
                </Button>
              </div>

              <p className="notice" style={{ marginTop: '0.75rem' }}>
                Item will be staged in PostgreSQL Cart. Stored procedures validate stock on checkout.
              </p>
            </div>
          </div>

          <div className="detail-about">
            <h2>ABOUT THIS PRODUCT</h2>
            <p className="notice">
              {product.description || 'Authentic handcrafted item sourced locally from neighborhood artisans.'}
            </p>
          </div>

          <div className="detail-about">
            <h2>CUSTOMER REVIEWS</h2>
            <RatingView
              rating={ratings.data.data.find((r) => r.productId === product.productId)}
            />
            {loadingReviews ? (
              <p className="notice">Loading reviews from database…</p>
            ) : reviews.length > 0 ? (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((r, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--secondary)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong>{r.user ? r.user.fullName : 'Verified Customer'}</strong>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>★ {r.rating}/5</span>
                    </div>
                    <p style={{ fontSize: '15px', color: 'var(--foreground)' }}>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="notice">No customer written reviews recorded yet for this product.</p>
            )}
            <div style={{ marginTop: '1.25rem' }}>
              <Link className="text-link" to="/reviews" search={{ id: String(product.productId) }}>
                Share your review for this product <ArrowRight />
              </Link>
            </div>
          </div>

          <div className="detail-about">
            <h2>RELATED PRODUCTS</h2>
            <div className="product-grid">
              {catalog.data.data
                .filter(
                  (p) =>
                    p.productId !== product.productId &&
                    p.categoryName === product.categoryName
                )
                .slice(0, 4)
                .map((p) => (
                  <ProductCard
                    key={p.productId}
                    product={p}
                    rating={ratings.data.data.find((r) => r.productId === p.productId)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Business() {
  const search = pageSearch(useSearch({ strict: false }));
  const catalog = useSuspenseQuery(catalogOptions);
  const ratings = useSuspenseQuery(ratingOptions);

  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    localmartApi.getBusinesses().then(setBusinesses).catch(() => {});
  }, []);

  const names = [...new Set(catalog.data.data.map((p) => p.businessName))];
  const rows = catalog.data.data.filter((p) => p.businessName === search.business);
  const selectedBiz = businesses.find((b) => b.businessName === search.business);

  return (
    <>
      <PageHeading
        title={search.business ?? 'MEET YOUR LOCAL BUSINESSES'}
        subtitle={
          search.business
            ? `${selectedBiz ? `${selectedBiz.city || ''}, ${selectedBiz.state || ''} — ` : ''}${selectedBiz?.description || 'Thoughtfully chosen products, from a business in your community.'}`
            : 'Independent stores. Individual stories. Discover the people behind your next favourite.'
        }
      />
      <div className="wrap section">
        {catalog.data.error ? (
          <StatusPanel
            title="Unable to load businesses"
            message={catalog.data.error}
            retry={() => {
              void catalog.refetch();
            }}
          />
        ) : search.business ? (
          <>
            <h2 className="font-display text-2xl mb-8">PRODUCTS FROM THIS BUSINESS</h2>
            {rows.length ? (
              <div className="product-grid">
                {rows.map((p) => (
                  <ProductCard
                    key={p.productId}
                    product={p}
                    rating={ratings.data.data.find((r) => r.productId === p.productId)}
                  />
                ))}
              </div>
            ) : (
              <StatusPanel
                title="No products found"
                message="This business has no products in the current catalog."
                icon="empty"
              />
            )}
          </>
        ) : names.length ? (
          <div className="business-grid">
            {names.map((name) => {
              const biz = businesses.find((b) => b.businessName === name);
              const count = catalog.data.data.filter((p) => p.businessName === name).length;
              return (
                <article className="business-card" key={name}>
                  <Store />
                  <h2>{name}</h2>
                  <p style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '4px' }}>
                    {biz ? `📍 ${biz.city || ''}, ${biz.state || ''}` : ''}
                  </p>
                  <p>{count} products in the PostgreSQL catalog</p>
                  <Link to="/business" search={{ business: name }} className="text-link">
                    VIEW STORE <ArrowRight />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <StatusPanel
            title="No businesses yet"
            message="Meet local sellers as their products join the marketplace."
            icon="empty"
          />
        )}
      </div>
    </>
  );
}
