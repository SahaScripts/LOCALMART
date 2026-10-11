import { createFileRoute } from '@tanstack/react-router';
import { pageHead, pageSearch } from '@/lib/localmart-api';
import { AuthPage } from '@/components/localmart/auth';
import { Loading } from '@/components/localmart/shared';

export const Route = createFileRoute('/login')({
  head: () => pageHead('Sign In / Register — LOCALMART', 'Sign in to discover and shop local businesses in your community.'),
  validateSearch: pageSearch,
  pendingComponent: Loading,
  component: AuthPage,
});
