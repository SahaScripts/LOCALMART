import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  FolderTree,
  Package,
  Star,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
  ArrowRight,
  Handshake,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import {
  localmartApi,
  formatCurrency,
  type AdminDashboardStats,
  type AdminUser,
  type AdminBusiness,
  type AdminProduct,
  type AdminReview,
  type AdminAuditLog,
  type Category,
  type Collaboration,
  type ServiceArea,
} from '@/lib/localmart-api';
import { getProductImageUrl } from '@/lib/product-images';
import { StatusPanel, Button } from './shared';

type AdminTab = 'dashboard' | 'users' | 'businesses' | 'categories' | 'products' | 'reviews' | 'collaborations' | 'service_areas' | 'audit';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);

  // Filter states
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  const [bizStatusFilter, setBizStatusFilter] = useState('ALL');

  const [prodStatusFilter, setProdStatusFilter] = useState('ALL');
  const [prodSearch, setProdSearch] = useState('');

  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');

  const [collabStatusFilter, setCollabStatusFilter] = useState('ALL');

  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditEntityFilter, setAuditEntityFilter] = useState('ALL');

  // Business Detailed Review Modal State
  const [selectedBizForReview, setSelectedBizForReview] = useState<AdminBusiness | null>(null);

  // Service Area Creation & Testing State
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPincode, setNewAreaPincode] = useState('');
  const [testPincode, setTestPincode] = useState('');
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string; serviceArea?: ServiceArea } | null>(null);
  const [testingPin, setTestingPin] = useState(false);

  // Modal / Action states
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionLabel: string;
    variant?: 'destructive' | 'default';
    requiresReason?: boolean;
    onConfirm: (reason: string) => Promise<void>;
  } | null>(null);
  const [modalReason, setModalReason] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Category Modal State
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    categoryId?: number;
    initialName?: string;
  } | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, u, b, c, p, r, a, col, sa] = await Promise.all([
        localmartApi.admin.dashboard(),
        localmartApi.admin.getUsers(),
        localmartApi.admin.getBusinesses(),
        localmartApi.admin.getCategories(),
        localmartApi.admin.getProducts(),
        localmartApi.admin.getReviews(),
        localmartApi.admin.getAuditLogs(),
        localmartApi.admin.getCollaborations(),
        localmartApi.admin.getServiceAreas(),
      ]);
      setStats(s);
      setUsers(u);
      setBusinesses(b);
      setCategories(c);
      setProducts(p);
      setReviews(r);
      setAuditLogs(a);
      setCollaborations(col);
      setServiceAreas(sa);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load administrative data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // Specific reloaders
  const reloadUsers = async () => {
    const data = await localmartApi.admin.getUsers({
      role: userRoleFilter,
      status: userStatusFilter,
      search: userSearch,
    });
    setUsers(data);
  };

  const reloadBusinesses = async () => {
    const data = await localmartApi.admin.getBusinesses(bizStatusFilter);
    setBusinesses(data);
  };

  const reloadProducts = async () => {
    const data = await localmartApi.admin.getProducts({
      status: prodStatusFilter,
      search: prodSearch,
    });
    setProducts(data);
  };

  const reloadReviews = async () => {
    const data = await localmartApi.admin.getReviews(reviewStatusFilter);
    setReviews(data);
  };

  const reloadAuditLogs = async () => {
    const data = await localmartApi.admin.getAuditLogs({
      action: auditActionFilter,
      entityType: auditEntityFilter,
    });
    setAuditLogs(data);
  };

  const reloadCategories = async () => {
    const data = await localmartApi.admin.getCategories();
    setCategories(data);
  };

  const reloadCollaborations = async () => {
    const data = await localmartApi.admin.getCollaborations(collabStatusFilter);
    setCollaborations(data);
  };

  const reloadServiceAreas = async () => {
    const data = await localmartApi.admin.getServiceAreas();
    setServiceAreas(data);
  };

  const reloadStats = async () => {
    const data = await localmartApi.admin.dashboard();
    setStats(data);
  };

  // Service Area Actions
  const handleToggleServiceArea = async (sa: ServiceArea) => {
    try {
      await localmartApi.admin.toggleServiceAreaActive(sa.serviceAreaId);
      showNotification(`Service area "${sa.areaName}" status updated`);
      await Promise.all([reloadServiceAreas(), reloadAuditLogs()]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update service area');
    }
  };

  const handleCreateServiceArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim() || !newAreaPincode.trim()) return;
    try {
      await localmartApi.admin.createServiceArea(newAreaName.trim(), newAreaPincode.trim());
      showNotification(`Service area "${newAreaName.trim()} (${newAreaPincode.trim()})" created`);
      setShowAddAreaModal(false);
      setNewAreaName('');
      setNewAreaPincode('');
      await Promise.all([reloadServiceAreas(), reloadAuditLogs()]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create service area');
    }
  };

  const handleTestPincode = async () => {
    if (!testPincode.trim()) return;
    try {
      setTestingPin(true);
      const res = await localmartApi.validatePincode(testPincode.trim());
      setTestResult(res);
    } catch {
      setTestResult({ valid: false, message: 'Server error checking postal code' });
    } finally {
      setTestingPin(false);
    }
  };

  // Collaboration Governance Actions
  const handleCollaborationStatus = (c: Collaboration, newStatus: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => {
    const isReject = newStatus === 'REJECTED' || newStatus === 'CANCELLED';
    setActionModal({
      open: true,
      title: `${newStatus === 'ACCEPTED' ? 'Approve' : 'Reject'} Collaboration #${c.collaborationId}`,
      description: `${c.initiatorBusiness?.businessName} × ${c.partnerBusiness?.businessName}: "${c.title}"`,
      actionLabel: `${newStatus === 'ACCEPTED' ? 'APPROVE' : 'REJECT'} PROPOSAL`,
      variant: isReject ? 'destructive' : 'default',
      requiresReason: isReject,
      onConfirm: async (reason) => {
        await localmartApi.admin.updateCollaborationStatus(c.collaborationId, newStatus, reason);
        showNotification(`Collaboration #${c.collaborationId} is now ${newStatus}`);
        await Promise.all([reloadCollaborations(), reloadAuditLogs(), reloadStats()]);
      },
    });
  };

  // User Actions
  const handleToggleUserStatus = (u: AdminUser, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    if (u.role === 'ADMIN') {
      alert('Administrator accounts cannot be suspended.');
      return;
    }
    const isSuspending = newStatus === 'SUSPENDED';
    setActionModal({
      open: true,
      title: isSuspending ? `Suspend User: ${u.fullName}` : `Reactivate User: ${u.fullName}`,
      description: isSuspending
        ? 'Suspending this user will prevent them from making transactions or operating their store.'
        : 'Reactivating this user will restore their account to active standing.',
      actionLabel: isSuspending ? 'SUSPEND USER' : 'REACTIVATE USER',
      variant: isSuspending ? 'destructive' : 'default',
      requiresReason: true,
      onConfirm: async (reason) => {
        await localmartApi.admin.updateUserStatus(u.userId, newStatus, reason);
        showNotification(`User ${u.fullName} is now ${newStatus}`);
        await Promise.all([reloadUsers(), reloadAuditLogs(), reloadStats()]);
      },
    });
  };

  // Business Actions
  const handleBusinessVerification = (
    b: AdminBusiness,
    newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  ) => {
    const labels: Record<string, string> = {
      APPROVED: 'Approve Business',
      REJECTED: 'Reject Business',
      SUSPENDED: 'Suspend Business',
    };
    const isDestructive = newStatus === 'REJECTED' || newStatus === 'SUSPENDED';
    setActionModal({
      open: true,
      title: `${labels[newStatus]}: ${b.businessName}`,
      description:
        newStatus === 'APPROVED'
          ? 'Approving this store will allow its products to appear immediately on the customer marketplace.'
          : newStatus === 'SUSPENDED'
          ? 'Suspending this store will hide all its products from customer discovery while preserving order history.'
          : 'Rejecting this store will prevent it from listing products on LocalSync.',
      actionLabel: labels[newStatus].toUpperCase(),
      variant: isDestructive ? 'destructive' : 'default',
      requiresReason: true,
      onConfirm: async (reason) => {
        await localmartApi.admin.updateBusinessVerification(b.businessId, newStatus, reason);
        showNotification(`Store "${b.businessName}" is now ${newStatus}`);
        await Promise.all([reloadBusinesses(), reloadProducts(), reloadAuditLogs(), reloadStats()]);
      },
    });
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;
    try {
      setModalSubmitting(true);
      if (categoryModal?.mode === 'edit' && categoryModal.categoryId) {
        await localmartApi.admin.updateCategory(categoryModal.categoryId, categoryNameInput.trim());
        showNotification(`Category updated to "${categoryNameInput.trim()}"`);
      } else {
        await localmartApi.admin.createCategory(categoryNameInput.trim());
        showNotification(`Master Category "${categoryNameInput.trim()}" created`);
      }
      setCategoryModal(null);
      setCategoryNameInput('');
      await Promise.all([reloadCategories(), reloadAuditLogs()]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Category operation failed');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    setActionModal({
      open: true,
      title: `Delete Category: ${cat.categoryName}`,
      description: `Attempt to permanently delete "${cat.categoryName}". This will fail if products are currently assigned to this category.`,
      actionLabel: 'DELETE CATEGORY',
      variant: 'destructive',
      requiresReason: false,
      onConfirm: async () => {
        await localmartApi.admin.deleteCategory(cat.categoryId);
        showNotification(`Category "${cat.categoryName}" deleted successfully`);
        await Promise.all([reloadCategories(), reloadAuditLogs()]);
      },
    });
  };

  // Product Actions
  const handleToggleProductStatus = (p: AdminProduct, newStatus: 'ACTIVE' | 'HIDDEN') => {
    const isHiding = newStatus === 'HIDDEN';
    setActionModal({
      open: true,
      title: isHiding ? `Hide Product: ${p.productName}` : `Restore Product: ${p.productName}`,
      description: isHiding
        ? 'Hiding this product removes it from customer search and catalog, while preserving historical order items.'
        : 'Restoring this product makes it visible in the marketplace again.',
      actionLabel: isHiding ? 'HIDE PRODUCT' : 'RESTORE PRODUCT',
      variant: isHiding ? 'destructive' : 'default',
      requiresReason: true,
      onConfirm: async (reason) => {
        await localmartApi.admin.updateProductStatus(p.productId, newStatus, reason);
        showNotification(`Product "${p.productName}" is now ${newStatus}`);
        await Promise.all([reloadProducts(), reloadAuditLogs(), reloadStats()]);
      },
    });
  };

  // Review Actions
  const handleToggleReviewStatus = (r: AdminReview, newStatus: 'ACTIVE' | 'HIDDEN') => {
    const isHiding = newStatus === 'HIDDEN';
    setActionModal({
      open: true,
      title: isHiding ? `Hide Inappropriate Review (#${r.reviewId})` : `Restore Review (#${r.reviewId})`,
      description: isHiding
        ? 'Hiding this review excludes it from public average rating calculations and store pages.'
        : 'Restoring this review recalculates public average ratings including this review.',
      actionLabel: isHiding ? 'HIDE REVIEW' : 'RESTORE REVIEW',
      variant: isHiding ? 'destructive' : 'default',
      requiresReason: true,
      onConfirm: async (reason) => {
        await localmartApi.admin.updateReviewStatus(r.reviewId, newStatus, reason);
        showNotification(`Review #${r.reviewId} is now ${newStatus}`);
        await Promise.all([reloadReviews(), reloadAuditLogs(), reloadStats()]);
      },
    });
  };

  // Confirmation Modal Executor
  const executeModalAction = async () => {
    if (!actionModal) return;
    if (actionModal.requiresReason && !modalReason.trim()) {
      alert('Please provide an administrative reason for this action.');
      return;
    }
    try {
      setModalSubmitting(true);
      await actionModal.onConfirm(modalReason.trim());
      setActionModal(null);
      setModalReason('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <>
      {/* Refined Page Header with Editorial Hierarchy */}
      <div className="admin-page-header">
        <div className="wrap">
          <p className="admin-header-eyebrow">PLATFORM GOVERNANCE · LOCALSYNC</p>
          <h1 className="admin-header-title">ADMIN COMMAND CENTER</h1>
          <p className="admin-header-subtitle">
            Master governance, verification, catalog moderation & audit intelligence.
          </p>
        </div>
      </div>

      <div className="wrap admin-shell">
        {/* Fixed Structured Navigation Sidebar */}
        <aside className="admin-sidebar" role="tablist" aria-label="Admin Navigation">
          {/* Section: ADMIN */}
          <div className="admin-sidebar-group">
            <h3 className="admin-sidebar-header">ADMIN</h3>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="admin-nav-icon"><LayoutDashboard size={18} /></span>
              <span>Dashboard</span>
            </button>
          </div>

          <hr className="admin-sidebar-divider" />

          {/* Section: MANAGEMENT */}
          <div className="admin-sidebar-group">
            <h3 className="admin-sidebar-section-title">MANAGEMENT</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('users');
                  void reloadUsers();
                }}
              >
                <span className="admin-nav-icon"><Users size={18} /></span>
                <span>Users</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'businesses' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('businesses');
                  void reloadBusinesses();
                }}
              >
                <span className="admin-nav-icon"><Store size={18} /></span>
                <span>Businesses</span>
                {stats && stats.pendingBusinesses > 0 && (
                  <span className="nav-badge" title={`${stats.pendingBusinesses} awaiting approval`}>
                    {stats.pendingBusinesses}
                  </span>
                )}
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('categories');
                  void reloadCategories();
                }}
              >
                <span className="admin-nav-icon"><FolderTree size={18} /></span>
                <span>Categories</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('products');
                  void reloadProducts();
                }}
              >
                <span className="admin-nav-icon"><Package size={18} /></span>
                <span>Products</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('reviews');
                  void reloadReviews();
                }}
              >
                <span className="admin-nav-icon"><Star size={18} /></span>
                <span>Reviews</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'collaborations' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('collaborations');
                  void reloadCollaborations();
                }}
              >
                <span className="admin-nav-icon"><Handshake size={18} /></span>
                <span>Collaborations</span>
                {stats && stats.pendingCollaborations > 0 && (
                  <span className="nav-badge" title={`${stats.pendingCollaborations} pending proposals`}>
                    {stats.pendingCollaborations}
                  </span>
                )}
              </button>
            </div>
          </div>

          <hr className="admin-sidebar-divider" />

          {/* Section: SYSTEM */}
          <div className="admin-sidebar-group">
            <h3 className="admin-sidebar-section-title">SYSTEM</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'service_areas' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('service_areas');
                  void reloadServiceAreas();
                }}
              >
                <span className="admin-nav-icon"><MapPin size={18} /></span>
                <span>Service Areas</span>
              </button>
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('audit');
                  void reloadAuditLogs();
                }}
              >
                <span className="admin-nav-icon"><FileText size={18} /></span>
                <span>Audit Logs</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ minWidth: 0 }}>
          {/* Notification Alert Banner */}
          {actionSuccess && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.85rem 1.25rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid #22c55e',
                borderRadius: '6px',
                color: '#15803d',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} />
              {actionSuccess}
            </div>
          )}

          {loading ? (
            <StatusPanel
              title="Loading platform analytics…"
              message="Connecting to PostgreSQL database and calculating platform metrics."
            />
          ) : error ? (
            <StatusPanel
              compact
              title="Failed to load admin data"
              message={error}
              retry={loadAllData}
            />
          ) : (
            <>
              {/* ============================================================ */}
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {/* ============================================================ */}
              {activeTab === 'dashboard' && stats && (
                <div>
                  {/* Platform Health & Metrics Section Header */}
                  <div className="admin-section-header">
                    <div>
                      <h2 className="admin-section-title">
                        Platform Health & Metrics
                      </h2>
                      <p className="admin-section-subtitle">
                        Real-time indicators computed directly from PostgreSQL tables and views.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-refresh-button"
                      onClick={loadAllData}
                      title="Reload real-time metrics"
                    >
                      <RefreshCw size={13} /> Refresh
                    </button>
                  </div>

                  {/* Pending Approvals Callout Banner */}
                  {stats.pendingBusinesses > 0 && (
                    <div
                      style={{
                        padding: '1.25rem',
                        background: 'rgba(234, 179, 8, 0.12)',
                        border: '1px solid #eab308',
                        borderRadius: '8px',
                        marginBottom: '1.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertTriangle size={24} style={{ color: '#ca8a04', flexShrink: 0 }} />
                        <div>
                          <h4 style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>
                            {stats.pendingBusinesses} Business Application(s) Awaiting Verification
                          </h4>
                          <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                            New local businesses require approval before their products appear in customer search.
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setBizStatusFilter('PENDING');
                          setActiveTab('businesses');
                          void reloadBusinesses();
                        }}
                      >
                        REVIEW APPLICATIONS <ArrowRight size={14} />
                      </Button>
                    </div>
                  )}

                  {/* Responsive Grid of Metric Cards */}
                  <div className="admin-metric-grid">
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">TOTAL REVENUE</p>
                      <h3 className="admin-metric-card-value">{formatCurrency(stats.totalRevenue)}</h3>
                      <p className="admin-metric-card-desc">Completed transactions</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">CUSTOMERS</p>
                      <h3 className="admin-metric-card-value">{stats.totalCustomers}</h3>
                      <p className="admin-metric-card-desc">Active shoppers</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">SELLERS</p>
                      <h3 className="admin-metric-card-value">{stats.totalSellers}</h3>
                      <p className="admin-metric-card-desc">Registered store merchants</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">TOTAL BUSINESSES</p>
                      <h3 className="admin-metric-card-value">{stats.totalBusinesses}</h3>
                      <p className="admin-metric-card-desc">{stats.approvedBusinesses} Approved</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">CATALOG PRODUCTS</p>
                      <h3 className="admin-metric-card-value">{stats.totalProducts}</h3>
                      <p className="admin-metric-card-desc">{stats.hiddenProducts} Hidden</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">TOTAL ORDERS</p>
                      <h3 className="admin-metric-card-value">{stats.totalOrders}</h3>
                      <p className="admin-metric-card-desc">Fulfilled orders</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">TOTAL REVIEWS</p>
                      <h3 className="admin-metric-card-value">{stats.totalReviews}</h3>
                      <p className="admin-metric-card-desc">{stats.hiddenReviews} Moderated/Hidden</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">COLLABORATIONS</p>
                      <h3 className="admin-metric-card-value">{stats.totalCollaborations ?? 0}</h3>
                      <p className="admin-metric-card-desc">{stats.acceptedCollaborations ?? 0} Active ({stats.pendingCollaborations ?? 0} Pending)</p>
                    </div>
                    <div className="admin-metric-card">
                      <p className="admin-metric-card-title">LOCAL SERVICE AREAS</p>
                      <h3 className="admin-metric-card-value">{serviceAreas.length}</h3>
                      <p className="admin-metric-card-desc">Active coverage zones</p>
                    </div>
                  </div>

                  {/* Recent Administrative Audit Trail Section */}
                  <div style={{ marginTop: '2.5rem' }}>
                    <div className="admin-section-header">
                      <div>
                        <h3 className="admin-section-title">
                          Recent Administrative Audit Trail
                        </h3>
                        <p className="admin-section-subtitle">
                          Live ledger of administrative decisions, verifications, and moderations.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTab('audit');
                          void reloadAuditLogs();
                        }}
                      >
                        VIEW ALL AUDIT LOGS <ArrowRight size={13} />
                      </Button>
                    </div>
                    <div className="table-scroll" style={{ borderRadius: '8px', background: '#fff' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Admin</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.slice(0, 6).map((log) => (
                            <tr key={log.auditId}>
                              <td>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background:
                                      log.action.includes('SUSPEND') ||
                                      log.action.includes('HIDE') ||
                                      log.action.includes('DELETE') ||
                                      log.action.includes('REJECT')
                                        ? 'rgba(239, 68, 68, 0.12)'
                                        : 'rgba(34, 197, 94, 0.12)',
                                    color:
                                      log.action.includes('SUSPEND') ||
                                      log.action.includes('HIDE') ||
                                      log.action.includes('DELETE') ||
                                      log.action.includes('REJECT')
                                        ? '#b91c1c'
                                        : '#15803d',
                                  }}
                                >
                                  {log.action}
                                </span>
                              </td>
                              <td>
                                <strong>{log.entityType}</strong>{' '}
                                <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                                  #{log.entityId}
                                </span>
                              </td>
                              <td>
                                <div><strong>{log.adminName}</strong></div>
                                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                                  {log.adminEmail || 'admin@marketplace.com'}
                                </div>
                              </td>
                              <td style={{ fontSize: '12.5px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                                {new Date(log.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td style={{ maxWidth: '280px', fontSize: '13px' }}>
                                {log.reason || 'Completed successfully'}
                              </td>
                            </tr>
                          ))}
                          {auditLogs.length === 0 && (
                            <tr>
                              <td colSpan={5} className="empty-cell">
                                No administrative actions recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 2: USERS MANAGEMENT */}
              {/* ============================================================ */}
              {activeTab === 'users' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div className="search-box" style={{ width: '240px' }}>
                        <Search size={16} />
                        <input
                          placeholder="Search name or email…"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && void reloadUsers()}
                        />
                      </div>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => {
                          setUserRoleFilter(e.target.value);
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Roles</option>
                        <option value="CUSTOMER">Customers</option>
                        <option value="SELLER">Sellers</option>
                        <option value="ADMIN">Admins</option>
                      </select>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => {
                          setUserStatusFilter(e.target.value);
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => void reloadUsers()}>
                        Apply Filters
                      </Button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {users.length} user(s) found
                    </span>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => {
                          const isSuspended = u.accountStatus === 'SUSPENDED';
                          const isAdmin = u.role === 'ADMIN';
                          return (
                            <tr key={u.userId}>
                              <td>
                                <div>
                                  <strong>{u.fullName}</strong>
                                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                    {u.email}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '2px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background:
                                      u.role === 'ADMIN'
                                        ? 'rgba(147, 51, 234, 0.15)'
                                        : u.role === 'SELLER'
                                        ? 'rgba(59, 130, 246, 0.15)'
                                        : 'rgba(100, 116, 139, 0.15)',
                                    color:
                                      u.role === 'ADMIN'
                                        ? '#7e22ce'
                                        : u.role === 'SELLER'
                                        ? '#2563eb'
                                        : 'inherit',
                                  }}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td style={{ fontSize: '13px' }}>
                                <div>{u.phone || 'N/A'}</div>
                                <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                                  {u.address || '—'}
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '2px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                    color: isSuspended ? '#b91c1c' : '#15803d',
                                  }}
                                >
                                  {u.accountStatus}
                                </span>
                              </td>
                              <td style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {isAdmin ? (
                                  <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                    Protected Admin
                                  </span>
                                ) : isSuspended ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleUserStatus(u, 'ACTIVE')}
                                  >
                                    <RotateCcw size={13} /> Reactivate
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => handleToggleUserStatus(u, 'SUSPENDED')}
                                  >
                                    <Ban size={13} /> Suspend
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={6} className="empty-cell">
                              No users match the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 3: BUSINESSES VERIFICATION */}
              {/* ============================================================ */}
              {activeTab === 'businesses' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600 }}>Filter by Status:</label>
                      <select
                        value={bizStatusFilter}
                        onChange={(e) => {
                          setBizStatusFilter(e.target.value);
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Verification States</option>
                        <option value="PENDING">PENDING (Action Needed)</option>
                        <option value="APPROVED">APPROVED (Active Store)</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => void reloadBusinesses()}>
                        Refresh
                      </Button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {businesses.length} store(s) listed
                    </span>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Business Store</th>
                          <th>Merchant Owner</th>
                          <th>Physical Location & Area</th>
                          <th>Trade Proof</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Administrative Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businesses.map((b) => {
                          const status = b.verificationStatus;
                          const badgeStyle = {
                            APPROVED: { bg: 'rgba(34, 197, 94, 0.15)', color: '#15803d' },
                            PENDING: { bg: 'rgba(234, 179, 8, 0.15)', color: '#a16207' },
                            SUSPENDED: { bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c' },
                            REJECTED: { bg: 'rgba(100, 116, 139, 0.2)', color: '#475569' },
                          }[status] || { bg: 'var(--muted)', color: 'inherit' };

                          return (
                            <tr key={b.businessId}>
                              <td>
                                <div>
                                  <strong>{b.businessName}</strong>
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      color: 'var(--muted-foreground)',
                                      maxWidth: '220px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {b.description || 'No description provided'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>{b.ownerName || 'Merchant'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                  {b.ownerEmail || '—'}
                                </div>
                              </td>
                              <td style={{ fontSize: '13px' }}>
                                <div><strong>{b.serviceAreaName || 'Unassigned Zone'}</strong></div>
                                <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                                  {b.physicalAddress || `${b.city}, ${b.state}`} ({b.postalCode || 'No PIN'})
                                </div>
                              </td>
                              <td style={{ fontSize: '12px' }}>
                                {b.verificationDocument ? (
                                  <a
                                    href={localmartApi.getVerificationDocumentUrl(b.businessId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Click to view ${b.verificationDocument}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 6px',
                                      background: 'var(--secondary)',
                                      border: '1px solid var(--border)',
                                      borderRadius: '4px',
                                      fontFamily: 'monospace',
                                      color: 'var(--coral, #c86144)',
                                      textDecoration: 'none',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <FileText size={12} />
                                    {b.verificationDocument.length > 18
                                      ? `${b.verificationDocument.substring(0, 15)}...`
                                      : b.verificationDocument}
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--muted-foreground)' }}>None</span>
                                )}
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '2px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    background: badgeStyle.bg,
                                    color: badgeStyle.color,
                                  }}
                                >
                                  {status}
                                </span>
                                {b.verificationReason && (
                                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.verificationReason}>
                                    Note: {b.verificationReason}
                                  </div>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedBizForReview(b)}
                                  >
                                    <ShieldCheck size={13} /> Dossier
                                  </Button>

                                  {status === 'PENDING' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleBusinessVerification(b, 'APPROVED')}
                                      >
                                        <CheckCircle2 size={13} /> Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive"
                                        onClick={() => handleBusinessVerification(b, 'REJECTED')}
                                      >
                                        <XCircle size={13} /> Reject
                                      </Button>
                                    </>
                                  )}

                                  {status === 'APPROVED' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive"
                                      onClick={() => handleBusinessVerification(b, 'SUSPENDED')}
                                    >
                                      <Ban size={13} /> Suspend
                                    </Button>
                                  )}

                                  {status === 'SUSPENDED' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleBusinessVerification(b, 'APPROVED')}
                                    >
                                      <RotateCcw size={13} /> Restore Store
                                    </Button>
                                  )}

                                  {status === 'REJECTED' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleBusinessVerification(b, 'APPROVED')}
                                    >
                                      Re-Review
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {businesses.length === 0 && (
                          <tr>
                            <td colSpan={6} className="empty-cell">
                              No businesses found for status filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 4: MASTER CATEGORIES MANAGEMENT */}
              {/* ============================================================ */}
              {activeTab === 'categories' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>
                        Master Product Categories
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        Categories define marketplace taxonomy. Categories in active use by products cannot be deleted.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setCategoryModal({ open: true, mode: 'add' });
                        setCategoryNameInput('');
                      }}
                    >
                      <Plus size={14} /> ADD CATEGORY
                    </Button>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>ID</th>
                          <th>Category Name</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((c) => (
                          <tr key={c.categoryId}>
                            <td>#{c.categoryId}</td>
                            <td>
                              <strong style={{ fontSize: '15px' }}>{c.categoryName}</strong>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setCategoryModal({
                                      open: true,
                                      mode: 'edit',
                                      categoryId: c.categoryId,
                                      initialName: c.categoryName,
                                    });
                                    setCategoryNameInput(c.categoryName);
                                  }}
                                >
                                  <Edit2 size={13} /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDeleteCategory(c)}
                                >
                                  <Trash2 size={13} /> Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 5: PRODUCTS MODERATION */}
              {/* ============================================================ */}
              {activeTab === 'products' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div className="search-box" style={{ width: '240px' }}>
                        <Search size={16} />
                        <input
                          placeholder="Search product or business…"
                          value={prodSearch}
                          onChange={(e) => setProdSearch(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && void reloadProducts()}
                        />
                      </div>
                      <select
                        value={prodStatusFilter}
                        onChange={(e) => setProdStatusFilter(e.target.value)}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Listing States</option>
                        <option value="ACTIVE">ACTIVE (Visible in Discovery)</option>
                        <option value="HIDDEN">HIDDEN (Moderated)</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => void reloadProducts()}>
                        Apply Filters
                      </Button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {products.length} product(s) in catalog
                    </span>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Product Item</th>
                          <th>Store / Business</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Inventory</th>
                          <th>Listing Status</th>
                          <th style={{ textAlign: 'right' }}>Moderation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => {
                          const isHidden = p.listingStatus === 'HIDDEN';
                          const imgUrl = getProductImageUrl(p);
                          return (
                            <tr key={p.productId}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div
                                    style={{
                                      width: '42px',
                                      height: '42px',
                                      flexShrink: 0,
                                      overflow: 'hidden',
                                      borderRadius: '4px',
                                      background: 'var(--muted)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {imgUrl ? (
                                      <img
                                        src={imgUrl}
                                        alt={p.productName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <Package size={18} style={{ opacity: 0.4 }} />
                                    )}
                                  </div>
                                  <div>
                                    <strong>{p.productName}</strong>
                                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                      ID: #{p.productId}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{p.businessName || '—'}</td>
                              <td>{p.categoryName || '—'}</td>
                              <td>{formatCurrency(Number(p.price))}</td>
                              <td>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: p.stockQuantity <= 5 ? 'var(--destructive)' : 'inherit',
                                  }}
                                >
                                  {p.stockQuantity} in stock
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '2px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: isHidden
                                      ? 'rgba(239, 68, 68, 0.15)'
                                      : 'rgba(34, 197, 94, 0.15)',
                                    color: isHidden ? '#b91c1c' : '#15803d',
                                  }}
                                >
                                  {p.listingStatus}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {isHidden ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleProductStatus(p, 'ACTIVE')}
                                  >
                                    <Eye size={13} /> Restore Listing
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => handleToggleProductStatus(p, 'HIDDEN')}
                                  >
                                    <EyeOff size={13} /> Hide Product
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 6: REVIEWS MODERATION */}
              {/* ============================================================ */}
              {activeTab === 'reviews' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600 }}>Filter Reviews:</label>
                      <select
                        value={reviewStatusFilter}
                        onChange={(e) => setReviewStatusFilter(e.target.value)}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Reviews</option>
                        <option value="ACTIVE">ACTIVE (Affects Public Ratings)</option>
                        <option value="HIDDEN">HIDDEN (Excluded from Public Ratings)</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => void reloadReviews()}>
                        Refresh
                      </Button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {reviews.length} total review(s)
                    </span>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Review ID</th>
                          <th>Product</th>
                          <th>Customer</th>
                          <th>Rating</th>
                          <th>Comment</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Moderation Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((r) => {
                          const isHidden = r.reviewStatus === 'HIDDEN';
                          return (
                            <tr key={r.reviewId}>
                              <td>#{r.reviewId}</td>
                              <td><strong>{r.productName || `Product #${r.productId}`}</strong></td>
                              <td>{r.customerName || 'Anonymous Customer'}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#eab308' }}>
                                  <Star size={14} fill="#eab308" />
                                  <span style={{ fontWeight: 700, color: 'inherit' }}>{r.rating}</span>
                                </div>
                              </td>
                              <td style={{ maxWidth: '320px', fontSize: '13px' }}>
                                &ldquo;{r.comment}&rdquo;
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '2px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: isHidden
                                      ? 'rgba(239, 68, 68, 0.15)'
                                      : 'rgba(34, 197, 94, 0.15)',
                                    color: isHidden ? '#b91c1c' : '#15803d',
                                  }}
                                >
                                  {r.reviewStatus}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {isHidden ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleReviewStatus(r, 'ACTIVE')}
                                  >
                                    <RotateCcw size={13} /> Restore Review
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => handleToggleReviewStatus(r, 'HIDDEN')}
                                  >
                                    <EyeOff size={13} /> Hide Inappropriate
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {reviews.length === 0 && (
                          <tr>
                            <td colSpan={7} className="empty-cell">
                              No customer reviews recorded in database.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 7: COLLABORATIONS GOVERNANCE */}
              {/* ============================================================ */}
              {activeTab === 'collaborations' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600 }}>Filter Proposals:</label>
                      <select
                        value={collabStatusFilter}
                        onChange={(e) => {
                          setCollabStatusFilter(e.target.value);
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Collaboration Proposals</option>
                        <option value="PENDING">PENDING (Awaiting Seller Acceptance)</option>
                        <option value="ACCEPTED">ACCEPTED (Active Partnerships)</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => void reloadCollaborations()}>
                        Refresh
                      </Button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {collaborations.length} partnership proposal(s)
                    </span>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Partnership</th>
                          <th>Type</th>
                          <th>Proposal Title & Offer</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th style={{ textAlign: 'right' }}>Admin Governance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collaborations.map((c) => {
                          const status = c.status;
                          const badgeStyle = {
                            ACCEPTED: { bg: 'rgba(34, 197, 94, 0.15)', color: '#15803d' },
                            PENDING: { bg: 'rgba(234, 179, 8, 0.15)', color: '#a16207' },
                            REJECTED: { bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c' },
                            CANCELLED: { bg: 'rgba(100, 116, 139, 0.2)', color: '#475569' },
                          }[status] || { bg: 'var(--muted)', color: 'inherit' };

                          return (
                            <tr key={c.collaborationId}>
                              <td>#{c.collaborationId}</td>
                              <td>
                                <div>
                                  <strong>{c.initiatorBusiness?.businessName}</strong>
                                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                    with {c.partnerBusiness?.businessName}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 6px', background: 'var(--muted)', borderRadius: '3px' }}>
                                  {c.collaborationType}
                                </span>
                              </td>
                              <td style={{ maxWidth: '280px' }}>
                                <strong>{c.title}</strong>
                                {c.proposedOfferTitle && (
                                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                                    Offer: {c.proposedOfferTitle} {c.proposedComboPrice ? `(₹${c.proposedComboPrice})` : ''}
                                  </div>
                                )}
                                {c.sharedGoals && (
                                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.sharedGoals}
                                  </div>
                                )}
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '2px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    background: badgeStyle.bg,
                                    color: badgeStyle.color,
                                  }}
                                >
                                  {status}
                                </span>
                              </td>
                              <td style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                  {status === 'PENDING' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleCollaborationStatus(c, 'ACCEPTED')}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive"
                                        onClick={() => handleCollaborationStatus(c, 'REJECTED')}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {status === 'ACCEPTED' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive"
                                      onClick={() => handleCollaborationStatus(c, 'CANCELLED')}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  {status === 'REJECTED' && (
                                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Closed</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {collaborations.length === 0 && (
                          <tr>
                            <td colSpan={7} className="empty-cell">
                              No collaboration proposals found for the current filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 8: SERVICE AREAS GOVERNANCE */}
              {/* ============================================================ */}
              {activeTab === 'service_areas' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>
                        Local Service Areas & Municipal Coverage
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        Physical businesses and delivery eligibility are strictly validated against these postal zones.
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setShowAddAreaModal(true)}>
                      <Plus size={14} /> ADD SERVICE AREA
                    </Button>
                  </div>

                  {/* Real-time Pincode Validation Diagnostic Box */}
                  <div
                    style={{
                      padding: '1.25rem',
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: 700 }}>
                      Test Pincode Eligibility Diagnostic
                    </h4>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      Verify whether any 6-digit postal code maps to an active LocalMart service area.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                      <input
                        placeholder="e.g. 632001, 632014"
                        value={testPincode}
                        onChange={(e) => {
                          setTestPincode(e.target.value);
                          setTestResult(null);
                        }}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)', flex: 1 }}
                      />
                      <Button size="sm" variant="outline" disabled={testingPin || !testPincode.trim()} onClick={handleTestPincode}>
                        {testingPin ? 'Checking…' : 'Validate'}
                      </Button>
                    </div>
                    {testResult && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: testResult.valid ? '#dcfce7' : '#fee2e2',
                          color: testResult.valid ? '#166534' : '#991b1b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {testResult.valid ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {testResult.message}
                      </div>
                    )}
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>ID</th>
                          <th>Service Area Name</th>
                          <th>Postal Code (PIN)</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceAreas.map((sa) => (
                          <tr key={sa.serviceAreaId}>
                            <td>#{sa.serviceAreaId}</td>
                            <td><strong>{sa.areaName}</strong></td>
                            <td><code>{sa.pincode}</code></td>
                            <td>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '2px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  background: sa.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: sa.isActive ? '#15803d' : '#b91c1c',
                                }}
                              >
                                {sa.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                              {sa.createdAt ? new Date(sa.createdAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleServiceArea(sa)}
                              >
                                {sa.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {serviceAreas.length === 0 && (
                          <tr>
                            <td colSpan={6} className="empty-cell">
                              No local service areas registered.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 9: AUDIT LOGS */}
              {/* ============================================================ */}
              {activeTab === 'audit' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value)}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Actions</option>
                        <option value="SUSPEND_USER">SUSPEND_USER</option>
                        <option value="REACTIVATE_USER">REACTIVATE_USER</option>
                        <option value="APPROVE_BUSINESS">APPROVE_BUSINESS</option>
                        <option value="SUSPEND_BUSINESS">SUSPEND_BUSINESS</option>
                        <option value="RESTORE_BUSINESS">RESTORE_BUSINESS</option>
                        <option value="REJECT_BUSINESS">REJECT_BUSINESS</option>
                        <option value="HIDE_PRODUCT">HIDE_PRODUCT</option>
                        <option value="RESTORE_PRODUCT">RESTORE_PRODUCT</option>
                        <option value="HIDE_REVIEW">HIDE_REVIEW</option>
                        <option value="RESTORE_REVIEW">RESTORE_REVIEW</option>
                        <option value="CREATE_CATEGORY">CREATE_CATEGORY</option>
                        <option value="UPDATE_CATEGORY">UPDATE_CATEGORY</option>
                        <option value="DELETE_CATEGORY">DELETE_CATEGORY</option>
                      </select>
                      <select
                        value={auditEntityFilter}
                        onChange={(e) => setAuditEntityFilter(e.target.value)}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      >
                        <option value="ALL">All Entity Types</option>
                        <option value="USER">USER</option>
                        <option value="BUSINESS">BUSINESS</option>
                        <option value="PRODUCT">PRODUCT</option>
                        <option value="REVIEW">REVIEW</option>
                        <option value="CATEGORY">CATEGORY</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => void reloadAuditLogs()}>
                        Filter
                      </Button>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {auditLogs.length} audit entry(ies) recorded
                    </span>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Audit ID</th>
                          <th>Action Performed</th>
                          <th>Entity Type</th>
                          <th>Entity ID</th>
                          <th>Administrator</th>
                          <th>Justification / Reason</th>
                          <th>Timestamp (IST)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.auditId}>
                            <td>#{log.auditId}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '2px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: log.action.includes('SUSPEND') || log.action.includes('HIDE') || log.action.includes('DELETE')
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(34, 197, 94, 0.15)',
                                  color: log.action.includes('SUSPEND') || log.action.includes('HIDE') || log.action.includes('DELETE')
                                    ? '#b91c1c'
                                    : '#15803d',
                                }}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td>
                              <strong>{log.entityType}</strong>
                            </td>
                            <td>#{log.entityId}</td>
                            <td>
                              <div>{log.adminName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                                {log.adminEmail || 'admin@marketplace.com'}
                              </div>
                            </td>
                            <td style={{ maxWidth: '300px', fontSize: '13px' }}>
                              {log.reason || '—'}
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                              {new Date(log.createdAt).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr>
                            <td colSpan={7} className="empty-cell">
                              No administrative audit records match this filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Confirmation & Reason Modal */}
      {actionModal?.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '6px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              {actionModal.title}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
              {actionModal.description}
            </p>

            {actionModal.requiresReason && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.35rem' }}>
                  ADMINISTRATIVE REASON / JUSTIFICATION *
                </label>
                <textarea
                  required
                  placeholder="Enter policy violation, verification notes, or reason for audit trail..."
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    minHeight: '75px',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                variant="outline"
                disabled={modalSubmitting}
                onClick={() => {
                  setActionModal(null);
                  setModalReason('');
                }}
              >
                CANCEL
              </Button>
              <Button
                variant={actionModal.variant === 'destructive' ? 'default' : 'default'}
                style={
                  actionModal.variant === 'destructive'
                    ? { background: 'var(--destructive)', color: '#fff' }
                    : undefined
                }
                disabled={modalSubmitting || (actionModal.requiresReason && !modalReason.trim())}
                onClick={executeModalAction}
              >
                {modalSubmitting ? 'PROCESSING…' : actionModal.actionLabel}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {categoryModal?.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '6px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 1rem 0' }}>
              {categoryModal.mode === 'edit' ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSaveCategory}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.4rem' }}>
                CATEGORY NAME
              </label>
              <input
                required
                autoFocus
                placeholder="e.g. Organic Produce, Pottery, Dairy"
                value={categoryNameInput}
                onChange={(e) => setCategoryNameInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginBottom: '1.25rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCategoryModal(null);
                    setCategoryNameInput('');
                  }}
                >
                  CANCEL
                </Button>
                <Button type="submit" disabled={modalSubmitting || !categoryNameInput.trim()}>
                  {modalSubmitting ? 'SAVING…' : categoryModal.mode === 'edit' ? 'UPDATE' : 'CREATE'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Area Add Modal */}
      {showAddAreaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              Add Municipal Service Area Zone
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
              Define a local delivery and physical verification boundary for LocalMart.
            </p>
            <form onSubmit={handleCreateServiceArea}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.4rem' }}>
                  AREA / LOCALITY NAME *
                </label>
                <input
                  required
                  autoFocus
                  placeholder="e.g. Bagayam, Vellore"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.4rem' }}>
                  6-DIGIT POSTAL CODE (PINCODE) *
                </label>
                <input
                  required
                  placeholder="e.g. 632002"
                  value={newAreaPincode}
                  onChange={(e) => setNewAreaPincode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddAreaModal(false);
                    setNewAreaName('');
                    setNewAreaPincode('');
                  }}
                >
                  CANCEL
                </Button>
                <Button type="submit" disabled={!newAreaName.trim() || !newAreaPincode.trim()}>
                  REGISTER SERVICE AREA
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Verification Dossier Modal */}
      {selectedBizForReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              maxWidth: '580px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--coral, #c86144)', letterSpacing: '0.05em' }}>
                  VERIFICATION DOSSIER #{selectedBizForReview.businessId}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0 0 0' }}>
                  {selectedBizForReview.businessName}
                </h3>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background:
                    selectedBizForReview.verificationStatus === 'APPROVED'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : selectedBizForReview.verificationStatus === 'PENDING'
                      ? 'rgba(234, 179, 8, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  color:
                    selectedBizForReview.verificationStatus === 'APPROVED'
                      ? '#15803d'
                      : selectedBizForReview.verificationStatus === 'PENDING'
                      ? '#a16207'
                      : '#b91c1c',
                }}
              >
                {selectedBizForReview.verificationStatus}
              </span>
            </div>

            <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <strong style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '11px' }}>MERCHANT OWNER</strong>
                  <span>{selectedBizForReview.ownerName}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '11px' }}>CONTACT EMAIL / PHONE</strong>
                  <span>{selectedBizForReview.ownerEmail} • {selectedBizForReview.phone || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '11px' }}>SERVICE AREA ZONE</strong>
                  <strong>{selectedBizForReview.serviceAreaName || 'Not Matched'} ({selectedBizForReview.serviceAreaPincode || selectedBizForReview.postalCode || 'N/A'})</strong>
                </div>
                <div>
                  <strong style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '11px' }}>PHYSICAL STORE ADDRESS</strong>
                  <span>{selectedBizForReview.physicalAddress || `${selectedBizForReview.city}, ${selectedBizForReview.state}`}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                SUBMITTED TRADE PROOF DOCUMENT
              </h4>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: '#fafaf9',
                }}
              >
                <FileText size={20} style={{ color: 'var(--coral, #c86144)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedBizForReview.verificationDocument || 'No document attached'}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                    {selectedBizForReview.verificationSubmittedAt
                      ? `Submitted on ${new Date(selectedBizForReview.verificationSubmittedAt).toLocaleDateString('en-IN')}`
                      : 'Physical storefront license'}
                  </span>
                </div>
                {selectedBizForReview.verificationDocument && (
                  <a
                    href={localmartApi.getVerificationDocumentUrl(selectedBizForReview.businessId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      color: 'var(--coral, #c86144)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--coral, #c86144)',
                      background: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View PDF ↗
                  </a>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem', padding: '0.85rem', border: '1px dashed var(--border)', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--muted-foreground)' }}>
                LOCAL PHYSICAL VERIFICATION CHECKLIST
              </h4>
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" defaultChecked readOnly />
                  Physical store located within Vellore service area boundary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" defaultChecked={!!selectedBizForReview.postalCode} readOnly />
                  Valid 6-digit postal code verified against municipal database
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" defaultChecked={!!selectedBizForReview.verificationDocument} readOnly />
                  Physical establishment trade certificate / document on file
                </label>
              </div>
            </div>

            {/* Current Reason if any */}
            {selectedBizForReview.verificationReason && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '4px', fontSize: '12px', color: '#991b1b' }}>
                <strong>Current Verification Reason / Notes:</strong> {selectedBizForReview.verificationReason}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={() => setSelectedBizForReview(null)}
              >
                CLOSE
              </Button>

              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => {
                  const b = selectedBizForReview;
                  setSelectedBizForReview(null);
                  handleBusinessVerification(b, 'REJECTED');
                }}
              >
                <XCircle size={13} /> REJECT WITH REASON
              </Button>

              {selectedBizForReview.verificationStatus === 'APPROVED' ? (
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    const b = selectedBizForReview;
                    setSelectedBizForReview(null);
                    handleBusinessVerification(b, 'SUSPENDED');
                  }}
                >
                  <Ban size={13} /> SUSPEND
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const b = selectedBizForReview;
                    setSelectedBizForReview(null);
                    handleBusinessVerification(b, 'APPROVED');
                  }}
                >
                  <CheckCircle2 size={13} /> APPROVE BUSINESS
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
