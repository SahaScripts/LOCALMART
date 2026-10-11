import {createFileRoute} from '@tanstack/react-router';
import {pageHead,pageSearch,catalogOptions,ratingOptions} from '@/lib/localmart-api';
import {Reviews} from '@/components/localmart/workflows';
import {Loading} from '@/components/localmart/shared';
export const Route=createFileRoute('/reviews')({head:()=>pageHead('Ratings & reviews','Ratings & reviews on LOCALMART. Discover local. Shop nearby. Support small.'),validateSearch:pageSearch,loader:({context})=>Promise.all([context.queryClient.ensureQueryData(catalogOptions),context.queryClient.ensureQueryData(ratingOptions)]),pendingComponent:Loading,component:Reviews});
