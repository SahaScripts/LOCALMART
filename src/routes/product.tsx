import {createFileRoute} from '@tanstack/react-router';
import {pageHead,pageSearch,catalogOptions,ratingOptions} from '@/lib/localmart-api';
import {Product} from '@/components/localmart/browse';
import {Loading} from '@/components/localmart/shared';
export const Route=createFileRoute('/product')({head:()=>pageHead('Product details','Product details on LOCALMART. Discover local. Shop nearby. Support small.'),validateSearch:pageSearch,loader:({context})=>Promise.all([context.queryClient.ensureQueryData(catalogOptions),context.queryClient.ensureQueryData(ratingOptions)]),pendingComponent:Loading,component:Product});
