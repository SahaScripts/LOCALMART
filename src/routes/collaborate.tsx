import { createFileRoute } from '@tanstack/react-router';
import { pageHead, pageSearch } from '@/lib/localmart-api';
import { Collaborate } from '@/components/localmart/collaborate';
import { Loading } from '@/components/localmart/shared';

export const Route = createFileRoute('/collaborate')({
  head: () =>
    pageHead(
      'Local Business Collaboration',
      'Hyperlocal collaborations, joint gift hampers, and seller-to-seller partnerships on LocalSync.'
    ),
  validateSearch: pageSearch,
  pendingComponent: Loading,
  component: Collaborate,
});
