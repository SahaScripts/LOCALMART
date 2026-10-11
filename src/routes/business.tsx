import {createFileRoute} from '@tanstack/react-router';
import {pageHead,pageSearch,catalogOptions,ratingOptions} from '@/lib/localmart-api';
import {Business} from '@/components/localmart/browse';
import {Loading} from '@/components/localmart/shared';
export const Route=createFileRoute('/business')({head:()=>pageHead('Local businesses','Local businesses on LOCALMART. Discover local. Shop nearby. Support small.'),validateSearch:pageSearch,loader:({context})=>Promise.all([context.queryClient.ensureQueryData(catalogOptions),context.queryClient.ensureQueryData(ratingOptions)]),pendingComponent:Loading,component:Business});
