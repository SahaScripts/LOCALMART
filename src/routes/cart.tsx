import {createFileRoute} from '@tanstack/react-router';
import {pageHead,pageSearch} from '@/lib/localmart-api';
import {Cart} from '@/components/localmart/workflows';
import {Loading} from '@/components/localmart/shared';
export const Route=createFileRoute('/cart')({head:()=>pageHead('Your cart','Your cart on LOCALMART. Discover local. Shop nearby. Support small.'),validateSearch:pageSearch,pendingComponent:Loading,component:Cart});
