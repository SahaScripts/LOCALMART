import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Store,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Building2,
  FileText,
  ShieldAlert,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import type { UserRole } from '@/lib/localmart-api';

interface AuthPageProps {
  initialRole?: UserRole;
  initialMode?: 'signin' | 'signup';
}

export function AuthPage({ initialRole = 'CUSTOMER', initialMode = 'signin' }: AuthPageProps) {
  const navigate = useNavigate();
  const { currentUser, role: activeRole, login, registerShopper, registerSeller, logout } = useAuth();

  // Role selection: SHOPPER, SELLER, ADMIN
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Shopper sign-up fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Seller registration fields
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Food & Bakery');
  const [storeAddress, setStoreAddress] = useState('');
  const [postalCode, setPostalCode] = useState('632001');
  const [verificationDoc, setVerificationDoc] = useState('');

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initialRole if props change
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Reset form errors when switching role or mode
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setSuccessMessage(null);
    if (role === 'ADMIN') {
      setMode('signin'); // Admin is sign-in only
    }
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  const resolvePostAuthRedirect = (userRole: UserRole): string => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');
      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        const isAdminTarget = redirectParam.startsWith('/admin');
        const isSellerTarget = redirectParam.startsWith('/seller');
        if (isAdminTarget && userRole !== 'ADMIN') {
          return '/';
        }
        if (isSellerTarget && userRole !== 'SELLER' && userRole !== 'ADMIN') {
          return '/';
        }
        return redirectParam;
      }
    } catch {
      // fallback to role destination
    }

    if (userRole === 'ADMIN') return '/admin';
    if (userRole === 'SELLER') return '/seller';
    return '/';
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      const resp = await login({
        email: email.trim(),
        password: password.trim(),
        expectedRole: selectedRole,
      });

      setSuccessMessage(`Welcome back, ${resp.fullName}!`);

      // Redirect after brief pause for smooth UX
      setTimeout(() => {
        const destination = resolvePostAuthRedirect(resp.role);
        window.location.href = destination;
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Shopper Sign Up Handler
  const handleShopperSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please complete all required fields (Full Name, Email, Password).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const resp = await registerShopper({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      setSuccessMessage('Your LOCALMART account has been created successfully!');

      setTimeout(() => {
        const destination = resolvePostAuthRedirect(resp.role);
        window.location.href = destination;
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Email might already be in use.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Seller Registration Handler
  const handleSellerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!ownerName.trim() || !email.trim() || !password.trim() || !businessName.trim() || !storeAddress.trim() || !postalCode.trim()) {
      setError('Please complete all required fields to register your local business.');
      return;
    }

    try {
      setLoading(true);
      const resp = await registerSeller({
        ownerName: ownerName.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        businessName: businessName.trim(),
        description: `Local ${businessCategory} establishment in ${postalCode}`,
        category: businessCategory,
        address: storeAddress.trim(),
        city: 'Vellore',
        state: 'Tamil Nadu',
        postalCode: postalCode.trim(),
        verificationDocument: verificationDoc.trim() || 'Trade_License_Document_Proof.pdf',
      });

      setSuccessMessage(
        `Business registration submitted for "${businessName}". Your application is currently PENDING administrative physical verification.`
      );

      setTimeout(() => {
        navigate({ to: '/seller' });
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Seller registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo accounts for convenient testing
  const handleUseDemo = (demoEmail: string, demoRole: UserRole) => {
    setSelectedRole(demoRole);
    setMode('signin');
    setEmail(demoEmail);
    setPassword('password');
    setError(null);
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#faf7f2]">
      {/* =========================================================================
          LEFT PANEL: Lifestyle Hero with High-Contrast Typography
          Matches media_1791482412103_7b4953fb.png
      ========================================================================= */}
      <div
        className="w-full md:w-[48%] lg:w-[50%] min-h-[480px] md:min-h-full relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(18, 14, 12, 0.42) 0%, rgba(18, 14, 12, 0.62) 55%, rgba(18, 14, 12, 0.88) 100%), url('/assets/food.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Top Branding on Hero */}
        <div className="flex items-center gap-2.5 z-10">
          <Store className="w-6 h-6 text-[#d97d64]" strokeWidth={2} />
          <span className="text-xl font-bold tracking-tight text-[#e5927c]">
            LOCALMART
          </span>
        </div>

        {/* Center Editorial Headlines */}
        <div className="my-auto py-12 z-10 max-w-lg">
          <div className="text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] uppercase text-white/85 mb-4">
            SMALL BUSINESSES. EXTRAORDINARY FINDS.
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.08] mb-5"
            style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", Georgia, serif)' }}
          >
            Discover local.<br />
            Shop meaningful.
          </h1>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans max-w-md">
            A marketplace built around the businesses, makers and people in your community.
          </p>
        </div>

        {/* Bottom Tagline */}
        <div className="z-10 pt-6 border-t border-white/20">
          <div className="text-[11px] sm:text-[12px] tracking-[0.22em] uppercase font-medium text-white/75">
            LOCAL BUSINESSES &bull; LOCAL DISCOVERY &bull; LOCAL COMMUNITY
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Role Selector & Real Spring Boot Auth Forms
          Matches media_1791482412103_7b4953fb.png
      ========================================================================= */}
      <div className="w-full md:w-[52%] lg:w-[50%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 bg-[#faf7f2]">
        <div className="w-full max-w-[460px]">

          {/* Already logged in banner (if user is authenticated) */}
          {currentUser && (
            <div className="mb-6 p-4 bg-white border border-[#e2ddd5] rounded-md shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#888]">Currently Signed In</div>
                  <div className="text-sm font-semibold text-[#1e1e1e] mt-0.5">
                    {currentUser.fullName} <span className="text-[#c86144] font-normal">({activeRole})</span>
                  </div>
                  <div className="text-xs text-[#666]">{currentUser.email}</div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#c86144] hover:bg-[#faf7f2] border border-[#c86144] rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Top Brand Logo */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Store className="w-6 h-6 text-[#1e1e1e]" strokeWidth={2} />
            <span className="text-xl font-bold tracking-tight text-[#1e1e1e]">
              LOCAL<span className="text-[#c86144]">MART</span>
            </span>
          </div>

          {/* Welcome Header */}
          <h2
            className="text-2xl sm:text-3xl text-center text-[#1e1e1e] font-normal"
            style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", Georgia, serif)' }}
          >
            Welcome to LOCALMART.
          </h2>
          <p className="text-xs sm:text-sm text-center text-[#6e6860] mt-1.5 mb-6">
            Choose how you want to continue.
          </p>

          {/* ROLE SELECTOR DIVIDER */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-[#e2ddd5] w-full" />
            <span className="bg-[#faf7f2] px-3 text-[10px] sm:text-[11px] font-semibold tracking-widest text-[#8c867e] uppercase absolute">
              ROLE SELECTOR
            </span>
          </div>

          {/* 3-CARD ROLE SELECTOR */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-6">
            {/* Card 1: SHOPPER */}
            <button
              type="button"
              onClick={() => handleRoleChange('CUSTOMER')}
              className={`p-3 text-left rounded-md transition-all cursor-pointer ${
                selectedRole === 'CUSTOMER'
                  ? 'bg-white border-2 border-[#c86144] shadow-sm'
                  : 'bg-white border border-[#e2ddd5] hover:border-[#cfc8bc]'
              }`}
            >
              <div
                className={`text-[12px] font-bold tracking-wider ${
                  selectedRole === 'CUSTOMER' ? 'text-[#c86144]' : 'text-[#1e1e1e]'
                }`}
              >
                SHOPPER
              </div>
              <div className="text-[10.5px] leading-snug text-[#666] mt-1 line-clamp-2">
                Discover and buy from local businesses
              </div>
              <div className="text-[9.5px] text-[#999] mt-2 hidden sm:block">
                Browse &bull; Discover &bull; Purchase
              </div>
            </button>

            {/* Card 2: SELLER */}
            <button
              type="button"
              onClick={() => handleRoleChange('SELLER')}
              className={`p-3 text-left rounded-md transition-all cursor-pointer ${
                selectedRole === 'SELLER'
                  ? 'bg-white border-2 border-[#c86144] shadow-sm'
                  : 'bg-white border border-[#e2ddd5] hover:border-[#cfc8bc]'
              }`}
            >
              <div
                className={`text-[12px] font-bold tracking-wider ${
                  selectedRole === 'SELLER' ? 'text-[#c86144]' : 'text-[#1e1e1e]'
                }`}
              >
                SELLER
              </div>
              <div className="text-[10.5px] leading-snug text-[#666] mt-1 line-clamp-2">
                Grow your local business
              </div>
              <div className="text-[9.5px] text-[#999] mt-2 hidden sm:block">
                Sell &bull; Collaborate &bull; Grow
              </div>
            </button>

            {/* Card 3: ADMIN */}
            <button
              type="button"
              onClick={() => handleRoleChange('ADMIN')}
              className={`p-3 text-left rounded-md transition-all cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'bg-white border-2 border-[#c86144] shadow-sm'
                  : 'bg-white border border-[#e2ddd5] hover:border-[#cfc8bc]'
              }`}
            >
              <div
                className={`text-[12px] font-bold tracking-wider ${
                  selectedRole === 'ADMIN' ? 'text-[#c86144]' : 'text-[#1e1e1e]'
                }`}
              >
                ADMIN
              </div>
              <div className="text-[10.5px] leading-snug text-[#666] mt-1 line-clamp-2">
                Manage the LOCALMART marketplace
              </div>
              <div className="text-[9.5px] text-[#999] mt-2 hidden sm:block">
                Verify &bull; Govern &bull; Manage
              </div>
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* ===================================================================
              SHOPPER WORKFLOWS (Sign In / Create Account)
          =================================================================== */}
          {selectedRole === 'CUSTOMER' && (
            <div>
              {mode === 'signin' ? (
                /* SHOPPER SIGN IN (Exact match to reference image) */
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div className="mb-2">
                    <h3
                      className="text-xl sm:text-2xl text-[#1e1e1e] font-normal"
                      style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", Georgia, serif)' }}
                    >
                      Welcome back.
                    </h3>
                  </div>

                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#555]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => alert('For hackathon demonstration, standard test accounts use password: "password"')}
                      className="text-xs text-[#777] hover:text-[#c86144] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#c86144] hover:bg-[#b35237] active:bg-[#a0462d] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'SIGNING IN…' : 'SIGN IN'}
                  </button>

                  <div className="text-center pt-3 space-y-1">
                    <div className="text-xs text-[#666]">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('signup')}
                        className="text-[#c86144] font-medium hover:underline cursor-pointer"
                      >
                        Create an account
                      </button>
                    </div>
                    <div className="text-[11px] text-[#888]">
                      Shop from verified local businesses around you.
                    </div>
                  </div>

                  {/* Demo fast-fill buttons */}
                  <div className="pt-3 border-t border-[#e8e4dc]">
                    <div className="text-[10px] tracking-wider uppercase text-[#888] mb-1.5 text-center">
                      Quick Demo Sign-In
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <button
                        type="button"
                        onClick={() => handleUseDemo('arjun@gmail.com', 'CUSTOMER')}
                        className="text-[11px] px-2.5 py-1 bg-white border border-[#ded9cf] rounded hover:border-[#c86144] text-[#555]"
                      >
                        Arjun Sharma (Shopper)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUseDemo('priya@gmail.com', 'CUSTOMER')}
                        className="text-[11px] px-2.5 py-1 bg-white border border-[#ded9cf] rounded hover:border-[#c86144] text-[#555]"
                      >
                        Priya Patel (Shopper)
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* SHOPPER SIGN UP */
                <form onSubmit={handleShopperSignUp} className="space-y-3">
                  <div className="mb-2">
                    <h3
                      className="text-xl sm:text-2xl text-[#1e1e1e] font-normal"
                      style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", Georgia, serif)' }}
                    >
                      Create your account.
                    </h3>
                    <p className="text-xs text-[#6e6860] mt-0.5">
                      Shop from verified local businesses around you.
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone (optional)"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City / Area"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create Password (min. 6 characters)"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#c86144] hover:bg-[#b35237] active:bg-[#a0462d] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
                  </button>

                  <div className="text-center pt-2">
                    <div className="text-xs text-[#666]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('signin')}
                        className="text-[#c86144] font-medium hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================
              SELLER WORKFLOWS (Sign In / Register Business)
          =================================================================== */}
          {selectedRole === 'SELLER' && (
            <div>
              {mode === 'signin' ? (
                /* SELLER SIGN IN */
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div className="mb-2">
                    <h3
                      className="text-xl sm:text-2xl text-[#1e1e1e] font-normal"
                      style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", Georgia, serif)' }}
                    >
                      Seller Portal Sign In
                    </h3>
                    <p className="text-xs text-[#6e6860] mt-0.5">
                      Manage your storefront, inventory, orders and local collaborations.
                    </p>
                  </div>

                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seller email address"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#555]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#c86144] hover:bg-[#b35237] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'AUTHENTICATING…' : 'SIGN IN AS SELLER'}
                  </button>

                  <div className="text-center pt-3 space-y-1">
                    <div className="text-xs text-[#666]">
                      Want to sell on LOCALMART?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('signup')}
                        className="text-[#c86144] font-medium hover:underline cursor-pointer"
                      >
                        Register your local business
                      </button>
                    </div>
                    <div className="text-[11px] text-[#888]">
                      Subject to physical service area review &amp; verification.
                    </div>
                  </div>

                  {/* Demo fast-fill buttons */}
                  <div className="pt-3 border-t border-[#e8e4dc]">
                    <div className="text-[10px] tracking-wider uppercase text-[#888] mb-1.5 text-center">
                      Quick Demo Seller Sign-In
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <button
                        type="button"
                        onClick={() => handleUseDemo('rahul@freshbites.com', 'SELLER')}
                        className="text-[11px] px-2.5 py-1 bg-white border border-[#ded9cf] rounded hover:border-[#c86144] text-[#555]"
                      >
                        Rahul Verma (Fresh Bites Bakery)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUseDemo('anita@organicgreens.com', 'SELLER')}
                        className="text-[11px] px-2.5 py-1 bg-white border border-[#ded9cf] rounded hover:border-[#c86144] text-[#555]"
                      >
                        Anita Rao (Organic Greens)
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* SELLER REGISTER BUSINESS (Physical Verification & Service Area) */
                <form onSubmit={handleSellerRegister} className="space-y-3">
                  <div className="mb-2">
                    <h3
                      className="text-xl sm:text-2xl text-[#1e1e1e] font-normal"
                      style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", Georgia, serif)' }}
                    >
                      Register Your Local Business
                    </h3>
                    <p className="text-xs text-[#6e6860] mt-0.5">
                      Physical verification and local service area enrollment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Proprietor Full Name"
                      required
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144]"
                    />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Trade / Store Name"
                      required
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Business Email"
                      required
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144]"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e]"
                    >
                      <option value="Food & Bakery">Food &amp; Bakery</option>
                      <option value="Fashion & Accessories">Fashion &amp; Accessories</option>
                      <option value="Home Decor & Handicrafts">Home Decor &amp; Handicrafts</option>
                      <option value="Beauty & Wellness">Beauty &amp; Wellness</option>
                      <option value="Gifts & Lifestyle">Gifts &amp; Lifestyle</option>
                    </select>

                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Pincode (e.g. 632001)"
                      required
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144]"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="Physical Store Street Address (Vellore)"
                      required
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144]"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={verificationDoc}
                      onChange={(e) => setVerificationDoc(e.target.value)}
                      placeholder="Trade License / GSTIN Proof (e.g. GSTIN_PROOF.pdf)"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144]"
                    />
                  </div>

                  {/* Verification Policy Notice */}
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-900 leading-snug">
                    <span className="font-semibold">Local Verification Guarantee:</span> Registrations are submitted with <span className="font-semibold">PENDING</span> status. Marketplace admin will verify your physical address before your products appear in catalog search.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#c86144] hover:bg-[#b35237] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'SUBMITTING APPLICATION…' : 'SUBMIT FOR VERIFICATION'}
                  </button>

                  <div className="text-center pt-2">
                    <div className="text-xs text-[#666]">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('signin')}
                        className="text-[#c86144] font-medium hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================
              ADMIN WORKFLOW (Sign In Only — No Public Sign Up)
          =================================================================== */}
          {selectedRole === 'ADMIN' && (
            <div>
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div className="mb-2">
                  <h3
                    className="text-xl sm:text-2xl text-[#1e1e1e] font-normal"
                    style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", Georgia, serif)' }}
                  >
                    Marketplace Administration
                  </h3>
                  <p className="text-xs text-[#6e6860] mt-0.5">
                    Authorized LOCALMART administrators only.
                  </p>
                </div>

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin Email Address"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999]"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin Password"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ded9cf] rounded-md focus:outline-none focus:border-[#c86144] text-[#1e1e1e] placeholder:text-[#999] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#555]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Restricted Access Governance Notice */}
                <div className="p-3 bg-stone-100 border border-stone-200 rounded-md text-[11px] text-stone-700 leading-relaxed flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900">Restricted Access:</span> Public registration is not permitted for the administrator tier. Non-admin accounts attempting access are blocked by backend security policies.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#c86144] hover:bg-[#b35237] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'VERIFYING CREDENTIALS…' : 'SIGN IN AS ADMIN'}
                </button>

                {/* Demo fast-fill button */}
                <div className="pt-3 border-t border-[#e8e4dc]">
                  <div className="text-[10px] tracking-wider uppercase text-[#888] mb-1.5 text-center">
                    Administrator Demo Credential
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleUseDemo('admin@marketplace.com', 'ADMIN')}
                      className="text-[11px] px-3 py-1 bg-white border border-[#ded9cf] rounded hover:border-[#c86144] text-[#555]"
                    >
                      Admin (admin@marketplace.com)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
