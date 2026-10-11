import {createFileRoute} from '@tanstack/react-router';
import {pageHead,pageSearch} from '@/lib/localmart-api';
import {Profile} from '@/components/localmart/workflows';
import {Loading} from '@/components/localmart/shared';
export const Route=createFileRoute('/profile')({head:()=>pageHead('Your LOCALMART','Your LOCALMART on LOCALMART. Discover local. Shop nearby. Support small.'),validateSearch:pageSearch,pendingComponent:Loading,component:Profile});
