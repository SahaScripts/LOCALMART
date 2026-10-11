import { useState, useEffect, useMemo } from 'react';
import {
  Handshake,
  Store,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Plus,
  Send,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import {
  localmartApi,
  formatCurrency,
  resolveUserCart,
  type Collaboration,
  type AdminBusiness,
  type Product,
  type ServiceArea,
} from '@/lib/localmart-api';
import { useAuth } from '@/lib/use-auth';
import { PageHeading, Button, Link } from './shared';
import { getProductImageUrl } from '@/lib/product-images';

export function Collaborate() {
  const { user, currentUser, role, sellerBusiness: authSellerBusiness } = useAuth();
  const activeUser = currentUser || user;
  const [localSellerBiz, setLocalSellerBiz] = useState<any | null>(null);
  const sellerBusiness = authSellerBusiness || localSellerBiz;

  const [activeTab, setActiveTab] = useState<'directory' | 'my-collaborations' | 'combos'>(
    role === 'SELLER' ? 'directory' : 'combos'
  );

  // Data states
  const [approvedBusinesses, setApprovedBusinesses] = useState<AdminBusiness[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [collaborativeProducts, setCollaborativeProducts] = useState<Product[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('ALL');

  // Contact modal
  const [contactBusiness, setContactBusiness] = useState<AdminBusiness | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Propose Collaboration modal
  const [proposePartner, setProposePartner] = useState<AdminBusiness | null>(null);
  const [collabTitle, setCollabTitle] = useState('');
  const [collabType, setCollabType] = useState('Combo Offer');
  const [collabDescription, setCollabDescription] = useState('');
  const [submittingCollab, setSubmittingCollab] = useState(false);
  const [collabSuccessMessage, setCollabSuccessMessage] = useState<string | null>(null);

  // Reject proposal modal
  const [rejectingCollabId, setRejectingCollabId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Create Collaborative Product modal
  const [activeCollabForProduct, setActiveCollabForProduct] = useState<Collaboration | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('10');
  const [newProductCategory, setNewProductCategory] = useState('4'); // Default 4 = Gifts
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Add to cart state
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);

  // Load all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [businesses, allCollabs, allProducts, areas] = await Promise.all([
        localmartApi.getApprovedBusinesses(),
        localmartApi.getCollaborations(),
        localmartApi.getProducts(),
        localmartApi.getServiceAreas(),
      ]);

      setApprovedBusinesses(businesses);
      setCollaborations(allCollabs);
      setCollaborativeProducts(allProducts.filter((p) => p.isCollaborative));
      setServiceAreas(areas);

      if (role === 'SELLER' && !authSellerBusiness && activeUser) {
        try {
          const allBiz = await localmartApi.getBusinesses();
          const match = allBiz.find(b => b.user && b.user.userId === activeUser.userId);
          if (match) {
            const details = await localmartApi.getBusinessDetails(match.businessId);
            setLocalSellerBiz(details);
          }
        } catch (bizErr) {
          console.warn('Could not load local seller business details:', bizErr);
        }
      }
    } catch (err: any) {
      console.error('Failed to load collaboration data', err);
      setError(err?.message || 'Failed to load collaboration information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUser?.userId, role, authSellerBusiness]);

  const isSellerApproved =
    role === 'SELLER' &&
    sellerBusiness &&
    sellerBusiness.verificationStatus === 'APPROVED';

  // Filtered approved businesses (exclude current seller's own business)
  const filteredBusinesses = useMemo(() => {
    return approvedBusinesses.filter((b) => {
      if (sellerBusiness && b.businessId === sellerBusiness.businessId) return false;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        b.businessName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q));

      const matchArea =
        areaFilter === 'ALL' ||
        (b.serviceAreaName && b.serviceAreaName.toLowerCase() === areaFilter.toLowerCase()) ||
        (b.serviceAreaPincode && b.serviceAreaPincode === areaFilter);

      return matchSearch && matchArea;
    });
  }, [approvedBusinesses, sellerBusiness, searchQuery, areaFilter]);

  // My collaborations for current seller
  const myCollaborations = useMemo(() => {
    if (!sellerBusiness) return [];
    return collaborations.filter(
      (c) =>
        c.initiatorBusinessId === sellerBusiness.businessId ||
        c.partnerBusinessId === sellerBusiness.businessId
    );
  }, [collaborations, sellerBusiness]);

  const incomingProposals = useMemo(() => {
    if (!sellerBusiness) return [];
    return myCollaborations.filter(
      (c) => c.partnerBusinessId === sellerBusiness.businessId && c.status === 'PENDING'
    );
  }, [myCollaborations, sellerBusiness]);

  const outgoingProposals = useMemo(() => {
    if (!sellerBusiness) return [];
    return myCollaborations.filter(
      (c) => c.initiatorBusinessId === sellerBusiness.businessId && c.status === 'PENDING'
    );
  }, [myCollaborations, sellerBusiness]);

  const activePartnerships = useMemo(() => {
    return myCollaborations.filter((c) => c.status === 'ACCEPTED');
  }, [myCollaborations]);

  // Handle Proposing Collaboration
  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerBusiness || !proposePartner) return;

    if (!collabTitle.trim()) {
      alert('Please enter a collaboration title');
      return;
    }

    try {
      setSubmittingCollab(true);
      await localmartApi.proposeCollaboration({
        initiatorBusinessId: sellerBusiness.businessId,
        partnerBusinessId: proposePartner.businessId,
        title: collabTitle.trim(),
        description: collabDescription.trim(),
        collaborationType: collabType,
      });

      setCollabSuccessMessage(
        `Collaboration proposal successfully sent to ${proposePartner.businessName}!`
      );
      setProposePartner(null);
      setCollabTitle('');
      setCollabDescription('');
      await loadData();
    } catch (err: any) {
      alert(`Error proposing collaboration: ${err.message}`);
    } finally {
      setSubmittingCollab(false);
    }
  };

  // Handle Accepting Proposal
  const handleAcceptProposal = async (collabId: number) => {
    try {
      await localmartApi.updateCollaborationStatus(collabId, 'ACCEPTED');
      await loadData();
    } catch (err: any) {
      alert(`Error accepting collaboration: ${err.message}`);
    }
  };

  // Handle Rejecting Proposal
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCollabId) return;

    if (!rejectReason.trim()) {
      alert('Please provide a reason for declining the proposal.');
      return;
    }

    try {
      setRejectSubmitting(true);
      await localmartApi.updateCollaborationStatus(rejectingCollabId, 'REJECTED', rejectReason.trim());
      setRejectingCollabId(null);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      alert(`Error rejecting collaboration: ${err.message}`);
    } finally {
      setRejectSubmitting(false);
    }
  };

  // Handle Creating Collaborative Product
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollabForProduct) return;

    const price = parseFloat(newProductPrice);
    const stock = parseInt(newProductStock, 10);
    const categoryId = parseInt(newProductCategory, 10);

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setCreatingProduct(true);
      await localmartApi.createCollaborativeProduct({
        collaborationId: activeCollabForProduct.collaborationId,
        categoryId,
        productName: newProductName.trim(),
        description: newProductDesc.trim(),
        price,
        stockQuantity: isNaN(stock) ? 10 : stock,
      });

      setActiveCollabForProduct(null);
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice('');
      setNewProductStock('10');
      await loadData();
      setActiveTab('combos');
    } catch (err: any) {
      alert(`Error creating collaborative product: ${err.message}`);
    } finally {
      setCreatingProduct(false);
    }
  };

  // Handle Add Collaborative Combo to Cart
  const handleAddToCart = async (product: Product) => {
    if (!activeUser) {
      alert('Please log in with a customer account to add items to your cart.');
      window.location.href = '/login';
      return;
    }

    if (role !== 'CUSTOMER') {
      alert(
        `You are currently signed in as a ${role}. Adding items to cart and checkout is reserved for customers. Switch persona or log in as a customer in your Profile.`
      );
      return;
    }

    try {
      setAddingProductId(product.productId);
      const cartId = await resolveUserCart(activeUser.userId);
      await localmartApi.addCartItem(cartId, product.productId, 1);
      setCartSuccess(`Added "${product.productName}" to your cart!`);

      // Notify cart listeners across the app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('localmart:cart-changed'));
      }

      setTimeout(() => setCartSuccess(null), 3500);
    } catch (err: any) {
      console.error('Failed to add combo to cart', err);
      alert('Unable to add product to cart: ' + err.message);
    } finally {
      setAddingProductId(null);
    }
  };

  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="wrap">
      <PageHeading
        kicker="Hyperlocal B2B & Combos"
        title="Local Business Collaboration"
        lead="Connecting verified neighborhood artisans, bakers, and shops to co-create exclusive local combos, holiday hampers, and community offerings."
      />

      {/* Role Notice & Status Banners */}
      {role === 'CUSTOMER' && (
        <div
          style={{
            background: 'var(--stone-50, #fcfbf9)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <Sparkles style={{ color: 'var(--coral, #c86144)', flexShrink: 0 }} size={24} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                Customer Showcase Mode
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Discover handcrafted combo bundles created jointly by neighborhood businesses. Want to
                partner with local makers? Switch to a verified Seller account in your Profile.
              </span>
            </div>
          </div>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              Switch Persona
            </Button>
          </Link>
        </div>
      )}

      {role === 'SELLER' && !isSellerApproved && (
        <div
          style={{
            background: '#fff8f0',
            border: '1px solid #fbd38d',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <AlertCircle style={{ color: '#dd6b20', flexShrink: 0 }} size={24} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: '#9c4221' }}>
                Business Verification Required for Collaborations
              </strong>
              <span style={{ fontSize: '0.85rem', color: '#7b341e' }}>
                Only verified and approved local businesses can propose or accept partnerships.
                {sellerBusiness
                  ? ` Current status: ${sellerBusiness.verificationStatus}.`
                  : ' Please register and verify your business.'}
              </span>
            </div>
          </div>
          <Link to="/seller">
            <Button size="sm">Verify in Dashboard</Button>
          </Link>
        </div>
      )}

      {collabSuccessMessage && (
        <div
          style={{
            background: '#f0fff4',
            border: '1px solid #9ae6b4',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22543d' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{collabSuccessMessage}</span>
          </div>
          <button
            onClick={() => setCollabSuccessMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22543d' }}
          >
            ✕
          </button>
        </div>
      )}

      {cartSuccess && (
        <div
          style={{
            background: '#f0fff4',
            border: '1px solid #9ae6b4',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22543d' }}>
            <ShoppingBag size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cartSuccess}</span>
          </div>
          <Link to="/cart">
            <Button size="sm" variant="outline">
              View Cart
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('combos')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'combos' ? 'var(--foreground, #1a1a1a)' : 'var(--stone-100, #f5f4f0)',
            color: activeTab === 'combos' ? '#ffffff' : 'var(--foreground, #1a1a1a)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={16} />
          Collaborative Offers ({collaborativeProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'directory' ? 'var(--foreground, #1a1a1a)' : 'var(--stone-100, #f5f4f0)',
            color: activeTab === 'directory' ? '#ffffff' : 'var(--foreground, #1a1a1a)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Store size={16} />
          Approved Seller Directory ({approvedBusinesses.length})
        </button>

        {role === 'SELLER' && (
          <button
            onClick={() => setActiveTab('my-collaborations')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background:
                activeTab === 'my-collaborations' ? 'var(--foreground, #1a1a1a)' : 'var(--stone-100, #f5f4f0)',
              color: activeTab === 'my-collaborations' ? '#ffffff' : 'var(--foreground, #1a1a1a)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Handshake size={16} />
            My Collaborations ({myCollaborations.length})
            {incomingProposals.length > 0 && (
              <span
                style={{
                  background: 'var(--coral, #c86144)',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                {incomingProposals.length}
              </span>
            )}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' }}>
          Loading collaborative experiences and verified sellers…
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#e53e3e' }}>
          {error}
        </div>
      ) : (
        <>
          {/* ================================================================ */}
          {/* TAB 1: COLLABORATIVE OFFERS / COMBOS                             */}
          {/* ================================================================ */}
          {activeTab === 'combos' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Handcrafted Local Combos
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Curated bundles created by local creators working together. Enjoy combined flavor,
                  craftsmanship, and local savings in a single purchase.
                </p>
              </div>

              {collaborativeProducts.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    border: '1px dashed var(--border)',
                    borderRadius: '12px',
                    color: 'var(--muted)',
                  }}
                >
                  <Sparkles size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No active collaborative combos listed yet.</p>
                  {isSellerApproved && (
                    <Button
                      size="sm"
                      style={{ marginTop: '1rem' }}
                      onClick={() => setActiveTab('directory')}
                    >
                      Propose a Partnership
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.75rem',
                  }}
                >
                  {collaborativeProducts.map((p) => {
                    const imgSrc = getProductImageUrl(p.productName, p.categoryName);
                    return (
                      <div
                        key={p.productId}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div
                          style={{
                            height: '210px',
                            background: '#f8f7f4',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={p.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--muted)',
                              }}
                            >
                              <Package size={48} />
                            </div>
                          )}
                          <span
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: 'var(--coral, #c86144)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '4px',
                            }}
                          >
                            🤝 Joint Combo
                          </span>
                        </div>

                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--coral, #c86144)', fontWeight: 600, marginBottom: '0.35rem' }}>
                            {p.categoryName || 'Curated Offer'}
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                            {p.productName}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', flex: 1, marginBottom: '1rem', lineHeight: 1.5 }}>
                            {p.description}
                          </p>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '0.75rem',
                              borderTop: '1px solid var(--border)',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                {formatCurrency(p.price)}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                Stock: {p.stockQuantity} units
                              </span>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(p)}
                              disabled={addingProductId === p.productId || p.stockQuantity <= 0}
                            >
                              {addingProductId === p.productId ? (
                                'Adding…'
                              ) : (
                                <>
                                  <ShoppingBag size={14} style={{ marginRight: '4px' }} />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: APPROVED SELLER DIRECTORY                                 */}
          {/* ================================================================ */}
          {activeTab === 'directory' && (
            <div>
              {/* Directory Filter Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.75rem',
                  background: 'var(--stone-50, #fcfbf9)',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
                  <Search size={18} style={{ color: 'var(--muted)' }} />
                  <input
                    type="text"
                    placeholder="Search verified businesses or offerings…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      width: '100%',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Filter size={16} style={{ color: 'var(--muted)' }} />
                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.85rem',
                      background: '#fff',
                    }}
                  >
                    <option value="ALL">All Service Areas</option>
                    {serviceAreas.map((sa) => (
                      <option key={sa.areaId} value={sa.areaName}>
                        {sa.areaName} ({sa.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredBusinesses.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--muted)',
                    border: '1px dashed var(--border)',
                    borderRadius: '12px',
                  }}
                >
                  <Store size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No verified businesses match your search filters.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem',
                  }}
                >
                  {filteredBusinesses.map((b) => (
                    <div
                      key={b.businessId}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        background: '#fff',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                            {b.businessName}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            Owner: {b.ownerName || 'Verified Merchant'}
                          </span>
                        </div>
                        <span
                          style={{
                            background: '#e6fffa',
                            color: '#234e52',
                            border: '1px solid #b2f5ea',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                        {b.description || 'Neighborhood artisan business on LocalSync.'}
                      </p>

                      <div
                        style={{
                          background: 'var(--stone-50, #fcfbf9)',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)' }}>
                          <MapPin size={14} style={{ color: 'var(--coral, #c86144)' }} />
                          <span>
                            {b.address}, {b.city} ({b.postalCode})
                          </span>
                        </div>
                        {b.serviceAreaName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)' }}>
                            <Store size={14} style={{ color: 'var(--coral, #c86144)' }} />
                            <span>
                              Service Area: <strong>{b.serviceAreaName}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ flex: 1 }}
                          onClick={() => setContactBusiness(b)}
                        >
                          <Mail size={14} style={{ marginRight: '4px' }} />
                          Contact
                        </Button>

                        {isSellerApproved ? (
                          <Button
                            size="sm"
                            style={{ flex: 1 }}
                            onClick={() => setProposePartner(b)}
                          >
                            <Handshake size={14} style={{ marginRight: '4px' }} />
                            Propose
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ flex: 1, opacity: 0.6 }}
                            onClick={() =>
                              alert(
                                role === 'SELLER'
                                  ? 'Your business verification must be APPROVED before proposing collaborations.'
                                  : 'A verified Seller account is required to initiate collaborations.'
                              )
                            }
                          >
                            Propose
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: MY COLLABORATIONS (Seller View)                           */}
          {/* ================================================================ */}
          {activeTab === 'my-collaborations' && (
            <div>
              {/* Incoming Proposals */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Received Collaboration Proposals
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Partnership proposals sent to your business by fellow verified merchants.
                </p>

                {incomingProposals.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      border: '1px dashed var(--border)',
                      borderRadius: '10px',
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                    }}
                  >
                    No pending incoming proposals right now.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {incomingProposals.map((collab) => (
                      <div
                        key={collab.collaborationId}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '1.25rem 1.5rem',
                          background: '#fff',
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span
                              style={{
                                background: '#edf2f7',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              {collab.collaborationType}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              From: <strong>{collab.initiatorBusinessName}</strong>
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                            {collab.title}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                            {collab.description || 'No pitch description provided.'}
                          </p>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                            Contact: {collab.initiatorOwnerName} ({collab.initiatorOwnerEmail})
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptProposal(collab.collaborationId)}
                          >
                            <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ color: '#c53030' }}
                            onClick={() => setRejectingCollabId(collab.collaborationId)}
                          >
                            <XCircle size={14} style={{ marginRight: '4px' }} />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Partnerships */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Active Partnerships ({activePartnerships.length})
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Accepted collaborations ready for joint combo product creation.
                </p>

                {activePartnerships.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      border: '1px dashed var(--border)',
                      borderRadius: '10px',
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                    }}
                  >
                    No active partnerships yet. Accept an incoming proposal or propose one in the Directory.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activePartnerships.map((collab) => {
                      const isInitiator = collab.initiatorBusinessId === sellerBusiness?.businessId;
                      const partnerName = isInitiator
                        ? collab.partnerBusinessName
                        : collab.initiatorBusinessName;

                      return (
                        <div
                          key={collab.collaborationId}
                          style={{
                            border: '1px solid #c6f6d5',
                            background: '#f0fff4',
                            borderRadius: '12px',
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span
                                style={{
                                  background: '#38a169',
                                  color: '#fff',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                }}
                              >
                                ACTIVE PARTNERSHIP
                              </span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                Partner: {partnerName}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.25rem 0' }}>
                              {collab.title}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#276749', margin: 0 }}>
                              {collab.description}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveCollabForProduct(collab);
                              setNewProductName(`${collab.title} Combo`);
                            }}
                          >
                            <Plus size={14} style={{ marginRight: '4px' }} />
                            Create Joint Combo Offer
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sent Proposals */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Sent Proposals ({outgoingProposals.length})
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Proposals you have submitted awaiting a response from the partner business.
                </p>

                {outgoingProposals.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      border: '1px dashed var(--border)',
                      borderRadius: '10px',
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                    }}
                  >
                    You have no pending outgoing proposals.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {outgoingProposals.map((collab) => (
                      <div
                        key={collab.collaborationId}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          padding: '1rem 1.25rem',
                          background: '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                            {collab.title}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Sent to: <strong>{collab.partnerBusinessName}</strong> • Type: {collab.collaborationType}
                          </span>
                        </div>
                        <span
                          style={{
                            background: '#fefcbf',
                            color: '#744210',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                          }}
                        >
                          PENDING REVIEW
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: CONTACT SELLER MODAL                                        */}
      {/* ==================================================================== */}
      {contactBusiness && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
          onClick={() => setContactBusiness(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Contact {contactBusiness.businessName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Reach out directly to discuss cross-promotions, bulk orders, or joint offerings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  background: 'var(--stone-50, #fcfbf9)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '0.25rem' }}>
                  OWNER EMAIL
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {contactBusiness.ownerEmail || 'contact@localmart.com'}
                  </span>
                  <button
                    onClick={() => copyEmailToClipboard(contactBusiness.ownerEmail || '')}
                    style={{
                      border: '1px solid var(--border)',
                      background: '#fff',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    {copiedEmail ? <Check size={12} color="#38a169" /> : <Copy size={12} />}
                    {copiedEmail ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {contactBusiness.phone && (
                <div
                  style={{
                    background: 'var(--stone-50, #fcfbf9)',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '0.25rem' }}>
                    PHONE NUMBER
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contactBusiness.phone}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={() => setContactBusiness(null)}
              >
                Close
              </Button>
              {contactBusiness.ownerEmail && (
                <a
                  href={`mailto:${contactBusiness.ownerEmail}?subject=LocalMart Partnership Inquiry from ${activeUser?.fullName || 'Neighbor'}`}
                  style={{ flex: 1 }}
                >
                  <Button style={{ width: '100%' }}>
                    <Mail size={14} style={{ marginRight: '4px' }} />
                    Open Email Client
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: PROPOSE COLLABORATION MODAL                                 */}
      {/* ==================================================================== */}
      {proposePartner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
          onClick={() => setProposePartner(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Propose Partnership with {proposePartner.businessName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Create a joint initiative, combined hamper, or neighborhood cross-promotion.
            </p>

            <form onSubmit={handleProposeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Collaboration Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Bakery & Handcrafted Candle Hamper"
                  value={collabTitle}
                  onChange={(e) => setCollabTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Partnership Type *
                </label>
                <select
                  value={collabType}
                  onChange={(e) => setCollabType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    background: '#fff',
                  }}
                >
                  <option value="Combo Offer">Combo / Bundle Offer</option>
                  <option value="Joint Product">Joint Co-Branded Product</option>
                  <option value="Cross Promotion">Neighborhood Cross Promotion</option>
                  <option value="Seasonal Hamper">Seasonal Gift Hamper</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Proposal Details & Idea *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your idea (e.g. bundling your fresh sourdough with our artisanal jam for Sunday brunch)..."
                  value={collabDescription}
                  onChange={(e) => setCollabDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setProposePartner(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" style={{ flex: 1 }} disabled={submittingCollab}>
                  {submittingCollab ? 'Sending…' : 'Send Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: DECLINE REASON MODAL                                        */}
      {/* ==================================================================== */}
      {rejectingCollabId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
          onClick={() => setRejectingCollabId(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Decline Proposal
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Please provide a professional reason for declining this collaboration proposal.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                rows={3}
                required
                placeholder="e.g. Capacity constraints during festival season / Product mismatch..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem',
                }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setRejectingCollabId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{ flex: 1, background: '#e53e3e', color: '#fff' }}
                  disabled={rejectSubmitting}
                >
                  {rejectSubmitting ? 'Declining…' : 'Confirm Decline'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: CREATE COLLABORATIVE PRODUCT MODAL                          */}
      {/* ==================================================================== */}
      {activeCollabForProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
          onClick={() => setActiveCollabForProduct(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Publish Collaborative Combo Offer
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              This combo will be published directly into the LocalSync catalog under your joint partnership.
            </p>

            <form onSubmit={handleCreateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Combo Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Celebration Hamper (Bakery × Candles)"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Category *
                </label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    background: '#fff',
                  }}
                >
                  <option value="4">Gifts & Hampers</option>
                  <option value="1">Bakery & Sweets</option>
                  <option value="3">Handicrafts & Decor</option>
                  <option value="5">Snacks & Combos</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Combo Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="299.00"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="15"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Combo Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail what is included from both businesses in this bundle..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setActiveCollabForProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" style={{ flex: 1 }} disabled={creatingProduct}>
                  {creatingProduct ? 'Publishing…' : 'Publish Combo Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
