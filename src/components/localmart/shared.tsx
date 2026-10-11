import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Store,
  Search,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ArrowRight,
  RefreshCw,
  Package,
  Star,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Heart,
  Database,
  MessageCircle,
  Check,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  catalogOptions,
  ratingOptions,
  formatCurrency,
  safeImage,
  localmartApi,
  resolveUserCart,
  type Product,
  type Rating,
} from '@/lib/localmart-api';
import { useAuth } from '@/lib/use-auth';
import { getProductImageUrl } from '@/lib/product-images';

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="LOCALMART home">
      <Store />
      <span>LOCALMART</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { role, currentUser, cartCount, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="site-header">
      <div className="wrap header-top">
        <Brand />
        <form
          className="header-search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: '/catalog', search: { q } });
            setOpen(false);
          }}
        >
          <input
            aria-label="Search products and businesses"
            placeholder="Search products, businesses and a little local magic…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button variant="ghost" size="icon" type="submit" aria-label="Search">
            <Search />
          </Button>
        </form>

        <div className="header-actions">
          <Link to="/orders" className="orders-link">
            <Package />
            MY ORDERS
          </Link>
          <Link to="/cart">
            <ShoppingBag />
            MY CART{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="profile-link" title={`${currentUser.fullName} (${role})`}>
                <UserRound />
                {`${currentUser.fullName.split(' ')[0].toUpperCase()} (${role})`}
              </Link>
              <button
                type="button"
                className="profile-link text-xs font-semibold tracking-wider text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 ml-1"
                onClick={handleSignOut}
                title="Sign out of LOCALMART"
              >
                <LogOut className="w-3.5 h-3.5" />
                SIGN OUT
              </button>
            </div>
          ) : (
            <Link to="/login" className="profile-link" title="Sign in or register">
              <UserRound />
              SIGN IN
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className={`wrap nav-row ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      >
        <Link to="/" activeOptions={{ exact: true }}>
          HOME
        </Link>
        <Link to="/catalog">SHOP</Link>
        <Link to="/business">BUSINESSES</Link>
        <Link to="/catalog" search={{ category: '' }}>
          CATEGORIES
        </Link>
        <Link to="/collaborate">COLLABORATE</Link>
        {currentUser?.role === 'SELLER' && <Link to="/seller">SELLER DASHBOARD</Link>}
        {currentUser?.role === 'ADMIN' && <Link to="/admin">ADMIN</Link>}
        <Link to="/reviews">REVIEWS</Link>
        {open && (
          <>
            <Link to="/orders">ORDERS</Link>
            {currentUser ? (
              <>
                <Link to="/profile">PROFILE</Link>
                <button
                  type="button"
                  className="text-left font-semibold text-destructive py-2 px-0 bg-transparent border-0 cursor-pointer flex items-center gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  SIGN OUT
                </button>
              </>
            ) : (
              <Link to="/login">SIGN IN</Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              Discover local. Shop nearby.
              <br />
              Support small.
            </p>
          </div>
          <div className="footer-col">
            <h3>MARKETPLACE</h3>
            <Link to="/">Home</Link>
            <Link to="/catalog">Shop</Link>
            <Link to="/catalog" search={{ category: '' }}>
              Categories
            </Link>
            <Link to="/business">Businesses</Link>
          </div>
          <div className="footer-col">
            <h3>CUSTOMER</h3>
            <Link to="/cart">Cart</Link>
            <Link to="/checkout">Checkout</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/reviews">Reviews</Link>
          </div>
          <div className="footer-col">
            <h3>BUSINESS</h3>
            <Link to="/seller">Seller Dashboard</Link>
            <Link to="/seller">Manage Products</Link>
            <Link to="/seller">Performance</Link>
          </div>
          <div className="footer-col">
            <h3>CONNECT</h3>
            <Link to="/about">About LOCALMART</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/help">Help</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 LOCALMART. All rights reserved.</span>
          <span>PostgreSQL 18.6 &bull; Spring Boot REST Backend</span>
          <span>Local marketplace platform</span>
        </div>
      </div>
    </footer>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  eyebrow = 'YOUR NEIGHBOURHOOD. YOUR MARKETPLACE.',
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="page-heading">
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatusPanel({
  title = 'Unable to load products',
  message = 'Please try again shortly.',
  retry,
  compact = false,
  icon = 'error',
}: {
  title?: string;
  message?: string;
  retry?: () => void;
  compact?: boolean;
  icon?: 'error' | 'empty' | 'locked';
}) {
  return (
    <div className={`status-panel ${compact ? 'compact' : ''}`} role="status">
      {icon === 'empty' ? <ShoppingBag /> : icon === 'locked' ? <ShieldCheck /> : <Store />}
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      {retry && (
        <Button className="retry" variant="outline" size="sm" onClick={retry}>
          <RefreshCw />
          TRY AGAIN
        </Button>
      )}
    </div>
  );
}

export function Loading() {
  return (
    <div className="wrap section" role="status">
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
      <p className="loading-label">Loading the marketplace…</p>
    </div>
  );
}

export function ProductImage({
  product,
  className,
}: {
  product: { productId?: number; productName?: string; imageUrl?: string };
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = getProductImageUrl(product);
  const image = safeImage(resolved);
  return (
    <div className={`product-image ${className || ''}`.trim()}>
      {image && !failed ? (
        <img
          src={image}
          alt={product.productName || 'Product'}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <Package />
          <span className="image-label">Product image unavailable</span>
        </>
      )}
    </div>
  );
}

export function RatingView({ rating }: { rating?: Rating }) {
  return (
    <div className="rating">
      {rating && Number(rating.reviewCount) > 0 ? (
        <>
          <Star />
          <span>{Number(rating.averageRating).toFixed(1)}</span>
          <span>
            ({rating.reviewCount} {Number(rating.reviewCount) === 1 ? 'review' : 'reviews'})
          </span>
        </>
      ) : (
        <span>No reviews yet</span>
      )}
    </div>
  );
}

export function ProductCard({ product, rating }: { product: Product; rating?: Rating }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { currentUser } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    try {
      setAdding(true);
      const cartId = await resolveUserCart(currentUser.userId);
      await localmartApi.addCartItem(cartId, product.productId, 1);
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
    <article className="product-card">
      <Link to="/product" search={{ id: String(product.productId) }}>
        <ProductImage product={product} />
      </Link>
      <p className="category-label">{product.categoryName}</p>
      <h3>
        <Link to="/product" search={{ id: String(product.productId) }}>
          {product.productName}
        </Link>
      </h3>
      <p className="business-name">
        <Link to="/business" search={{ business: product.businessName }}>
          {product.businessName}
        </Link>
      </p>
      <p className="description">{product.description}</p>
      <RatingView rating={rating} />
      <div className="product-bottom">
        <strong>{formatCurrency(Number(product.price))}</strong>
        <span className={`stock-label ${product.stockQuantity <= 0 ? 'unavailable' : ''}`}>
          {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'OUT OF STOCK'}
        </span>
      </div>
      <div>
        <Button
          className="product-add"
          variant="outline"
          disabled={product.stockQuantity <= 0 || adding}
          onClick={handleAddToCart}
          title={product.stockQuantity <= 0 ? 'Out of stock' : 'Add 1 unit to cart'}
        >
          {added ? (
            <>
              <Check className="h-3 w-3 mr-1 text-emerald-600" />
              ADDED TO CART
            </>
          ) : (
            <>
              <ShoppingBag className="h-3 w-3 mr-1" />
              {product.stockQuantity <= 0 ? 'OUT OF STOCK' : adding ? 'ADDING…' : 'ADD TO CART'}
            </>
          )}
        </Button>
      </div>
    </article>
  );
}

export function ProductsSection({ popular = false }: { popular?: boolean }) {
  const catalog = useSuspenseQuery(catalogOptions);
  const ratings = useSuspenseQuery(ratingOptions);
  const rows = popular
    ? [...catalog.data.data].sort(
        (a, b) =>
          (ratings.data.data.find((r) => r.productId === b.productId)?.reviewCount ?? 0) -
          (ratings.data.data.find((r) => r.productId === a.productId)?.reviewCount ?? 0)
      )
    : catalog.data.data;

  return (
    <section className="section wrap">
      <div className="section-top">
        <SectionHeading
          title={popular ? 'POPULAR RIGHT NOW' : "WHAT’S NEW?"}
          subtitle={
            popular
              ? 'Good finds, right around the corner.'
              : 'Fresh discoveries from your local marketplace.'
          }
        />
        <Link to="/catalog">
          VIEW ALL PRODUCTS <ArrowRight size={13} />
        </Link>
      </div>
      {catalog.data.error ? (
        <StatusPanel
          compact
          message={catalog.data.error}
          retry={() => {
            void catalog.refetch();
          }}
        />
      ) : rows.length ? (
        <div className="product-grid">
          {rows.slice(0, 4).map((p) => (
            <ProductCard
              key={p.productId}
              product={p}
              rating={ratings.data.data.find((r) => r.productId === p.productId)}
            />
          ))}
        </div>
      ) : (
        <StatusPanel
          compact
          title="No products yet"
          message="New local discoveries will appear here when sellers add their products."
          icon="empty"
        />
      )}
      {ratings.data.error && !catalog.data.error && (
        <p className="notice">Ratings are currently unavailable.</p>
      )}
      <div className="coral-rule" />
    </section>
  );
}

export function Categories() {
  const query = useSuspenseQuery(catalogOptions);
  const cats = [...new Set(query.data.data.map((p) => p.categoryName).filter(Boolean))];
  return (
    <section className="category-section">
      <div className="wrap">
        <SectionHeading title="EXPLORE CATEGORIES" />
        {query.data.error ? (
          <StatusPanel
            compact
            title="Local discoveries are on their way"
            message="Categories will appear when the marketplace is available."
          />
        ) : cats.length ? (
          <div className="category-grid">
            {cats.map((c) => (
              <Link key={c} className="category-item" to="/catalog" search={{ category: c }}>
                <ShoppingBag />
                <span>{c}</span>
              </Link>
            ))}
          </div>
        ) : (
          <StatusPanel
            compact
            title="No categories yet"
            message="Browse categories as local products arrive."
            icon="empty"
          />
        )}
      </div>
    </section>
  );
}

export const features = [
  { Icon: MapPin, title: 'LOCAL BUSINESSES', text: 'Closer to your community.' },
  { Icon: Package, title: 'REAL PRODUCTS', text: 'Thoughtfully made. Honestly listed.' },
  { Icon: Database, title: 'DATABASE DRIVEN', text: 'Product information you can trust.' },
  { Icon: MessageCircle, title: 'CUSTOMER REVIEWS', text: 'Real experiences, shared.' },
];

export function Breadcrumb({ label }: { label: string }) {
  return (
    <div className="breadcrumb">
      <Link to="/">Home</Link>
      <ChevronRight />
      <Link to="/catalog">Shop</Link>
      <ChevronRight />
      <span>{label}</span>
    </div>
  );
}

export { Button, Link, ArrowRight, Heart };
