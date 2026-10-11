import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { pageHead, pageSearch } from '@/lib/localmart-api';
import { Seller } from '@/components/localmart/workflows';
import { Loading, Button } from '@/components/localmart/shared';
import { useAuth } from '@/lib/use-auth';
import { useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Store } from 'lucide-react';

function SellerGuard() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!currentUser || (currentUser.role !== 'SELLER' && currentUser.role !== 'ADMIN'))) {
      const timer = setTimeout(() => {
        if (!currentUser) {
          navigate({ to: '/login', search: { redirect: '/seller' } });
        } else {
          navigate({ to: '/' });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, currentUser, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!currentUser || (currentUser.role !== 'SELLER' && currentUser.role !== 'ADMIN')) {
    return (
      <div className="wrap section" style={{ maxWidth: '640px', margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ border: '1px solid #fed7aa', background: '#fffbeb', padding: '2.5rem', borderRadius: '8px' }}>
          <Store className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-amber-950 mb-2">Seller Access Required</h2>
          <p className="text-sm text-amber-800 mb-6 leading-relaxed">
            {!currentUser
              ? 'Authentication required. Please sign in or register as a local seller to manage your products, orders, and business.'
              : `Your active account (${currentUser.fullName} — ${currentUser.role}) is registered as a customer persona. You must sign in with a registered Seller account or register your local business to access the seller workspace.`}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/' })}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Return to Marketplace
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate({ to: '/login' })}
            >
              Switch / Register Seller
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Seller />;
}

export const Route = createFileRoute('/seller')({
  head: () => pageHead('Seller Workspace', 'Seller workspace on LOCALMART. Discover local. Shop nearby. Support small.'),
  validateSearch: pageSearch,
  pendingComponent: Loading,
  component: SellerGuard,
});

