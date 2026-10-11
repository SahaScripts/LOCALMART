import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { pageHead, pageSearch } from '@/lib/localmart-api';
import { AdminDashboard } from '@/components/localmart/admin';
import { Loading, Button } from '@/components/localmart/shared';
import { useAuth } from '@/lib/use-auth';
import { useEffect } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function AdminGuard() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!currentUser || currentUser.role !== 'ADMIN')) {
      const timer = setTimeout(() => {
        if (!currentUser) {
          navigate({ to: '/login' });
        } else {
          navigate({ to: '/' });
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading, currentUser, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="wrap section" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ border: '1px solid #fecaca', background: '#fef2f2', padding: '2.5rem', borderRadius: '8px' }}>
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-sm text-red-700 mb-6">
            {!currentUser
              ? 'Authentication required. Please sign in with an administrator account to access the command center.'
              : `Your account (${currentUser.fullName} — ${currentUser.role}) does not have administrator privileges.`}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: currentUser ? '/' : '/login' })}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {currentUser ? 'Return to Marketplace' : 'Go to Sign In'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

export const Route = createFileRoute('/admin')({
  head: () => pageHead('Admin Command Center', 'Administrative governance, verification, and analytics for LocalSync.'),
  validateSearch: pageSearch,
  pendingComponent: Loading,
  component: AdminGuard,
});
